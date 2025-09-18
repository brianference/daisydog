/**
 * GameManager - Central coordination for all game systems
 * Implements Single Responsibility Principle for game state management
 */

import { GAME_STATES, EMOTIONS } from '../types/index.js'
import { GAME_CONFIG } from '../constants/index.js'
import FetchGame from './games/FetchGame.js'
import HideSeekGame from './games/HideSeekGame.js'
import TugWarGame from './games/TugWarGame.js'
import GuessingGame from './games/GuessingGame.js'

class GameManager {
  constructor() {
    this.games = {
      [GAME_STATES.FETCH]: new FetchGame(),
      [GAME_STATES.HIDE_AND_SEEK]: new HideSeekGame(),
      [GAME_STATES.TUG_OF_WAR]: new TugWarGame(),
      [GAME_STATES.GUESSING_GAME]: new GuessingGame()
    }
    
    this.currentGame = null
    this.gameState = {
      ballPosition: 'ready',
      hideSeekCount: 0,
      tugStrength: 0,
      guessTarget: null
    }
  }

  /**
   * Start a new game
   * @param {string} gameType - Game type from GAME_STATES
   * @returns {Object} Game start response
   */
  startGame(gameType) {
    if (!this.games[gameType]) {
      throw new Error(`Unknown game type: ${gameType}`)
    }

    this.currentGame = gameType
    const game = this.games[gameType]
    
    // Reset game-specific state
    this.resetGameState(gameType)
    
    return game.start(this.gameState)
  }

  /**
   * Process user input for current game
   * @param {string} userInput - User's message
   * @returns {Object} Game response
   */
  processGameInput(userInput) {
    if (!this.currentGame) {
      return null
    }

    const game = this.games[this.currentGame]
    const response = game.processInput(userInput, this.gameState)
    
    // Update game state with any changes
    if (response.stateChanges) {
      Object.assign(this.gameState, response.stateChanges)
    }
    
    // Check if game ended
    if (response.gameEnded) {
      this.currentGame = null
    }
    
    return response
  }

  /**
   * End current game
   * @returns {Object} Game end response
   */
  endCurrentGame() {
    if (!this.currentGame) {
      return null
    }

    const game = this.games[this.currentGame]
    const response = game.end(this.gameState)
    
    this.currentGame = null
    this.resetAllGameStates()
    
    return response
  }

  /**
   * Get current game state
   * @returns {string|null} Current active game
   */
  getCurrentGame() {
    return this.currentGame
  }

  /**
   * Check if a game is currently active
   * @returns {boolean} Whether a game is active
   */
  isGameActive() {
    return this.currentGame !== null
  }

  /**
   * Get available actions for current game
   * @returns {Array} Array of available game actions
   */
  getAvailableActions() {
    if (!this.currentGame) {
      return []
    }

    // Special case for game selection
    if (this.currentGame === 'GAME_SELECTION') {
      return this.getGameSelectionActions()
    }

    const game = this.games[this.currentGame]
    return game.getAvailableActions(this.gameState)
  }

  /**
   * Get game selection actions
   * @returns {Array} Available games to choose from
   */
  getGameSelectionActions() {
    return [
      { id: 'fetch', label: '🎾 Play Fetch', message: "Let's play fetch!" },
      { id: 'hideseek', label: '👁️ Hide & Seek', message: "Let's play hide and seek!" },
      { id: 'tugwar', label: '🪢 Tug of War', message: "Let's play tug of war!" },
      { id: 'guessing', label: '🔢 Guessing Game', message: "Let's play a guessing game!" },
      { id: 'cancel', label: '❌ Never mind', message: "Actually, let's do something else" }
    ]
  }

  /**
   * Get game status information
   * @returns {Object} Current game status
   */
  getGameStatus() {
    if (!this.currentGame) {
      return { active: false, game: null, state: null }
    }

    const game = this.games[this.currentGame]
    return {
      active: true,
      game: this.currentGame,
      state: this.gameState,
      status: game.getStatus(this.gameState)
    }
  }

  /**
   * Reset game state for specific game type
   * @param {string} gameType - Game type to reset
   */
  resetGameState(gameType) {
    switch (gameType) {
      case GAME_STATES.FETCH:
        this.gameState.ballPosition = 'ready'
        break
      case GAME_STATES.HIDE_AND_SEEK:
        this.gameState.hideSeekCount = 0
        break
      case GAME_STATES.TUG_OF_WAR:
        this.gameState.tugStrength = 0
        break
      case GAME_STATES.GUESSING_GAME:
        this.gameState.guessTarget = null
        break
    }
  }

  /**
   * Reset all game states
   */
  resetAllGameStates() {
    this.gameState = {
      ballPosition: 'ready',
      hideSeekCount: 0,
      tugStrength: 0,
      guessTarget: null
    }
  }

  /**
   * Detect game initialization from user message
   * @param {string} message - User message
   * @returns {string|null} Detected game type or null
   */
  detectGameFromMessage(message) {
    const lowerMessage = message.toLowerCase()

    // Specific game detection
    if (lowerMessage.includes('fetch') && (lowerMessage.includes('play') || lowerMessage.includes('let'))) {
      return GAME_STATES.FETCH
    }
    
    if (lowerMessage.includes('hide') && lowerMessage.includes('seek')) {
      return GAME_STATES.HIDE_AND_SEEK
    }
    
    if (lowerMessage.includes('tug') && lowerMessage.includes('war')) {
      return GAME_STATES.TUG_OF_WAR
    }
    
    if (lowerMessage.includes('guessing') && lowerMessage.includes('game')) {
      return GAME_STATES.GUESSING_GAME
    }

    // General "play games" - return special state to show game options
    if ((lowerMessage.includes('play') && lowerMessage.includes('game')) || 
        lowerMessage.includes('let\'s play') ||
        lowerMessage === 'play games') {
      return 'GAME_SELECTION'
    }

    return null
  }

  /**
   * Get game statistics
   * @returns {Object} Game usage statistics
   */
  getGameStats() {
    return {
      currentGame: this.currentGame,
      gamesAvailable: Object.keys(this.games).length,
      gameState: { ...this.gameState }
    }
  }

  /**
   * Serialize game state for persistence
   * @returns {Object} Serializable game state
   */
  serialize() {
    return {
      currentGame: this.currentGame,
      gameState: { ...this.gameState }
    }
  }

  /**
   * Restore game state from serialized data
   * @param {Object} serializedState - Previously serialized state
   */
  deserialize(serializedState) {
    if (serializedState) {
      this.currentGame = serializedState.currentGame || null
      this.gameState = { ...this.gameState, ...serializedState.gameState }
    }
  }
}

// Export singleton instance
export default new GameManager()
