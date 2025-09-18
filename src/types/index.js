/**
 * Type definitions and interfaces for the Daisy Dog application
 * Provides clear contracts between modules
 */

// Game Types
export const GAME_STATES = {
  NONE: null,
  FETCH: 'fetch',
  HIDE_AND_SEEK: 'hide_and_seek',
  TUG_OF_WAR: 'tug_of_war',
  GUESSING_GAME: 'guessing_game'
}

export const EMOTIONS = {
  HAPPY: 'happy',
  EXCITED: 'excited',
  PLAYFETCH: 'playfetch',
  THINKING: 'thinking',
  HUNGRY: 'hungry',
  PATIENT: 'patient',
  NERVOUS: 'nervous',
  DANCING: 'dancing',
  CROUCHINGDOWN: 'crouchingdown',
  EAGER: 'eager',
  PANTING: 'panting',
  WAITING: 'waiting',
  LOOKINGBEHIND: 'lookingbehind',
  STYLISH: 'stylish',
  SHAKEPAW: 'shakepaw'
}

export const MESSAGE_TYPES = {
  CHAT: 'chat',
  SYSTEM: 'system',
  GAME: 'game'
}

// Interface definitions (using JSDoc for type hints)

/**
 * @typedef {Object} Message
 * @property {number} id - Unique message identifier
 * @property {string} text - Message content
 * @property {'user'|'daisy'} sender - Message sender
 * @property {Date} timestamp - When message was sent
 * @property {string} type - Message type from MESSAGE_TYPES
 * @property {string} [emotionImage] - Path to emotion image for Daisy messages
 */

/**
 * @typedef {Object} GameState
 * @property {string|null} currentGame - Current active game from GAME_STATES
 * @property {string} ballPosition - Fetch game ball position
 * @property {number} hideSeekCount - Hide and seek progress counter
 * @property {number} tugStrength - Tug of war strength level
 * @property {number|null} guessTarget - Guessing game target number
 */

/**
 * @typedef {Object} ChatState
 * @property {Message[]} messages - Array of chat messages
 * @property {string} currentEmotion - Current emotion from EMOTIONS
 * @property {number} hungerLevel - Hunger level (0-5)
 * @property {boolean} hasGreeted - Whether initial greeting occurred
 * @property {string} userName - Detected user name
 * @property {number} storyIndex - Current story rotation index
 * @property {Date|null} lastSaved - Last checkpoint save time
 */

/**
 * @typedef {Object} ResponseContext
 * @property {string} userMessage - User's input message
 * @property {ChatState} chatState - Current chat state
 * @property {GameState} gameState - Current game state
 */

/**
 * @typedef {Object} GameResponse
 * @property {string} message - Response message
 * @property {string} emotion - New emotion state
 * @property {Object} stateChanges - State changes to apply
 */
