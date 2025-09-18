/**
 * FetchGame - Handles fetch game mechanics
 * Implements Single Responsibility Principle for fetch game logic
 */

import { EMOTIONS } from '../../types/index.js'
import { GAME_CONFIG } from '../../constants/index.js'

class FetchGame {
  constructor() {
    this.name = 'fetch'
    this.config = GAME_CONFIG.FETCH
  }

  /**
   * Start the fetch game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game start response
   */
  start(gameState) {
    return {
      message: "*bounces excitedly* Woof! Let's play fetch! Throw the ball and I'll catch it! 🎾",
      emotion: EMOTIONS.PLAYFETCH,
      stateChanges: {
        ballPosition: 'ready'
      },
      gameStarted: true
    }
  }

  /**
   * Process user input for fetch game
   * @param {string} userInput - User's message
   * @param {Object} gameState - Current game state
   * @returns {Object} Game response
   */
  processInput(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()

    // Throw ball
    if (lowerInput.includes('throw') || lowerInput.includes('fetch')) {
      return this.throwBall(gameState)
    }

    // Good catch response
    if (lowerInput.includes('good') || lowerInput.includes('catch')) {
      return this.goodCatch(gameState)
    }

    // Stop game
    if (lowerInput.includes('stop') || lowerInput.includes('done')) {
      return this.end(gameState)
    }

    // Default response
    return {
      message: "*holds ball in mouth* Woof! Throw the ball and I'll fetch it! 🎾",
      emotion: EMOTIONS.PLAYFETCH,
      stateChanges: {}
    }
  }

  /**
   * Handle ball throwing
   * @param {Object} gameState - Current game state
   * @returns {Object} Throw response
   */
  throwBall(gameState) {
    return {
      message: "*runs after the ball excitedly* Woof woof! I got it! *brings ball back and drops it at your feet* 🎾",
      emotion: EMOTIONS.PLAYFETCH,
      stateChanges: {
        ballPosition: 'thrown'
      }
    }
  }

  /**
   * Handle good catch praise
   * @param {Object} gameState - Current game state
   * @returns {Object} Praise response
   */
  goodCatch(gameState) {
    return {
      message: "*wags tail proudly* Thanks! I love playing fetch! Want to throw it again? 🐕",
      emotion: EMOTIONS.HAPPY,
      stateChanges: {
        ballPosition: 'ready'
      }
    }
  }

  /**
   * End the fetch game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game end response
   */
  end(gameState) {
    return {
      message: "*pants happily* That was fun! What should we do next? 🐾",
      emotion: EMOTIONS.PATIENT,
      stateChanges: {
        ballPosition: 'ready'
      },
      gameEnded: true
    }
  }

  /**
   * Get available actions for fetch game
   * @param {Object} gameState - Current game state
   * @returns {Array} Available actions
   */
  getAvailableActions(gameState) {
    const actions = [
      { id: 'throw', label: '🎾 Throw ball', message: 'Throw the ball' },
      { id: 'praise', label: '👏 Good catch', message: 'Good catch!' },
      { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
    ]

    return actions
  }

  /**
   * Get current game status
   * @param {Object} gameState - Current game state
   * @returns {Object} Game status
   */
  getStatus(gameState) {
    return {
      ballPosition: gameState.ballPosition,
      ready: gameState.ballPosition === 'ready',
      inProgress: gameState.ballPosition === 'thrown'
    }
  }

  /**
   * Get game rules and instructions
   * @returns {Object} Game information
   */
  getGameInfo() {
    return {
      name: 'Fetch',
      description: 'Play fetch with Daisy! Throw the ball and watch her bring it back.',
      instructions: [
        'Say "throw the ball" to start',
        'Praise Daisy with "good catch"',
        'Say "stop" to end the game'
      ],
      emoji: '🎾'
    }
  }

  /**
   * Validate game state
   * @param {Object} gameState - Game state to validate
   * @returns {boolean} Whether state is valid
   */
  validateState(gameState) {
    return this.config.POSITIONS.includes(gameState.ballPosition)
  }
}

export default FetchGame
