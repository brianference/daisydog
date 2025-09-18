/**
 * GuessingGame - Handles number guessing game mechanics
 * Implements Single Responsibility Principle for guessing game logic
 */

import { EMOTIONS } from '../../types/index.js'
import { GAME_CONFIG } from '../../constants/index.js'

class GuessingGame {
  constructor() {
    this.name = 'guessing_game'
    this.config = GAME_CONFIG.GUESSING_GAME
  }

  /**
   * Start the guessing game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game start response
   */
  start(gameState) {
    const target = this.generateTarget()
    
    return {
      message: "*thinks hard* Okay! I'm thinking of a number between 1 and 10! Can you guess it? 🤔",
      emotion: EMOTIONS.THINKING,
      stateChanges: {
        guessTarget: target
      },
      gameStarted: true
    }
  }

  /**
   * Process user input for guessing game
   * @param {string} userInput - User's message
   * @param {Object} gameState - Current game state
   * @returns {Object} Game response
   */
  processInput(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()

    // Stop game
    if (lowerInput.includes('stop') || lowerInput.includes('done')) {
      return this.end(gameState)
    }

    // Give hint
    if (lowerInput.includes('hint') || lowerInput.includes('help')) {
      return this.giveHint(gameState)
    }

    // Process number guess
    const guess = this.extractNumber(userInput)
    if (guess !== null) {
      return this.processGuess(guess, gameState)
    }

    // Invalid input
    return {
      message: "*tilts head* I need a number between 1 and 10! Try again! 🔢",
      emotion: EMOTIONS.THINKING,
      stateChanges: {}
    }
  }

  /**
   * Process a number guess
   * @param {number} guess - User's guess
   * @param {Object} gameState - Current game state
   * @returns {Object} Guess response
   */
  processGuess(guess, gameState) {
    const target = gameState.guessTarget

    // Validate guess range
    if (guess < this.config.MIN_NUMBER || guess > this.config.MAX_NUMBER) {
      return {
        message: `*shakes head* Pick a number between ${this.config.MIN_NUMBER} and ${this.config.MAX_NUMBER}! 🔢`,
        emotion: EMOTIONS.PATIENT,
        stateChanges: {}
      }
    }

    // Correct guess
    if (guess === target) {
      return {
        message: `*jumps up and down* YES! You got it! It was ${target}! You're so smart! 🎉`,
        emotion: EMOTIONS.EXCITED,
        stateChanges: {
          guessTarget: null
        },
        gameEnded: true
      }
    }

    // Too low
    if (guess < target) {
      return {
        message: "*wags tail* Higher! Try a bigger number! 📈",
        emotion: EMOTIONS.EAGER,
        stateChanges: {}
      }
    }

    // Too high
    return {
      message: "*shakes head* Lower! Try a smaller number! 📉",
      emotion: EMOTIONS.EAGER,
      stateChanges: {}
    }
  }

  /**
   * Give a hint to the player
   * @param {Object} gameState - Current game state
   * @returns {Object} Hint response
   */
  giveHint(gameState) {
    const target = gameState.guessTarget
    const hints = [
      `*whispers* It's ${target % 2 === 0 ? 'even' : 'odd'}! 🤫`,
      `*gives puppy eyes* It's ${target <= 5 ? 'in the first half' : 'in the second half'}! 🐕`,
      `*tilts head* It's ${target < 5 ? 'less than 5' : target > 5 ? 'greater than 5' : 'exactly 5'}! 🤔`
    ]

    return {
      message: hints[Math.floor(Math.random() * hints.length)],
      emotion: EMOTIONS.THINKING,
      stateChanges: {}
    }
  }

  /**
   * End the guessing game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game end response
   */
  end(gameState) {
    const target = gameState.guessTarget
    const message = target 
      ? `*wags tail* The number was ${target}! Good try though! What should we do next? 🐾`
      : "*wags tail* That was fun! What should we do next? 🐾"

    return {
      message,
      emotion: EMOTIONS.PATIENT,
      stateChanges: {
        guessTarget: null
      },
      gameEnded: true
    }
  }

  /**
   * Get available actions for guessing game
   * @param {Object} gameState - Current game state
   * @returns {Array} Available actions
   */
  getAvailableActions(gameState) {
    return [
      { id: 'guess1', label: '1️⃣', message: '1' },
      { id: 'guess5', label: '5️⃣', message: '5' },
      { id: 'guess10', label: '🔟', message: '10' },
      { id: 'hint', label: '💡 Hint', message: 'Give me a hint' },
      { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
    ]
  }

  /**
   * Get current game status
   * @param {Object} gameState - Current game state
   * @returns {Object} Game status
   */
  getStatus(gameState) {
    return {
      target: gameState.guessTarget,
      hasTarget: gameState.guessTarget !== null,
      range: {
        min: this.config.MIN_NUMBER,
        max: this.config.MAX_NUMBER
      }
    }
  }

  /**
   * Generate random target number
   * @returns {number} Random number within game range
   */
  generateTarget() {
    return Math.floor(Math.random() * this.config.MAX_NUMBER) + this.config.MIN_NUMBER
  }

  /**
   * Extract number from user input
   * @param {string} input - User input
   * @returns {number|null} Extracted number or null
   */
  extractNumber(input) {
    // Try to parse as integer
    const parsed = parseInt(input.trim())
    if (!isNaN(parsed)) {
      return parsed
    }

    // Try to extract from text
    const numberWords = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    }

    const lowerInput = input.toLowerCase()
    for (const [word, number] of Object.entries(numberWords)) {
      if (lowerInput.includes(word)) {
        return number
      }
    }

    return null
  }

  /**
   * Get game rules and instructions
   * @returns {Object} Game information
   */
  getGameInfo() {
    return {
      name: 'Guessing Game',
      description: `Daisy thinks of a number between ${this.config.MIN_NUMBER} and ${this.config.MAX_NUMBER}. Can you guess it?`,
      instructions: [
        'Daisy will think of a number',
        'Guess the number by typing it',
        'Daisy will say "higher" or "lower"',
        'Keep guessing until you get it right!',
        'Say "hint" for a clue'
      ],
      emoji: '🔢'
    }
  }

  /**
   * Validate game state
   * @param {Object} gameState - Game state to validate
   * @returns {boolean} Whether state is valid
   */
  validateState(gameState) {
    if (gameState.guessTarget === null) {
      return true
    }

    return (
      typeof gameState.guessTarget === 'number' &&
      gameState.guessTarget >= this.config.MIN_NUMBER &&
      gameState.guessTarget <= this.config.MAX_NUMBER
    )
  }

  /**
   * Get encouragement messages
   * @returns {Array} Array of encouraging messages
   */
  getEncouragementMessages() {
    return [
      "*wags tail* You're doing great! Keep trying! 🐕",
      "*bounces* So close! Don't give up! 🎯",
      "*tilts head* Hmm, think about it! You can do this! 💭",
      "*pants excitedly* This is fun! Try another number! 🎮"
    ]
  }

  /**
   * Get random encouragement
   * @returns {string} Random encouraging message
   */
  getRandomEncouragement() {
    const messages = this.getEncouragementMessages()
    return messages[Math.floor(Math.random() * messages.length)]
  }
}

export default GuessingGame
