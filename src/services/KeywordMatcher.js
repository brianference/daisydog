/**
 * KeywordMatcher - Handles keyword-based response matching
 * Implements Single Responsibility Principle for keyword detection
 */

import { EMOTIONS } from '../types/index.js'
import { daisyResponses } from '../data/daisyResponses.js'

class KeywordMatcher {
  constructor() {
    this.keywordMap = {
      // Story keywords
      story: {
        keywords: ['story', 'tell me a story', 'tale', 'narrative'],
        emotion: EMOTIONS.THINKING,
        responseType: 'stories'
      },
      
      // Joke keywords
      joke: {
        keywords: ['joke', 'funny', 'laugh', 'humor', 'comedy'],
        emotion: EMOTIONS.HAPPY,
        responseType: 'jokes'
      },
      
      // Trick keywords
      trick: {
        keywords: ['trick', 'sit', 'stay', 'roll over', 'shake', 'paw'],
        emotion: EMOTIONS.CROUCHINGDOWN,
        responseType: 'tricks'
      },
      
      // Dance keywords
      dance: {
        keywords: ['dance', 'dancing', 'party', 'boogie', 'groove'],
        emotion: EMOTIONS.DANCING,
        responseType: 'dances'
      },
      
      // Greeting keywords
      greeting: {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'howdy'],
        emotion: EMOTIONS.EXCITED,
        responseType: 'greetings'
      },
      
      // Feelings keywords
      feelings: {
        keywords: ['how are you', 'feeling', 'mood', 'emotions', 'happy', 'sad'],
        emotion: EMOTIONS.HAPPY,
        responseType: 'feelings'
      },
      
      // Dreams keywords
      dreams: {
        keywords: ['dream', 'dreams', 'wish', 'hope', 'aspire', 'imagine'],
        emotion: EMOTIONS.THINKING,
        responseType: 'dreams'
      },
      
      // Nature keywords
      nature: {
        keywords: ['nature', 'forest', 'trees', 'flowers', 'animals', 'outdoors'],
        emotion: EMOTIONS.HAPPY,
        responseType: 'nature'
      },
      
      // Adventure keywords
      adventure: {
        keywords: ['adventure', 'explore', 'journey', 'travel', 'discover'],
        emotion: EMOTIONS.EXCITED,
        responseType: 'adventure'
      },
      
      // Friendship keywords
      friendship: {
        keywords: ['friend', 'friendship', 'buddy', 'pal', 'companion'],
        emotion: EMOTIONS.HAPPY,
        responseType: 'friendship'
      },
      
      // Creativity keywords
      creativity: {
        keywords: ['create', 'art', 'draw', 'paint', 'color', 'creative'],
        emotion: EMOTIONS.EXCITED,
        responseType: 'creativity'
      },
      
      // Music keywords
      music: {
        keywords: ['music', 'song', 'sing', 'melody', 'sound', 'rhythm'],
        emotion: EMOTIONS.DANCING,
        responseType: 'music'
      },
      
      // Learning keywords
      learning: {
        keywords: ['learn', 'study', 'school', 'education', 'knowledge'],
        emotion: EMOTIONS.THINKING,
        responseType: 'learning'
      },
      
      // Wonder keywords
      wonder: {
        keywords: ['wonder', 'amazing', 'wow', 'incredible', 'awesome'],
        emotion: EMOTIONS.EXCITED,
        responseType: 'wonder'
      },
      
      // Help keywords
      help: {
        keywords: ['help', 'assist', 'support', 'aid', 'career', 'job'],
        emotion: EMOTIONS.EAGER,
        responseType: 'helping'
      }
    }
  }

  /**
   * Match keywords in user message and return appropriate response
   * @param {string} message - User's message
   * @param {Object} chatState - Current chat state
   * @returns {Object|null} Keyword match response or null
   */
  matchKeywords(message, chatState) {
    const lowerMessage = message.toLowerCase()
    
    // Find the best matching keyword category
    const match = this.findBestMatch(lowerMessage)
    if (!match) {
      return null
    }

    // Generate response based on match
    return this.generateKeywordResponse(match, chatState)
  }

  /**
   * Find the best keyword match for message
   * @param {string} lowerMessage - Lowercase message
   * @returns {Object|null} Best match or null
   */
  findBestMatch(lowerMessage) {
    let bestMatch = null
    let highestScore = 0

    for (const [category, config] of Object.entries(this.keywordMap)) {
      const score = this.calculateMatchScore(lowerMessage, config.keywords)
      if (score > highestScore) {
        highestScore = score
        bestMatch = { category, config, score }
      }
    }

    // Only return match if score is above threshold
    return highestScore > 0 ? bestMatch : null
  }

  /**
   * Calculate match score for keywords
   * @param {string} message - Message to check
   * @param {Array} keywords - Keywords to match against
   * @returns {number} Match score
   */
  calculateMatchScore(message, keywords) {
    let score = 0
    
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        // Longer keywords get higher scores
        score += keyword.length
        
        // Exact word matches get bonus points
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i')
        if (wordBoundaryRegex.test(message)) {
          score += 5
        }
      }
    }
    
    return score
  }

  /**
   * Generate response for keyword match
   * @param {Object} match - Keyword match object
   * @param {Object} chatState - Current chat state
   * @returns {Object} Response object
   */
  generateKeywordResponse(match, chatState) {
    const { category, config } = match
    
    // Special handling for stories (with rotation)
    if (category === 'story') {
      return {
        message: this.getStoryResponse(chatState),
        emotion: config.emotion,
        stateChanges: {
          storyIndex: (chatState.storyIndex || 0) + 1
        }
      }
    }
    
    // Get random response from category
    const responses = daisyResponses[config.responseType] || []
    if (responses.length === 0) {
      return null
    }
    
    const message = responses[Math.floor(Math.random() * responses.length)]
    
    return {
      message,
      emotion: config.emotion,
      stateChanges: {}
    }
  }

  /**
   * Get story response with rotation
   * @param {Object} chatState - Current chat state
   * @returns {string} Story response
   */
  getStoryResponse(chatState) {
    const stories = daisyResponses.stories || []
    if (stories.length === 0) {
      return "*wags tail* I'd love to tell you a story, but I'm still learning new ones! 📚"
    }
    
    const storyIndex = chatState.storyIndex || 0
    return stories[storyIndex % stories.length]
  }

  /**
   * Add new keyword category
   * @param {string} category - Category name
   * @param {Object} config - Category configuration
   */
  addKeywordCategory(category, config) {
    if (this.validateCategoryConfig(config)) {
      this.keywordMap[category] = config
    } else {
      throw new Error('Invalid category configuration')
    }
  }

  /**
   * Remove keyword category
   * @param {string} category - Category to remove
   */
  removeKeywordCategory(category) {
    delete this.keywordMap[category]
  }

  /**
   * Update existing keyword category
   * @param {string} category - Category to update
   * @param {Object} updates - Updates to apply
   */
  updateKeywordCategory(category, updates) {
    if (this.keywordMap[category]) {
      this.keywordMap[category] = { ...this.keywordMap[category], ...updates }
    }
  }

  /**
   * Validate category configuration
   * @param {Object} config - Configuration to validate
   * @returns {boolean} Whether configuration is valid
   */
  validateCategoryConfig(config) {
    return (
      config &&
      Array.isArray(config.keywords) &&
      config.keywords.length > 0 &&
      typeof config.emotion === 'string' &&
      typeof config.responseType === 'string'
    )
  }

  /**
   * Get all keyword categories
   * @returns {Object} All keyword categories
   */
  getAllCategories() {
    return { ...this.keywordMap }
  }

  /**
   * Get keywords for specific category
   * @param {string} category - Category name
   * @returns {Array|null} Keywords or null if category doesn't exist
   */
  getCategoryKeywords(category) {
    return this.keywordMap[category]?.keywords || null
  }

  /**
   * Search for categories containing specific keyword
   * @param {string} keyword - Keyword to search for
   * @returns {Array} Categories containing the keyword
   */
  findCategoriesWithKeyword(keyword) {
    const results = []
    const lowerKeyword = keyword.toLowerCase()
    
    for (const [category, config] of Object.entries(this.keywordMap)) {
      if (config.keywords.some(kw => kw.toLowerCase().includes(lowerKeyword))) {
        results.push({ category, config })
      }
    }
    
    return results
  }

  /**
   * Get keyword matching statistics
   * @returns {Object} Keyword statistics
   */
  getStats() {
    const stats = {
      totalCategories: Object.keys(this.keywordMap).length,
      totalKeywords: 0,
      categoriesByEmotion: {},
      categoriesByResponseType: {}
    }
    
    for (const [category, config] of Object.entries(this.keywordMap)) {
      stats.totalKeywords += config.keywords.length
      
      // Group by emotion
      if (!stats.categoriesByEmotion[config.emotion]) {
        stats.categoriesByEmotion[config.emotion] = []
      }
      stats.categoriesByEmotion[config.emotion].push(category)
      
      // Group by response type
      if (!stats.categoriesByResponseType[config.responseType]) {
        stats.categoriesByResponseType[config.responseType] = []
      }
      stats.categoriesByResponseType[config.responseType].push(category)
    }
    
    return stats
  }

  /**
   * Test keyword matching on sample text
   * @param {string} text - Text to test
   * @returns {Object} Test results
   */
  testMatching(text) {
    const lowerText = text.toLowerCase()
    const results = {
      input: text,
      matches: [],
      bestMatch: null
    }
    
    // Test all categories
    for (const [category, config] of Object.entries(this.keywordMap)) {
      const score = this.calculateMatchScore(lowerText, config.keywords)
      if (score > 0) {
        results.matches.push({ category, config, score })
      }
    }
    
    // Sort by score
    results.matches.sort((a, b) => b.score - a.score)
    results.bestMatch = results.matches[0] || null
    
    return results
  }

  /**
   * Get keyword coverage analysis
   * @param {Array} messages - Array of messages to analyze
   * @returns {Object} Coverage analysis
   */
  analyzeCoverage(messages) {
    const coverage = {
      totalMessages: messages.length,
      matchedMessages: 0,
      categoryUsage: {},
      unmatchedMessages: []
    }
    
    for (const message of messages) {
      const match = this.findBestMatch(message.toLowerCase())
      if (match) {
        coverage.matchedMessages++
        coverage.categoryUsage[match.category] = (coverage.categoryUsage[match.category] || 0) + 1
      } else {
        coverage.unmatchedMessages.push(message)
      }
    }
    
    coverage.matchRate = coverage.matchedMessages / coverage.totalMessages
    
    return coverage
  }
}

// Export singleton instance
export default new KeywordMatcher()
