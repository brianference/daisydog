/**
 * ContentFilter - Handles inappropriate content detection and filtering
 * Implements Single Responsibility Principle for content safety
 */

import { CONTENT_FILTER } from '../constants/index.js'
import { EMOTIONS } from '../types/index.js'

class ContentFilter {
  constructor() {
    this.inappropriateWords = CONTENT_FILTER.INAPPROPRIATE_WORDS
    this.gameCommands = CONTENT_FILTER.GAME_COMMANDS
    
    // Additional safety patterns
    this.dangerousPatterns = [
      /\b(kill|die|death|hurt|pain)\b/i,
      /\b(stupid|dumb|idiot|moron)\b/i,
      /\b(hate|angry|mad)\b/i
    ]
    
    // Positive override words (allow even if contains filtered words)
    this.positiveOverrides = [
      'birthday', 'celebrate', 'party', 'happy', 'love', 'friend',
      'play', 'game', 'fun', 'story', 'joke', 'trick'
    ]
  }

  /**
   * Check if content is appropriate for children
   * @param {string} content - Content to check
   * @returns {Object} Content check result
   */
  checkContent(content) {
    const lowerContent = content.toLowerCase().trim()
    
    // Empty content is safe
    if (!lowerContent) {
      return { isAppropriate: true }
    }

    // Check for positive overrides first
    if (this.hasPositiveOverride(lowerContent)) {
      return { isAppropriate: true }
    }

    // Check inappropriate words
    const inappropriateWord = this.findInappropriateWord(lowerContent)
    if (inappropriateWord) {
      return {
        isAppropriate: false,
        reason: 'inappropriate_word',
        word: inappropriateWord,
        response: this.getInappropriateResponse(inappropriateWord)
      }
    }

    // Check dangerous patterns
    const dangerousPattern = this.findDangerousPattern(lowerContent)
    if (dangerousPattern) {
      return {
        isAppropriate: false,
        reason: 'dangerous_pattern',
        pattern: dangerousPattern,
        response: this.getDangerousPatternResponse()
      }
    }

    // Content is appropriate
    return { isAppropriate: true }
  }

  /**
   * Check if content has positive override words
   * @param {string} content - Content to check
   * @returns {boolean} Whether content has positive overrides
   */
  hasPositiveOverride(content) {
    return this.positiveOverrides.some(word => content.includes(word))
  }

  /**
   * Find inappropriate word in content
   * @param {string} content - Content to check
   * @returns {string|null} Found inappropriate word or null
   */
  findInappropriateWord(content) {
    return this.inappropriateWords.find(word => content.includes(word)) || null
  }

  /**
   * Find dangerous pattern in content
   * @param {string} content - Content to check
   * @returns {RegExp|null} Matching dangerous pattern or null
   */
  findDangerousPattern(content) {
    return this.dangerousPatterns.find(pattern => pattern.test(content)) || null
  }

  /**
   * Get response for inappropriate word
   * @param {string} word - The inappropriate word found
   * @returns {string} Appropriate response
   */
  getInappropriateResponse(word) {
    const responses = {
      'stupid': "*whimpers softly* That's not a nice word. Can we talk about something fun instead? 🐕💙",
      'dumb': "*tilts head sadly* I don't like mean words. How about we play a game? 🎾",
      'hate': "*looks sad* Hate is such a strong word. I prefer love and friendship! 💕",
      'kill': "*hides behind paws* That's scary talk! Let's talk about happy things like treats and toys! 🦴",
      'die': "*whimpers* That makes me nervous. Can we talk about something cheerful? 🌈",
      'bad dog': "*ears droop* I try my best to be good! Can you help me learn? 🐾"
    }

    return responses[word] || "*whimpers softly* That makes me sad. Can we talk about something happier? I love playing games and hearing stories! 🐕💙"
  }

  /**
   * Get response for dangerous pattern
   * @returns {string} Safe response
   */
  getDangerousPatternResponse() {
    const responses = [
      "*covers eyes with paws* That sounds scary! Let's talk about fun things instead! 🐕",
      "*whimpers softly* I don't like scary talk. How about a nice story or game? 📚🎾",
      "*hides behind cushion* Can we please talk about happy things? I love treats and toys! 🦴🎾"
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  /**
   * Check if message is a game command (should not be filtered)
   * @param {string} message - Message to check
   * @returns {boolean} Whether message is a game command
   */
  isGameCommand(message) {
    const lowerMessage = message.toLowerCase()
    return this.gameCommands.some(command => lowerMessage.includes(command))
  }

  /**
   * Get content safety level
   * @param {string} content - Content to analyze
   * @returns {Object} Safety analysis
   */
  getSafetyLevel(content) {
    const check = this.checkContent(content)
    
    if (!check.isAppropriate) {
      return {
        level: 'unsafe',
        score: 0,
        reason: check.reason,
        details: check
      }
    }

    // Analyze positive content
    const positiveScore = this.calculatePositiveScore(content)
    
    return {
      level: positiveScore > 0.5 ? 'very_safe' : 'safe',
      score: positiveScore,
      reason: 'appropriate_content'
    }
  }

  /**
   * Calculate positive content score
   * @param {string} content - Content to score
   * @returns {number} Positive score (0-1)
   */
  calculatePositiveScore(content) {
    const lowerContent = content.toLowerCase()
    const positiveWords = [
      'happy', 'fun', 'play', 'love', 'friend', 'good', 'nice',
      'awesome', 'great', 'wonderful', 'amazing', 'cool', 'sweet'
    ]

    const matches = positiveWords.filter(word => lowerContent.includes(word)).length
    return Math.min(matches / 5, 1) // Max score of 1
  }

  /**
   * Add custom inappropriate word
   * @param {string} word - Word to add to filter
   */
  addInappropriateWord(word) {
    if (!this.inappropriateWords.includes(word.toLowerCase())) {
      this.inappropriateWords.push(word.toLowerCase())
    }
  }

  /**
   * Remove word from inappropriate list
   * @param {string} word - Word to remove
   */
  removeInappropriateWord(word) {
    const index = this.inappropriateWords.indexOf(word.toLowerCase())
    if (index > -1) {
      this.inappropriateWords.splice(index, 1)
    }
  }

  /**
   * Get all filtered words (for debugging/admin)
   * @returns {Array} List of filtered words
   */
  getFilteredWords() {
    return [...this.inappropriateWords]
  }

  /**
   * Get filter statistics
   * @returns {Object} Filter usage statistics
   */
  getStats() {
    return {
      inappropriateWordsCount: this.inappropriateWords.length,
      dangerousPatternsCount: this.dangerousPatterns.length,
      positiveOverridesCount: this.positiveOverrides.length,
      gameCommandsCount: this.gameCommands.length
    }
  }

  /**
   * Test content against all filters
   * @param {string} content - Content to test
   * @returns {Object} Detailed test results
   */
  testContent(content) {
    const result = {
      content,
      isAppropriate: true,
      checks: {
        inappropriateWords: [],
        dangerousPatterns: [],
        gameCommands: [],
        positiveOverrides: []
      }
    }

    const lowerContent = content.toLowerCase()

    // Check all inappropriate words
    this.inappropriateWords.forEach(word => {
      if (lowerContent.includes(word)) {
        result.checks.inappropriateWords.push(word)
        result.isAppropriate = false
      }
    })

    // Check all dangerous patterns
    this.dangerousPatterns.forEach(pattern => {
      if (pattern.test(lowerContent)) {
        result.checks.dangerousPatterns.push(pattern.source)
        result.isAppropriate = false
      }
    })

    // Check game commands
    this.gameCommands.forEach(command => {
      if (lowerContent.includes(command)) {
        result.checks.gameCommands.push(command)
      }
    })

    // Check positive overrides
    this.positiveOverrides.forEach(word => {
      if (lowerContent.includes(word)) {
        result.checks.positiveOverrides.push(word)
      }
    })

    // Override if positive words found
    if (result.checks.positiveOverrides.length > 0) {
      result.isAppropriate = true
      result.overridden = true
    }

    return result
  }
}

// Export singleton instance
export default new ContentFilter()
