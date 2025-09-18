/**
 * Application constants and configuration
 * Centralized configuration management
 */

// Timing constants
export const TIMING = {
  TYPING_DELAY_MIN: 1000,
  TYPING_DELAY_MAX: 2000,
  HUNGER_DECREASE_INTERVAL: 60000, // 1 minute
  FEED_RESPONSE_DELAY: 500,
  AUTO_SAVE_DEBOUNCE: 1000
}

// Game configuration
export const GAME_CONFIG = {
  FETCH: {
    MAX_ROUNDS: 10,
    POSITIONS: ['ready', 'thrown', 'caught']
  },
  HIDE_AND_SEEK: {
    MAX_COUNT: 3,
    WIN_THRESHOLD: 2
  },
  TUG_OF_WAR: {
    MAX_STRENGTH: 3,
    WIN_THRESHOLD: 2
  },
  GUESSING_GAME: {
    MIN_NUMBER: 1,
    MAX_NUMBER: 10
  }
}

// Content filtering
export const CONTENT_FILTER = {
  INAPPROPRIATE_WORDS: [
    'stupid', 'dumb', 'hate', 'kill', 'die', 'bad dog'
  ],
  GAME_COMMANDS: [
    'fetch', 'catch', 'throw', 'ball', 'hide', 'seek', 'found',
    'pull', 'harder', 'tug', 'guess', 'number', 'higher', 'lower'
  ]
}

// UI configuration
export const UI_CONFIG = {
  MAX_HUNGER_LEVEL: 5,
  MIN_HUNGER_LEVEL: 0,
  HUNGER_WARNING_LEVEL: 1,
  MESSAGE_SCROLL_BEHAVIOR: 'smooth',
  MOBILE_BREAKPOINT: 768
}

// Storage keys
export const STORAGE_KEYS = {
  CHAT_STATE: 'daisyDogState',
  USER_PREFERENCES: 'daisyDogPreferences',
  GAME_STATS: 'daisyDogGameStats'
}

// API configuration
export const API_CONFIG = {
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3
}

// Response priorities (lower number = higher priority)
export const RESPONSE_PRIORITIES = {
  INAPPROPRIATE_CONTENT: 1,
  GAME_STATE: 2,
  SPECIFIC_KEYWORDS: 3,
  NAME_DETECTION: 4,
  GENERAL_RESPONSE: 5
}

// Error messages
export const ERROR_MESSAGES = {
  SAVE_FAILED: 'Failed to save conversation state',
  LOAD_FAILED: 'Failed to load conversation state',
  API_ERROR: 'Unable to connect to AI service',
  GAME_ERROR: 'Game state error occurred',
  UNKNOWN_ERROR: 'An unexpected error occurred'
}
