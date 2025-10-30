// Netlify Function: Child Link
// Allows children to link their session to a parent account using a 6-digit code

const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

const sql = neon(process.env.DATABASE_URL);

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

    // Mark code as used
    await sql`
      UPDATE child_link_codes
      SET used_at = NOW()
      WHERE id = ${linkData.id}
    `;

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
