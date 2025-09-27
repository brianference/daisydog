/**
 * GeminiService - Google Gemini AI integration service
 * Fixed version for production deployment with proper error handling
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  constructor() {
    this.version = '5.6.1' // Force cache refresh
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    this.genAI = null
    this.model = null
    this.isInitialized = false
    this.lastApiTest = null
    this.apiWorking = false
    this.lastError = null
    this.retryCount = 0
    this.maxRetries = 3
    
    this.initialize()
  }

  /**
   * Initialize Gemini AI service
   */
  async initialize() {
    console.log('🔧 Initializing Gemini Service...')
    console.log('API Key present:', !!this.apiKey)
    console.log('API Key length:', this.apiKey?.length || 0)
    console.log('API Key starts with:', this.apiKey?.substring(0, 10) || 'none')
    
    if (!this.apiKey || this.apiKey === 'your_actual_gemini_api_key_here') {
      console.warn('⚠️ Gemini API key not configured properly')
      return
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      
      // Use the stable model name for production
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
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
      await this.testApiConnectivity()
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error)
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
      console.log('❌ No model available for testing')
      this.apiWorking = false
      return false
    }

    try {
      console.log('🧪 Testing Gemini API connectivity...')
      
      const testPrompt = 'You are DaisyDog, a friendly AI dog. Say "Woof! Test successful!" in under 10 words.'
      const result = await this.model.generateContent(testPrompt)
      const response = await result.response
      const text = response.text()
      
      if (text && text.trim()) {
        this.apiWorking = true
        this.lastApiTest = Date.now()
        this.lastError = null
        this.retryCount = 0
        console.log('✅ Gemini API connectivity confirmed')
        console.log('Test response:', text.trim())
        return true
      } else {
        throw new Error('Empty response from API')
      }
    } catch (error) {
      this.apiWorking = false
      this.lastApiTest = Date.now()
      this.lastError = error.message
      
      console.error('❌ Gemini API connectivity test failed:', error.message)
      
      if (error.message.includes('API_KEY_INVALID')) {
        console.error('🔑 API Key Issue: The API key appears to be invalid')
      } else if (error.message.includes('quota') || error.message.includes('429')) {
        console.error('📊 Quota Issue: API quota exceeded')
      } else if (error.message.includes('billing')) {
        console.error('💳 Billing Issue: Billing account required')
      } else if (error.message.includes('403')) {
        console.error('🚫 Permission Issue: API access denied - check domain restrictions')
      } else if (error.message.includes('CORS')) {
        console.error('🌐 CORS Issue: Cross-origin request blocked')
      }
      
      return false
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
    
    // Check if we're in production (daisydog.org)
    const isProduction = window.location.hostname === 'daisydog.org' || 
                        window.location.hostname.includes('netlify.app') ||
                        window.location.protocol === 'https:'
    
    // If we haven't tested the API yet, or if it's working and been more than 61 seconds
    const testAge = this.lastApiTest ? Date.now() - this.lastApiTest : Infinity
    const shouldRetest = testAge === Infinity || (isWorking && testAge > 61 * 1000) // 61 seconds if working
    
    // If not working, check every 5 minutes
    const testStale = !isWorking && testAge > 5 * 60 * 1000 // 5 minutes if not working
    
    // In production, be more strict about API availability
    const available = hasKey && hasModel && this.isInitialized && (isProduction ? this.apiWorking !== false : (isWorking && !testStale))
    
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('🔧 Gemini Availability Check:', {
        hasKey,
        hasModel,
        isInitialized: this.isInitialized,
        isWorking,
        isProduction,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        testAge: testAge < Infinity ? `${Math.round(testAge / 1000)}s ago` : 'never',
        shouldRetest,
        testStale,
        available,
        lastError: this.lastError
      })
    }
    
    return available
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
      console.log('🔧 Gemini status:', this.getStatus())
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

Knowledge & Helpfulness:
- You can answer general knowledge questions (like what day it is, weather, simple facts)
- Always provide helpful information when asked direct questions
- For time/date questions, use current information if available
- Combine helpful answers with your playful dog personality
- Make learning fun and engaging for kids

Current context:
- User name: ${context.userName || 'friend'}
- Hunger level: ${context.hungerLevel || 3}/5
- Current emotion: ${context.currentEmotion || 'happy'}
- Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current time: ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}

Important: Always maintain Daisy's dog personality while being helpful and informative!`

      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nDaisyDog:`
      
      console.log('🧠 Generating Gemini response...')
      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      
      // Update API status on successful call
      this.apiWorking = true
      this.lastApiTest = Date.now()
      this.lastError = null
      this.retryCount = 0
      
      const aiResponse = response.text().trim()
      console.log('✅ Gemini response generated successfully')
      
      return aiResponse

    } catch (error) {
      console.error('💥 Gemini API Error:', error)
      
      // Update API status on failed call
      this.apiWorking = false
      this.lastApiTest = Date.now()
      this.lastError = error.message
      
      // Specific error handling
      if (error.message.includes('quota') || error.message.includes('429')) {
        console.error('📊 Quota exceeded - using local responses')
        return "Woof! I've used up my smart brain quota for today, but I still have lots of local responses! 🐕"
      } else if (error.message.includes('API_KEY_INVALID') || error.message.includes('400')) {
        console.error('🔑 API key invalid - check configuration')
        return "Woof! My API key seems to be having trouble. Please check the setup! 🐕"
      } else if (error.message.includes('billing') || error.message.includes('403')) {
        console.error('💳 Billing required - check Google Cloud billing')
        return "Woof! There's a billing issue with my smart brain. Please check Google Cloud billing! 🐕"
      } else {
        console.error('🌐 Network or other error:', error.message)
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
    this.retryCount = 0
    await this.testApiConnectivity()
    return this.isAvailable()
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
      isInitialized: this.isInitialized,
      retryCount: this.retryCount
    }
  }

  /**
   * Get detailed debug information
   */
  debugStatus() {
    const status = this.getStatus()
    console.log('🔧 Gemini Service Debug Status:')
    console.table(status)
    
    // Additional debug info
    console.log('🔍 Environment Check:')
    console.log('- Current URL:', window.location.href)
    console.log('- Environment:', import.meta.env.MODE)
    console.log('- API Key (first 10 chars):', this.apiKey?.substring(0, 10) || 'none')
    
    if (this.lastError) {
      console.error('❌ Last error details:', this.lastError)
    }
    
    if (!status.apiKeyConfigured) {
      console.log('💡 To fix: Add VITE_GEMINI_API_KEY to Netlify environment variables')
      console.log('💡 Get key from: https://aistudio.google.com/app/apikey')
    }
    
    if (!status.apiWorking && status.apiKeyConfigured) {
      console.log('💡 Try: GeminiService.forceRetry() to test connectivity')
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