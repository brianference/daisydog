/**
 * NameDetector - Handles user name detection and recognition
 * Implements Single Responsibility Principle for name detection logic
 */

import { EMOTIONS } from '../types/index.js'
import { CONTENT_FILTER } from '../constants/index.js'

class NameDetector {
  constructor() {
    this.gameCommands = CONTENT_FILTER.GAME_COMMANDS
    this.commonWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'is', 'are', 'was',
      'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'hello', 'hi', 'hey', 'yes', 'no', 'okay', 'ok', 'please',
      'thank', 'thanks', 'sorry', 'what', 'when', 'where', 'why', 'how',
      'who', 'which', 'that', 'this', 'these', 'those', 'my', 'your',
      'his', 'her', 'its', 'our', 'their', 'me', 'you', 'him', 'her',
      'us', 'them', 'i', 'we', 'they', 'it', 'he', 'she'
    ]
    
    this.greetingWords = [
      'hello', 'hi', 'hey', 'greetings', 'howdy', 'sup', 'yo'
    ]
  }

  /**
   * Attempt to detect user's name from message
   * @param {string} message - User's message
   * @returns {Object|null} Name detection result or null
   */
  detectName(message) {
    const trimmedMessage = message.trim()
    
    // Skip if message is too short or too long
    if (trimmedMessage.length < 2 || trimmedMessage.length > 25) {
      return null
    }

    // Skip if contains game commands
    if (this.containsGameCommand(trimmedMessage)) {
      return null
    }

    // Skip if contains common greeting patterns
    if (this.isGreeting(trimmedMessage)) {
      return null
    }

    // Skip if contains common words or phrases
    if (this.containsCommonWords(trimmedMessage)) {
      return null
    }

    // Skip if contains question words
    if (this.isQuestion(trimmedMessage)) {
      return null
    }

    // Extract potential name
    const potentialName = this.extractName(trimmedMessage)
    if (potentialName && this.isValidName(potentialName)) {
      return this.createNameResponse(potentialName)
    }

    return null
  }

  /**
   * Check if message contains game commands
   * @param {string} message - Message to check
   * @returns {boolean} Whether message contains game commands
   */
  containsGameCommand(message) {
    const lowerMessage = message.toLowerCase()
    return this.gameCommands.some(command => lowerMessage.includes(command))
  }

  /**
   * Check if message is a greeting
   * @param {string} message - Message to check
   * @returns {boolean} Whether message is a greeting
   */
  isGreeting(message) {
    const lowerMessage = message.toLowerCase()
    return this.greetingWords.some(greeting => lowerMessage.includes(greeting))
  }

  /**
   * Check if message contains common words
   * @param {string} message - Message to check
   * @returns {boolean} Whether message contains common words
   */
  containsCommonWords(message) {
    const lowerMessage = message.toLowerCase()
    const words = lowerMessage.split(/\s+/)
    
    // If more than 60% of words are common words, likely not a name
    const commonWordCount = words.filter(word => 
      this.commonWords.includes(word.replace(/[^\w]/g, ''))
    ).length
    
    return (commonWordCount / words.length) > 0.6
  }

  /**
   * Check if message is a question
   * @param {string} message - Message to check
   * @returns {boolean} Whether message is a question
   */
  isQuestion(message) {
    const lowerMessage = message.toLowerCase()
    const questionWords = ['what', 'when', 'where', 'why', 'how', 'who', 'which']
    
    return (
      message.includes('?') ||
      questionWords.some(word => lowerMessage.startsWith(word)) ||
      lowerMessage.startsWith('is ') ||
      lowerMessage.startsWith('are ') ||
      lowerMessage.startsWith('can ') ||
      lowerMessage.startsWith('do ') ||
      lowerMessage.startsWith('does ')
    )
  }

  /**
   * Extract potential name from message
   * @param {string} message - Message to process
   * @returns {string|null} Extracted name or null
   */
  extractName(message) {
    // Remove punctuation and extra spaces
    let cleaned = message.replace(/[^\w\s]/g, '').trim()
    
    // If single word, likely a name
    const words = cleaned.split(/\s+/)
    if (words.length === 1) {
      return this.capitalizeFirstLetter(words[0])
    }

    // If two words, might be first and last name
    if (words.length === 2) {
      return words.map(word => this.capitalizeFirstLetter(word)).join(' ')
    }

    // For longer messages, try to extract first word if it looks like a name
    const firstWord = words[0]
    if (this.looksLikeName(firstWord)) {
      return this.capitalizeFirstLetter(firstWord)
    }

    return null
  }

  /**
   * Check if word looks like a name
   * @param {string} word - Word to check
   * @returns {boolean} Whether word looks like a name
   */
  looksLikeName(word) {
    const lowerWord = word.toLowerCase()
    
    // Skip common words
    if (this.commonWords.includes(lowerWord)) {
      return false
    }

    // Skip very short or very long words
    if (word.length < 2 || word.length > 15) {
      return false
    }

    // Must contain only letters
    if (!/^[a-zA-Z]+$/.test(word)) {
      return false
    }

    // Skip words that are likely not names
    const notNames = [
      'okay', 'yeah', 'nope', 'sure', 'maybe', 'never', 'always',
      'really', 'very', 'quite', 'just', 'only', 'also', 'even'
    ]
    
    return !notNames.includes(lowerWord)
  }

  /**
   * Validate if extracted text is a valid name
   * @param {string} name - Name to validate
   * @returns {boolean} Whether name is valid
   */
  isValidName(name) {
    // Must be alphabetic characters and spaces only
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return false
    }

    // Must be reasonable length
    if (name.length < 2 || name.length > 25) {
      return false
    }

    // Must not be all uppercase or all lowercase (unless single letter)
    if (name.length > 1) {
      if (name === name.toUpperCase() || name === name.toLowerCase()) {
        return false
      }
    }

    return true
  }

  /**
   * Create response object for detected name
   * @param {string} name - Detected name
   * @returns {Object} Name response object
   */
  createNameResponse(name) {
    const responses = [
      `*wags tail enthusiastically* Nice to meet you, ${name}! I'm Daisy! I love to play games, tell stories, and do tricks! What would you like to do together? 🐕✨`,
      `*bounces excitedly* Hi ${name}! I'm so happy to meet you! I'm Daisy, your friendly AI companion! Want to play or chat? 🎾💕`,
      `*tilts head with a big smile* ${name}! What a lovely name! I'm Daisy! I can play games, tell stories, do tricks, and chat about anything! What sounds fun? 🐾🌟`
    ]

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      emotion: EMOTIONS.EXCITED,
      stateChanges: {
        userName: name,
        hasGreeted: true
      }
    }
  }

  /**
   * Capitalize first letter of word
   * @param {string} word - Word to capitalize
   * @returns {string} Capitalized word
   */
  capitalizeFirstLetter(word) {
    if (!word) return word
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }

  /**
   * Check if name was already detected
   * @param {Object} chatState - Current chat state
   * @returns {boolean} Whether name was already detected
   */
  hasDetectedName(chatState) {
    return chatState.hasGreeted && chatState.userName
  }

  /**
   * Get name detection statistics
   * @returns {Object} Detection statistics
   */
  getStats() {
    return {
      gameCommandsCount: this.gameCommands.length,
      commonWordsCount: this.commonWords.length,
      greetingWordsCount: this.greetingWords.length
    }
  }

  /**
   * Test name detection on sample text
   * @param {string} text - Text to test
   * @returns {Object} Detection test results
   */
  testDetection(text) {
    return {
      input: text,
      containsGameCommand: this.containsGameCommand(text),
      isGreeting: this.isGreeting(text),
      containsCommonWords: this.containsCommonWords(text),
      isQuestion: this.isQuestion(text),
      extractedName: this.extractName(text),
      detectionResult: this.detectName(text)
    }
  }

  /**
   * Get common false positives to avoid
   * @returns {Array} List of words that shouldn't be detected as names
   */
  getFalsePositives() {
    return [
      ...this.commonWords,
      ...this.greetingWords,
      ...this.gameCommands,
      'okay', 'yeah', 'nope', 'sure', 'maybe', 'never', 'always'
    ]
  }

  /**
   * Validate name detection configuration
   * @returns {Object} Configuration validation results
   */
  validateConfig() {
    return {
      gameCommandsValid: Array.isArray(this.gameCommands) && this.gameCommands.length > 0,
      commonWordsValid: Array.isArray(this.commonWords) && this.commonWords.length > 0,
      greetingWordsValid: Array.isArray(this.greetingWords) && this.greetingWords.length > 0,
      totalWords: this.gameCommands.length + this.commonWords.length + this.greetingWords.length
    }
  }
}

// Export singleton instance
export default new NameDetector()
