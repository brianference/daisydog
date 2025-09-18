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
    this.lastApiTest = null
    this.apiWorking = false
    
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
        model: 'gemini-1.5-flash-latest',
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
      
      // Test API connectivity
      this.testApiConnectivity()
    } catch (error) {
      console.warn('❌ Failed to initialize Gemini AI:', error)
      this.isInitialized = false
      this.apiWorking = false
    }
  }

  /**
   * Test API connectivity with a simple request
   */
  async testApiConnectivity() {
    if (!this.model) return

    // Skip test if we recently tested and failed due to quota
    const timeSinceLastTest = this.lastApiTest ? Date.now() - this.lastApiTest : Infinity
    if (timeSinceLastTest < 60000 && !this.apiWorking) { // 60 seconds (1 minute)
      console.log('⏳ Skipping API test due to recent quota failure (waiting 1 minute between retries)')
      return
    }

    try {
      const testResult = await this.model.generateContent('Hi')
      const response = await testResult.response
      const text = response.text()
      
      this.apiWorking = true
      this.lastApiTest = Date.now()
      console.log('✅ Gemini API connectivity confirmed')
    } catch (error) {
      this.apiWorking = false
      this.lastApiTest = Date.now()
      
      if (error.message.includes('quota') || error.message.includes('429')) {
        console.warn('⚠️ Gemini API quota exceeded. Using local responses until quota resets.')
      } else {
        console.warn('❌ Gemini API connectivity test failed:', error.message)
      }
    }
  }

  /**
   * Check if Gemini is available and ready
   * @returns {boolean} Whether Gemini is available
   */
  isAvailable() {
    const hasKey = !!this.apiKey && this.apiKey !== 'your_actual_gemini_api_key_here'
    const hasModel = !!this.model
    const isWorking = this.apiWorking
    
    // If we haven't tested the API in the last 5 minutes, consider it potentially unavailable
    const testAge = this.lastApiTest ? Date.now() - this.lastApiTest : Infinity
    const testStale = testAge > 5 * 60 * 1000 // 5 minutes
    
    return hasKey && hasModel && this.isInitialized && isWorking && !testStale
  }

  /**
   * Generate AI response using Gemini
   * @param {string} userMessage - User's message
   * @param {Object} context - Chat context
   * @returns {Promise<string>} AI response
   */
  async generateResponse(userMessage, context = {}) {
    if (!this.isAvailable()) {
      return "Woof! I'm using my basic responses right now! 🐕"
    }

    try {
      const systemPrompt = `You are DaisyDog, a friendly and playful AI dog companion for kids.

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

Respond as Daisy the friendly AI dog! Keep your response engaging, fun, and dog-like.`

      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nDaisyDog:`
      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      
      // Update API status on successful call
      this.apiWorking = true
      this.lastApiTest = Date.now()
      
      return response.text().trim()

    } catch (error) {
      console.error('Gemini API Error:', error)
      
      // Update API status on failed call
      this.apiWorking = false
      this.lastApiTest = Date.now()
      
      if (error.message.includes('quota') || error.message.includes('429')) {
        return "Woof! I've used up my smart brain quota for today, but I still have lots of local responses! 🐕"
      } else {
        return "Woof! I'm having trouble connecting to my AI brain right now! 🐕"
      }
    }
  }

  /**
   * Force a retry of API connectivity (ignores cooldown)
   */
  async forceRetry() {
    console.log('🔄 Forcing API connectivity retry...')
    this.lastApiTest = null // Reset to allow immediate retry
    await this.testApiConnectivity()
  }

  /**
   * Get service status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      apiKeyConfigured: !!this.apiKey,
      isAvailable: this.isAvailable(),
      modelReady: !!this.model,
      apiWorking: this.apiWorking,
      lastTested: this.lastApiTest,
      testAge: this.lastApiTest ? Date.now() - this.lastApiTest : null
    }
  }
}

// Export singleton instance
const geminiServiceInstance = new GeminiService()

// Expose to window for console debugging
if (typeof window !== 'undefined') {
  window.GeminiService = geminiServiceInstance
}

export default geminiServiceInstance
