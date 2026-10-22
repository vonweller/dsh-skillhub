import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sameOrigin } from '../lib/index.js'

function req(origin, host) {
  const headers = {}
  if (origin !== undefined) headers.origin = origin
  if (host !== undefined) headers.host = host
  return { headers }
}

test('allows requests without an Origin header (proxied / non-browser clients)', () => {
  assert.equal(sameOrigin(req(undefined, '127.0.0.1:52242')), true)
  assert.equal(sameOrigin(req(undefined, undefined)), true)
})

test('allows the official desktop shell origin', () => {
  assert.equal(sameOrigin(req('dsh-app://app', '127.0.0.1:9876')), true)
})

test('allows any loopback origin regardless of port (GUI port changes every launch)', () => {
  assert.equal(sameOrigin(req('http://127.0.0.1:52242', '127.0.0.1:61000')), true)
  assert.equal(sameOrigin(req('http://localhost:3000', '127.0.0.1:61000')), true)
  assert.equal(sameOrigin(req('http://[::1]:4001', '127.0.0.1:61000')), true)
  // exact same-origin (the old rule) still passes
  assert.equal(sameOrigin(req('http://127.0.0.1:52242', '127.0.0.1:52242')), true)
})

test('rejects cross-site and malformed origins', () => {
  assert.equal(sameOrigin(req('https://evil.example', '127.0.0.1:61000')), false)
  assert.equal(sameOrigin(req('http://evil.example:8080', '127.0.0.1:61000')), false)
  assert.equal(sameOrigin(req('null', '127.0.0.1:61000')), false)
  assert.equal(sameOrigin(req('not a url', '127.0.0.1:61000')), false)
  assert.equal(sameOrigin(req('chrome-extension://abcdef', '127.0.0.1:61000')), false)
})

test('keeps exact same-origin for non-loopback hosts (e.g. LAN access)', () => {
  assert.equal(sameOrigin(req('http://192.168.1.10:61000', '192.168.1.10:61000')), true)
})

test('rejects a non-loopback origin that differs from Host', () => {
  assert.equal(sameOrigin(req('http://192.168.1.10:52242', '192.168.1.10:61000')), false)
  assert.equal(sameOrigin(req('http://192.168.1.10:61000', '127.0.0.1:61000')), false)
})
