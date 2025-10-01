import OpenAI from 'openai';
import { checkAuth, createAuthErrorResponse, checkRateLimit, getClientIP, createRateLimitResponse } from './utils/rateLimiter.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TONE_PROMPTS = {
  prayer: 'Speak in a reverent, gentle, and peaceful tone, as if speaking a prayer with deep respect and calmness.',
  story: 'Speak in an animated, expressive, and engaging tone, bringing the story to life with excitement and wonder.',
  teaching: 'Speak in a patient, clear, and encouraging tone, like a kind teacher explaining something important.',
  play: 'Speak in an excited, playful, and energetic tone, full of joy and enthusiasm, like playing with a best friend.',
  default: 'Speak in a warm, friendly, and cheerful tone, like a caring companion.',
};

const EMOTION_MODIFIERS = {
  HAPPY: 'with happiness and joy',
  EXCITED: 'with great excitement and energy',
  CALM: 'with calmness and gentleness',
  CURIOUS: 'with curiosity and wonder',
  CARING: 'with care and warmth',
  PLAYFUL: 'with playfulness and fun',
  ENCOURAGING: 'with encouragement and support',
};

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
    const { text, emotion = 'HAPPY', mode = 'play' } = JSON.parse(event.body);

    if (!text || text.trim().length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing text' }),
      };
    }

    // Clean text: remove emojis, asterisks, and extra formatting
    const cleanText = text
      .replace(/[*_~`]/g, '') // Remove markdown formatting
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    const response = await openai.audio.speech.create({
      model: 'tts-1-hd', // Higher quality audio
      voice: 'shimmer', // Lighter, more youthful female voice (naturally higher pitch)
      input: cleanText,
      speed: 1.35, // Increased speed = higher pitch for younger puppy sound
      response_format: 'mp3',
    });

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioBase64: base64Audio,
        format: 'mp3',
      }),
    };
  } catch (error) {
    console.error('TTS generation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'TTS generation failed',
        message: error.message,
      }),
    };
  }
};
