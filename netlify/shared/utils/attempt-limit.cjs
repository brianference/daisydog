/**
 * Fixed-window attempt limiter backed by the D1 rate_limits table.
 * Used by endpoints that must not be brute-forced (child link codes).
 *
 * Two layers: a per-client bucket (IPv6 grouped by /64), then a global bucket across
 * all clients, so an attacker spread over many addresses is still capped.
 */
const crypto = require('crypto');
const sql = require('./d1-sql.cjs');
const { ipGroup } = require('./ip-group.cjs');

/**
 * Counts one use of a bucket and reports whether it is within the limit.
 * @param {string} bucket bucket name
 * @param {number} windowStart start of the current window (seconds)
 * @param {number} limit max uses per window
 * @returns {Promise<boolean>} true if allowed
 */
async function bump(bucket, windowStart, limit) {
  const rows = await sql`
    INSERT INTO rate_limits (bucket, window_start, count) VALUES (${bucket}, ${windowStart}, 1)
    ON CONFLICT (bucket, window_start) DO UPDATE SET count = count + 1
    RETURNING count
  `;
  return rows[0].count <= limit;
}

/**
 * Counts one attempt and reports whether it is allowed.
 * The client bucket is checked first so a rejected client does not spend the global budget.
 * @param {object} event Netlify-style event (needs headers)
 * @param {string} scope bucket prefix, e.g. "link-code"
 * @param {{perClient: number, global: number, windowSeconds: number}} limits attempt limits per window
 * @returns {Promise<boolean>} true if allowed
 */
async function withinAttemptLimit(event, scope, { perClient, global, windowSeconds }) {
  const ip = ipGroup(event.headers['cf-connecting-ip'] || 'unknown');
  const salt = process.env.JWT_SECRET || '';
  const hashed = crypto.createHash('sha256').update(salt + ':' + ip).digest('hex');
  const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
  if (!(await bump(scope + ':' + hashed, windowStart, perClient))) return false;
  return bump(scope + ':global', windowStart, global);
}

module.exports = { withinAttemptLimit };
