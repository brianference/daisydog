/**
 * Security utilities for Netlify functions
 * - Session-based authentication with HMAC signatures
 * - Simple in-memory rate limiter by IP
 */

import crypto from 'crypto';

const requestCounts = new Map();
const FUNCTION_SECRET = process.env.VOICE_FUNCTION_SECRET || 'dev-secret-change-in-production';

export function checkAuth(event) {
  const authHeader = event.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      error: 'Missing authorization header'
    };
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const [sessionId, timestamp, signature] = token.split('.');
    
    if (!sessionId || !timestamp || !signature) {
      return {
        authorized: false,
        error: 'Invalid token format'
      };
    }
    
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return {
        authorized: false,
        error: 'Token expired'
      };
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', FUNCTION_SECRET)
      .update(`${sessionId}.${timestamp}`)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return {
        authorized: false,
        error: 'Invalid token signature'
      };
    }
    
    return {
      authorized: true,
      sessionId
    };
  } catch (error) {
    console.error('Auth validation error:', error);
    return {
      authorized: false,
      error: 'Authentication failed'
    };
  }
}

export function createAuthErrorResponse(error = 'Unauthorized') {
  return {
    statusCode: 401,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: 'Unauthorized',
      message: error
    })
  };
}
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

export function checkRateLimit(clientIP) {
  const now = Date.now();
  const clientKey = clientIP || 'unknown';
  
  if (!requestCounts.has(clientKey)) {
    requestCounts.set(clientKey, []);
  }
  
  const requests = requestCounts.get(clientKey);
  
  const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    requestCounts.set(clientKey, recentRequests);
    
    return {
      allowed: false,
      retryAfter: Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
    };
  }
  
  recentRequests.push(now);
  requestCounts.set(clientKey, recentRequests);
  
  return {
    allowed: true,
    remaining: MAX_REQUESTS - recentRequests.length
  };
}

export function getClientIP(event) {
  return event.headers['x-forwarded-for']?.split(',')[0].trim() || 
         event.headers['x-real-ip'] || 
         event.headers['client-ip'] ||
         'unknown';
}

export function createRateLimitResponse(retryAfter) {
  return {
    statusCode: 429,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Retry-After': retryAfter.toString(),
    },
    body: JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter
    })
  };
}
