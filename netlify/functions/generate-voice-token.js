import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

const FUNCTION_SECRET = process.env.VOICE_FUNCTION_SECRET || 'dev-secret-change-in-production';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body);

    if (!sessionId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing sessionId' }),
      };
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .select('id, created_at')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid session' }),
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
