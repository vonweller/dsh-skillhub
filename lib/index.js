/**
 * dsh-skillhub host: proxies the public skillhub.cn API and installs
 * selected skill zips into the user DSH skills root (~/.dsh/skills).
 *
 * Function plugin: named-export name / inject / Config / apply, no default
 * export. Config implements Standard Schema so invalid rows fail at load.
 */

import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { inflateRawSync } from 'node:zlib'

export const name = 'dsh-skillhub'

export const inject = ['webServer']

const PREFIX = '/dsh-skillhub'
const DEFAULT_API = 'https://api.skillhub.cn'
const SITE = 'https://skillhub.cn'
const SIDECAR = '.skillhub.json'
const SLUG_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/
const DSH_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SORTS = new Set(['updated_at', 'downloads', 'stars', 'installs', 'score'])
const SOURCES = new Set(['community', 'enterprise', 'official', 'clawhub'])
const MAX_PAGE_SIZE = 50
const MAX_ZIP_BYTES = 25 * 1024 * 1024
const MAX_UNCOMPRESSED = 40 * 1024 * 1024
const MAX_ZIP_FILES = 200
const FETCH_MS = 25_000

/**
 * @typedef {object} Config
 * @property {string} apiBase SkillHub API origin, no trailing slash.
 * @property {string} installDir Directory that receives installed skill bundles.
 */

function defaultSkillsRoot() {
  const home = process.env.DSH_HOME && process.env.DSH_HOME.trim()
    ? process.env.DSH_HOME.trim()
    : join(homedir(), '.dsh')
  return join(home, 'skills')
}

function issue(path, message) {
  return { message, path }
}

function asTrimmedString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function resolveApiBase(raw) {
  const text = asTrimmedString(raw) || DEFAULT_API
  let url
  try {
    url = new URL(text)
  } catch {
    return { error: `apiBase "${text}" is not an absolute URL` }
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { error: `apiBase must be an http(s) URL, got ${url.protocol}` }
  }
  if (url.username || url.password) {
    return { error: 'apiBase must not include credentials' }
  }
  return { value: text.replace(/\/+$/, '') }
}

/**
 * Standard Schema config so Cordis fails plugin load on invalid rows.
 * @type {{ '~standard': { version: 1, vendor: string, validate: (value: unknown) => { value: Config } | { issues: { message: string, path?: PropertyKey[] }[] } } }}
 */
export const Config = {
  '~standard': {
    version: 1,
    vendor: 'dsh-skillhub',
    validate(value) {
      const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
      const issues = []
      if (value !== undefined && (typeof value !== 'object' || value === null || Array.isArray(value))) {
        return { issues: [issue([], 'config must be an object')] }
      }
      if ('apiBase' in raw && raw.apiBase !== undefined && typeof raw.apiBase !== 'string') {
        issues.push(issue(['apiBase'], 'apiBase must be a string'))
      }
      if ('installDir' in raw && raw.installDir !== undefined && typeof raw.installDir !== 'string') {
        issues.push(issue(['installDir'], 'installDir must be a string'))
      }
      const extra = Object.keys(raw).filter((key) => key !== 'apiBase' && key !== 'installDir')
      for (const key of extra) issues.push(issue([key], `unknown config field "${key}"`))
      const api = resolveApiBase(raw.apiBase)
      if (api.error) issues.push(issue(['apiBase'], api.error))
      const installDir = asTrimmedString(raw.installDir) || defaultSkillsRoot()
      if (!installDir) issues.push(issue(['installDir'], 'installDir must be a non-empty path'))
      if (issues.length) return { issues }
      return { value: { apiBase: api.value, installDir } }
    },
  },
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function sameOrigin(request) {
  const origin = request.headers.origin
  const host = request.headers.host
  if (origin === undefined || host === undefined) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

async function readJsonBody(request, maxBytes = 4096) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > maxBytes) throw new Error('request body too large')
    chunks.push(buffer)
  }
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function pathnameOf(request) {
  const host = request.headers.host ?? '127.0.0.1'
  return new URL(request.url ?? '/', `http://${host}`)
}

/**
 * @param {string} slug
 */
function assertSlug(slug) {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    throw new Error('invalid skill slug')
  }
  return slug
}

/**
 * @param {string} slug
 */
function kebabName(slug) {
  const lowered = slug.toLowerCase().replace(/[._]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (DSH_NAME_RE.test(lowered)) return lowered
  const fallback = lowered.replace(/[^a-z0-9-]/g, '')
  if (DSH_NAME_RE.test(fallback)) return fallback
  throw new Error(`skill name "${slug}" is not kebab-case`)
}

function frontmatterName(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!match) return null
  const line = match[1].split(/\r?\n/).find((row) => /^name\s*:/.test(row))
  if (!line) return null
  const value = line.replace(/^name\s*:\s*/, '').trim().replace(/^['"]|['"]$/g, '')
  return value || null
}

/**
 * @param {Buffer} buffer
 * @returns {{ name: string, data: Buffer }[]}
 */
function unzip(buffer) {
  if (buffer.length < 22) throw new Error('invalid zip')
  let eocd = -1
  const min = Math.max(0, buffer.length - 22 - 65535)
  for (let i = buffer.length - 22; i >= min; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('invalid zip: missing directory')
  const count = buffer.readUInt16LE(eocd + 10)
  let offset = buffer.readUInt32LE(eocd + 16)
  if (count > MAX_ZIP_FILES) throw new Error('zip has too many files')
  const files = []
  let total = 0
  for (let i = 0; i < count; i += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('invalid zip directory')
    const method = buffer.readUInt16LE(offset + 10)
    const compSize = buffer.readUInt32LE(offset + 20)
    const uncompSize = buffer.readUInt32LE(offset + 24)
    const nameLen = buffer.readUInt16LE(offset + 28)
    const extraLen = buffer.readUInt16LE(offset + 30)
    const commentLen = buffer.readUInt16LE(offset + 32)
    const localOff = buffer.readUInt32LE(offset + 42)
    const name = buffer.subarray(offset + 46, offset + 46 + nameLen).toString('utf8')
    offset += 46 + nameLen + extraLen + commentLen
    if (name.endsWith('/') || name.includes('..') || name.startsWith('/') || name.includes('\\')) continue
    if (name.startsWith('__MACOSX/') || name.endsWith('.DS_Store')) continue
    if (buffer.readUInt32LE(localOff) !== 0x04034b50) throw new Error('invalid zip local header')
    const localNameLen = buffer.readUInt16LE(localOff + 26)
    const localExtraLen = buffer.readUInt16LE(localOff + 28)
    const dataStart = localOff + 30 + localNameLen + localExtraLen
    const compressed = buffer.subarray(dataStart, dataStart + compSize)
    let data
    if (method === 0) data = Buffer.from(compressed)
    else if (method === 8) data = inflateRawSync(compressed)
    else throw new Error(`unsupported zip compression ${method}`)
    if (uncompSize !== 0 && data.length !== uncompSize) throw new Error('zip size mismatch')
    total += data.length
    if (total > MAX_UNCOMPRESSED) throw new Error('uncompressed skill is too large')
    files.push({ name: name.replace(/\\/g, '/'), data })
  }
  return files
}

function skillRootPrefix(files) {
  const skillFiles = files.filter((file) => /(^|\/)SKILL\.md$/i.test(file.name))
  if (skillFiles.length === 0) throw new Error('zip does not contain SKILL.md')
  const root = skillFiles.find((file) => file.name === 'SKILL.md' || file.name.toLowerCase() === 'skill.md')
  if (root) return ''
  const first = skillFiles[0].name
  const slash = first.lastIndexOf('/')
  return slash === -1 ? '' : first.slice(0, slash + 1)
}

async function writeTree(dest, files, prefix) {
  await mkdir(dest, { recursive: true })
  const destRoot = resolve(dest) + sep
  for (const file of files) {
    if (prefix && !file.name.startsWith(prefix)) continue
    const relative = prefix ? file.name.slice(prefix.length) : file.name
    if (!relative || relative.endsWith('/')) continue
    const target = resolve(dest, ...relative.split('/'))
    if (!target.startsWith(destRoot) && target !== destRoot.slice(0, -1)) {
      throw new Error('refusing to write outside the skill directory')
    }
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, file.data)
  }
}

async function fetchBuffer(url, maxBytes) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(FETCH_MS) })
  if (!response.ok) throw new Error(`download failed (HTTP ${response.status})`)
  const length = Number(response.headers.get('content-length') ?? '0')
  if (Number.isFinite(length) && length > maxBytes) throw new Error('download is too large')
  const reader = response.body?.getReader()
  if (!reader) {
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length > maxBytes) throw new Error('download is too large')
    return bytes
  }
  const chunks = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      reader.cancel().catch(() => undefined)
      throw new Error('download is too large')
    }
    chunks.push(Buffer.from(value))
  }
  return Buffer.concat(chunks)
}

async function fetchJson(url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(FETCH_MS) })
  const text = await response.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(`SkillHub returned non-JSON (HTTP ${response.status})`)
  }
  if (!response.ok) {
    const message = parsed && typeof parsed === 'object' && 'message' in parsed
      ? String(parsed.message)
      : `HTTP ${response.status}`
    throw new Error(message)
  }
  return parsed
}

function cardFromListItem(item) {
  if (!item || typeof item !== 'object') return null
  const slug = typeof item.slug === 'string' ? item.slug : ''
  if (!slug) return null
  return {
    slug,
    name: typeof item.name === 'string' ? item.name : slug,
    description: typeof item.description_zh === 'string' && item.description_zh
      ? item.description_zh
      : (typeof item.description === 'string' ? item.description : ''),
    category: typeof item.category === 'string' ? item.category : '',
    source: typeof item.source === 'string' ? item.source : '',
    version: typeof item.version === 'string' ? item.version : '',
    downloads: Number(item.downloads) || 0,
    installs: Number(item.installs) || 0,
    stars: Number(item.stars) || 0,
    ownerName: typeof item.ownerName === 'string' ? item.ownerName : '',
    iconUrl: typeof item.iconUrl === 'string' ? item.iconUrl : '',
    labels: item.labels && typeof item.labels === 'object' ? item.labels : {},
    page: `${SITE}/skills/${slug}`,
  }
}

async function listInstalled(installDir) {
  const installed = []
  let entries
  try {
    entries = await readdir(installDir, { withFileTypes: true })
  } catch (error) {
    if (error && error.code === 'ENOENT') return installed
    throw error
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const dir = join(installDir, entry.name)
    const skillFile = join(dir, 'SKILL.md')
    let body = ''
    try {
      body = await readFile(skillFile, 'utf8')
    } catch {
      continue
    }
    let meta = null
    try {
      meta = JSON.parse(await readFile(join(dir, SIDECAR), 'utf8'))
    } catch {
      meta = null
    }
    const fmName = frontmatterName(body)
    installed.push({
      slug: typeof meta?.slug === 'string' ? meta.slug : entry.name,
      dirName: entry.name,
      name: typeof meta?.name === 'string' ? meta.name : (fmName ?? entry.name),
      version: typeof meta?.version === 'string' ? meta.version : '',
      source: typeof meta?.source === 'string' ? meta.source : 'local',
      installedAt: typeof meta?.installedAt === 'string' ? meta.installedAt : '',
      description: firstDescription(body),
    })
  }
  installed.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  return installed
}

function firstDescription(body) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(body)
  if (!match) return ''
  const line = match[1].split(/\r?\n/).find((row) => /^description\s*:/.test(row))
  if (!line) return ''
  return line.replace(/^description\s*:\s*/, '').trim().replace(/^['"]|['"]$/g, '')
}

export async function installSkill(apiBase, installDir, slug) {
  assertSlug(slug)
  const zip = await fetchBuffer(`${apiBase}/api/v1/download?slug=${encodeURIComponent(slug)}`, MAX_ZIP_BYTES)
  const files = unzip(zip)
  const prefix = skillRootPrefix(files)
  const skillEntry = files.find((file) => file.name === `${prefix}SKILL.md` || file.name.toLowerCase() === `${prefix}skill.md`)
  if (!skillEntry) throw new Error('zip does not contain SKILL.md')
  const text = skillEntry.data.toString('utf8')
  const fmName = frontmatterName(text)
  const dirName = kebabName(fmName && DSH_NAME_RE.test(fmName) ? fmName : slug)
  let detail = null
  try {
    detail = await fetchJson(`${apiBase}/api/v1/skills/${encodeURIComponent(slug)}`)
  } catch {
    detail = null
  }
  const dest = join(installDir, dirName)
  const staging = await mkdtemp(join(tmpdir(), 'dsh-skillhub-'))
  try {
    const staged = join(staging, dirName)
    await writeTree(staged, files, prefix)
    await writeFile(join(staged, SIDECAR), `${JSON.stringify({
      slug,
      name: detail?.skill?.displayName ?? fmName ?? slug,
      version: detail?.latestVersion?.version ?? '',
      source: detail?.skill?.source ?? '',
      installedAt: new Date().toISOString(),
      page: `${SITE}/skills/${slug}`,
    }, null, 2)}\n`)
    await rm(dest, { recursive: true, force: true })
    await mkdir(installDir, { recursive: true })
    try {
      await rename(staged, dest)
    } catch {
      await writeTree(dest, files, prefix)
      await writeFile(join(dest, SIDECAR), await readFile(join(staged, SIDECAR)))
    }
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
  return { slug, dirName }
}

async function uninstallSkill(installDir, slug) {
  assertSlug(slug)
  const installed = await listInstalled(installDir)
  const match = installed.find((item) => item.slug === slug || item.dirName === slug)
  if (!match) throw new Error('skill is not installed')
  await rm(join(installDir, match.dirName), { recursive: true, force: true })
  return { slug: match.slug, dirName: match.dirName }
}

function previewFromZip(files) {
  const prefix = skillRootPrefix(files)
  const skillEntry = files.find((file) => file.name === `${prefix}SKILL.md` || file.name.toLowerCase() === `${prefix}skill.md`)
  if (!skillEntry) throw new Error('zip does not contain SKILL.md')
  const text = skillEntry.data.toString('utf8')
  const extras = files
    .filter((file) => file.name.startsWith(prefix))
    .map((file) => file.name.slice(prefix.length))
    .filter((name) => name && name !== 'SKILL.md')
  return { text, files: extras.slice(0, 40) }
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {Config} config
 */
export function apply(ctx, config) {
  const previewCache = new Map()

  async function handle(request, response) {
    const url = pathnameOf(request)
    const path = url.pathname
    const method = request.method ?? 'GET'

    if (path === `${PREFIX}/api/meta` && method === 'GET') {
      const installed = await listInstalled(config.installDir)
      return sendJson(response, 200, {
        ok: true,
        apiBase: config.apiBase,
        installDir: config.installDir,
        site: SITE,
        installedCount: installed.length,
      })
    }

    if (path === `${PREFIX}/api/categories` && method === 'GET') {
      const payload = await fetchJson(`${config.apiBase}/api/v1/categories`)
      return sendJson(response, 200, { ok: true, categories: payload.items ?? payload.data ?? payload })
    }

    if (path === `${PREFIX}/api/skills` && method === 'GET') {
      const params = new URLSearchParams()
      const keyword = url.searchParams.get('keyword')
      if (keyword) params.set('keyword', keyword)
      const category = url.searchParams.get('category')
      if (category) params.set('category', category)
      const source = url.searchParams.get('source')
      if (source) {
        if (!SOURCES.has(source)) return sendJson(response, 400, { ok: false, error: 'invalid source' })
        params.set('source', source)
      }
      const sortBy = url.searchParams.get('sortBy') ?? 'downloads'
      if (!SORTS.has(sortBy)) return sendJson(response, 400, { ok: false, error: 'invalid sort' })
      params.set('sortBy', sortBy)
      params.set('order', 'desc')
      const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(url.searchParams.get('pageSize') ?? '20') || 20))
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const labels = url.searchParams.get('labels')
      if (labels) params.set('labels', labels)
      const payload = await fetchJson(`${config.apiBase}/api/skills?${params}`)
      const data = payload.data ?? payload
      const skills = Array.isArray(data.skills) ? data.skills.map(cardFromListItem).filter(Boolean) : []
      const installed = await listInstalled(config.installDir)
      const installedSlugs = new Set(installed.map((item) => item.slug))
      const installedDirs = new Set(installed.map((item) => item.dirName))
      for (const skill of skills) {
        skill.installed = installedSlugs.has(skill.slug) || installedDirs.has(skill.slug)
      }
      return sendJson(response, 200, {
        ok: true,
        total: Number(data.total) || skills.length,
        page,
        pageSize,
        skills,
      })
    }

    if (path === `${PREFIX}/api/skill` && method === 'GET') {
      const slug = assertSlug(url.searchParams.get('slug') ?? '')
      const payload = await fetchJson(`${config.apiBase}/api/v1/skills/${encodeURIComponent(slug)}`)
      const installed = await listInstalled(config.installDir)
      const isInstalled = installed.some((item) => item.slug === slug || item.dirName === slug)
      return sendJson(response, 200, { ok: true, detail: payload, installed: isInstalled, page: `${SITE}/skills/${slug}` })
    }

    if (path === `${PREFIX}/api/preview` && method === 'GET') {
      const slug = assertSlug(url.searchParams.get('slug') ?? '')
      const cached = previewCache.get(slug)
      if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
        return sendJson(response, 200, { ok: true, slug, text: cached.text, files: cached.files })
      }
      const zip = await fetchBuffer(`${config.apiBase}/api/v1/download?slug=${encodeURIComponent(slug)}`, MAX_ZIP_BYTES)
      const preview = previewFromZip(unzip(zip))
      previewCache.set(slug, { at: Date.now(), ...preview })
      if (previewCache.size > 24) {
        const oldest = previewCache.keys().next().value
        if (oldest !== undefined) previewCache.delete(oldest)
      }
      return sendJson(response, 200, { ok: true, slug, ...preview })
    }

    if (path === `${PREFIX}/api/installed` && method === 'GET') {
      return sendJson(response, 200, { ok: true, skills: await listInstalled(config.installDir) })
    }

    if (path === `${PREFIX}/api/install` && method === 'POST') {
      if (!sameOrigin(request)) return sendJson(response, 403, { ok: false, error: 'untrusted origin' })
      const body = await readJsonBody(request)
      const slug = assertSlug(body && typeof body.slug === 'string' ? body.slug : '')
      const result = await installSkill(config.apiBase, config.installDir, slug)
      return sendJson(response, 200, { ok: true, ...result })
    }

    if (path === `${PREFIX}/api/uninstall` && method === 'POST') {
      if (!sameOrigin(request)) return sendJson(response, 403, { ok: false, error: 'untrusted origin' })
      const body = await readJsonBody(request)
      const slug = assertSlug(body && typeof body.slug === 'string' ? body.slug : '')
      const result = await uninstallSkill(config.installDir, slug)
      return sendJson(response, 200, { ok: true, ...result })
    }

    sendJson(response, 404, { ok: false, error: 'not found' })
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: PREFIX,
    handler: (request, response) => {
      void handle(request, response).catch((error) => {
        if (!response.headersSent) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
        } else {
          response.destroy()
        }
      })
    },
  }), 'dsh-skillhub: routes')
}
