import OpenAI from 'openai';
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
    const { text } = JSON.parse(event.body);

    if (!text || text.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing text to moderate' }),
      };
    }

    const moderation = await openai.moderations.create({
      input: text,
      model: 'text-moderation-latest',
    });

    const result = moderation.results[0];
    const isSafe = !result.flagged;

    const flaggedCategories = Object.entries(result.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => category);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isSafe,
        flagged: result.flagged,
        categories: flaggedCategories,
        scores: result.category_scores,
      }),
    };
  } catch (error) {
    console.error('Content moderation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'MODERATION_FAILED',
        isSafe: false,
        message: 'Safety check failed - content blocked for safety',
      }),
    };
  }
};
