/**
 * Contact form handler.
 * Validates the message, rate limits the sender, saves it to D1 (so nothing is lost if
 * email fails), then emails it to the owner through Brevo.
 *
 * Needs the BREVO_API_KEY secret and the MAIL_FROM / CONTACT_TO variables.
 */
import sql from '../shared/utils/d1-sql.cjs';
import { withinAttemptLimit } from '../shared/utils/attempt-limit.cjs';

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_TIMEOUT_MS = 8000;
const CATEGORIES = new Set(['general', 'technical', 'safety', 'feedback']);
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 150;
const MAX_MESSAGE = 2000;
const CONTACT_LIMITS = { perClient: 5, global: 100, windowSeconds: 3600 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

/**
 * Builds a Netlify-style JSON response.
 * @param {number} statusCode HTTP status
 * @param {object} body payload
 * @returns {{statusCode: number, headers: object, body: string}} response
 */
function reply(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

/**
 * Escapes text for inclusion in an HTML email body.
 * @param {string} value untrusted text
 * @returns {string} escaped text
 */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates and normalises the submitted fields.
 * @param {unknown} data parsed request body
 * @returns {{ok: true, fields: object}|{ok: false, error: string}} result
 */
export function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'Invalid request' };
  const text = (value, max) => (typeof value === 'string' && value.trim().length > 0 && value.length <= max ? value.trim() : null);
  const name = text(data.name, MAX_NAME);
  const email = text(data.email, MAX_EMAIL);
  const subject = text(data.subject, MAX_SUBJECT);
  const message = text(data.message, MAX_MESSAGE);
  if (!name || !email || !subject || !message) return { ok: false, error: 'Missing or too long: name, email, subject and message are required' };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'Invalid email address' };
  const category = CATEGORIES.has(data.category) ? data.category : 'general';
  return { ok: true, fields: { name, email, subject, message, category, isParent: data.isParent === true } };
}

/**
 * Emails the submission to the owner. Never throws.
 * @param {object} fields validated fields
 * @returns {Promise<{sent: boolean, error?: string}>} outcome
 */
async function sendEmail(fields) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.CONTACT_TO;
  if (!apiKey || !from || !to) return { sent: false, error: 'email not configured' };
  const rows = [
    ['From', `${fields.name} <${fields.email}>`],
    ['Category', fields.category],
    ['Parent or guardian', fields.isParent ? 'Yes' : 'No'],
    ['Subject', fields.subject],
  ];
  const html = `<h2>DaisyDog contact form</h2>${rows.map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v)}</p>`).join('')}<p><strong>Message:</strong></p><p style="white-space:pre-wrap">${escapeHtml(fields.message)}</p>`;
  const textBody = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessage:\n${fields.message}`;
  try {
    const response = await fetch(BREVO_URL, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'DaisyDog', email: from },
        to: [{ email: to }],
        replyTo: { email: fields.email, name: fields.name },
        subject: `[DaisyDog] ${fields.subject}`.slice(0, 200),
        htmlContent: html,
        textContent: textBody,
      }),
      signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
    });
    return response.ok ? { sent: true } : { sent: false, error: `brevo ${response.status}` };
  } catch (error) {
    return { sent: false, error: error.name };
  }
}

/**
 * Function entry point.
 * @param {object} event Netlify-style event
 * @returns {Promise<object>} response
 */
export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });

  let data;
  try {
    data = JSON.parse(event.body || '');
  } catch {
    return reply(400, { error: 'Invalid JSON' });
  }
  const checked = validate(data);
  if (!checked.ok) return reply(400, { error: checked.error });

  try {
    if (!(await withinAttemptLimit(event, 'contact', CONTACT_LIMITS))) {
      return reply(429, { error: 'Too many messages. Please try again later.' });
    }
    const f = checked.fields;
    const saved = await sql`
      INSERT INTO contact_messages (name, email, subject, category, message, is_parent)
      VALUES (${f.name}, ${f.email}, ${f.subject}, ${f.category}, ${f.message}, ${f.isParent})
      RETURNING id
    `;
    const outcome = await sendEmail(f);
    await sql`UPDATE contact_messages SET emailed = ${outcome.sent}, email_error = ${outcome.error || null} WHERE id = ${saved[0].id}`;
    if (!outcome.sent) console.error('contact email not sent:', outcome.error);
    // The message is stored either way, so the visitor is told it was received.
    return reply(200, { success: true });
  } catch (error) {
    console.error('contact form failed:', error.message);
    return reply(500, { error: 'Could not send your message. Please try again.' });
  }
}
