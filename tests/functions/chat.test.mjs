// Run with: node --test tests/functions/chat.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../../functions/api/chat.js'

/** Build a POST request with a JSON body. */
const req = (body) =>
  new Request('http://x/api/chat', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) })

/** Mock AI binding that records its call. */
const okEnv = (response = '  Woof! Here is a joke.  ') => {
  const calls = []
  return { calls, AI: { run: async (model, args) => { calls.push({ model, args }); return { response } } } }
}

test('valid request returns {text} and calls Workers AI correctly', async () => {
  const env = okEnv()
  const history = Array.from({ length: 14 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }))
  const res = await onRequestPost({ request: req({ message: 'Tell me a joke', history, age: 7 }), env })
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { text: 'Woof! Here is a joke.' })
  const { model, args } = env.calls[0]
  assert.equal(model, '@cf/meta/llama-3.1-8b-instruct')
  assert.equal(args.messages[0].role, 'system')
  assert.equal(args.messages.length, 1 + 10 + 1, 'history capped to last 10')
  assert.equal(args.messages.at(-1).content, 'Tell me a joke')
  assert.ok(args.max_tokens > 0)
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
  const env = { AI: { run: async () => { throw new Error('boom') } } }
  const res = await onRequestPost({ request: req({ message: 'hi', age: 8 }), env })
  assert.equal(res.status, 502)
  assert.deepEqual(await res.json(), { error: 'AI unavailable' })
})

test('empty AI response returns 502', async () => {
  const res = await onRequestPost({ request: req({ message: 'hi', age: 8 }), env: okEnv('   ') })
  assert.equal(res.status, 502)
})

test('missing AI binding returns 502', async () => {
  const res = await onRequestPost({ request: req({ message: 'hi', age: 8 }), env: {} })
  assert.equal(res.status, 502)
})
