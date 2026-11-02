/**
 * Fixed-window attempt limiter backed by the D1 rate_limits table.
 * Used by endpoints that must not be brute-forced (child link codes).
 */
const crypto = require('crypto');
const sql = require('./d1-sql.cjs');

/**
 * Counts one attempt and reports whether it is within the limit.
 * @param {object} event Netlify-style event (needs headers)
 * @param {string} scope bucket prefix, e.g. "link-code"
 * @param {number} limit max attempts per window
 * @param {number} windowSeconds window length
 * @returns {Promise<boolean>} true if allowed
 */
async function withinAttemptLimit(event, scope, limit, windowSeconds) {
  const ip = event.headers['cf-connecting-ip'] || 'unknown';
  const salt = process.env.JWT_SECRET || '';
  const hashed = crypto.createHash('sha256').update(salt + ':' + ip).digest('hex');
  const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
  const bucket = scope + ':' + hashed;
  const rows = await sql`
    INSERT INTO rate_limits (bucket, window_start, count) VALUES (${bucket}, ${windowStart}, 1)
    ON CONFLICT (bucket, window_start) DO UPDATE SET count = count + 1
    RETURNING count
  `;
  return rows[0].count <= limit;
}

module.exports = { withinAttemptLimit };
