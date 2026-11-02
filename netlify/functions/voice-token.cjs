import crypto from 'crypto';

// Fail fast: a hardcoded fallback secret would let anyone mint valid session tokens.
if (!process.env.VOICE_FUNCTION_SECRET) {
  throw new Error('CRITICAL: VOICE_FUNCTION_SECRET environment variable is not set.');
}
const FUNCTION_SECRET = process.env.VOICE_FUNCTION_SECRET;

// Netlify serverless function handler
export const handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body || '{}');

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing sessionId' }),
      };
    }

    // Sessions are client-generated; the HMAC signature below is what the other functions verify.
    if (!sessionId || sessionId.length < 10) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid session format' }),
      };
    }

    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', FUNCTION_SECRET)
      .update(`${sessionId}.${timestamp}`)
      .digest('hex');

    const token = `${sessionId}.${timestamp}.${signature}`;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        expiresIn: 24 * 60 * 60 * 1000
      }),
    };
  } catch (error) {
    console.error('Token generation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Token generation failed',
        message: error.message,
      }),
    };
  }
};
