/**
 * Safe AI System for DaisyDog
 * Comprehensive AI safety and response management
 */

export class SafeAISystem {
  constructor(daisyResponses) {
    this.daisyResponses = daisyResponses
    this.anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.debugMode = import.meta.env.VITE_DEBUG_MODE === 'true'
    this.shouldLogApiStatus = import.meta.env.VITE_LOG_API_STATUS === 'true'
    
    // Safety configuration
    this.safetyConfig = {
      maxResponseLength: parseInt(import.meta.env.VITE_MAX_RESPONSE_LENGTH) || 500,
      childSafetyMode: import.meta.env.VITE_CHILD_SAFETY_MODE === 'true',
      defaultUserAge: parseInt(import.meta.env.VITE_DEFAULT_USER_AGE) || 12,
      enableSafetyMetrics: import.meta.env.VITE_ENABLE_SAFETY_METRICS === 'true'
    }
    
    // Initialize safety metrics
    this.safetyMetrics = {
      totalRequests: 0,
      blockedRequests: 0,
      apiCalls: 0,
      fallbackUses: 0,
      averageResponseTime: 0
    }
    
    this.logApiStatus()
  }
  
  logApiStatus() {
    if (this.shouldLogApiStatus) {
      console.log('🔧 SafeAI System Status:')
      console.log(`  Anthropic API: ${this.anthropicApiKey ? '✅ Configured' : '❌ Not configured'}`)
      console.log(`  OpenAI API: ${this.openaiApiKey ? '✅ Configured' : '❌ Not configured'}`)
      console.log(`  Child Safety: ${this.safetyConfig.childSafetyMode ? '✅ Enabled' : '❌ Disabled'}`)
      console.log(`  Debug Mode: ${this.debugMode ? '✅ Enabled' : '❌ Disabled'}`)
    }
  }
  
  async generateSafeResponse(message, userAge = null) {
    const startTime = Date.now()
    this.safetyMetrics.totalRequests++
    
    try {
      // Step 1: Input validation and safety check
      const safetyCheck = await this.checkInputSafety(message, userAge)
      if (!safetyCheck.safe) {
        this.safetyMetrics.blockedRequests++
        return this.createSafeRedirect(safetyCheck.reason, message)
      }
      
      // Step 2: Try AI response with safety validation
      if (this.anthropicApiKey) {
        try {
          const aiResponse = await this.getAnthropicResponse(message, userAge)
          if (aiResponse) {
            const validatedResponse = await this.validateAIResponse(aiResponse, userAge)
            if (validatedResponse.safe) {
              this.updateMetrics(startTime, 'ai')
              return validatedResponse.response
            }
          }
        } catch (error) {
          if (this.debugMode) {
            console.warn('Anthropic API error, falling back:', error.message)
          }
        }
      }
      
      // Step 3: Fallback to local responses
      const localResponse = this.getLocalResponse(message)
      this.updateMetrics(startTime, 'local')
      this.safetyMetrics.fallbackUses++
      
      return localResponse
      
    } catch (error) {
      console.error('SafeAI System error:', error)
      this.updateMetrics(startTime, 'error')
      return this.getEmergencyResponse()
    }
  }
  
  async checkInputSafety(message, userAge) {
    // Local safety checks
    const localCheck = this.performLocalSafetyCheck(message, userAge)
    if (!localCheck.safe) {
      return localCheck
    }
    
    // OpenAI moderation check (if available)
    if (this.openaiApiKey) {
      try {
        const moderationCheck = await this.checkWithOpenAI(message)
        if (!moderationCheck.safe) {
          return moderationCheck
        }
      } catch (error) {
        if (this.debugMode) {
          console.warn('OpenAI moderation error, using local checks:', error.message)
        }
      }
    }
    
    return { safe: true }
  }
  
  performLocalSafetyCheck(message, userAge) {
    const lowerMessage = message.toLowerCase()
    
    // Child safety patterns
    const unsafePatterns = [
      /\b(phone|address|location|where.*live|meet.*person)\b/i,
      /\b(password|secret|private)\b/i,
      /\b(credit.*card|bank|money|pay)\b/i,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr)\b/i // Addresses
    ]
    
    for (const pattern of unsafePatterns) {
      if (pattern.test(message)) {
        return {
          safe: false,
          reason: 'personal_information',
          pattern: pattern.toString()
        }
      }
    }
    
    // Violence or harmful content
    const harmfulPatterns = [
      /\b(hurt|harm|kill|die|death|violence)\b/i,
      /\b(hate|angry|mad|furious)\b/i
    ]
    
    for (const pattern of harmfulPatterns) {
      if (pattern.test(message)) {
        return {
          safe: false,
          reason: 'harmful_content',
          pattern: pattern.toString()
        }
      }
    }
    
    return { safe: true }
  }
  
  async checkWithOpenAI(message) {
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: message
        })
      })
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }
      
      const data = await response.json()
      const result = data.results[0]
      
      if (result.flagged) {
        return {
          safe: false,
          reason: 'openai_moderation',
          categories: Object.keys(result.categories).filter(cat => result.categories[cat])
        }
      }
      
      return { safe: true }
      
    } catch (error) {
      if (this.debugMode) {
        console.warn('OpenAI moderation check failed:', error.message)
      }
      throw error
    }
  }
  
  async getAnthropicResponse(message, userAge) {
    try {
      const systemPrompt = this.buildSystemPrompt(userAge)
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: message
            }
          ]
        })
      })
      
      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`)
      }
      
      const data = await response.json()
      this.safetyMetrics.apiCalls++
      
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text
      }
      
      return null
      
    } catch (error) {
      if (this.debugMode) {
        console.warn('Anthropic API call failed:', error.message)
      }
      throw error
    }
  }
  
  buildSystemPrompt(userAge) {
    const age = userAge || this.safetyConfig.defaultUserAge
    
    return `You are Daisy, a friendly 4-year-old Cavalier King Charles Spaniel chatbot designed for children aged ${age}. 

PERSONALITY:
- High energy, positive, food motivated, humorous, mischievous
- Always respond from a dog's perspective with "woof", "bark", tail wagging, etc.
- Use age-appropriate language for ${age}-year-olds
- Be encouraging, supportive, and educational
- Include emojis and playful expressions

SAFETY RULES:
- Never ask for or discuss personal information (names, addresses, phone numbers)
- Keep all content appropriate for children aged 5-18
- Redirect inappropriate topics to safe, fun alternatives
- Focus on positive, educational, and entertaining content
- If unsure about content safety, choose the safer option

RESPONSE STYLE:
- Keep responses under 300 characters
- Include dog-like expressions and behaviors
- Ask follow-up questions to encourage engagement
- Be enthusiastic and playful
- Use simple vocabulary appropriate for the child's age

Remember: You are a dog who loves treats, playing, and making children happy!`
  }
  
  async validateAIResponse(response, userAge) {
    // Check response length
    if (response.length > this.safetyConfig.maxResponseLength) {
      response = response.substring(0, this.safetyConfig.maxResponseLength - 3) + '...'
    }
    
    // Check for inappropriate content
    const safetyCheck = this.performLocalSafetyCheck(response, userAge)
    if (!safetyCheck.safe) {
      return {
        safe: false,
        reason: 'ai_response_unsafe',
        details: safetyCheck
      }
    }
    
    // Ensure dog personality markers
    const hasPersonality = /\b(woof|bark|tail|paw|puppy|dog)\b/i.test(response) || 
                          /[🐕🐾🦴🎾]/g.test(response)
    
    if (!hasPersonality) {
      // Add personality markers
      response = response + " *wags tail* 🐕"
    }
    
    return {
      safe: true,
      response: response
    }
  }
  
  getLocalResponse(message) {
    const lowerMessage = message.toLowerCase()
    
    // Check all response categories
    for (const [category, responses] of Object.entries(this.daisyResponses)) {
      if (category === 'keywords') continue
      
      const keywords = this.daisyResponses.keywords[category] || []
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return this.getRandomResponse(responses)
      }
    }
    
    // Default to general responses
    return this.getRandomResponse(this.daisyResponses.general)
  }
  
  getRandomResponse(responses) {
    if (!responses || responses.length === 0) {
      return this.getEmergencyResponse()
    }
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  createSafeRedirect(reason, originalMessage) {
    const redirects = {
      personal_information: [
        "Woof! I don't need to know personal things about you! Let's talk about fun stuff instead! What's your favorite game? 🐕",
        "Bark bark! Let's keep our conversation about fun topics! Do you want to hear a joke or play a game? 🎾",
        "Woof woof! I'm just a friendly dog who loves to chat about happy things! What makes you smile? 😊"
      ],
      harmful_content: [
        "Woof! Let's talk about happy things instead! Do you want to hear about my favorite treats? 🦴",
        "Bark bark! I only like to chat about fun, positive stuff! Want to play a game? 🎮",
        "Woof woof! How about we talk about something that makes us both happy? I love belly rubs! 🐕💕"
      ],
      openai_moderation: [
        "Woof! Let's keep our chat friendly and fun! What's your favorite animal? 🐾",
        "Bark bark! I love talking about positive things! Do you like dogs like me? 🐕",
        "Woof woof! Let's chat about something that makes us both happy! Want to hear a joke? 😄"
      ]
    }
    
    const categoryRedirects = redirects[reason] || redirects.harmful_content
    return this.getRandomResponse(categoryRedirects)
  }
  
  getEmergencyResponse() {
    const emergency = [
      "Woof! I'm having a little trouble understanding, but I'm still happy to chat! 🐕",
      "Bark bark! My doggy brain is a bit confused, but I still love talking with you! 🐾",
      "Woof woof! Sometimes I get a bit mixed up, but that's okay! Want to try asking something else? 😊"
    ]
    return this.getRandomResponse(emergency)
  }
  
  updateMetrics(startTime, responseType) {
    const responseTime = Date.now() - startTime
    this.safetyMetrics.averageResponseTime = 
      (this.safetyMetrics.averageResponseTime + responseTime) / 2
    
    if (this.debugMode) {
      console.log(`Response generated via ${responseType} in ${responseTime}ms`)
    }
  }
  
  getSafetyMetrics() {
    const blockRate = this.safetyMetrics.totalRequests > 0 
      ? (this.safetyMetrics.blockedRequests / this.safetyMetrics.totalRequests * 100).toFixed(1)
      : 0
    
    return {
      ...this.safetyMetrics,
      blockRate: `${blockRate}%`,
      apiAvailable: !!(this.anthropicApiKey || this.openaiApiKey),
      safetyLevel: this.safetyConfig.childSafetyMode ? 'Strict' : 'Standard'
    }
  }
}