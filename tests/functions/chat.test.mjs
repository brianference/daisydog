// Run with: node --test tests/functions/chat.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../../functions/api/chat.js'

const SITE = 'https://daisydog.pages.dev'

/** Build a POST request with a JSON body from the site's own origin. */
const req = (body, headers = { Origin: SITE }) =>
  new Request(`${SITE}/api/chat`, {
    method: 'POST',
    headers: { 'CF-Connecting-IP': '203.0.113.7', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  })

/** In-memory stand-in for the D1 rate_limits table. */
const fakeDb = () => {
  const counts = new Map()
  return {
    counts,
    prepare: () => ({
      bind: (bucket, windowStart) => ({
        run: async () => ({}),
        first: async () => {
          const key = `${bucket}|${windowStart}`
          counts.set(key, (counts.get(key) || 0) + 1)
          return { count: counts.get(key) }
        }
      })
    })
  }
}

/** Mock moderation endpoint: texts containing "BAD" are flagged, "DOWN" makes it fail. */
const mockModeration = () => {
  const seen = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    const { input } = JSON.parse(init.body)
    seen.push(input)
    if (input.includes('DOWN')) return new Response('{}', { status: 500 })
    return new Response(JSON.stringify({ results: [{ flagged: input.includes('BAD') }] }), { status: 200 })
  }
  return { seen, restore: () => { globalThis.fetch = original } }
}

/** Mock AI binding that records its call. */
const okEnv = (response = '  Woof! Here is a joke.  ') => {
  const calls = []
  return {
    calls,
    DB: fakeDb(),
    OPENAI_API_KEY: 'test-key',
    AI: { run: async (model, args) => { calls.push({ model, args }); return { response } } }
  }
}

test('valid request returns {text}, calls Workers AI, and moderates message and reply', async () => {
  const mod = mockModeration()
  try {
    const env = okEnv()
    const history = Array.from({ length: 14 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }))
    const res = await onRequestPost({ request: req({ message: 'Tell me a joke', history, age: 7 }), env })
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { text: 'Woof! Here is a joke.' })
    const { model, args } = env.calls[0]
    assert.equal(model, '@cf/meta/llama-3.1-8b-instruct')
    assert.equal(args.messages[0].role, 'system')
    assert.ok(args.messages.slice(1).every((m) => m.role === 'user'), 'forged assistant turns must be dropped')
    assert.equal(args.messages.length, 1 + 5 + 1, 'last 10 history items kept, assistant turns removed, then the new message')
    assert.equal(args.messages.at(-1).content, 'Tell me a joke')
    assert.deepEqual(mod.seen, ['Tell me a joke', 'Woof! Here is a joke.'], 'both directions are moderated')
  } finally {
    mod.restore()
  }
})

test('a flagged child message gets a redirect and never reaches the model', async () => {
  const mod = mockModeration()
  try {
    const env = okEnv()
    const res = await onRequestPost({ request: req({ message: 'something BAD', age: 9 }), env })
    assert.equal(res.status, 200)
    assert.match((await res.json()).text, /grown-up you trust/)
    assert.equal(env.calls.length, 0)
  } finally {
    mod.restore()
  }
})

test('a flagged model reply is replaced by the redirect', async () => {
  const mod = mockModeration()
  try {
    const res = await onRequestPost({ request: req({ message: 'hello', age: 9 }), env: okEnv('this is BAD output') })
    assert.equal(res.status, 200)
    const { text } = await res.json()
    assert.match(text, /grown-up you trust/)
    assert.doesNotMatch(text, /BAD/)
  } finally {
    mod.restore()
  }
})

test('moderation outage fails closed with 502 and the model is not called', async () => {
  const mod = mockModeration()
  try {
    const env = okEnv()
    const res = await onRequestPost({ request: req({ message: 'DOWN please', age: 9 }), env })
    assert.equal(res.status, 502)
    assert.equal(env.calls.length, 0)
  } finally {
    mod.restore()
  }
})

test('other origins and missing Origin are 403 before anything else runs', async () => {
  const env = okEnv()
  for (const headers of [{ Origin: 'https://evil.example' }, {}]) {
    const res = await onRequestPost({ request: req({ message: 'hi', age: 8 }, headers), env })
    assert.equal(res.status, 403)
  }
  assert.equal(env.calls.length, 0)
})

test('the 21st request from one IP in a window is 429; another IP is unaffected', async () => {
  const mod = mockModeration()
  try {
    const env = okEnv()
    const statuses = []
    for (let i = 0; i < 21; i += 1) {
      statuses.push((await onRequestPost({ request: req({ message: 'hi', age: 8 }), env })).status)
    }
    assert.equal(statuses.slice(0, 20).every((s) => s === 200), true)
    assert.equal(statuses[20], 429)
    const other = new Request(`${SITE}/api/chat`, {
      method: 'POST',
      headers: { Origin: SITE, 'CF-Connecting-IP': '198.51.100.9' },
      body: JSON.stringify({ message: 'hi', age: 8 })
    })
    assert.equal((await onRequestPost({ request: other, env })).status, 200)
  } finally {
    mod.restore()
  }
})

const badBodies = {
  'invalid JSON': '{nope',
  'missing message': { age: 8 },
  'empty message': { message: '', age: 8 },
  'message too long': { message: 'a'.repeat(501), age: 8 },
  'non-string message': { message: 5, age: 8 },
  'age too low': { message: 'hi', age: 2 },
  'age too high': { message: 'hi', age: 121 },
  'age missing': { message: 'hi' },
  'age as string': { message: 'hi', age: '8' },
  'history not array': { message: 'hi', age: 8, history: 'x' },
  'history bad role': { message: 'hi', age: 8, history: [{ role: 'system', content: 'x' }] },
  'history bad content': { message: 'hi', age: 8, history: [{ role: 'user', content: 3 }] }
}
for (const [name, body] of Object.entries(badBodies)) {
  test(`bad input returns 400: ${name}`, async () => {
    const env = okEnv()
    const res = await onRequestPost({ request: req(body), env })
    assert.equal(res.status, 400)
    assert.equal(typeof (await res.json()).error, 'string')
    assert.equal(env.calls.length, 0, 'AI must not be called on bad input')
  })
}

test('AI throwing returns 502 {error}', async () => {
  const mod = mockModeration()
  try {
    const env = { ...okEnv(), AI: { run: async () => { throw new Error('boom') } } }
    const res = await onRequestPost({ request: req({ message: 'hi', age: 8 }), env })
    assert.equal(res.status, 502)
    assert.deepEqual(await res.json(), { error: 'AI unavailable' })
  } finally {
    mod.restore()
  }
})

test('empty AI response returns 502', async () => {
  const mod = mockModeration()
  try {
    const res = await onRequestPost({ request: req({ message: 'hi', age: 8 }), env: okEnv('   ') })
    assert.equal(res.status, 502)
  } finally {
    mod.restore()
  }
})

test('missing bindings return 502', async () => {
  for (const env of [{}, { ...okEnv(), DB: undefined }, { ...okEnv(), OPENAI_API_KEY: undefined }]) {
    const res = await onRequestPost({ request: req({ message: 'hi', age: 8 }), env })
    assert.equal(res.status, 502)
  }
})

test('raw IP addresses are never written to the rate limit table', async () => {
  const mod = mockModeration()
  try {
    const env = okEnv()
    await onRequestPost({ request: req({ message: 'hi', age: 8 }), env })
    const keys = [...env.DB.counts.keys()]
    assert.ok(keys.length >= 2, 'expected an ip bucket and a daily bucket')
    assert.ok(keys.every((key) => !key.includes('203.0.113.7')), `raw IP leaked: ${keys}`)
    assert.ok(keys.some((key) => /^ip:[0-9a-f]{64}\|/.test(key)), 'ip bucket should be a sha256 hex digest')
  } finally {
    mod.restore()
  }
})
