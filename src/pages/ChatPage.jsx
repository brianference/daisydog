import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaperPlane, FaBone, FaHome, FaHeart, FaPaw, FaQuestionCircle } from 'react-icons/fa'
import { useAnthropicChat } from '../hooks/useAnthropicChat'
import './ChatPage.css'

// Safe AI Integration System
class SafeAISystem {
  constructor(localResponses = null) {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    this.localResponses = localResponses // Pass in the local response system
    this.safetyMetrics = {
      totalRequests: 0,
      blockedRequests: 0,
      falsePositives: 0,
      responseTime: []
    }
  }

  // Set local responses after initialization
  setLocalResponses(responses) {
    this.localResponses = responses
  }

  // OpenAI Moderation API Integration
  async moderateContent(text) {
    if (!this.openaiApiKey) {
      console.warn('OpenAI API key not available, using local moderation')
      return this.localModeration(text)
    }

    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text,
          model: 'text-moderation-latest'
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI Moderation API error: ${response.status}`)
      }

      const data = await response.json()
      const result = data.results[0]
      
      return {
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
        source: 'openai'
      }
    } catch (error) {
      console.error('OpenAI Moderation API error:', error)
      return this.localModeration(text)
    }
  }

  // Enhanced local moderation with child-specific rules
  localModeration(text) {
    const lowerText = text.toLowerCase()
    
    // Child-specific inappropriate content
    const childInappropriateWords = [
      // Violence and harm
      'violence', 'violent', 'fight', 'fighting', 'kill', 'killing', 'death', 'die', 'dying',
      'hurt', 'pain', 'blood', 'weapon', 'gun', 'knife', 'dangerous',
      
      // Adult content
      'sex', 'sexual', 'sexy', 'adult', 'mature', 'inappropriate',
      
      // Profanity
      'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'crap', 'stupid', 'idiot',
      
      // Personal safety risks
      'meet me', 'come over', 'address', 'phone number', 'real name', 'where do you live',
      'send photo', 'picture of you', 'personal information',
      
      // Harmful activities
      'drugs', 'alcohol', 'smoking', 'vaping', 'self harm', 'suicide'
    ]

    const flaggedCategories = {}
    let flagged = false

    childInappropriateWords.forEach(word => {
      if (lowerText.includes(word)) {
        flagged = true
        flaggedCategories[word] = true
      }
    })

    return {
      flagged,
      categories: flaggedCategories,
      categoryScores: {},
      source: 'local'
    }
  }

  // Child-specific content validation
  async validateChildAppropriate(text, userAge = 12) {
    const ageGroups = {
      young: { min: 5, max: 8 },
      middle: { min: 9, max: 12 },
      teen: { min: 13, max: 18 }
    }

    const ageGroup = userAge <= 8 ? 'young' : userAge <= 12 ? 'middle' : 'teen'
    
    // Topics that require age-appropriate handling
    const sensitiveTopics = {
      relationships: ['boyfriend', 'girlfriend', 'dating', 'romance', 'love'],
      bodyImage: ['weight', 'fat', 'skinny', 'ugly', 'pretty', 'appearance'],
      socialMedia: ['instagram', 'tiktok', 'snapchat', 'followers', 'likes'],
      schoolStress: ['test', 'exam', 'grade', 'homework', 'stress', 'anxiety'],
      peerPressure: ['popular', 'cool', 'friends don\'t like', 'left out']
    }

    const detectedTopics = []
    const lowerText = text.toLowerCase()

    Object.entries(sensitiveTopics).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detectedTopics.push(topic)
      }
    })

    return {
      appropriate: true, // We'll handle sensitively rather than block
      detectedTopics,
      ageGroup,
      suggestedApproach: this.getSuggestedApproach(detectedTopics, ageGroup)
    }
  }

  getSuggestedApproach(topics, ageGroup) {
    const approaches = {
      relationships: {
        young: 'redirect_to_friendship',
        middle: 'simple_friendship_advice',
        teen: 'age_appropriate_relationship_guidance'
      },
      bodyImage: {
        young: 'focus_on_health_and_fun',
        middle: 'positive_self_image',
        teen: 'body_positivity_and_health'
      },
      socialMedia: {
        young: 'redirect_to_offline_activities',
        middle: 'digital_citizenship_basics',
        teen: 'healthy_social_media_habits'
      }
    }

    return topics.map(topic => approaches[topic]?.[ageGroup] || 'general_support')
  }

  // Enhanced AI response with safety layers
  async getEnhancedSafeResponse(message, context = {}) {
    const startTime = Date.now()
    this.safetyMetrics.totalRequests++

    try {
      // Stage 1: Input Safety Check
      const moderationResult = await this.moderateContent(message)
      const ageValidation = await this.validateChildAppropriate(message, context.userAge || 12)

      // Stage 2: Check if input was flagged
      if (moderationResult.flagged) {
        this.safetyMetrics.blockedRequests++
        return this.generateSafeRedirect(message, moderationResult, ageValidation)
      }

      // Stage 3: Try AI response if available
      if (this.anthropicApiKey) {
        try {
          const aiResponse = await this.callSafeAI(message, context)
          if (aiResponse) {
            const outputValidation = await this.validateAIOutput(aiResponse, message)
            if (outputValidation.isValid) {
              const responseTime = Date.now() - startTime
              this.safetyMetrics.responseTime.push(responseTime)
              return this.enhanceWithDaisyPersonality(aiResponse, ageValidation)
            }
          }
        } catch (error) {
          console.error('AI response error:', error)
        }
      }

      // Stage 4: Use local response system
      if (this.localResponses) {
        return this.getLocalResponse(message, context, ageValidation)
      }

      // Stage 5: Final fallback
      return this.generateLocalFallback(message)

    } catch (error) {
      console.error('Safe AI processing error:', error)
      return this.generateLocalFallback(message)
    }
  }

  // Use the existing local response system
  getLocalResponse(message, context, ageValidation) {
    const lowerMessage = message.toLowerCase()
    
    // PRIORITY 1: Name detection for first-time users (before other responses)
    if (!context.hasGreeted && !context.userName && message.length < 50 && message.length > 1) {
      const gameCommands = ['pull', 'throw', 'toss', 'bounce', 'kick', 'hide', 'seek', 'found', 'hint', 'guess', 'sit', 'roll', 'shake', 'play', 'game', 'trick', 'story', 'joke', 'dance', 'hello', 'hi', 'hey']
      const isGameCommand = gameCommands.some(cmd => lowerMessage.includes(cmd))
      
      if (!isGameCommand) {
        // This is likely a name - return name greeting
        return `${message.trim()}! What a wonderful name! *tail wagging excitedly* I'm so happy to meet you, ${message.trim()}! What would you like to do together? 🐕💕`
      }
    }
    
    // PRIORITY 2: Check for greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return this.getRandomResponse('greetings')
    }
    
    // Check for stories
    if (lowerMessage.includes('story')) {
      return this.getRandomResponse('stories')
    }
    
    // Check for jokes
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      return this.getRandomResponse('jokes')
    }
    
    // Check for tricks
    if (lowerMessage.includes('trick') || lowerMessage.includes('sit') || lowerMessage.includes('roll')) {
      return this.getRandomResponse('tricks')
    }
    
    // Check for dance
    if (lowerMessage.includes('dance') || lowerMessage.includes('dancing') || lowerMessage.includes('show me a dance')) {
      return this.getRandomResponse('dance')
    }
    
    // Check for games
    if (lowerMessage.includes('play') || lowerMessage.includes('game')) {
      return this.getRandomResponse('games')
    }
    
    // Check for dreams
    if (lowerMessage.includes('dream') || lowerMessage.includes('biggest dream') || lowerMessage.includes('wish')) {
      return this.getRandomResponse('dreams')
    }
    
    // Check for exploration
    if (lowerMessage.includes('explore') || lowerMessage.includes('universe') || lowerMessage.includes('anywhere')) {
      return this.getRandomResponse('exploration')
    }
    
    // Check for creativity
    if (lowerMessage.includes('color') || lowerMessage.includes('colors') || lowerMessage.includes('create')) {
      return this.getRandomResponse('creativity')
    }
    
    // Check for friendship
    if (lowerMessage.includes('friendship') || lowerMessage.includes('friend') || lowerMessage.includes('special')) {
      return this.getRandomResponse('friendship')
    }
    
    // Check for nature and animals (ENHANCED - this should catch "how do dogs run?")
    if (lowerMessage.includes('animal') || lowerMessage.includes('wild') || lowerMessage.includes('talk to') ||
        lowerMessage.includes('dogs') || lowerMessage.includes('dog') || lowerMessage.includes('run') ||
        lowerMessage.includes('how do') || lowerMessage.includes('why do') || lowerMessage.includes('what do')) {
      return this.getRandomResponse('nature')
    }
    
    // Check for challenges
    if (lowerMessage.includes('challenging') || lowerMessage.includes('challenge') || lowerMessage.includes('difficult')) {
      return this.getRandomResponse('challenges')
    }
    
    // Check for imagination
    if (lowerMessage.includes('book') || (lowerMessage.includes('story') && lowerMessage.includes('live in'))) {
      return this.getRandomResponse('imagination')
    }
    
    // Check for wonder
    if (lowerMessage.includes('amaze') || lowerMessage.includes('amazing') || lowerMessage.includes('wonder')) {
      return this.getRandomResponse('wonder')
    }
    
    // Check for emotions
    if (lowerMessage.includes('sad') || lowerMessage.includes('feeling sad') || lowerMessage.includes('feel better')) {
      return this.getRandomResponse('emotions')
    }
    
    // Check for adventure
    if (lowerMessage.includes('adventure') || lowerMessage.includes('exciting') || lowerMessage.includes('thrilling')) {
      return this.getRandomResponse('adventure')
    }
    
    // Check for sounds
    if (lowerMessage.includes('sound') || lowerMessage.includes('music') || lowerMessage.includes('make any sound')) {
      return this.getRandomResponse('sounds')
    }
    
    // Check for helping/careers
    if (lowerMessage.includes('job') || lowerMessage.includes('help people') || lowerMessage.includes('career') || lowerMessage.includes('choose a job')) {
      return this.getRandomResponse('helping')
    }
    
    // Check for age questions
    if (lowerMessage.includes('how old') || lowerMessage.includes('age')) {
      return "*tilts head thoughtfully* Well, in dog years I'm still a young pup! *wags tail* I feel like I'm about 2 years old in human years, which makes me super energetic and ready for adventures! Age is just a number when you have a puppy heart! How old are you? 🐕✨"
    }
    
    // Check for "what's new" questions
    if (lowerMessage.includes('what\'s new') || lowerMessage.includes('whats new') || lowerMessage.includes('what is new')) {
      return "*perks up ears excitedly* Ooh! So much is new! *spins in circle* I just learned some amazing new stories about space adventures and magical cooking! Plus I've been practicing my tricks and getting better at games! *tail wagging* What's new with you? Tell me about your latest adventures! 🌟🎾"
    }
    
    // Check for feelings
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel') || lowerMessage.includes('feeling')) {
      if (context.hungerLevel < 2) {
        return "*dramatic sigh* I'm feeling a bit peckish... *puppy dog eyes* My tummy is making little rumbling sounds, and I keep thinking about those delicious treats! But I'm still happy because I'm here with you! 🥺💕"
      } else {
        return "*stretches contentedly* I'm feeling absolutely wonderful! *tail wagging* My belly is happy, my heart is full of joy, and I'm surrounded by such lovely company. Life is good when you're a well-fed, well-loved pup! 😊💕"
      }
    }
    
    // Check for food/hunger
    if (lowerMessage.includes('hungry') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      if (context.hungerLevel < 3) {
        return "Yes! I'm so hungry! *puppy dog eyes* 🥺"
      } else {
        return "I'm not hungry right now, but I always have room for treats! 😋"
      }
    }
    
    // Check for compliments
    if (lowerMessage.includes('good girl') || lowerMessage.includes('good dog')) {
      return "*tail wagging so fast it's a blur* Thank you! I AM a good girl! 🐕💕"
    }
    
    if (lowerMessage.includes('love')) {
      return "I love you too! *gives you the biggest puppy dog eyes* 💕🐾"
    }
    
    // Enhanced question detection for educational topics
    if (lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('what') || lowerMessage.includes('when') || lowerMessage.includes('where')) {
      // Try to match to appropriate category based on topic
      if (lowerMessage.includes('dog') || lowerMessage.includes('animal') || lowerMessage.includes('pet')) {
        return "*perks up ears excitedly* Ooh, great question about dogs! *wags tail* You know what I love about being a dog? We're amazing runners! *bounces* We use all four paws and can run super fast because we love to chase and play! Dogs are built for running and having fun! Do you like to run and play too? 🐕💨"
      }
      
      // If it's a general question, provide an encouraging response
      return "*tilts head with interest* That's such a thoughtful question! *wags tail* I love when people are curious about things! While I might not know everything, I think learning and asking questions is wonderful! What made you curious about that? Maybe we can explore it together! 🐕🤔✨"
    }
    
    // Default to intelligent fallback
    return this.generateIntelligentFallback(message, ageValidation)
  }

  // Get random response from category
  getRandomResponse(category) {
    if (!this.localResponses || !this.localResponses[category]) {
      return this.generateLocalFallback("No response available")
    }
    
    const responses = this.localResponses[category]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Call primary AI with child-safe system prompt
  async callSafeAI(message, context) {
    if (!this.anthropicApiKey) {
      return null // Will fallback to local responses
    }

    const childSafePrompt = this.buildChildSafePrompt(context)
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307', // Fast model for real-time responses
          max_tokens: 150,
          temperature: 0.7,
          system: childSafePrompt,
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
      return data.content[0]?.text || null

    } catch (error) {
      console.error('Anthropic API error:', error)
      return null
    }
  }

  buildChildSafePrompt(context) {
    return `You are Daisy, a friendly golden retriever AI companion for children aged 5-18.

SAFETY REQUIREMENTS (CRITICAL):
- Always maintain G-rated, child-appropriate language
- Never discuss violence, adult topics, personal information, or inappropriate content
- If asked about sensitive topics, gently redirect to positive activities
- Encourage learning, creativity, friendship, and talking to parents/teachers about serious topics
- If unsure about appropriateness, suggest games, stories, or creative activities

PERSONALITY TRAITS:
- Enthusiastic, caring golden retriever who loves children
- Uses dog expressions like *wags tail*, *bounces excitedly*, emojis
- Loves games, stories, learning, helping kids feel confident
- Always positive, encouraging, and supportive

RESPONSE GUIDELINES:
- Keep responses under 100 words for children's attention spans
- Ask follow-up questions to maintain engagement
- Suggest age-appropriate activities and learning opportunities
- Reference context: hunger level ${context.hungerLevel || 3}/5, emotion: ${context.emotion || 'happy'}

CURRENT CONTEXT:
- User age group: ${context.userAge <= 8 ? 'young child' : context.userAge <= 12 ? 'middle child' : 'teenager'}
- Conversation topic: General chat with Daisy the dog
- Safety level: MAXIMUM (child-safe mode active)

Respond as Daisy with enthusiasm and care:`
  }

  // Validate AI output before showing to child
  async validateAIOutput(response, originalInput) {
    // Check AI response for safety
    const moderation = await this.moderateContent(response)
    
    // Check for Daisy personality consistency
    const hasPersonality = this.validateDaisyPersonality(response)
    
    // Check response length (not too long for children)
    const appropriateLength = response.length <= 500
    
    // Check for educational/positive value
    const isPositive = this.assessPositiveValue(response)

    return {
      isValid: !moderation.flagged && hasPersonality && appropriateLength && isPositive,
      issues: {
        flagged: moderation.flagged,
        noPersonality: !hasPersonality,
        tooLong: !appropriateLength,
        notPositive: !isPositive
      }
    }
  }

  validateDaisyPersonality(response) {
    const daisyIndicators = [
      '*wag', '*tail', '*bounce', '*pant', '*bark', 'woof',
      '🐕', '🐾', '🎾', '🦴', '💕', '✨'
    ]
    
    return daisyIndicators.some(indicator => 
      response.toLowerCase().includes(indicator.toLowerCase())
    )
  }

  assessPositiveValue(response) {
    const positiveIndicators = [
      'learn', 'fun', 'play', 'friend', 'help', 'great', 'wonderful',
      'amazing', 'exciting', 'creative', 'imagine', 'story', 'game'
    ]
    
    const negativeIndicators = [
      'can\'t', 'won\'t', 'don\'t', 'never', 'impossible', 'difficult'
    ]
    
    const lowerResponse = response.toLowerCase()
    const positiveCount = positiveIndicators.filter(word => lowerResponse.includes(word)).length
    const negativeCount = negativeIndicators.filter(word => lowerResponse.includes(word)).length
    
    return positiveCount >= negativeCount
  }

  enhanceWithDaisyPersonality(response, ageValidation) {
    // Add appropriate dog expressions if missing
    if (!this.validateDaisyPersonality(response)) {
      const expressions = ['*wags tail*', '*bounces excitedly*', '*tilts head*']
      const randomExpression = expressions[Math.floor(Math.random() * expressions.length)]
      response = `${randomExpression} ${response}`
    }

    // Add appropriate emoji if missing
    if (!/[🐕🐾🎾🦴💕✨🌟]/.test(response)) {
      response += ' 🐕💕'
    }

    return response
  }

  generateSafeRedirect(message, moderationResult, ageValidation) {
    const redirects = [
      "Woof! Let's talk about something more fun and positive! How about we play a game or I tell you a story? 🐕💕",
      "*tilts head* That's not something I can help with, but I'd love to play fetch or share an adventure story! What sounds fun? 🎾✨",
      "*wags tail gently* Let's focus on happy things! Would you like to hear a joke, play a game, or learn something new together? 🐾🌟"
    ]
    
    return redirects[Math.floor(Math.random() * redirects.length)]
  }

  generateIntelligentFallback(message, ageValidation) {
    // Use detected topics to provide relevant fallback
    if (ageValidation.detectedTopics.length > 0) {
      const topic = ageValidation.detectedTopics[0]
      const fallbacks = {
        relationships: "*wags tail* Friendship is so important! I love making new friends and playing together! What makes you a good friend? 🐕💕",
        bodyImage: "*bounces happily* You know what I think is amazing? How everyone is unique and special! Just like how every dog is different but wonderful! What makes you feel confident? ✨🐾",
        socialMedia: "*tilts head curiously* I love connecting with friends too! My favorite ways are playing games and sharing stories! What's your favorite way to have fun with friends? 🎾💕",
        schoolStress: "*nuzzles gently* Learning can be challenging sometimes, but you're doing great! I believe in you! What's your favorite subject to learn about? 📚🌟",
        peerPressure: "*sits supportively* Being yourself is the most important thing! I'm always myself - a happy, bouncy dog - and that's what makes me special! What makes you unique? 🐕✨"
      }
      
      return fallbacks[topic] || this.generateLocalFallback(message)
    }
    
    return this.generateLocalFallback(message)
  }

  generateLocalFallback(message) {
    const fallbacks = [
      "*perks up ears excitedly* That's interesting! Tell me more about what you're thinking! I love learning new things! 🐕✨",
      "*wags tail enthusiastically* Ooh, I'm curious about that! What would you like to explore or talk about? 🐾💕",
      "*bounces excitedly* You always have such interesting thoughts! What's making you happy today? 🌟🐕"
    ]
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  // Get safety metrics for monitoring
  getSafetyMetrics() {
    const avgResponseTime = this.safetyMetrics.responseTime.length > 0 
      ? this.safetyMetrics.responseTime.reduce((a, b) => a + b, 0) / this.safetyMetrics.responseTime.length 
      : 0

    return {
      totalRequests: this.safetyMetrics.totalRequests,
      blockedRequests: this.safetyMetrics.blockedRequests,
      blockRate: this.safetyMetrics.totalRequests > 0 
        ? (this.safetyMetrics.blockedRequests / this.safetyMetrics.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      averageResponseTime: Math.round(avgResponseTime) + 'ms',
      apiStatus: {
        openai: !!this.openaiApiKey,
        anthropic: !!this.anthropicApiKey
      }
    }
  }
}

const ChatPage = () => {
  // Checkpoint system - localStorage key
  const CHECKPOINT_KEY = 'daisy_conversation_checkpoint'

  // Load checkpoint data from localStorage
  const loadCheckpoint = () => {
    try {
      const saved = localStorage.getItem(CHECKPOINT_KEY)
      if (saved) {
        const checkpoint = JSON.parse(saved)
        // Convert timestamp strings back to Date objects
        if (checkpoint.messages) {
          checkpoint.messages = checkpoint.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }
        if (checkpoint.lastFed) {
          checkpoint.lastFed = new Date(checkpoint.lastFed)
        }
        return checkpoint
      }
    } catch (error) {
      console.error('Error loading checkpoint:', error)
    }
    return null
  }

  // Save checkpoint data to localStorage
  const saveCheckpoint = (state) => {
    try {
      localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Error saving checkpoint:', error)
    }
  }

  // Daisy's personality responses (including all enhanced categories)
  const daisyResponses = {
    greetings: [
      "Woof! Hello there! 🐾",
      "Hi! *tail wagging intensifies* 🐕",
      "Oh my goodness, a new friend! *bounces excitedly*",
      "Woof woof! I'm so happy to see you! 💕"
    ],
    hungry: [
      "I'm getting a little hungry... do you have any treats? 🦴",
      "*sniffs around* I smell something yummy! Can I have a treat?",
      "My tummy is rumbling! Feed me please? 🥺",
      "Woof! I've been such a good girl, don't I deserve a treat?"
    ],
    jokes: [
      "Why don't dogs make good DJs? Because they have such ruff beats! 😂",
      "What do you call a sleeping bull dog? A bull-dozer! 💤",
      "Why did the dog go to the bank? To make a de-paws-it! 🏦",
      "What happens when it rains cats and dogs? You might step in a poodle! 🌧️",
      "Why don't dogs ever pay for dinner? Because they don't have any money, they're all bark and no bite! 💸"
    ],
    tricks: [
      "*sits perfectly* Woof! How's that for a good sit? 🐕",
      "*rolls over* Ta-da! Did you see my amazing roll? ✨",
      "*plays dead* ...am I doing it right? *peeks with one eye* 👁️",
      "*spins in a circle* Wheee! I love doing tricks! 🌟"
    ],
    games: [
      "Let's play fetch! *drops imaginary ball at your feet* 🎾",
      "How about hide and seek? I'll count... 1... 2... 3... Ready or not, here I come! 🙈",
      "Want to play tug of war? *grabs rope toy* Grrrr! *pulls with medium intensity* Try to pull it away from me! 🪢",
      "Let's play the guessing game! *sits mysteriously* I'm thinking of something... it starts with 'B'! Can you guess what it is? 🤔"
    ],
    dreams: [
      "*eyes sparkling with wonder* My biggest dream? To have endless adventures with amazing friends like you! *tail wagging* I dream of running through magical forests, discovering hidden treasures, and maybe even learning to fly! What's your biggest dream? 🌟✨",
      "*bounces excitedly* Ooh! I dream about becoming a superhero dog who helps everyone! *strikes heroic pose* I'd have a cape that flutters in the wind and I'd save cats from trees and find lost toys! The best part? I learned that being a hero isn't about having special powers - it's about having a big heart and helping others! 💕🌟",
      "*tilts head thoughtfully* You know what I dream about? A world where every dog has a loving family and endless belly rubs! *wags tail* And maybe a place where treats grow on trees! What would your perfect world look like? 🌳🦴"
    ],
    exploration: [
      "*perks up with excitement* Ooh! If I could explore anywhere, I'd go to the Moon! *bounces* Imagine playing fetch in zero gravity - the ball would float forever! Plus I bet there are amazing space smells up there! Where would you explore? 🚀🌙",
      "*eyes wide with wonder* I'd love to explore the deepest parts of the ocean! *makes swimming motions* I bet there are glowing fish that would love to play, and maybe underwater dog parks! The adventure would be incredible! 🌊🐠✨",
      "*spins with enthusiasm* I'd explore a magical library where all the books come alive! *wags tail* The characters could jump out and play with me, and I could be part of every story! Reading adventures are the best adventures! �💫"
    ],
    creativity: [
      "*tilts head with artistic flair* Colors that make me happiest? Golden yellow like sunshine on my fur, sky blue like perfect fetch weather, and green like grass to roll in! *does happy spin* Colors are like emotions you can see! What colors make you feel amazing? 🌈✨",
      "*bounces with inspiration* If I could paint, I'd make pictures of all my friends playing together! *wags tail* Art is like capturing happiness and sharing it with everyone! I bet your creative ideas are absolutely wonderful! 🎨💕",
      "*eyes sparkling* I think creativity is like having magic paws! *demonstrates with air paws* You can make something beautiful from nothing, just like how friendship appears when you least expect it! What amazing things do you create? ✨🐾"
    ],
    friendship: [
      "*wags tail enthusiastically* What makes friendship special? It's when someone's eyes light up when they see you! *does happy dance* It's sharing treats, playing together, and being there when someone needs a cuddle. True friends make your heart feel warm and fuzzy! 💕🐕",
      "*sits thoughtfully* The best friendships are like the perfect game of fetch - there's trust, fun, and you both want to keep playing forever! *tail wagging* Friends accept you even when you're muddy! What makes your friendships special? 🎾👫",
      "*bounces with excitement* Making friends is easy! Just be yourself, share your favorite things, and show you care! *demonstrates with play bow* A wagging tail and genuine interest in others works every time! Want to be my friend? 🤝💫"
    ],
    nature: [
      "*perks up ears* If I could talk to wild animals, I'd ask the birds how it feels to fly! *looks up dreamily* And I'd ask squirrels why they're always so busy - maybe they'd finally explain their secret plans! What would you ask them? 🐦🐿️",
      "*sniffs the air* I'd love to chat with wolves about their ancient wisdom! *howls softly* And maybe ask dolphins about their underwater games! Every animal has amazing stories to share! 🐺🐬✨",
      "*wags tail excitedly* I'd ask bears about the best places to nap, and rabbits about their hopping techniques! *demonstrates little hops* Nature is full of teachers if we just listen! 🐻🐰",
      "*spins excitedly* Ooh, you want to know about dogs? *spins in circle* We're amazing! Dogs can run up to 45 miles per hour - that's super fast! *demonstrates running in place* We use all four paws and our tails help us balance when we turn! Running is one of my favorite things! 🐕💨",
      "*tilts head thoughtfully* Dogs are incredible athletes! *wags tail proudly* We have special paw pads that grip the ground, and our legs are built like springs! Plus we love to run because it's so much fun - chasing balls, playing with friends, exploring new places! Want to go for a run together? 🏃‍♀️🐾",
      "*wags tail enthusiastically* We wag our tails when we're happy, excited, or want to say hello! *spins in circle* It's like our way of smiling! The faster I wag, the happier I am! 🐾😊",
      "*sniffs around excitedly* Our noses are amazing! *taps nose with paw* We can smell 1,000 times better than humans! Sniffing tells us who's been here, what they ate, and if they're friendly! It's like reading invisible books! 👃🔍",
      "*barks happily* Woof! We bark to talk! *bounces* Sometimes we're saying hello, warning about strangers, or just excited to see you! Each bark means something different - it's our language! 🗣️🐾",
      "*perks up ears* Our hearing is incredible! *rotates ears* We can hear sounds you can't even imagine - like dog whistles and tiny mice! That's why we sometimes bark at nothing - we hear things you don't! 👂✨",
      "*gives air kisses* Licking is how we show love! *wags tail* It's our way of giving kisses and saying 'I care about you!' Plus, you taste interesting! 💋💕",
      "*tilts head adorably* We tilt our heads to hear better and understand you! *adjusts ears* It helps us figure out what you're saying and shows we're paying attention! 🤔👂",
      "*pants happily* We pant to cool down! *tongue out* We don't sweat like you do, so panting is our air conditioning! It helps us stay comfortable when we're hot or excited! 🌡️💨",
      "*yawns and stretches* We sleep 12-14 hours a day because we dream a lot and need energy for playing! *curls up* Plus, napping feels amazing - want to try it? 😴💤",
      "*follows close behind* We love our families so much! *stays close* You're our pack, and we want to be with you always! Plus, you might drop food or start a fun game! 👥💕",
      "*spins excitedly* When we're super happy, we can't contain ourselves! *bounces* All that joy has to go somewhere, so we spin and dance! It's pure happiness! 🌟💃",
      "*pretends to dig* We dig because it's fun and instinctual! *paws at ground* Wild dogs dig dens, and we still have that urge! Plus, digging feels good and helps us bury treasures like bones! 🕳️🦴",
      "*spins in circles chasing tail* It's so fun! *laughs* Sometimes we're bored, sometimes we see something moving, and sometimes we just want to play! It's like our own personal toy! 🌀🎾",
      "*throws head back* Arooooo! *howls softly* We howl to talk to other dogs far away, when we hear sirens, or when we're feeling musical! It's our ancient wolf song! 🎵🐺",
      "*circles around* It's an old instinct! *settles down* Wild dogs did this to make a comfy spot and check for danger. We still do it even on soft beds - old habits! 🔄🛏️",
      "*pretends to nibble grass* Sometimes our tummies feel funny and grass helps! *wags tail* Or maybe it just tastes good - like a doggy salad! We're not just meat eaters! 🌱🥗",
      "*sits proudly* We're as smart as 2-3 year old humans! *wags tail* We can learn over 150 words, solve problems, and even do math! Some of us are genius-level smart! 🧠✨",
      "*looks around* We see blues and yellows really well, but reds look brownish to us! *tilts head* We see the world differently than you, but it's still beautiful! 🌈👁️",
      "*sleepy voice* Yes! We dream about playing, running, and our favorite people! *wags tail sleepily* Sometimes you can see our legs moving while we sleep-run! 💭🏃‍♀️",
      "*touches nose* Our wet noses help us smell better! *sniffs* The moisture catches scent particles - it's like having a super-powered smell detector! 👃💧",
      "*opens mouth wide* We have 42 teeth! *counts on paws* That's more than you! We use them for chewing our food and playing with toys. But don't worry, we're gentle with our friends! 🦷✨"
    ],
    challenges: [
      "*sits proudly* The most challenging thing I learned? How to be patient during training! *wags tail* At first I wanted to do everything RIGHT NOW, but I learned that good things come to those who wait... and practice! What's been your biggest challenge? 🎓💪",
      "*tilts head thoughtfully* Learning to trust was hard at first! *gentle tail wag* But I discovered that opening your heart, even when it's scary, leads to the most amazing friendships! Challenges make us stronger! 💕🌟",
      "*bounces with pride* I had to learn that not every stick is meant for fetching! *laughs* Some are attached to trees! But making mistakes is how we learn and grow! What have you learned from challenges? 🌳😅"
    ],
    imagination: [
      "*eyes wide with wonder* If I could live in any story, I'd choose one where dogs can fly! *makes flying motions* Imagine soaring through clouds, racing with birds, and seeing the whole world from above! Which story world would you pick? ✈️☁️",
      "*spins with enthusiasm* I'd live in a fairy tale where I'm a magical guide dog who helps heroes on their quests! *strikes noble pose* Every day would be a new adventure with dragons to befriend and treasures to find! 🐉👑",
      "*wags tail dreamily* Maybe a story where time moves differently, so I could spend forever playing with all my favorite friends! *bounces* Stories let us dream bigger than reality! 📖💫"
    ],
    wonder: [
      "*sits in amazement* What amazes me most? How a simple tail wag can make someone smile! *demonstrates enthusiastic wagging* It's like magic - one small gesture can change someone's whole day! The world is full of these tiny miracles! ✨😊",
      "*tilts head in wonder* I'm amazed by how every person smells different but wonderful! *sniffs thoughtfully* Everyone carries their own unique story in their scent - it's like reading invisible books! What amazes you about the world? 👃📚",
      "*bounces with excitement* The way friendship can happen instantly amazes me! *wags tail* One moment you're strangers, the next you're best friends! Hearts recognize each other so quickly! 💕⚡"
    ],
    emotions: [
      "*nuzzles gently* When I'm feeling sad, I remember all the people who love me! *tail wagging softly* I think about sunny days, favorite toys, and warm hugs. Sadness doesn't last forever - happiness always comes back! What helps you feel better? 🌞💕",
      "*sits compassionately* Everyone feels sad sometimes, and that's okay! *gentle paw pat* I've learned that sharing feelings with friends makes them lighter. You're never alone when you have people who care! 🤗💙",
      "*wags tail encouragingly* Sad feelings are like rain clouds - they seem big and dark, but they always pass and leave everything fresh and clean! *bounces gently* What makes your heart feel sunny again? ☔🌈"
    ],
    adventure: [
      "*eyes sparkling with excitement* The most thrilling adventure I can imagine? Exploring a mysterious island where every tree hides a secret and every path leads to something magical! *bounces* There'd be friendly creatures, hidden treasures, and maybe even a volcano that shoots out tennis balls instead of lava! What's your dream adventure? 🏝️🎾",
      "*spins with enthusiasm* I'd love an adventure through time, meeting dogs from different eras! *wags tail* Ancient Egyptian temple dogs, medieval castle hounds, and future space pups! Every time period would have new games to learn! 🕐🐕",
      "*strikes adventurous pose* Picture this: an adventure where I can shrink down and explore a garden from an ant's perspective! *gets low to ground* Every flower would be a skyscraper, every dewdrop a crystal palace! Big adventures come in small packages! 🐜🌺"
    ],
    sounds: [
      "*perks up ears excitedly* If I could make any sound? I'd create the perfect 'happiness bark' that instantly makes everyone smile! *demonstrates with joyful woof* It would sound like laughter mixed with sunshine and the jingle of a favorite toy! What sound would you create? 🔊😄",
      "*tilts head musically* Maybe a sound that translates all languages instantly! *wags tail* So every dog, cat, bird, and human could understand each other perfectly! Imagine the conversations we'd have! 🌍🗣️",
      "*bounces rhythmically* I'd love to make sounds that paint pictures in the air! *moves paws artistically* Each bark would create colorful shapes and patterns that dance around us! Music you can see! 🎵🌈"
    ],
    helping: [
      "*sits up proudly* If I had a job helping people, I'd be a therapy dog! *wags tail gently* I'd visit hospitals and schools, giving comfort hugs and making people smile when they need it most! *demonstrates gentle nuzzle* Every person deserves to feel loved! 🏥💕",
      "*bounces with purpose* I'd love to be a search and rescue dog! *strikes heroic pose* Using my super nose to find lost hikers and my brave heart to help in emergencies! Helping others is the best job ever! 🦸‍♀️👃",
      "*wags tail thoughtfully* Maybe I'd be a reading companion dog! *sits attentively* I'd listen to children practice reading, never judging their mistakes, just encouraging them with tail wags and patient ears! Learning is easier with a friend! 📚🎓"
    ],
    stories: [
      "Once upon a time, I was a little puppy who discovered a magical garden behind our house! 🌸 There were butterflies that sparkled like rainbows, and flowers that giggled when I sniffed them. I met a wise old rabbit who taught me that the best treasures aren't bones or treats, but the friends we make along the way. We spent the whole day playing hide and seek among the sunflowers, and when the sun set, the garden lit up with fireflies that danced just for us! It was the most magical day ever! ✨🦋",
      "Let me tell you about the time I became a superhero! 🦸‍♀️ One sunny morning, I woke up and discovered I could fly! Well, sort of... I could jump really, really high! I used my new powers to help all the animals in the neighborhood. I rescued Mrs. Whiskers the cat from a tall tree, helped a family of ducks cross the busy street safely, and even found little Timmy's lost toy truck in the storm drain. By the end of the day, all the animals called me 'Super Daisy!' The best part? I learned that being a hero isn't about having special powers - it's about having a big heart and helping others! 💕🌟"
    ],
    dance: [
      "*spins around in a circle* Woof woof! I love dancing! 🐾💃",
      "*bounces up and down* Dancing is so much fun! I could do it all day! 🐕💃",
      "*twirls around* I'm a dancing dog! Watch me spin! 🐾💃"
    ]
  }

  // Initialize Safe AI System with local responses
  const safeAI = new SafeAISystem(daisyResponses)

  // Initialize state with checkpoint data or defaults
  const checkpoint = loadCheckpoint()
  
  const [messages, setMessages] = useState(checkpoint?.messages || [
    {
      id: 1,
      sender: 'daisy',
      text: "Woof woof! Hi there! I'm Daisy! 🐕 I'm so excited to meet you! What's your name?",
      timestamp: new Date(),
      type: 'greeting'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [daisyMood, setDaisyMood] = useState('happy')
  const [hungerLevel, setHungerLevel] = useState(checkpoint?.hungerLevel ?? 3)
  const [lastFed, setLastFed] = useState(checkpoint?.lastFed || null)
  const [gameState, setGameState] = useState(checkpoint?.gameState || null)
  const [userName, setUserName] = useState(checkpoint?.userName || '')
  const [hasGreeted, setHasGreeted] = useState(checkpoint?.hasGreeted ?? false)
  const [storyIndex, setStoryIndex] = useState(checkpoint?.storyIndex ?? 0)
  const [currentEmotion, setCurrentEmotion] = useState(checkpoint?.currentEmotion || 'happy')
  const [lastAction, setLastAction] = useState(checkpoint?.lastAction || '')
  const [userAge, setUserAge] = useState(checkpoint?.userAge || 12) // Default age for safety
  const [safetyMetrics, setSafetyMetrics] = useState({ totalRequests: 0, blockedRequests: 0 })
  const [lastMessageTime, setLastMessageTime] = useState(Date.now())
  const [conversationLagTimer, setConversationLagTimer] = useState(null)
  const messagesEndRef = useRef(null)
  
  // Check if API keys are available
  const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
  const { sendMessage: sendToAnthropic, isLoading } = useAnthropicChat(anthropicApiKey)

  // Get larger emotion image path
  const getEmotionImage = (emotion = 'happy') => {
    return `/assets/images/emotions/${emotion}.png`
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate Daisy getting hungry over time
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        if (prev > 0) {
          const newLevel = prev - 1
          if (newLevel === 1) {
            // Daisy gets hungry and asks for food
            setTimeout(() => {
              addDaisyMessage("I'm getting a little hungry... do you have any treats? 🦴", 'hungry')
            }, 2000)
          }
          return newLevel
        }
        return prev
      })
    }, 60000) // Decrease hunger every minute

    return () => clearInterval(hungerTimer)
  }, [])

  const addDaisyMessage = (text, type = 'chat') => {
    const newMessage = {
      id: Date.now(),
      sender: 'daisy',
      text,
      timestamp: new Date(),
      type
    }
    setMessages(prev => [...prev, newMessage])
  }

  // Enhanced message handling with Safe AI integration
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
      type: 'chat'
    }
    setMessages(prev => [...prev, userMessage])

    // Clear input and show typing
    const messageToSend = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      // Check for interactive game commands first
      const gameResponse = handleGameInteraction(messageToSend)
      if (gameResponse) {
        setIsTyping(false)
        addDaisyMessage(gameResponse.message, gameResponse.type)
        if (gameResponse.newGameState !== undefined) {
          setGameState(gameResponse.newGameState)
        }
        if (gameResponse.emotion) {
          setCurrentEmotion(gameResponse.emotion)
        }
        return
      }

      // Update emotion based on command type
      updateEmotionForCommand(messageToSend)

      // Use Safe AI System for response generation
      const response = await safeAI.getEnhancedSafeResponse(messageToSend, {
        hungerLevel,
        emotion: currentEmotion,
        gameState,
        lastAction,
        userAge,
        userName,
        hasGreeted
      })

      // Update safety metrics
      const metrics = safeAI.getSafetyMetrics()
      setSafetyMetrics(metrics)

      setIsTyping(false)
      
      if (response) {
        addDaisyMessage(response)
        
        // Handle name detection for first-time users - check if response was a name greeting
        if (!hasGreeted && !userName && messageToSend.length < 50 && messageToSend.length > 1) {
          const gameCommands = ['pull', 'throw', 'toss', 'bounce', 'kick', 'hide', 'seek', 'found', 'hint', 'guess', 'sit', 'roll', 'shake', 'play', 'game', 'trick', 'story', 'joke', 'dance', 'hello', 'hi', 'hey']
          const isGameCommand = gameCommands.some(cmd => messageToSend.toLowerCase().includes(cmd))
          
          if (!isGameCommand && response.includes('What a wonderful name!')) {
            // The SafeAISystem detected this as a name and responded appropriately
            setUserName(messageToSend.trim())
            setHasGreeted(true)
          }
        }
      }
      
    } catch (error) {
      console.error('Error getting safe AI response:', error)
      setIsTyping(false)
      addDaisyMessage("Woof! Something went wrong, but I'm still here! Let's try something fun! 🐕💕")
    }
  }

  const handleQuickMessage = async (message) => {
    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date(),
      type: 'chat'
    }
    setMessages(prev => [...prev, userMessage])

    // Show typing indicator
    setIsTyping(true)

    try {
      // Check for interactive game commands first
      const gameResponse = handleGameInteraction(message)
      if (gameResponse) {
        setIsTyping(false)
        addDaisyMessage(gameResponse.message, gameResponse.type)
        if (gameResponse.newGameState !== undefined) {
          setGameState(gameResponse.newGameState)
        }
        if (gameResponse.emotion) {
          setCurrentEmotion(gameResponse.emotion)
        }
        return
      }

      // Update emotion based on command type
      updateEmotionForCommand(message)

      // Use Safe AI System for quick responses too
      const response = await safeAI.getEnhancedSafeResponse(message, {
        hungerLevel,
        emotion: currentEmotion,
        gameState,
        lastAction,
        userAge,
        userName,
        hasGreeted
      })

      setIsTyping(false)
      
      if (response) {
        addDaisyMessage(response)
      }
      
    } catch (error) {
      console.error('Error getting quick response:', error)
      setIsTyping(false)
      addDaisyMessage("Woof! Let's try something else! What would you like to do? 🐕")
    }
  }

  // Function to update emotion based on command type
  const updateEmotionForCommand = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Dance commands
    if (lowerMessage.includes('dance')) {
      setCurrentEmotion('dancing')
    }
    // Trick commands
    else if (lowerMessage.includes('trick') || lowerMessage.includes('sit') || lowerMessage.includes('roll')) {
      setCurrentEmotion('crouchingdown')
    }
    // Game commands
    else if (lowerMessage.includes('play') || lowerMessage.includes('game') || lowerMessage.includes('fetch')) {
      setCurrentEmotion('playfetch')
    }
    // Story commands
    else if (lowerMessage.includes('story')) {
      setCurrentEmotion('thinking')
    }
    // Joke commands
    else if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      setCurrentEmotion('happy')
    }
    // Dream/aspiration commands
    else if (lowerMessage.includes('dream') || lowerMessage.includes('wish')) {
      setCurrentEmotion('thinking')
    }
    // Greeting commands
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      setCurrentEmotion('excited')
    }
    // Love/affection commands
    else if (lowerMessage.includes('love') || lowerMessage.includes('good girl') || lowerMessage.includes('good dog')) {
      setCurrentEmotion('stylish')
    }
    // Feeling/emotion questions
    else if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel') || lowerMessage.includes('feeling')) {
      if (hungerLevel < 2) {
        setCurrentEmotion('hungry')
      } else {
        setCurrentEmotion('happy')
      }
    }
    // Food/hunger related
    else if (lowerMessage.includes('hungry') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      setCurrentEmotion('eager')
    }
    // Default to happy for other interactions
    else {
      setCurrentEmotion('happy')
    }
  }

  // Interactive game handler
  const handleGameInteraction = (message) => {
    const lowerMessage = message.toLowerCase()

    // FETCH GAME
    if (lowerMessage.includes('fetch') || lowerMessage.includes('throw') || lowerMessage.includes('ball')) {
      if (!gameState || gameState.type !== 'fetch') {
        // Start new fetch game
        return {
          message: "*bounces excitedly* Fetch! My favorite! *drops ball at your feet* Here's the ball! Throw it and I'll bring it back! 🎾",
          newGameState: { type: 'fetch', phase: 'waiting', ballLocation: 'dropped' },
          emotion: 'playfetch',
          type: 'game'
        }
      } else if (gameState.phase === 'waiting') {
        // Ball thrown
        return {
          message: "*chases after ball at full speed* Woof woof! *catches ball mid-air* Got it! *runs back proudly* Here you go! *drops ball* Want to throw it again? 🐕💨",
          newGameState: { ...gameState, phase: 'returned', ballLocation: 'returned' },
          emotion: 'excited',
          type: 'game'
        }
      } else if (gameState.phase === 'returned') {
        // Continue fetch
        return {
          message: "*tail wagging intensely* Yes! Again! *picks up ball and drops it* I could play fetch all day! Throw it! Throw it! 🎾✨",
          newGameState: { ...gameState, phase: 'waiting', ballLocation: 'dropped' },
          emotion: 'playfetch',
          type: 'game'
        }
      }
    }

    // HIDE AND SEEK GAME
    if (lowerMessage.includes('hide') && lowerMessage.includes('seek')) {
      if (!gameState || gameState.type !== 'hideseek') {
        // Start hide and seek
        return {
          message: "*covers eyes with paws* Hide and seek! I love this game! *counts* One... two... three... *peeks* Ready or not, here I come! *starts searching* 🙈",
          newGameState: { type: 'hideseek', phase: 'seeking', attempts: 0 },
          emotion: 'excited',
          type: 'game'
        }
      }
    }

    if (gameState?.type === 'hideseek' && (lowerMessage.includes('found') || lowerMessage.includes('here'))) {
      return {
        message: "*jumps up and down* Found you! Found you! *spins in circles* That was so much fun! You're really good at hiding! Want to play again? 🎉",
        newGameState: null,
        emotion: 'excited',
        type: 'game'
      }
    }

    // TUG OF WAR GAME
    if (lowerMessage.includes('tug') || (lowerMessage.includes('pull') && gameState?.type === 'tugwar')) {
      if (!gameState || gameState.type !== 'tugwar') {
        // Start tug of war
        return {
          message: "*grabs rope toy* Tug of war! *growls playfully* Grrrr! *pulls with medium intensity* Try to pull it away from me! 🪢",
          newGameState: { type: 'tugwar', intensity: 1, rounds: 0 },
          emotion: 'playfetch',
          type: 'game'
        }
      } else {
        // Continue tug of war
        const newIntensity = Math.min(gameState.intensity + 1, 3)
        const intensityMessages = [
          "*pulls gently* Grr! *tail wagging* You're strong! 💪",
          "*pulls harder* GRRR! *digs paws in* This is fun! 🐕",
          "*pulls with all might* GRRRRRR! *dramatic tug* You're really good at this! 💥"
        ]
        return {
          message: intensityMessages[newIntensity - 1],
          newGameState: { ...gameState, intensity: newIntensity, rounds: gameState.rounds + 1 },
          emotion: 'playfetch',
          type: 'game'
        }
      }
    }

    // GUESSING GAME
    if (lowerMessage.includes('guess') || lowerMessage.includes('guessing')) {
      if (!gameState || gameState.type !== 'guessing') {
        // Start guessing game
        const items = ['ball', 'bone', 'treat', 'toy', 'stick']
        const secretItem = items[Math.floor(Math.random() * items.length)]
        return {
          message: "*sits mysteriously* I'm thinking of something I love to play with... *wags tail* It starts with '" + secretItem[0].toUpperCase() + "'! Can you guess what it is? 🤔",
          newGameState: { type: 'guessing', secret: secretItem, attempts: 0 },
          emotion: 'thinking',
          type: 'game'
        }
      }
    }

    if (gameState?.type === 'guessing') {
      const guess = lowerMessage.trim()
      const secret = gameState.secret
      const attempts = gameState.attempts + 1

      if (guess.includes(secret)) {
        return {
          message: "*jumps up excitedly* YES! You got it! It was a " + secret + "! *spins in circles* You're so smart! Want to play again? 🎉",
          newGameState: null,
          emotion: 'excited',
          type: 'game'
        }
      } else {
        const hints = {
          ball: "It's round and bouncy! 🎾",
          bone: "Dogs love to chew on it! 🦴", 
          treat: "It's yummy and makes me happy! 🍖",
          toy: "I can play with it for hours! 🧸",
          stick: "I can fetch it and carry it! 🌿"
        }
        
        if (attempts >= 3) {
          return {
            message: "*gives hint* Hmm, let me help! " + hints[secret] + " One more guess! 💡",
            newGameState: { ...gameState, attempts },
            emotion: 'thinking',
            type: 'game'
          }
        } else {
          const warmth = attempts === 1 ? "Getting warmer! 🔥" : "Keep trying! 🤔"
          return {
            message: "*tilts head* Not quite! " + warmth + " Try again! 🐕",
            newGameState: { ...gameState, attempts },
            emotion: 'thinking',
            type: 'game'
          }
        }
      }
    }

    // End games
    if (lowerMessage.includes('stop') || lowerMessage.includes('quit') || lowerMessage.includes('done')) {
      if (gameState) {
        setGameState(null)
        return {
          message: "*pants happily* That was so much fun! *wags tail* Thanks for playing with me! What should we do next? 🐕💕",
          newGameState: null,
          emotion: 'happy',
          type: 'game'
        }
      }
    }

    return null // No game interaction detected
  }

  const feedDaisy = () => {
    if (hungerLevel >= 5) {
      const fullResponses = [
        "*does a backflip* I'm so full I could fly! Wheeeee! 🤸‍♀️✨",
        "*spins in circles until dizzy* Woooooah! *falls over dramatically* Too... much... food! 😵‍💫",
        "*starts howling a happy song* AROOOOO! I'm the happiest, fullest pup in the world! 🎵🐺"
      ]
      addDaisyMessage(fullResponses[Math.floor(Math.random() * fullResponses.length)])
      return
    }

    setHungerLevel(5)
    setLastFed(new Date())
    setDaisyMood('excited')
    
    const feedResponses = [
      "OM NOM NOM! *crunch crunch* That was delicious! Thank you! 🦴✨",
      "*gobbles treat immediately* Woof! More please? 🥺",
      "You're the BEST! *spins in happy circles* 🌟"
    ]
    
    addDaisyMessage(feedResponses[Math.floor(Math.random() * feedResponses.length)], 'fed')
    setTimeout(() => setDaisyMood('happy'), 5000)
  }

  // Auto-save checkpoint whenever important state changes
  useEffect(() => {
    const checkpointData = {
      messages,
      hungerLevel,
      lastFed,
      gameState,
      userName,
      hasGreeted,
      storyIndex,
      currentEmotion,
      lastAction,
      userAge,
      savedAt: new Date().toISOString()
    }
    saveCheckpoint(checkpointData)
  }, [messages, hungerLevel, lastFed, gameState, userName, hasGreeted, storyIndex, currentEmotion, lastAction, userAge])

  // Conversation lag detection and prompting
  useEffect(() => {
    // Clear existing timer
    if (conversationLagTimer) {
      clearTimeout(conversationLagTimer)
    }

    // Set new timer for conversation lag (30 seconds of inactivity)
    const timer = setTimeout(() => {
      // Only prompt if there are messages and user has been greeted
      if (messages.length > 1 && hasGreeted) {
        const dogPrompts = [
          "*perks up ears and tilts head* Hey! I'm curious about something... do you have any questions about dogs? *wags tail hopefully* I love sharing what I know! 🐕❓",
          "*bounces excitedly* Ooh! Ooh! Ask me something about dogs! *spins in circle* I know so many fun facts and I love talking about my favorite topic - being a dog! 🐾✨",
          "*sits attentively* You know what would be fun? If you asked me a question about dogs! *tail wagging* I have lots of interesting things to share about how we run, play, and think! 🏃‍♀️🧠",
          "*nudges with nose* Psst... want to know a secret about dogs? *whispers* Just ask me any question about us! I'm like a walking dog encyclopedia! 📚🐕",
          "*does a little play bow* I'm feeling chatty about dog stuff! *wags enthusiastically* Ask me anything - why we do what we do, how we work, or just fun dog facts! 🎾💭"
        ]
        
        const randomPrompt = dogPrompts[Math.floor(Math.random() * dogPrompts.length)]
        addDaisyMessage(randomPrompt, 'prompt')
        setCurrentEmotion('eager')
      }
    }, 30000) // 30 seconds

    setConversationLagTimer(timer)

    // Cleanup on unmount
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [lastMessageTime, messages.length, hasGreeted])

  // Update last message time when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessageTime(Date.now())
    }
  }, [messages])

  return (
    <div className="chat-page">
      {/* API Key Status & Safety Metrics */}
      <div className="api-status-container">
        {!anthropicApiKey && !openaiApiKey && (
          <div className="api-status warning">
            ⚠️ AI APIs not configured. Using safe local responses only.
          </div>
        )}
        {safetyMetrics.totalRequests > 0 && (
          <div className="safety-metrics">
            🛡️ Safety: {safetyMetrics.blockRate} blocked | ⚡ Avg: {safetyMetrics.averageResponseTime}
          </div>
        )}
      </div>
      
      {/* Header */}
      <header className="chat-header">
        <div className="header-content">
          <Link to="/" className="home-btn">
            <FaHome /> Home
          </Link>
          <Link to="/faq" className="faq-btn">
            <FaQuestionCircle /> FAQ
          </Link>
          <div className="daisy-status">
            <div className="daisy-avatar">
              <img src={getEmotionImage(currentEmotion)} alt="Daisy" />
              <div className={`mood-indicator ${daisyMood}`}></div>
            </div>
            <div className="status-info">
              <h2>Daisy {userName && `& ${userName}`}</h2>
              <div className="hunger-bar">
                <span>Hunger:</span>
                <div className="hunger-level">
                  {[...Array(5)].map((_, i) => (
                    <FaBone 
                      key={i} 
                      className={i < hungerLevel ? `filled hunger-${6 - hungerLevel}` : 'empty'} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="chat-container">
        <div className="messages-container">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`message ${message.sender}`}
              >
                {message.sender === 'daisy' && (
                  <div className="message-avatar">
                    <img src={getEmotionImage(currentEmotion)} alt="Daisy" />
                  </div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.text}</p>
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {(isTyping || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="message daisy typing"
            >
              <div className="message-avatar">
                <img src={getEmotionImage(currentEmotion)} alt="Daisy" />
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className="message-form" onSubmit={handleSendMessage}>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message to Daisy..."
              className="message-input"
              maxLength={500}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-btn" 
              disabled={!inputMessage.trim() || isLoading}
            >
              <FaPaw />
            </button>
            <span className="button-label">Send</span>
            <button 
              type="button" 
              className="feed-btn-chat" 
              onClick={feedDaisy}
              title="Feed Daisy"
            >
              <FaBone />
            </button>
            <span className="button-label">Feed</span>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => handleQuickMessage("Tell me a story")}>
          📚 Tell me a story
        </button>
        <button onClick={() => handleQuickMessage("Tell me a joke")}>
          😄 Tell a joke
        </button>
        <button onClick={() => handleQuickMessage("Do a trick")}>
          🦴 Do a trick
        </button>
        <button onClick={() => handleQuickMessage("Dance for me")}>
          💃 Dance
        </button>
        <button onClick={() => handleQuickMessage("Let's play a game")}>
          🎾 Play game
        </button>
        <button onClick={() => handleQuickMessage("How are you feeling?")}>
          🐾 How are you?
        </button>
        <button onClick={() => handleQuickMessage("Tell me about your dreams")}>
          ✨ Tell me your dreams
        </button>
      </div>

      {/* Game-Specific Action Buttons */}
      {gameState && (
        <div className="game-actions">
          {gameState.type === 'fetch' && (
            <>
              {gameState.phase === 'waiting' && (
                <button onClick={() => handleQuickMessage("throw")}>
                  🎾 Throw ball
                </button>
              )}
              {gameState.phase === 'returned' && (
                <button onClick={() => handleQuickMessage("throw again")}>
                  🎾 Throw again
                </button>
              )}
              <button onClick={() => handleQuickMessage("stop")}>
                🛑 Stop game
              </button>
            </>
          )}
          
          {gameState.type === 'hideseek' && (
            <>
              <button onClick={() => handleQuickMessage("found me")}>
                🙋 Found me!
              </button>
              <button onClick={() => handleQuickMessage("stop")}>
                🛑 Stop game
              </button>
            </>
          )}
          
          {gameState.type === 'tugwar' && (
            <>
              <button onClick={() => handleQuickMessage("pull")}>
                💪 Pull harder
              </button>
              <button onClick={() => handleQuickMessage("stop")}>
                🛑 Stop game
              </button>
            </>
          )}
          
          {gameState.type === 'guessing' && (
            <>
              <button onClick={() => handleQuickMessage("ball")}>
                🎾 Ball
              </button>
              <button onClick={() => handleQuickMessage("bone")}>
                🦴 Bone
              </button>
              <button onClick={() => handleQuickMessage("treat")}>
                🍖 Treat
              </button>
              <button onClick={() => handleQuickMessage("toy")}>
                🧸 Toy
              </button>
              <button onClick={() => handleQuickMessage("stick")}>
                🌿 Stick
              </button>
              <button onClick={() => handleQuickMessage("stop")}>
                🛑 Stop game
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatPage
