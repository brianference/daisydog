/**
 * HideSeekGame - Handles hide and seek game mechanics
 * Implements Single Responsibility Principle for hide and seek logic
 */

import { EMOTIONS } from '../../types/index.js'
import { GAME_CONFIG } from '../../constants/index.js'

class HideSeekGame {
  constructor() {
    this.name = 'hide_and_seek'
    this.config = GAME_CONFIG.HIDE_AND_SEEK
  }

  /**
   * Start the hide and seek game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game start response
   */
  start(gameState) {
    return {
      message: "*covers eyes with paws* I'm counting! 1... 2... 3... Ready or not, here I come! 👁️",
      emotion: EMOTIONS.LOOKINGBEHIND,
      stateChanges: {
        hideSeekCount: 0
      },
      gameStarted: true
    }
  }

  /**
   * Process user input for hide and seek game
   * @param {string} userInput - User's message
   * @param {Object} gameState - Current game state
   * @returns {Object} Game response
   */
  processInput(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()

    // Player is ready or found
    if (lowerInput.includes('ready') || lowerInput.includes('found') || lowerInput.includes('here')) {
      return this.playerFound(gameState)
    }

    // Stop game
    if (lowerInput.includes('stop') || lowerInput.includes('done')) {
      return this.end(gameState)
    }

    // Default seeking response
    return {
      message: "*looks around excitedly* I'm seeking! Tell me when you're ready or if I'm getting close! 🔍",
      emotion: EMOTIONS.LOOKINGBEHIND,
      stateChanges: {}
    }
  }

  /**
   * Handle player being found
   * @param {Object} gameState - Current game state
   * @returns {Object} Found response
   */
  playerFound(gameState) {
    const newCount = gameState.hideSeekCount + 1

    // Check if game should end
    if (newCount >= this.config.WIN_THRESHOLD) {
      return {
        message: "*jumps out from behind a tree* Found you! That was so much fun! Want to play again? 🌳",
        emotion: EMOTIONS.EXCITED,
        stateChanges: {
          hideSeekCount: 0
        },
        gameEnded: true
      }
    }

    // Continue seeking
    return {
      message: "*sniffs around* Hmm, where could you be hiding? I'm getting closer! 👃",
      emotion: EMOTIONS.LOOKINGBEHIND,
      stateChanges: {
        hideSeekCount: newCount
      }
    }
  }

  /**
   * End the hide and seek game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game end response
   */
  end(gameState) {
    return {
      message: "*stops searching* Okay! That was fun! What should we do next? 🐾",
      emotion: EMOTIONS.PATIENT,
      stateChanges: {
        hideSeekCount: 0
      },
      gameEnded: true
    }
  }

  /**
   * Get available actions for hide and seek game
   * @param {Object} gameState - Current game state
   * @returns {Array} Available actions
   */
  getAvailableActions(gameState) {
    return [
      { id: 'ready', label: '✅ Ready', message: "I'm ready!" },
      { id: 'found', label: '👋 Found me', message: 'You found me!' },
      { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
    ]
  }

  /**
   * Get current game status
   * @param {Object} gameState - Current game state
   * @returns {Object} Game status
   */
  getStatus(gameState) {
    const progress = gameState.hideSeekCount / this.config.WIN_THRESHOLD
    
    return {
      count: gameState.hideSeekCount,
      maxCount: this.config.WIN_THRESHOLD,
      progress: Math.min(progress, 1),
      seeking: gameState.hideSeekCount < this.config.WIN_THRESHOLD
    }
  }

  /**
   * Get game rules and instructions
   * @returns {Object} Game information
   */
  getGameInfo() {
    return {
      name: 'Hide and Seek',
      description: 'Play hide and seek with Daisy! She\'ll count and then try to find you.',
      instructions: [
        'Daisy will start counting',
        'Say "ready" when you\'re hidden',
        'Say "found me" when she gets close',
        'Say "stop" to end the game'
      ],
      emoji: '👁️'
    }
  }

  /**
   * Validate game state
   * @param {Object} gameState - Game state to validate
   * @returns {boolean} Whether state is valid
   */
  validateState(gameState) {
    return (
      typeof gameState.hideSeekCount === 'number' &&
      gameState.hideSeekCount >= 0 &&
      gameState.hideSeekCount <= this.config.MAX_COUNT
    )
  }

  /**
   * Get seeking phrases for variety
   * @returns {Array} Array of seeking messages
   */
  getSeekingPhrases() {
    return [
      "*sniffs around* Where are you hiding? 👃",
      "*looks behind furniture* Are you over here? 🔍",
      "*tilts head* I can sense you're close! 🐕",
      "*wags tail* This is so much fun! Where could you be? 🎯"
    ]
  }

  /**
   * Get random seeking phrase
   * @returns {string} Random seeking message
   */
  getRandomSeekingPhrase() {
    const phrases = this.getSeekingPhrases()
    return phrases[Math.floor(Math.random() * phrases.length)]
  }
}

export default HideSeekGame
