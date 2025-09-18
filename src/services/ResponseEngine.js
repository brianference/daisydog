/**
 * ResponseEngine - Central response generation and coordination
 * Implements priority-based response logic with modular components
 */

import { RESPONSE_PRIORITIES, CONTENT_FILTER } from '../constants/index.js'
import { EMOTIONS } from '../types/index.js'
import ContentFilter from './ContentFilter.js'
import NameDetector from './NameDetector.js'
import KeywordMatcher from './KeywordMatcher.js'
import GameManager from './GameManager.js'
import EmotionService from './EmotionService.js'
import GeminiService from './GeminiService.js'
import { daisyResponses } from '../data/daisyResponses.js'

class ResponseEngine {
  constructor() {
    this.contentFilter = ContentFilter
    this.nameDetector = NameDetector
    this.keywordMatcher = KeywordMatcher
    this.gameManager = GameManager
    this.emotionService = EmotionService
    this.geminiService = GeminiService
    
    this.storyIndex = 0
  }

  /**
   * Generate response based on user input and context
   * @param {Object} context - Response context
   * @returns {Object} Generated response
   */
  generateResponse(context) {
    const { userMessage, chatState, gameState } = context
    const lowerMessage = userMessage.toLowerCase()

    // Priority 1: Content filtering
    const contentCheck = this.contentFilter.checkContent(userMessage)
    if (!contentCheck.isAppropriate) {
      return this.createResponse(
        contentCheck.response,
        EMOTIONS.NERVOUS,
        RESPONSE_PRIORITIES.INAPPROPRIATE_CONTENT
      )
    }

    // Priority 2: Game state handling
    if (this.gameManager.isGameActive()) {
      const gameResponse = this.gameManager.processGameInput(userMessage)
      if (gameResponse) {
        return this.createResponse(
          gameResponse.message,
          gameResponse.emotion,
          RESPONSE_PRIORITIES.GAME_STATE,
          gameResponse.stateChanges
        )
      }
    }

    // Check for game initialization
    const detectedGame = this.gameManager.detectGameFromMessage(userMessage)
    if (detectedGame) {
      if (detectedGame === 'GAME_SELECTION') {
        // Show game selection menu
        return this.createResponse(
          "*bounces excitedly* Woof! So many fun games to choose from! *wags tail* What would you like to play? 🎮✨",
          EMOTIONS.EXCITED,
          RESPONSE_PRIORITIES.GAME_STATE,
          { currentGame: 'GAME_SELECTION' }
        )
      } else {
        // Start specific game
        const gameResponse = this.gameManager.startGame(detectedGame)
        return this.createResponse(
          gameResponse.message,
          gameResponse.emotion,
          RESPONSE_PRIORITIES.GAME_STATE,
          { ...gameResponse.stateChanges, currentGame: detectedGame }
        )
      }
    }

    // Priority 3: Keyword matching
    const keywordResponse = this.keywordMatcher.matchKeywords(userMessage, chatState)
    if (keywordResponse) {
      return this.createResponse(
        keywordResponse.message,
        keywordResponse.emotion,
        RESPONSE_PRIORITIES.SPECIFIC_KEYWORDS,
        keywordResponse.stateChanges
      )
    }

    // Priority 4: Name detection (only if appropriate)
    if (!chatState.hasGreeted && !chatState.userName && !this.gameManager.isGameActive()) {
      const nameResponse = this.nameDetector.detectName(userMessage)
      if (nameResponse) {
        return this.createResponse(
          nameResponse.message,
          nameResponse.emotion,
          RESPONSE_PRIORITIES.NAME_DETECTION,
          nameResponse.stateChanges
        )
      }
    }

    // Priority 5: AI-enhanced response (if available)
    if (this.geminiService.isAvailable()) {
      return this.generateAIResponse(context)
    }

    // Priority 6: General responses (fallback)
    return this.createResponse(
      this.getGeneralResponse(),
      EMOTIONS.HAPPY,
      RESPONSE_PRIORITIES.GENERAL_RESPONSE
    )
  }

  /**
   * Create standardized response object
   * @param {string} message - Response message
   * @param {string} emotion - Emotion for response
   * @param {number} priority - Response priority
   * @param {Object} stateChanges - State changes to apply
   * @returns {Object} Response object
   */
  createResponse(message, emotion, priority, stateChanges = {}) {
    return {
      message,
      emotion,
      priority,
      stateChanges,
      timestamp: new Date(),
      emotionImage: this.emotionService.getEmotionImage(emotion)
    }
  }

  /**
   * Generate AI-enhanced response using Gemini
   * @param {Object} context - Response context
   * @returns {Promise<Object>} AI response object
   */
  async generateAIResponse(context) {
    try {
      const aiResponse = await this.geminiService.generateResponse(
        context.userMessage,
        context.chatState
      )
      
      // Determine emotion based on AI response content
      const emotion = this.emotionService.determineEmotionFromContext({
        messageContent: aiResponse,
        hungerLevel: context.chatState.hungerLevel,
        gameState: context.gameState?.currentGame
      })
      
      return this.createResponse(
        aiResponse,
        emotion,
        RESPONSE_PRIORITIES.GENERAL_RESPONSE - 1 // Higher priority than general responses
      )
    } catch (error) {
      console.error('AI response generation failed:', error)
      // Fallback to general response
      return this.createResponse(
        this.getGeneralResponse(),
        EMOTIONS.HAPPY,
        RESPONSE_PRIORITIES.GENERAL_RESPONSE
      )
    }
  }

  /**
   * Get general response when no specific match found
   * @returns {string} General response message
   */
  getGeneralResponse() {
    const generalResponses = [
      "*tilts head curiously* That's interesting! Tell me more! 🐾",
      "*wags tail* I love chatting with you! What else is on your mind? 🐕",
      "*bounces playfully* Woof! Want to play a game or hear a story? 🎾📚"
    ]
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
  }

  /**
   * Get story response with rotation
   * @returns {string} Story response
   */
  getStoryResponse() {
    const stories = daisyResponses.stories || []
    if (stories.length === 0) {
      return "*wags tail* I'd love to tell you a story, but I'm still learning new ones! 📚"
    }
    
    const story = stories[this.storyIndex % stories.length]
    this.storyIndex++
    return story
  }

  /**
   * Get random response from category
   * @param {string} category - Response category
   * @returns {string} Random response
   */
  getRandomResponse(category) {
    const responses = daisyResponses[category] || []
    if (responses.length === 0) {
      return this.getGeneralResponse()
    }
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  /**
   * Handle quick action messages
   * @param {string} message - Quick action message
   * @param {Object} chatState - Current chat state
   * @returns {Object} Response for quick action
   */
  handleQuickAction(message, chatState) {
    return this.generateResponse({
      userMessage: message,
      chatState,
      gameState: this.gameManager.serialize()
    })
  }

  /**
   * Get response statistics
   * @returns {Object} Response generation statistics
   */
  getStats() {
    return {
      storyIndex: this.storyIndex,
      gameActive: this.gameManager.isGameActive(),
      currentGame: this.gameManager.getCurrentGame(),
      availableCategories: Object.keys(daisyResponses)
    }
  }

  /**
   * Reset response engine state
   */
  reset() {
    this.storyIndex = 0
    this.gameManager.resetAllGameStates()
  }

  /**
   * Validate response context
   * @param {Object} context - Context to validate
   * @returns {boolean} Whether context is valid
   */
  validateContext(context) {
    return (
      context &&
      typeof context.userMessage === 'string' &&
      context.chatState &&
      typeof context.chatState === 'object'
    )
  }

  /**
   * Get available response priorities
   * @returns {Object} Response priority constants
   */
  getResponsePriorities() {
    return { ...RESPONSE_PRIORITIES }
  }

  /**
   * Serialize response engine state
   * @returns {Object} Serializable state
   */
  serialize() {
    return {
      storyIndex: this.storyIndex,
      gameManager: this.gameManager.serialize()
    }
  }

  /**
   * Restore response engine state
   * @param {Object} serializedState - Previously serialized state
   */
  deserialize(serializedState) {
    if (serializedState) {
      this.storyIndex = serializedState.storyIndex || 0
      if (serializedState.gameManager) {
        this.gameManager.deserialize(serializedState.gameManager)
      }
    }
  }
}

// Export singleton instance
export default new ResponseEngine()
