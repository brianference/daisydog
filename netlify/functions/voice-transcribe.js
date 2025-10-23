import OpenAI, { toFile } from 'openai';
import { checkAuth, createAuthErrorResponse, checkRateLimit, getClientIP, createRateLimitResponse } from '../shared/utils/rateLimiter.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  const auth = checkAuth(event);
  if (!auth.authorized) {
    return createAuthErrorResponse(auth.error);
  }

  const clientIP = getClientIP(event);
  const rateLimit = checkRateLimit(clientIP);
  
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.retryAfter);
  }

  try {
    const { audioBase64, language = 'en' } = JSON.parse(event.body);

    if (!audioBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing audio data' }),
      };
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');

    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(audioBuffer, 'recording.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: language,
      response_format: 'json',
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: transcription.text,
        language: language,
      }),
    };
  } catch (error) {
    console.error('Whisper transcription error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Transcription failed',
        message: error.message,
      }),
    };
  }
};
