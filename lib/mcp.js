/**
 * dsh-skillhub — MCP (Model Context Protocol) server management module.
 *
 * Provides:
 *  1. State persistence: stores user-configured MCP servers and disabled overrides
 *     in ~/.dsh/skillhub/mcp-servers.json (atomic write with temp file + rename).
 *  2. MCP server enumeration: merges profile-configured loader entries
 *     (@deepseek-ai/dsh-mcp-client) and user-added servers with live tool schemas.
 *  3. Dynamic lifecycle: dynamically mounts/unmounts user-added MCP servers via
 *     ctx.loader.create/remove without restarting the harness.
 *  4. Selective enable/disable: disables tools of inactive MCP servers on live agents
 *     via tools.restrict({ deny }), with full reentrancy safety.
 *  5. Agent tools: mcp_list, mcp_toggle, mcp_add, mcp_remove for in-conversation management.
 */

import { readFileSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

export const MCP_PLUGIN_NAME = '@deepseek-ai/dsh-mcp-client';
export const MCP_ENTRY_PREFIX = 'sh-mcp-';
export const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

/** Validate a serverName against the MCP namespace constraints. */
export function isValidServerName(name) {
  return typeof name === 'string' && SERVER_NAME_PATTERN.test(name);
}

function getAgents(ctx) {
  try {
    return ctx?.get ? ctx.get('agents') : ctx?.agents;
  } catch {
    return undefined;
  }
}

function getTools(ctx) {
  try {
    return ctx?.get ? ctx.get('tools') : ctx?.tools;
  } catch {
    return undefined;
  }
}

function getLoader(ctx) {
  try {
    return ctx?.get ? ctx.get('loader') : ctx?.loader;
  } catch {
    return undefined;
  }
}

/**
 * Resolve the state directory for MCP servers.
 * @param {string} [dshHome]
 * @returns {string}
 */
export function resolveMcpStateDir(dshHome) {
  const home = dshHome ?? process.env.DSH_HOME ?? join(homedir(), '.dsh');
  return join(home, 'skillhub');
}

/**
 * Normalize raw state object from disk.
 * @param {unknown} raw
 * @returns {{ servers: Array<{ serverName: string, transport: 'stdio'|'streamable-http', command?: string, args?: string[], env?: Record<string, string>, cwd?: string, url?: string, headers?: Record<string, string>, enabled: boolean, addedByUser: boolean }> }}
 */
export function normalizeMcpState(raw) {
  const list = Array.isArray(raw?.servers) ? raw.servers : [];
  const servers = list.filter((s) => (
    s !== null && typeof s === 'object'
    && typeof s.serverName === 'string'
    && isValidServerName(s.serverName)
    && (s.transport === 'stdio' || s.transport === 'streamable-http')
    && typeof s.enabled === 'boolean'
    && typeof s.addedByUser === 'boolean'
  )).map((s) => ({
    serverName: s.serverName,
    transport: s.transport,
    ...(s.command !== undefined ? { command: String(s.command) } : {}),
    ...(Array.isArray(s.args) ? { args: s.args.map(String) } : {}),
    ...(s.env && typeof s.env === 'object' && !Array.isArray(s.env)
      ? { env: Object.fromEntries(Object.entries(s.env).map(([k, v]) => [k, String(v)])) }
      : {}),
    ...(s.cwd !== undefined ? { cwd: String(s.cwd) } : {}),
    ...(s.url !== undefined ? { url: String(s.url) } : {}),
    ...(s.headers && typeof s.headers === 'object' && !Array.isArray(s.headers)
      ? { headers: Object.fromEntries(Object.entries(s.headers).map(([k, v]) => [k, String(v)])) }
      : {}),
    enabled: s.enabled,
    addedByUser: s.addedByUser,
  }));
  return { servers };
}

/**
 * Validate user input for creating an MCP server.
 * @param {unknown} input
 */
export function validateMcpServerInput(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('MCP server input must be an object');
  }
  const { serverName, transport } = input;
  if (typeof serverName !== 'string' || !isValidServerName(serverName)) {
    throw new Error(`serverName must match ${SERVER_NAME_PATTERN.source} (1-32 chars, alphanumeric, _, -)`);
  }
  if (transport !== 'stdio' && transport !== 'streamable-http') {
    throw new Error('transport must be "stdio" or "streamable-http"');
  }
  if (transport === 'stdio') {
    if (typeof input.command !== 'string' || input.command.trim().length === 0) {
      throw new Error('stdio transport requires a non-empty command');
    }
  } else if (typeof input.url !== 'string' || input.url.trim().length === 0) {
    throw new Error('streamable-http transport requires a non-empty url');
  }
  if (input.args !== undefined) {
    if (!Array.isArray(input.args) || input.args.some((a) => typeof a !== 'string')) {
      throw new Error('args must be an array of strings');
    }
  }
  if (input.env !== undefined) {
    if (typeof input.env !== 'object' || input.env === null || Array.isArray(input.env)) {
      throw new Error('env must be a key-value object of strings');
    }
    for (const [k, v] of Object.entries(input.env)) {
      if (typeof v !== 'string') throw new Error(`env.${k} must be a string`);
    }
  }
  return {
    serverName: serverName.trim(),
    transport,
    ...(transport === 'stdio'
      ? {
        command: input.command.trim(),
        args: Array.isArray(input.args) ? input.args : [],
        env: input.env ?? {},
        cwd: typeof input.cwd === 'string' && input.cwd.trim() ? input.cwd.trim() : undefined,
      }
      : {
        url: input.url.trim(),
        headers: input.headers ?? {},
      }),
  };
}

/**
 * Build config object accepted by @deepseek-ai/dsh-mcp-client.
 * @param {object} server
 */
export function mcpClientConfig(server) {
  if (server.transport === 'stdio') {
    return {
      serverName: server.serverName,
      transport: 'stdio',
      command: server.command,
      args: server.args ?? [],
      env: server.env ?? {},
      cwd: server.cwd ?? process.cwd(),
      toolCallTimeoutMs: 60000,
      failOnStartupError: false,
    };
  }
  return {
    serverName: server.serverName,
    transport: 'streamable-http',
    url: server.url,
    headers: server.headers ?? {},
    toolCallTimeoutMs: 60000,
    failOnStartupError: false,
  };
}

/**
 * Filter live tool names belonging to a specific MCP server.
 * Public naming convention in dsh-mcp-client: mcp__<serverName>__<rawName>
 * @param {Array<{ name: string, description?: string, parameters?: unknown }>} schemas
 * @param {string} serverName
 */
export function toolsOfServer(schemas, serverName) {
  const prefix = `mcp__${serverName}__`;
  return (schemas ?? [])
    .filter((tool) => tool.name.startsWith(prefix))
    .map((tool) => ({
      name: tool.name,
      rawName: tool.name.slice(prefix.length),
      description: tool.description ?? '',
      parameters: tool.parameters ?? {},
    }));
}

/**
 * Compute the deny list for tools.restrict({ deny }).
 * Only live registered names are returned because tools.restrict throws on unknown names.
 * @param {{ servers: Array<{ serverName: string, enabled: boolean }> }} state
 * @param {Array<{ name: string }>} schemas
 * @returns {string[]}
 */
export function denyNamesForDisabled(state, schemas) {
  const disabled = (state.servers ?? []).filter((s) => !s.enabled).map((s) => s.serverName);
  if (disabled.length === 0) return [];
  const live = (schemas ?? []).map((t) => t.name).filter((name) => name.startsWith('mcp__'));
  const deny = [];
  for (const server of disabled) {
    const prefix = `mcp__${server}__`;
    for (const name of live) {
      if (name.startsWith(prefix)) deny.push(name);
    }
  }
  return deny;
}

/**
 * Create a persistent store for MCP server definitions.
 * @param {{ dshHome?: string, logger?: { warn: Function, error: Function } }} [options]
 */
export function createMcpStore({ dshHome, logger = console } = {}) {
  const dir = resolveMcpStateDir(dshHome);
  const file = join(dir, 'mcp-servers.json');
  let state = { servers: [] };
  let writeQueue = Promise.resolve();

  function loadSync() {
    try {
      state = normalizeMcpState(JSON.parse(readFileSync(file, 'utf8')));
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        logger.warn?.(`dsh-skillhub: MCP state file unreadable (${file}): ${String(error)}; starting empty`);
      }
      state = { servers: [] };
    }
    return state;
  }

  async function load() {
    try {
      const raw = await readFile(file, 'utf8');
      state = normalizeMcpState(JSON.parse(raw));
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        logger.warn?.(`dsh-skillhub: MCP state file unreadable (${file}): ${String(error)}; starting empty`);
      }
      state = { servers: [] };
    }
    return state;
  }

  function get() {
    return state;
  }

  function persist() {
    const serialized = JSON.stringify(state, null, 2);
    const run = writeQueue.then(async () => {
      await mkdir(dir, { recursive: true });
      const tmp = join(dir, `mcp-servers.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
      await writeFile(tmp, serialized, 'utf8');
      await rename(tmp, file);
    });
    writeQueue = run.catch((err) => {
      logger.error?.(`dsh-skillhub: failed to write MCP state: ${String(err)}`);
    });
    return run;
  }

  function update(patch) {
    state = { ...state, ...patch };
    return persist();
  }

  return { loadSync, load, get, update };
}

/**
 * Main coordinator for MCP servers.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {ReturnType<typeof createMcpStore>} store
 */
export function createMcpManager(ctx, store) {
  const mountedMcp = new Map();
  const restrictDisposers = new Map();
  const applyingRestrictions = new Set();
  let writeChain = Promise.resolve();

  function withWriteLock(task) {
    const run = writeChain.then(task, task);
    writeChain = run.catch(() => {});
    return run;
  }

  function profileServerConfig(serverName) {
    const loaderService = getLoader(ctx);
    if (!loaderService?.entries) return undefined;
    for (const entry of loaderService.entries()) {
      if (entry.options?.name !== MCP_PLUGIN_NAME) continue;
      if (String(entry.options?.id ?? '').startsWith(MCP_ENTRY_PREFIX)) continue;
      if (entry.options?.config?.serverName === serverName) return entry.options.config;
    }
    return undefined;
  }

  function isProfileServer(serverName) {
    return profileServerConfig(serverName) !== undefined;
  }

  async function mountMcpServer(server) {
    if (mountedMcp.has(server.serverName)) return;
    if (isProfileServer(server.serverName)) return;
    const loaderService = getLoader(ctx);
    if (!loaderService?.create) return;
    const entryId = `${MCP_ENTRY_PREFIX}${server.serverName}`;
    try {
      await loaderService.create({
        id: entryId,
        name: MCP_PLUGIN_NAME,
        config: mcpClientConfig(server),
      });
      mountedMcp.set(server.serverName, entryId);
    } catch (error) {
      ctx.logger?.warn?.(`dsh-skillhub: mount of MCP server "${server.serverName}" failed: ${String(error)}`);
    }
  }

  async function unmountMcpServer(serverName) {
    const entryId = mountedMcp.get(serverName);
    if (entryId === undefined) return;
    mountedMcp.delete(serverName);
    const loaderService = getLoader(ctx);
    if (!loaderService?.remove) return;
    try {
      await loaderService.remove(entryId);
    } catch (error) {
      ctx.logger?.warn?.(`dsh-skillhub: unmount of MCP server "${serverName}" failed: ${String(error)}`);
    }
  }

  function applyMcpRestrictions(agent) {
    if (!agent || applyingRestrictions.has(agent.id)) return;
    applyingRestrictions.add(agent.id);
    try {
      const toolsService = getTools(ctx);
      const schemas = toolsService?.schemas ? toolsService.schemas() : [];
      const deny = denyNamesForDisabled(store.get(), schemas);
      const current = restrictDisposers.get(agent.id);
      if (current !== undefined && current.deny.join('\u0000') === deny.join('\u0000')) {
        return;
      }
      if (current !== undefined) {
        restrictDisposers.delete(agent.id);
        current.disposer();
      }
      if (deny.length === 0) return;
      const tools = agent.ctx?.get ? agent.ctx.get('tools') : toolsService;
      if (!tools?.restrict) return;
      const disposer = tools.restrict({ deny });
      restrictDisposers.set(agent.id, { deny, disposer });
    } finally {
      applyingRestrictions.delete(agent.id);
    }
  }

  function applyMcpRestrictionsToAll() {
    const agentsService = getAgents(ctx);
    if (!agentsService?.list) return;
    for (const agent of agentsService.list()) {
      applyMcpRestrictions(agent);
    }
  }

  // ── Public API ──

  async function list() {
    const toolsService = getTools(ctx);
    const schemas = toolsService?.schemas ? toolsService.schemas() : [];
    const state = store.get();
    const servers = [];
    const seen = new Set();

    const loaderService = getLoader(ctx);
    if (loaderService?.entries) {
      for (const entry of loaderService.entries()) {
        if (entry.options?.name !== MCP_PLUGIN_NAME) continue;
        if (String(entry.options?.id ?? '').startsWith(MCP_ENTRY_PREFIX)) continue;
        const serverName = entry.options?.config?.serverName;
        if (typeof serverName !== 'string') continue;
        seen.add(serverName);
        const stateEntry = state.servers.find((s) => s.serverName === serverName);
        const tools = toolsOfServer(schemas, serverName);
        servers.push({
          serverName,
          source: 'profile',
          transport: entry.options.config?.transport ?? 'stdio',
          command: entry.options.config?.command,
          args: entry.options.config?.args,
          url: entry.options.config?.url,
          enabled: stateEntry === undefined ? true : stateEntry.enabled,
          toolCount: tools.length,
          tools,
          live: entry.fiber !== undefined && !entry.disabled,
          addedByUser: false,
        });
      }
    }

    for (const server of state.servers) {
      if (!server.addedByUser || seen.has(server.serverName)) continue;
      seen.add(server.serverName);
      const tools = toolsOfServer(schemas, server.serverName);
      servers.push({
        serverName: server.serverName,
        source: 'user',
        transport: server.transport,
        command: server.command,
        args: server.args,
        env: server.env,
        cwd: server.cwd,
        url: server.url,
        enabled: server.enabled,
        toolCount: tools.length,
        tools,
        live: mountedMcp.has(server.serverName),
        addedByUser: true,
      });
    }

    return { servers };
  }

  async function toggle({ serverName, enabled }) {
    if (typeof serverName !== 'string' || typeof enabled !== 'boolean') {
      throw new Error('toggle requires { serverName, enabled: boolean }');
    }
    return withWriteLock(async () => {
      const state = store.get();
      const existing = state.servers.find((s) => s.serverName === serverName);

      if (existing === undefined) {
        const profileCfg = profileServerConfig(serverName);
        if (profileCfg === undefined) throw new Error(`MCP server "${serverName}" is not known`);
        await store.update({
          servers: [...state.servers, {
            serverName,
            transport: profileCfg.transport,
            ...(profileCfg.command !== undefined ? { command: profileCfg.command } : {}),
            ...(profileCfg.url !== undefined ? { url: profileCfg.url } : {}),
            enabled,
            addedByUser: false,
          }],
        });
      } else {
        await store.update({
          servers: state.servers.map((s) => (s.serverName === serverName ? { ...s, enabled } : s)),
        });
      }

      if (existing !== undefined && existing.addedByUser) {
        if (enabled) await mountMcpServer({ ...existing, enabled });
        else await unmountMcpServer(serverName);
      }

      applyMcpRestrictionsToAll();
      return { serverName, enabled };
    });
  }

  async function add(inputRaw) {
    const input = validateMcpServerInput(inputRaw);
    return withWriteLock(async () => {
      const state = store.get();
      if (state.servers.some((s) => s.serverName === input.serverName)) {
        throw new Error(`MCP server "${input.serverName}" is already managed`);
      }
      if (isProfileServer(input.serverName)) {
        throw new Error(`MCP server "${input.serverName}" is already configured in the profile`);
      }
      const server = { ...input, enabled: true, addedByUser: true };
      await store.update({ servers: [...state.servers, server] });
      await mountMcpServer(server);
      applyMcpRestrictionsToAll();
      return { serverName: input.serverName };
    });
  }

  async function remove({ serverName }) {
    if (typeof serverName !== 'string') throw new Error('remove requires { serverName }');
    return withWriteLock(async () => {
      const state = store.get();
      const match = state.servers.find((s) => s.serverName === serverName);
      if (!match) throw new Error(`MCP server "${serverName}" not found`);
      if (!match.addedByUser) throw new Error(`MCP server "${serverName}" is profile-configured and cannot be deleted`);
      await unmountMcpServer(serverName);
      await store.update({ servers: state.servers.filter((s) => s.serverName !== serverName) });
      applyMcpRestrictionsToAll();
      return { serverName };
    });
  }

  // ── Lifecycle initialization ──

  async function startup() {
    const state = store.get();
    for (const server of state.servers) {
      if (server.addedByUser && server.enabled) {
        await mountMcpServer(server);
      }
    }
    applyMcpRestrictionsToAll();
  }

  function registerListeners() {
    const agentsService = getAgents(ctx);
    if (agentsService?.list) {
      for (const agent of agentsService.list()) {
        applyMcpRestrictions(agent);
      }
    }
    const unsubCreated = ctx.on?.('agent/created', ({ agent }) => {
      applyMcpRestrictions(agent);
    });
    const unsubDisposed = ctx.on?.('agent/disposed', ({ agent }) => {
      restrictDisposers.delete(agent.id);
    });
    const unsubToolsChange = ctx.on?.('tools/change', () => {
      applyMcpRestrictionsToAll();
    });

    return () => {
      unsubCreated?.();
      unsubDisposed?.();
      unsubToolsChange?.();
      for (const { disposer } of restrictDisposers.values()) disposer();
      restrictDisposers.clear();
      const loaderService = getLoader(ctx);
      for (const entryId of mountedMcp.values()) {
        void loaderService?.remove?.(entryId)?.catch?.(() => {});
      }
      mountedMcp.clear();
    };
  }

  return {
    list,
    toggle,
    add,
    remove,
    startup,
    registerListeners,
  };
}

/**
 * Register MCP in-conversation tools for Agent use.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {ReturnType<typeof createMcpManager>} mcpManager
 */
export function registerMcpTools(ctx, mcpManager) {
  const tools = getTools(ctx);
  if (!tools?.register) return () => {};

  const disposers = [];

  try {
    disposers.push(tools.register({
      name: 'mcp_list',
      description: 'List all configured MCP (Model Context Protocol) servers, their enabled status, and live tools.',
      parameters: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            servers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  serverName: { type: 'string' },
                  source: { type: 'string' },
                  transport: { type: 'string' },
                  enabled: { type: 'boolean' },
                  toolCount: { type: 'number' },
                },
              },
            },
          },
        },
      },
      async execute() {
        const res = await mcpManager.list();
        return {
          servers: res.servers.map((s) => ({
            serverName: s.serverName,
            source: s.source,
            transport: s.transport,
            enabled: s.enabled,
            toolCount: s.toolCount,
            command: s.command,
            url: s.url,
            tools: s.tools.map((t) => t.name),
          })),
        };
      },
    }));

    disposers.push(tools.register({
      name: 'mcp_toggle',
      description: 'Enable or disable an MCP server. Disabling restricts all of its tools from the model.',
      parameters: {
        type: 'object',
        properties: {
          serverName: { type: 'string', description: 'Name of the MCP server.' },
          enabled: { type: 'boolean', description: 'Whether to enable (true) or disable (false) the server.' },
        },
        required: ['serverName', 'enabled'],
        additionalProperties: false,
      },
      async execute(args) {
        return mcpManager.toggle(args);
      },
    }));

    disposers.push(tools.register({
      name: 'mcp_add',
      description: 'Add and dynamically mount a new MCP server without restarting the harness.',
      parameters: {
        type: 'object',
        properties: {
          serverName: { type: 'string', description: 'Unique identifier for the server (alphanumeric, _, -).' },
          transport: { type: 'string', enum: ['stdio', 'streamable-http'], description: 'Transport type.' },
          command: { type: 'string', description: 'Executable command for stdio transport (e.g. npx, node, python).' },
          args: { type: 'array', items: { type: 'string' }, description: 'Arguments for stdio command.' },
          url: { type: 'string', description: 'HTTP / SSE endpoint URL for streamable-http transport.' },
        },
        required: ['serverName', 'transport'],
        additionalProperties: false,
      },
      async execute(args) {
        return mcpManager.add(args);
      },
    }));

    disposers.push(tools.register({
      name: 'mcp_remove',
      description: 'Remove a user-added MCP server. Profile-configured servers cannot be removed.',
      parameters: {
        type: 'object',
        properties: {
          serverName: { type: 'string', description: 'Name of the MCP server to remove.' },
        },
        required: ['serverName'],
        additionalProperties: false,
      },
      async execute(args) {
        return mcpManager.remove(args);
      },
    }));
  } catch (err) {
    ctx.logger?.warn?.(`dsh-skillhub: error registering MCP tools: ${String(err)}`);
  }

  return () => {
    for (const dispose of disposers) dispose();
  };
}
