/**
 * useGameState - Custom hook for managing game state
 * Implements Single Responsibility Principle for game state management
 */

import { useState, useCallback, useEffect } from 'react'
import { GAME_STATES } from '../types/index.js'
import GameManager from '../services/GameManager.js'

const useGameState = () => {
  const [currentGame, setCurrentGame] = useState(null)
  const [ballPosition, setBallPosition] = useState('ready')
  const [hideSeekCount, setHideSeekCount] = useState(0)
  const [tugStrength, setTugStrength] = useState(0)
  const [guessTarget, setGuessTarget] = useState(null)

  /**
   * Start a new game
   * @param {string} gameType - Game type from GAME_STATES
   * @returns {Object} Game start response
   */
  const startGame = useCallback((gameType) => {
    try {
      const response = GameManager.startGame(gameType)
      setCurrentGame(gameType)
      
      // Update local state based on game type
      switch (gameType) {
        case GAME_STATES.FETCH:
          setBallPosition('ready')
          break
        case GAME_STATES.HIDE_AND_SEEK:
          setHideSeekCount(0)
          break
        case GAME_STATES.TUG_OF_WAR:
          setTugStrength(0)
          break
        case GAME_STATES.GUESSING_GAME:
          setGuessTarget(null)
          break
      }
      
      return response
    } catch (error) {
      console.error('Failed to start game:', error)
      return {
        message: "Woof! I'm having trouble starting that game. Let's try something else! 🐕",
        emotion: 'nervous'
      }
    }
  }, [])

  /**
   * Process game input
   * @param {string} userInput - User's input
   * @returns {Object} Game response
   */
  const processGameInput = useCallback((userInput) => {
    if (!currentGame) {
      return null
    }

    try {
      const response = GameManager.processGameInput(userInput)
      
      if (response && response.stateChanges) {
        // Update local state based on changes
        if (response.stateChanges.ballPosition !== undefined) {
          setBallPosition(response.stateChanges.ballPosition)
        }
        if (response.stateChanges.hideSeekCount !== undefined) {
          setHideSeekCount(response.stateChanges.hideSeekCount)
        }
        if (response.stateChanges.tugStrength !== undefined) {
          setTugStrength(response.stateChanges.tugStrength)
        }
        if (response.stateChanges.guessTarget !== undefined) {
          setGuessTarget(response.stateChanges.guessTarget)
        }
      }
      
      // Check if game ended
      if (response && response.gameEnded) {
        setCurrentGame(null)
        resetGameStates()
      }
      
      return response
    } catch (error) {
      console.error('Failed to process game input:', error)
      return {
        message: "Woof! Something went wrong with the game. Let's try again! 🐕",
        emotion: 'nervous'
      }
    }
  }, [currentGame])

  /**
   * End current game
   * @returns {Object} Game end response
   */
  const endGame = useCallback(() => {
    if (!currentGame) {
      return null
    }

    try {
      const response = GameManager.endCurrentGame()
      setCurrentGame(null)
      resetGameStates()
      return response
    } catch (error) {
      console.error('Failed to end game:', error)
      return {
        message: "Woof! Game ended! What should we do next? 🐾",
        emotion: 'patient'
      }
    }
  }, [currentGame])

  /**
   * Reset all game states
   */
  const resetGameStates = useCallback(() => {
    setBallPosition('ready')
    setHideSeekCount(0)
    setTugStrength(0)
    setGuessTarget(null)
  }, [])

  /**
   * Get available actions for current game
   * @returns {Array} Available game actions
   */
  const getAvailableActions = useCallback(() => {
    if (!currentGame) {
      return []
    }

    try {
      return GameManager.getAvailableActions()
    } catch (error) {
      console.error('Failed to get available actions:', error)
      return []
    }
  }, [currentGame])

  /**
   * Get current game status
   * @returns {Object} Game status
   */
  const getGameStatus = useCallback(() => {
    try {
      return GameManager.getGameStatus()
    } catch (error) {
      console.error('Failed to get game status:', error)
      return {
        active: false,
        game: null,
        state: null
      }
    }
  }, [])

  /**
   * Check if a game is currently active
   * @returns {boolean} Whether a game is active
   */
  const isGameActive = useCallback(() => {
    return currentGame !== null
  }, [currentGame])

  /**
   * Detect game from user message
   * @param {string} message - User message
   * @returns {string|null} Detected game type or null
   */
  const detectGameFromMessage = useCallback((message) => {
    try {
      return GameManager.detectGameFromMessage(message)
    } catch (error) {
      console.error('Failed to detect game from message:', error)
      return null
    }
  }, [])

  /**
   * Get game state for serialization
   * @returns {Object} Serializable game state
   */
  const getSerializableState = useCallback(() => {
    return {
      currentGame,
      ballPosition,
      hideSeekCount,
      tugStrength,
      guessTarget
    }
  }, [currentGame, ballPosition, hideSeekCount, tugStrength, guessTarget])

  /**
   * Restore game state from serialized data
   * @param {Object} serializedState - Previously serialized state
   */
  const restoreState = useCallback((serializedState) => {
    if (serializedState) {
      setCurrentGame(serializedState.currentGame || null)
      setBallPosition(serializedState.ballPosition || 'ready')
      setHideSeekCount(serializedState.hideSeekCount || 0)
      setTugStrength(serializedState.tugStrength || 0)
      setGuessTarget(serializedState.guessTarget || null)
      
      // Sync with GameManager
      GameManager.deserialize(serializedState)
    }
  }, [])

  /**
   * Get game statistics
   * @returns {Object} Game statistics
   */
  const getGameStats = useCallback(() => {
    try {
      return GameManager.getGameStats()
    } catch (error) {
      console.error('Failed to get game stats:', error)
      return {
        currentGame: null,
        gamesAvailable: 0,
        gameState: {}
      }
    }
  }, [])

  // Sync local state with GameManager when currentGame changes
  useEffect(() => {
    if (currentGame) {
      const gameState = {
        ballPosition,
        hideSeekCount,
        tugStrength,
        guessTarget
      }
      
      try {
        GameManager.deserialize({
          currentGame,
          gameState
        })
      } catch (error) {
        console.error('Failed to sync game state:', error)
      }
    }
  }, [currentGame, ballPosition, hideSeekCount, tugStrength, guessTarget])

  return {
    // State
    currentGame,
    ballPosition,
    hideSeekCount,
    tugStrength,
    guessTarget,
    
    // Actions
    startGame,
    processGameInput,
    endGame,
    resetGameStates,
    
    // Queries
    getAvailableActions,
    getGameStatus,
    isGameActive,
    detectGameFromMessage,
    getGameStats,
    
    // Serialization
    getSerializableState,
    restoreState,
    
    // Direct state setters (for advanced use cases)
    setBallPosition,
    setHideSeekCount,
    setTugStrength,
    setGuessTarget
  }
}

export default useGameState
