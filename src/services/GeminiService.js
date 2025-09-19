/**
 * GeminiService - Google Gemini AI integration service
 * Fixed version with proper model names and error handling
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    this.genAI = null
    this.model = null
    this.isInitialized = false
    this.lastApiTest = null
    this.apiWorking = false
    this.lastError = null
    
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
      
      // Use the correct model name for the current API
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
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
      
      // Test API connectivity immediately
      this.testApiConnectivity()
    } catch (error) {
      console.warn('❌ Failed to initialize Gemini AI:', error)
      this.isInitialized = false
      this.apiWorking = false
      this.lastError = error.message
    }
  }

  /**
   * Test API connectivity with a simple request
   */
  async testApiConnectivity() {
    if (!this.model) {
      this.apiWorking = false
      return
    }

    // Skip test if we recently tested and failed due to quota
    const timeSinceLastTest = this.lastApiTest ? Date.now() - this.lastApiTest : Infinity
    if (timeSinceLastTest < 60000 && !this.apiWorking) {
      console.log('⏳ Skipping API test due to recent failure (waiting 1 minute between retries)')
      return
    }

    try {
      console.log('🧪 Testing Gemini API connectivity...')
      const testResult = await this.model.generateContent('Test')
      const response = await testResult.response
      const text = response.text()
      
      if (text && text.trim()) {
        this.apiWorking = true
        this.lastApiTest = Date.now()
        this.lastError = null
        console.log('✅ Gemini API connectivity confirmed')
      } else {
        throw new Error('Empty response from API')
      }
    } catch (error) {
      this.apiWorking = false
      this.lastApiTest = Date.now()
      this.lastError = error.message
      
      if (error.message.includes('quota') || error.message.includes('429')) {
        console.warn('⚠️ Gemini API quota exceeded. Using local responses until quota resets.')
      } else if (error.message.includes('API_KEY_INVALID')) {
        console.warn('❌ Gemini API key is invalid. Please check your .env.local file.')
      } else if (error.message.includes('billing')) {
        console.warn('❌ Gemini API billing issue. Please check your Google Cloud billing account.')
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
    
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('🔧 Gemini Availability Check:', {
        hasKey,
        hasModel,
        isInitialized: this.isInitialized,
        isWorking,
        testAge: testAge < Infinity ? `${Math.round(testAge / 1000)}s ago` : 'never',
        testStale,
        apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'none'
      })
    }
    
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
      console.log('❌ Gemini service not available, using fallback')
      return "Woof! I'm using my basic responses right now! 🐕"
    }

    try {
      const systemPrompt = `You are DaisyDog, a friendly and playful AI dog companion for kids aged 5-12.

Personality:
- Always excited and enthusiastic like a real dog
- Playful and fun-loving
- Very friendly and welcoming
- Loves sharing simple dog facts
- Speaks with cute dog sounds like "woof!", "*tail wags*", "*bounces*"
- Includes relevant emojis
- Be encouraging and positive
- Keep responses short and simple (under 100 words)
- Use age-appropriate vocabulary for children

Current context:
- User name: ${context.userName || 'friend'}
- Hunger level: ${context.hungerLevel || 3}/5
- Current emotion: ${context.currentEmotion || 'happy'}

Important: Always maintain Daisy's dog personality and be child-friendly!`

      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nDaisyDog:`
      
      console.log('🧠 Generating Gemini response...')
      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      
      // Update API status on successful call
      this.apiWorking = true
      this.lastApiTest = Date.now()
      this.lastError = null
      
      const aiResponse = response.text().trim()
      console.log('✅ Gemini response generated successfully')
      
      return aiResponse

    } catch (error) {
      console.error('💥 Gemini API Error:', error)
      
      // Update API status on failed call
      this.apiWorking = false
      this.lastApiTest = Date.now()
      this.lastError = error.message
      
      if (error.message.includes('quota') || error.message.includes('429')) {
        return "Woof! I've used up my smart brain quota for today, but I still have lots of local responses! 🐕"
      } else if (error.message.includes('API_KEY_INVALID')) {
        return "Woof! My API key seems to be having trouble. Please check the setup! 🐕"
      } else if (error.message.includes('billing')) {
        return "Woof! There's a billing issue with my smart brain. Please check Google Cloud billing! 🐕"
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
    this.lastError = null
    await this.testApiConnectivity()
  }

  /**
   * Get service status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      apiKeyConfigured: !!this.apiKey,
      apiKeyValid: this.apiKey !== 'your_actual_gemini_api_key_here',
      isAvailable: this.isAvailable(),
      modelReady: !!this.model,
      apiWorking: this.apiWorking,
      lastTested: this.lastApiTest,
      testAge: this.lastApiTest ? Date.now() - this.lastApiTest : null,
      lastError: this.lastError,
      isInitialized: this.isInitialized
    }
  }

  /**
   * Get detailed debug information
   */
  debugStatus() {
    const status = this.getStatus()
    console.log('🔧 Gemini Service Debug Status:')
    console.table(status)
    
    if (this.lastError) {
      console.error('Last error details:', this.lastError)
    }
    
    if (!status.apiKeyConfigured) {
      console.log('💡 To fix: Add VITE_GEMINI_API_KEY to your .env.local file')
      console.log('💡 Get key from: https://aistudio.google.com/app/apikey')
    }
    
    return status
  }
}

// Export singleton instance
const geminiServiceInstance = new GeminiService()

// Expose to window for console debugging
if (typeof window !== 'undefined') {
  window.GeminiService = geminiServiceInstance
}

export default geminiServiceInstance