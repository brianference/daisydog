// Run with: node --test tests/functions/contact.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { handler, validate, escapeHtml } from '../../netlify/functions/contact-form.js'

const GOOD = { name: 'Pat Parent', email: 'pat@example.com', subject: 'Question', category: 'general', message: 'Hello there', isParent: true }

/** Fake D1 recording every statement; rate limit counters increment per bucket. */
const installDb = () => {
  const log = []
  const counts = new Map()
  globalThis.__DAISY_DB = {
    prepare: (text) => ({
      bind: (...params) => ({
        all: async () => {
          log.push({ text, params })
          if (text.includes('INTO rate_limits')) {
            const key = `${params[0]}|${params[1]}`
            counts.set(key, (counts.get(key) || 0) + 1)
            return { results: [{ count: counts.get(key) }] }
          }
          if (text.includes('INTO contact_messages')) return { results: [{ id: 7 }] }
          return { results: [] }
        }
      })
    })
  }
  return log
}

/** Stand-in for Brevo; `status` is the HTTP status it answers with. */
const installBrevo = (status = 201) => {
  const calls = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) })
    return new Response('{}', { status })
  }
  return { calls, restore: () => { globalThis.fetch = original } }
}

const configure = () => {
  process.env.BREVO_API_KEY = 'test-key'
  process.env.MAIL_FROM = 'no-reply@txeas.com'
  process.env.CONTACT_TO = 'owner@example.com'
}

const post = (body, ip = '203.0.113.7') => handler({
  httpMethod: 'POST',
  headers: { 'cf-connecting-ip': ip },
  body: typeof body === 'string' ? body : JSON.stringify(body)
})

test('a valid message is saved first, then emailed from the verified sender with reply-to set', async () => {
  const log = installDb(); const brevo = installBrevo(); configure()
  try {
    const res = await post(GOOD)
    assert.equal(res.statusCode, 200)
    const insertAt = log.findIndex((entry) => entry.text.includes('INTO contact_messages'))
    assert.ok(insertAt >= 0, 'message must be saved')
    assert.equal(brevo.calls.length, 1)
    const mail = brevo.calls[0].body
    assert.equal(mail.sender.email, 'no-reply@txeas.com')
    assert.equal(mail.to[0].email, 'owner@example.com')
    assert.equal(mail.replyTo.email, 'pat@example.com')
    assert.equal(brevo.calls[0].init.headers['api-key'], 'test-key')
    const update = log.find((entry) => entry.text.includes('UPDATE contact_messages'))
    assert.equal(update.params[0], 1, 'emailed flag is recorded as true')
  } finally { brevo.restore() }
})

test('HTML in the message is escaped in the email body', async () => {
  installDb(); const brevo = installBrevo(); configure()
  try {
    await post({ ...GOOD, message: '<script>alert(1)</script>', name: '<b>x</b>' })
    const { htmlContent } = brevo.calls[0].body
    assert.ok(!htmlContent.includes('<script>') && !htmlContent.includes('<b>x</b>'))
    assert.ok(htmlContent.includes('&lt;script&gt;'))
  } finally { brevo.restore() }
})

test('a Brevo failure still returns 200 because the message is stored, and records the failure', async () => {
  const log = installDb(); const brevo = installBrevo(401); configure()
  try {
    const res = await post(GOOD)
    assert.equal(res.statusCode, 200)
    const update = log.find((entry) => entry.text.includes('UPDATE contact_messages'))
    assert.equal(update.params[0], 0)
    assert.equal(update.params[1], 'brevo 401')
  } finally { brevo.restore() }
})

test('missing email configuration still saves the message', async () => {
  const log = installDb(); const brevo = installBrevo(); configure()
  delete process.env.BREVO_API_KEY
  try {
    const res = await post(GOOD)
    assert.equal(res.statusCode, 200)
    assert.equal(brevo.calls.length, 0)
    assert.ok(log.some((entry) => entry.text.includes('INTO contact_messages')))
  } finally { brevo.restore() }
})

test('bad input is 400 and nothing is saved or sent', async () => {
  const log = installDb(); const brevo = installBrevo(); configure()
  try {
    const bad = [
      '{nope', { ...GOOD, email: 'not-an-email' }, { ...GOOD, name: '' }, { ...GOOD, subject: undefined },
      { ...GOOD, message: 'x'.repeat(2001) }, { ...GOOD, name: { a: 1 } }, []
    ]
    for (const body of bad) assert.equal((await post(body)).statusCode, 400, JSON.stringify(body)?.slice(0, 60))
    assert.equal(log.length, 0)
    assert.equal(brevo.calls.length, 0)
  } finally { brevo.restore() }
})

test('the sixth message from one client in an hour is 429', async () => {
  installDb(); const brevo = installBrevo(); configure()
  try {
    const statuses = []
    for (let i = 0; i < 6; i += 1) statuses.push((await post(GOOD)).statusCode)
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429])
  } finally { brevo.restore() }
})

test('GET is 405', async () => {
  installDb()
  assert.equal((await handler({ httpMethod: 'GET', headers: {} })).statusCode, 405)
})

test('unknown categories fall back to general; validate and escapeHtml behave', () => {
  assert.equal(validate({ ...GOOD, category: 'weird' }).fields.category, 'general')
  assert.equal(escapeHtml(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;')
})
