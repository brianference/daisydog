// Run with: node --test tests/functions/attempt-limit.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { withinAttemptLimit } = require('../../netlify/shared/utils/attempt-limit.cjs')

/** In-memory stand-in for D1's rate_limits table; returns the new count for a bucket and window. */
const installFakeDb = () => {
  const counts = new Map()
  globalThis.__DAISY_DB = {
    prepare: () => ({
      bind: (bucket, windowStart) => ({
        all: async () => {
          const key = `${bucket}|${windowStart}`
          counts.set(key, (counts.get(key) || 0) + 1)
          return { results: [{ count: counts.get(key) }] }
        }
      })
    })
  }
  return counts
}

const eventFor = (ip) => ({ headers: { 'cf-connecting-ip': ip } })
const globalCount = (counts) => [...counts.entries()].find(([key]) => key.startsWith('link-code:global|'))?.[1] || 0

test('the 11th attempt from one client is refused', async () => {
  installFakeDb()
  const limits = { perClient: 10, global: 1000, windowSeconds: 600 }
  const results = []
  for (let i = 0; i < 11; i += 1) results.push(await withinAttemptLimit(eventFor('203.0.113.7'), 'link-code', limits))
  assert.equal(results.slice(0, 10).every(Boolean), true)
  assert.equal(results[10], false)
})

test('rotating the low bits of an IPv6 address does not give a fresh bucket', async () => {
  installFakeDb()
  const limits = { perClient: 3, global: 1000, windowSeconds: 600 }
  const results = []
  for (let i = 0; i < 6; i += 1) {
    results.push(await withinAttemptLimit(eventFor(`2001:db8:1:2::${i + 1}`), 'link-code', limits))
  }
  assert.deepEqual(results, [true, true, true, false, false, false])
})

test('many different clients are still capped by the global limit', async () => {
  installFakeDb()
  const limits = { perClient: 100, global: 5, windowSeconds: 600 }
  const results = []
  for (let i = 0; i < 8; i += 1) results.push(await withinAttemptLimit(eventFor(`198.51.100.${i + 1}`), 'link-code', limits))
  assert.deepEqual(results, [true, true, true, true, true, false, false, false])
})

test('a refused client does not spend the global budget', async () => {
  const counts = installFakeDb()
  const limits = { perClient: 2, global: 1000, windowSeconds: 600 }
  for (let i = 0; i < 10; i += 1) await withinAttemptLimit(eventFor('203.0.113.9'), 'link-code', limits)
  assert.equal(globalCount(counts), 2)
})

test('raw IP addresses are never stored', async () => {
  const counts = installFakeDb()
  await withinAttemptLimit(eventFor('203.0.113.7'), 'link-code', { perClient: 10, global: 60, windowSeconds: 600 })
  assert.ok([...counts.keys()].every((key) => !key.includes('203.0.113.7')))
})
