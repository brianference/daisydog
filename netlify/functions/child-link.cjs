// Netlify Function: Child Link
// Allows children to link their session to a parent account using a 6-digit code

const jwt = require('jsonwebtoken');

const sql = require('../shared/utils/d1-sql.cjs');
const { withinAttemptLimit } = require('../shared/utils/attempt-limit.cjs');

const LINK_ATTEMPT_LIMIT = 10;
const LINK_ATTEMPT_WINDOW_SECONDS = 600;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // 6-digit codes are guessable, so cap attempts per IP.
    if (!(await withinAttemptLimit(event, 'link-code', LINK_ATTEMPT_LIMIT, LINK_ATTEMPT_WINDOW_SECONDS))) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Too many attempts. Try again in a few minutes.' }),
      };
    }

    const { code } = JSON.parse(event.body);

    if (!code || code.length !== 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid code format' }),
      };
    }

    // Verify code exists and is not expired
    const result = await sql`
      SELECT clc.*, c.nickname, c.id as child_id
      FROM child_link_codes clc
      JOIN children c ON c.id = clc.child_id
      WHERE clc.code = ${code}
      AND clc.expires_at > NOW()
      AND clc.used_at IS NULL
      LIMIT 1
    `;

    if (result.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired code' }),
      };
    }

    const linkData = result[0];

    // Redeem atomically: only the request that flips used_at from NULL wins.
    const redeemed = await sql`
      UPDATE child_link_codes
      SET used_at = NOW()
      WHERE id = ${linkData.id} AND used_at IS NULL
      RETURNING id
    `;
    if (redeemed.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired code' }),
      };
    }

    // Create a JWT token for the child session
    // Token expires in 90 days (children shouldn't need to re-link frequently)
    const childToken = jwt.sign(
      {
        childId: linkData.child_id,
        parentId: linkData.parent_id,
        type: 'child',
      },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        childId: linkData.child_id,
        nickname: linkData.nickname,
        token: childToken,
      }),
    };
  } catch (error) {
    console.error('Child link error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to link account' }),
    };
  }
};
