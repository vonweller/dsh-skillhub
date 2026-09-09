import { test } from 'node:test'
import assert from 'node:assert/strict'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { Config } from '../lib/index.js'

function validate(value) {
  return Config['~standard'].validate(value)
}

test('fills defaults for an empty config object', () => {
  const result = validate({})
  assert.equal(result.issues, undefined)
  assert.equal(result.value.apiBase, 'https://api.skillhub.cn')
  assert.equal(result.value.installDir, join(process.env.DSH_HOME?.trim() || join(homedir(), '.dsh'), 'skills'))
})

test('rejects a non-object config', () => {
  const result = validate('nope')
  assert.ok(result.issues?.length)
})

test('rejects an apiBase that is not an http(s) URL', () => {
  const result = validate({ apiBase: 'ftp://example.com' })
  assert.ok(result.issues?.some((issue) => issue.path?.[0] === 'apiBase'))
})

test('rejects credentials in apiBase', () => {
  const result = validate({ apiBase: 'https://user:pass@api.skillhub.cn' })
  assert.ok(result.issues?.some((issue) => issue.path?.[0] === 'apiBase'))
})

test('trims a trailing slash on apiBase', () => {
  const result = validate({ apiBase: 'https://api.skillhub.cn/' })
  assert.equal(result.issues, undefined)
  assert.equal(result.value.apiBase, 'https://api.skillhub.cn')
})

test('rejects unknown fields', () => {
  const result = validate({ extra: true })
  assert.ok(result.issues?.some((issue) => issue.path?.[0] === 'extra'))
})
