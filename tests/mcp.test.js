import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMcpManager,
  createMcpStore,
  denyNamesForDisabled,
  isValidServerName,
  mcpClientConfig,
  toolsOfServer,
  validateMcpServerInput,
} from '../lib/mcp.js';

test('MCP: isValidServerName validates properly', () => {
  assert.equal(isValidServerName('filesystem'), true);
  assert.equal(isValidServerName('my_server-1'), true);
  assert.equal(isValidServerName(''), false);
  assert.equal(isValidServerName('invalid name'), false);
  assert.equal(isValidServerName('a'.repeat(33)), false);
});

test('MCP: validateMcpServerInput rejects invalid inputs', () => {
  assert.throws(() => validateMcpServerInput(null), /must be an object/);
  assert.throws(() => validateMcpServerInput({ serverName: 'bad name', transport: 'stdio' }), /serverName/);
  assert.throws(() => validateMcpServerInput({ serverName: 'ok', transport: 'websocket' }), /transport/);
  assert.throws(() => validateMcpServerInput({ serverName: 'ok', transport: 'stdio', command: '' }), /command/);
  assert.throws(() => validateMcpServerInput({ serverName: 'ok', transport: 'streamable-http', url: '' }), /url/);
  assert.throws(() => validateMcpServerInput({ serverName: 'ok', transport: 'stdio', command: 'node', args: ['a', 123] }), /args/);
  assert.throws(() => validateMcpServerInput({ serverName: 'ok', transport: 'stdio', command: 'node', env: { a: 1 } }), /env/);
});

test('MCP: validateMcpServerInput accepts and normalizes valid inputs', () => {
  const stdio = validateMcpServerInput({
    serverName: 'my-srv',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'my-mcp'],
    env: { KEY: 'val' },
  });
  assert.deepEqual(stdio, {
    serverName: 'my-srv',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'my-mcp'],
    env: { KEY: 'val' },
    cwd: undefined,
  });

  const http = validateMcpServerInput({
    serverName: 'http-srv',
    transport: 'streamable-http',
    url: 'https://example.com/mcp',
  });
  assert.deepEqual(http, {
    serverName: 'http-srv',
    transport: 'streamable-http',
    url: 'https://example.com/mcp',
    headers: {},
  });
});

test('MCP: mcpClientConfig builds correct client parameters', () => {
  const cfg = mcpClientConfig({
    serverName: 'test',
    transport: 'stdio',
    command: 'node',
    args: ['app.js'],
    env: {},
  });
  assert.equal(cfg.serverName, 'test');
  assert.equal(cfg.transport, 'stdio');
  assert.equal(cfg.command, 'node');
  assert.equal(cfg.failOnStartupError, false);

  const httpCfg = mcpClientConfig({
    serverName: 'remote',
    transport: 'streamable-http',
    url: 'http://localhost:3000/sse',
  });
  assert.equal(httpCfg.transport, 'streamable-http');
  assert.equal(httpCfg.url, 'http://localhost:3000/sse');
});

test('MCP: toolsOfServer and denyNamesForDisabled work as expected', () => {
  const schemas = [
    { name: 'mcp__github__create_issue', description: 'Create an issue' },
    { name: 'mcp__github__get_issue', description: 'Get an issue' },
    { name: 'mcp__fs__read_file', description: 'Read file' },
    { name: 'bash', description: 'Bash tool' },
  ];

  const ghTools = toolsOfServer(schemas, 'github');
  assert.equal(ghTools.length, 2);
  assert.equal(ghTools[0].rawName, 'create_issue');

  const deny = denyNamesForDisabled({
    servers: [
      { serverName: 'github', enabled: false },
      { serverName: 'fs', enabled: true },
    ],
  }, schemas);
  assert.deepEqual(deny, ['mcp__github__create_issue', 'mcp__github__get_issue']);
});

test('MCP: createMcpStore persists state atomically', async () => {
  const tempDir = join(tmpdir(), `dsh-mcp-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    const store = createMcpStore({ dshHome: tempDir });
    assert.deepEqual(store.get(), { servers: [] });

    await store.update({
      servers: [
        {
          serverName: 'saved-srv',
          transport: 'stdio',
          command: 'python',
          args: ['main.py'],
          enabled: true,
          addedByUser: true,
        },
      ],
    });

    const store2 = createMcpStore({ dshHome: tempDir });
    store2.loadSync();
    assert.equal(store2.get().servers.length, 1);
    assert.equal(store2.get().servers[0].serverName, 'saved-srv');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('MCP: createMcpManager handles list, add, toggle, remove', async () => {
  const tempDir = join(tmpdir(), `dsh-mcp-mgr-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    const store = createMcpStore({ dshHome: tempDir });
    const createdEntries = [];
    const removedEntries = [];
    const schemas = [
      { name: 'mcp__profile-srv__tool1' },
    ];

    const mockCtx = {
      tools: {
        schemas() { return schemas; },
        restrict({ deny }) { return () => {}; },
      },
      loader: {
        entries() {
          return [
            {
              options: {
                id: 'profile-entry',
                name: '@deepseek-ai/dsh-mcp-client',
                config: { serverName: 'profile-srv', transport: 'stdio' },
              },
              disabled: false,
              fiber: {},
            },
          ];
        },
        async create(entry) { createdEntries.push(entry); },
        async remove(id) { removedEntries.push(id); },
      },
      agents: { list() { return []; } },
      on() { return () => {}; },
    };

    const manager = createMcpManager(mockCtx, store);
    await manager.startup();

    // 1. Initial list should see profile-srv
    const initial = await manager.list();
    assert.equal(initial.servers.length, 1);
    assert.equal(initial.servers[0].serverName, 'profile-srv');
    assert.equal(initial.servers[0].source, 'profile');
    assert.equal(initial.servers[0].toolCount, 1);

    // 2. Add user server
    await manager.add({
      serverName: 'user-srv',
      transport: 'stdio',
      command: 'node',
      args: ['index.js'],
    });

    assert.equal(createdEntries.length, 1);
    assert.equal(createdEntries[0].id, 'sh-mcp-user-srv');

    const afterAdd = await manager.list();
    assert.equal(afterAdd.servers.length, 2);

    // 3. Toggle user server off and on
    await manager.toggle({ serverName: 'user-srv', enabled: false });
    assert.equal(removedEntries.length, 1);
    assert.equal(removedEntries[0], 'sh-mcp-user-srv');

    await manager.toggle({ serverName: 'user-srv', enabled: true });
    assert.equal(createdEntries.length, 2);

    // 4. Remove user server
    await manager.remove({ serverName: 'user-srv' });
    assert.equal(removedEntries.length, 2);

    const final = await manager.list();
    assert.equal(final.servers.length, 1);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
