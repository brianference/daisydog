/**
 * TugWarGame - Handles tug of war game mechanics
 * Implements Single Responsibility Principle for tug of war logic
 */

import { EMOTIONS } from '../../types/index.js'
import { GAME_CONFIG } from '../../constants/index.js'

class TugWarGame {
  constructor() {
    this.name = 'tug_of_war'
    this.config = GAME_CONFIG.TUG_OF_WAR
  }

  /**
   * Start the tug of war game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game start response
   */
  start(gameState) {
    return {
      message: "*grabs rope in mouth* Grrr! Let's see who's stronger! Pull as hard as you can! 🪢",
      emotion: EMOTIONS.EAGER,
      stateChanges: {
        tugStrength: 0
      },
      gameStarted: true
    }
  }

  /**
   * Process user input for tug of war game
   * @param {string} userInput - User's message
   * @param {Object} gameState - Current game state
   * @returns {Object} Game response
   */
  processInput(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()

    // Pull harder
    if (lowerInput.includes('pull') || lowerInput.includes('tug') || lowerInput.includes('harder')) {
      return this.pullHarder(gameState)
    }

    // Give up
    if (lowerInput.includes('give up') || lowerInput.includes('surrender')) {
      return this.playerGivesUp(gameState)
    }

    // Stop game
    if (lowerInput.includes('stop') || lowerInput.includes('done')) {
      return this.end(gameState)
    }

    // Default tugging response
    return {
      message: "*grabs rope* Grrr! *playful tug* Come on, pull! Let's see who's stronger! 🪢",
      emotion: EMOTIONS.EAGER,
      stateChanges: {}
    }
  }

  /**
   * Handle pulling harder
   * @param {Object} gameState - Current game state
   * @returns {Object} Pull response
   */
  pullHarder(gameState) {
    const newStrength = Math.min(gameState.tugStrength + 1, this.config.MAX_STRENGTH)

    // Check if player wins
    if (newStrength >= this.config.WIN_THRESHOLD) {
      return {
        message: "*lets go of rope and wags tail* You win! You're really strong! That was awesome! 💪",
        emotion: EMOTIONS.EXCITED,
        stateChanges: {
          tugStrength: 0
        },
        gameEnded: true
      }
    }

    // Continue tugging
    const responses = [
      "*pulls back with determination* Grrrr! *playful growl* I'm not giving up! Pull harder! 🪢",
      "*digs paws into ground* Woof! You're strong, but I'm not letting go! 💪",
      "*tugs with all might* Grrr! This is fun! Keep pulling! 🐕"
    ]

    return {
      message: responses[Math.min(newStrength, responses.length - 1)],
      emotion: EMOTIONS.EAGER,
      stateChanges: {
        tugStrength: newStrength
      }
    }
  }

  /**
   * Handle player giving up
   * @param {Object} gameState - Current game state
   * @returns {Object} Give up response
   */
  playerGivesUp(gameState) {
    return {
      message: "*wags tail proudly* I win! *does victory dance* That was a great game! Want to try again? 🏆",
      emotion: EMOTIONS.EXCITED,
      stateChanges: {
        tugStrength: 0
      },
      gameEnded: true
    }
  }

  /**
   * End the tug of war game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game end response
   */
  end(gameState) {
    return {
      message: "*drops rope* Good game! What should we do next? 🐾",
      emotion: EMOTIONS.PATIENT,
      stateChanges: {
        tugStrength: 0
      },
      gameEnded: true
    }
  }

  /**
   * Get available actions for tug of war game
   * @param {Object} gameState - Current game state
   * @returns {Array} Available actions
   */
  getAvailableActions(gameState) {
    return [
      { id: 'pull', label: '💪 Pull harder', message: 'Pull harder!' },
      { id: 'giveup', label: '🏳️ Give up', message: 'I give up!' },
      { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
    ]
  }

  /**
   * Get current game status
   * @param {Object} gameState - Current game state
   * @returns {Object} Game status
   */
  getStatus(gameState) {
    const progress = gameState.tugStrength / this.config.WIN_THRESHOLD
    
    return {
      strength: gameState.tugStrength,
      maxStrength: this.config.MAX_STRENGTH,
      winThreshold: this.config.WIN_THRESHOLD,
      progress: Math.min(progress, 1),
      intensity: this.getIntensityLevel(gameState.tugStrength)
    }
  }

  /**
   * Get intensity level description
   * @param {number} strength - Current strength level
   * @returns {string} Intensity description
   */
  getIntensityLevel(strength) {
    switch (strength) {
      case 0:
        return 'Just started'
      case 1:
        return 'Getting intense'
      case 2:
        return 'Very intense'
      default:
        return 'Maximum effort'
    }
  }

  /**
   * Get game rules and instructions
   * @returns {Object} Game information
   */
  getGameInfo() {
    return {
      name: 'Tug of War',
      description: 'Test your strength against Daisy in a friendly tug of war!',
      instructions: [
        'Say "pull harder" to increase intensity',
        'Say "give up" if Daisy is too strong',
        'Win by pulling hard enough',
        'Say "stop" to end the game'
      ],
      emoji: '🪢'
    }
  }

  /**
   * Validate game state
   * @param {Object} gameState - Game state to validate
   * @returns {boolean} Whether state is valid
   */
  validateState(gameState) {
    return (
      typeof gameState.tugStrength === 'number' &&
      gameState.tugStrength >= 0 &&
      gameState.tugStrength <= this.config.MAX_STRENGTH
    )
  }

  /**
   * Get strength-based responses
   * @param {number} strength - Current strength level
   * @returns {Array} Appropriate responses for strength level
   */
  getStrengthResponses(strength) {
    const responses = {
      0: [
        "*grabs rope gently* Let's start easy! Pull when you're ready! 🪢",
        "*wags tail* This is going to be fun! Give it a try! 🐕"
      ],
      1: [
        "*pulls back steadily* Ooh, you're getting stronger! Keep going! 💪",
        "*digs in paws* Not bad! But I'm not giving up yet! 🐾"
      ],
      2: [
        "*strains against rope* Wow! You're really strong! One more pull might do it! 🔥",
        "*growls playfully* This is intense! You might actually win! 💪"
      ]
    }

    return responses[Math.min(strength, 2)] || responses[2]
  }
}

export default TugWarGame
