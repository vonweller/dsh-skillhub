import { test } from 'node:test'
import assert from 'node:assert/strict'
import { installSkill } from '../lib/index.js'

test('installSkill is exported and callable', () => {
  assert.equal(typeof installSkill, 'function')
})
