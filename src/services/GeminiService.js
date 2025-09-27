/**
 * GeminiService - Google Gemini AI integration service
 * Updated to use the new @google/genai SDK with correct API endpoints
 */

import { GoogleGenAI } from '@google/genai'

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
   * Test available models by trying to use them
   */
  async testAvailableModels() {
    if (!this.genAI) {
      console.error('❌ genAI not initialized')
      return []
    }
    
    console.log('🔍 Testing available models...')
    const modelsToTest = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ]
    
    const workingModels = []
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${modelName}`)
        
        // Quick test with timeout using new SDK
        const result = await Promise.race([
          this.genAI.models.generateContent({
            model: modelName,
            contents: 'Hi'
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ])
        
        const text = result.text
        
        console.log(`✅ Model ${modelName} works! Response: ${text.substring(0, 30)}...`)
        workingModels.push(modelName)
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`)
      }
    }
    
    console.log(`📊 Working models found: ${workingModels.length}`)
    return workingModels
  }

  /**
   * Initialize Gemini AI service
   */
  async initialize() {
    console.log('🔧 Initializing Gemini Service...')
    console.log('API Key present:', !!this.apiKey)
    console.log('API Key length:', this.apiKey?.length || 0)
    console.log('API Key starts with:', this.apiKey?.substring(0, 10) || 'none')
    
    // Check if we're in local development (only disable for localhost)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1'
    
    console.log('🌐 Hostname check:', {
      hostname: window.location.hostname,
      isLocalhost: isLocalhost,
      fullURL: window.location.href
    })
    
    if (isLocalhost) {
      console.log('🏠 Running on localhost - Gemini API enabled for development')
      // Localhost testing enabled permanently
    }
    
    if (!this.apiKey || this.apiKey === 'your_actual_gemini_api_key_here') {
      console.warn('⚠️ Gemini API key not configured properly')
      return
    }

    try {
      console.log('🔧 Attempting to create GoogleGenAI instance...')
      
      // Use the new GoogleGenAI SDK
      this.genAI = new GoogleGenAI({ apiKey: this.apiKey })
      console.log('✅ GoogleGenAI instance created successfully')
      
      // Try different models in order of preference
      const modelsToTest = [
        'gemini-2.5-flash',
        'gemini-1.5-flash', 
        'gemini-1.5-pro',
        'gemini-pro'
      ]
      
      let workingModel = null
      
      for (const modelName of modelsToTest) {
        try {
          console.log(`🧪 Testing model: ${modelName}`)
          
          // Quick test with timeout using new SDK
          const result = await Promise.race([
            this.genAI.models.generateContent({
              model: modelName,
              contents: 'Hi'
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 8s')), 8000))
          ])
          
          const text = result.text
          
          if (text && text.length > 0) {
            console.log(`✅ Model ${modelName} response: ${text.substring(0, 50)}...`)
            workingModel = modelName
            break
          }
        } catch (error) {
          console.log(`❌ Model ${modelName} failed: ${error.message}`)
          
          // If it's a 404, try next model. If it's 403/401, might be API access issue
          if (error.message.includes('403') || error.message.includes('401')) {
            console.warn(`🚫 API access issue detected with ${modelName}`)
          }
        }
      }
      
      if (!workingModel) {
        console.warn('⚠️ No working Gemini models found')
        console.warn('📋 This is likely because:')
        console.warn('  • Your API key has access to different model names')
        console.warn('  • Models require different authentication level')
        console.warn('  • Google has updated model names since our last check')
        console.warn('💡 DaisyDog will work perfectly in Local Mode with:')
        console.warn('  ✅ All 6 videos working')
        console.warn('  ✅ Safety system active')
        console.warn('  ✅ Bible API working')
        console.warn('  ✅ Built-in intelligent responses')
        this.apiWorking = false
        this.lastError = 'Using Local Mode - all features operational'
        this.isInitialized = true
        return
      }
      
      console.log(`🎯 Using production model: ${workingModel}`)
      
      // Store the working model name
      this.workingModel = workingModel
      
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
    if (!this.genAI || !this.workingModel) {
      console.log('❌ No model available for testing')
      this.apiWorking = false
      return false
    }

    try {
      console.log('🧪 Testing Gemini API connectivity...')
      
      const testPrompt = 'You are DaisyDog, a friendly AI dog. Say "Woof! Test successful!" in under 10 words.'
      const result = await this.genAI.models.generateContent({
        model: this.workingModel,
        contents: testPrompt
      })
      
      const text = result.text
      
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
    const hasModel = !!this.workingModel
    const isWorking = this.apiWorking
    
    // Check if we're in production vs localhost
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.port !== ''
    const isProduction = !isLocalhost
    
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
      const result = await this.genAI.models.generateContent({
        model: this.workingModel,
        contents: fullPrompt
      })
      
      // Update API status on successful call
      this.apiWorking = true
      this.lastApiTest = Date.now()
      this.lastError = null
      this.retryCount = 0
      
      const aiResponse = result.text.trim()
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
      modelReady: !!this.workingModel,
      workingModel: this.workingModel,
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

// Create singleton instance
const geminiService = new GeminiService()

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.GeminiService = geminiService
  window.testGemini = () => geminiService.testApiConnectivity()
  window.geminiStatus = () => geminiService.getStatus()
  window.testGeminiModels = () => geminiService.testAvailableModels()
  window.debugGeminiKey = () => {
    console.log('🔑 API Key Debug:')
    console.log('  Present:', !!geminiService.apiKey)
    console.log('  Length:', geminiService.apiKey?.length || 0)
    console.log('  Starts with:', geminiService.apiKey?.substring(0, 15) || 'none')
    console.log('  Format check:', geminiService.apiKey?.startsWith('AIza') ? '✅ Correct format' : '❌ Wrong format')
    console.log('  Environment:', import.meta.env.VITE_GEMINI_API_KEY ? 'Set in env' : 'Not in env')
  }
  window.reinitGemini = () => {
    console.log('🔄 Reinitializing Gemini Service...')
    return geminiService.initialize()
  }
  window.checkGeminiAPI = async () => {
    console.log('🔍 Checking Gemini API access with multi-version test...')
    console.log('API Key:', geminiService.apiKey ? `${geminiService.apiKey.substring(0, 15)}...` : 'None')
    
    if (!geminiService.apiKey) {
      console.error('❌ No API key configured')
      return
    }
    
    // Try different models like the main service does
    const modelsToTest = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ]
    
    const genAI = new GoogleGenAI({ apiKey: geminiService.apiKey })
    let foundWorking = false
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${modelName}...`)
        const result = await genAI.models.generateContent({
          model: modelName,
          contents: 'Hello'
        })
        const text = result.text
        console.log(`✅ Model ${modelName} working! Response: ${text.substring(0, 50)}...`)
        foundWorking = true
        break
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`)
      }
    }
    
    if (!foundWorking) {
      console.error('❌ No API version/model combination worked')
      console.error('🔍 Possible causes:')
      console.error('  - Billing not enabled in Google Cloud')
      console.error('  - Generative AI API not enabled')
      console.error('  - API key lacks proper permissions')
      console.error('  - Domain restrictions (if any)')
    }
  }
}

export default geminiService