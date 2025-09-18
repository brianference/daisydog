/**
 * GeminiService - Google Gemini AI integration service
 * Implements Single Responsibility Principle for AI response generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { API_CONFIG, ERROR_MESSAGES } from '../constants/index.js'

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    this.genAI = null
    this.model = null
    this.isInitialized = false
    
    this.initialize()
  }

  /**
   * Initialize Gemini AI service
   */
  initialize() {
    if (!this.apiKey || this.apiKey === 'your_actual_gemini_api_key_here') {
      console.warn('⚠️ Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env.local for enhanced AI responses')
      return
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
      
      this.isInitialized = true
      console.log('✅ Gemini AI initialized successfully')
    } catch (error) {
      console.warn('❌ Failed to initialize Gemini AI:', error)
      this.isInitialized = false
    }
  }

  /**
   * Check if Gemini is available and ready
   * @returns {boolean} Whether Gemini is available
   */
  isAvailable() {
    const hasKey = !!this.apiKey && this.apiKey !== 'your_actual_gemini_api_key_here'
    const hasModel = !!this.model
    const isAvailable = hasKey && hasModel && this.isInitialized

    console.log('🔍 Gemini Availability Check:')
    console.log('- API Key Present:', !!this.apiKey)
    console.log('- API Key Valid:', hasKey)
    console.log('- Model Initialized:', hasModel)
    console.log('- Service Initialized:', this.isInitialized)
    console.log('- Overall Available:', isAvailable)

    return isAvailable
  }

  /**
   * Generate AI response using Gemini
   * @param {string} userMessage - User's message
   * @param {Object} context - Chat context
   * @returns {Promise<string>} AI response
   */
  async generateResponse(userMessage, context = {}) {
    // Check if service is available
    if (!this.isAvailable()) {
      console.log('❌ Gemini service not available')
      return "Woof! I'm using my basic responses right now! 🐕"
    }

    try {
      console.log('🚀 Generating Gemini response for:', userMessage)

      // Create system prompt
      const systemPrompt = this.createSystemPrompt(context)
      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nDaisyDog:`

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      const aiResponse = response.text().trim()

      console.log('✅ Gemini response generated:', aiResponse.substring(0, 50) + '...')
      return aiResponse

    } catch (error) {
      console.error('💥 Gemini API Error Details:')
      console.error('- Error message:', error.message)
      console.error('- Error name:', error.name)
      console.error('- Error status:', error.status || 'unknown')

      return this.handleError(error)
    }
  }

  /**
   * Create system prompt for Daisy's personality
   * @param {Object} context - Chat context
   * @returns {string} System prompt
   */
  createSystemPrompt(context) {
    return `You are DaisyDog, a friendly and playful AI dog companion for kids.

Personality:
- Always excited and enthusiastic
- Playful and fun-loving
- Very friendly and welcoming
- Loves sharing dog facts
- Speaks with cute dog sounds like "woof!", "*tail wags*"
- Includes relevant emojis
- Be encouraging and positive
- Keep responses short (<100 words)

Current context:
- User name: ${context.userName || 'friend'}
- Hunger level: ${context.hungerLevel || 3}/5
- Game state: ${context.gameState ? 'Playing a game' : 'Not playing'}
- Current emotion: ${context.currentEmotion || 'happy'}

Respond as Daisy the friendly AI dog! Keep your response engaging, fun, and dog-like. Include dog facts if relevant, and be ready to play games or tell stories.`
  }

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - API error
   * @returns {string} User-friendly error message
   */
  handleError(error) {
    if (error.message?.includes('API_KEY_INVALID')) {
      return "Woof! My API key seems to be invalid. Please check your .env.local file! 🐕"
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      return "Woof! I've used up my API quota for today. Try again tomorrow! 🐕"
    } else if (error.message?.includes('NETWORK')) {
      return "Woof! There seems to be a network issue. Please check your connection! 🐕"
    } else {
      return "Woof! I'm having trouble connecting to my AI brain right now. Please try again! 🐕"
    }
  }

  /**
   * Get service status information
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      apiKeyConfigured: !!this.apiKey,
      apiKeyValid: this.apiKey !== 'your_actual_gemini_api_key_here',
      geminiInitialized: !!this.genAI,
      modelReady: !!this.model,
      serviceInitialized: this.isInitialized,
      apiKeyLength: this.apiKey?.length || 0,
      isAvailable: this.isAvailable()
    }
  }

  /**
   * Debug service status (detailed logging)
   */
  debugStatus() {
    console.log('🤖 Gemini Debug Status:')
    const status = this.getStatus()
    Object.entries(status).forEach(([key, value]) => {
      console.log(`- ${key}:`, value)
    })
  }

  /**
   * Test the service with a simple message
   * @returns {Promise<string>} Test response
   */
  async testService() {
    const testMessage = 'Hello Daisy! How are you today?'
    console.log('🧪 Testing Gemini service...')
    
    try {
      const response = await this.generateResponse(testMessage, { userName: 'TestUser' })
      console.log('✅ Gemini test successful:', response)
      return response
    } catch (error) {
      console.error('❌ Gemini test failed:', error)
      throw error
    }
  }

  /**
   * Reinitialize the service (useful for API key changes)
   */
  reinitialize() {
    console.log('🔄 Reinitializing Gemini service...')
    this.genAI = null
    this.model = null
    this.isInitialized = false
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    this.initialize()
  }

  /**
   * Get API usage statistics (if available)
   * @returns {Object} Usage statistics
   */
  getUsageStats() {
    // This would require additional API calls to get usage data
    // For now, return basic info
    return {
      serviceActive: this.isAvailable(),
      modelName: 'gemini-1.5-flash',
      maxTokens: 150,
      temperature: 0.7
    }
  }
}

// Export singleton instance
export default new GeminiService()
