/**
 * ProactiveEngagementService - Manages proactive conversation prompts
 * Implements Single Responsibility Principle for engagement management
 */

import { TIMING } from '../constants/index.js'
import { EMOTIONS } from '../types/index.js'

class ProactiveEngagementService {
  constructor() {
    this.lastInteractionTime = Date.now()
    this.promptType = 'dog_fact' // Alternates between 'dog_fact' and 'feed'
    this.isActive = false
    this.timer = null
    this.activationDelay = 30000 // 30 seconds
    this.checkInterval = 15000 // Check every 15 seconds
    
    // Proactive prompt templates
    this.dogFactPrompts = [
      "*perks up excitedly* Hey! Did you know something really cool about dogs? *wags tail* Ask me 'dog facts' and I'll tell you! 🐕📚",
      "*bounces with excitement* I've been thinking about dog facts! *tilts head* Want to hear an amazing dog fact? 🐾✨",
      "*sits attentively* You know what I love sharing? *wags tail enthusiastically* Dog facts! Ask me about dogs and I'll teach you something new! 🧠🐕",
      "*eyes light up* I just remembered something fascinating about dogs! *excited bounce* Ask me for a dog fact! 🤓🐕",
      "*tilts head curiously* Did you know dogs have some incredible abilities? *wags tail* Want to learn something amazing? 🌟🐾"
    ]
    
    this.feedPrompts = [
      "*stomach rumbles softly* Excuse me... *looks hopeful* I'm getting a little hungry. Do you think you could feed me a treat? 🦴🥺",
      "*sits politely* *gentle tail wag* I don't want to be a bother, but I'm feeling a bit peckish. Could I have a treat? 🍖😊",
      "*looks up with puppy eyes* I've been such a good dog! *hopeful expression* Maybe I deserve a little snack? 🥺🦴",
      "*gentle whimper* My tummy is making noises... *looks at you hopefully* Could you spare a treat for a good dog? 🐕🍗",
      "*sits and stays* I've been waiting patiently... *tail wag* Could I please have a treat? I promise I've been good! 🦴✨"
    ]
    
    this.generalPrompts = [
      "*stretches and yawns* I'm feeling chatty! *wags tail* Want to talk about something fun? 🐕💬",
      "*bounces playfully* I'm in a great mood! *spins in circle* What should we do together? 🎾🐾",
      "*sits attentively* I love spending time with you! *happy panting* What's on your mind? 💕🐕",
      "*tilts head with interest* I'm curious about what you're thinking! *wags tail* Want to chat? 🤔💭",
      "*playful bow* I'm ready for anything! *excited bark* Games, stories, or just talking - what sounds fun? 🎮📚"
    ]
  }

  /**
   * Start proactive engagement monitoring
   * @param {Function} onPrompt - Callback when prompt should be sent
   */
  start(onPrompt) {
    if (this.isActive) {
      this.stop()
    }
    
    this.isActive = true
    this.onPrompt = onPrompt
    this.lastInteractionTime = Date.now()
    
    this.timer = setInterval(() => {
      this.checkForProactivePrompt()
    }, this.checkInterval)
    
    console.log('🤖 ProactiveEngagementService started')
  }

  /**
   * Stop proactive engagement monitoring
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    
    this.isActive = false
    console.log('🛑 ProactiveEngagementService stopped')
  }

  /**
   * Update last interaction time (call when user interacts)
   */
  updateInteractionTime() {
    this.lastInteractionTime = Date.now()
  }

  /**
   * Check if proactive prompt should be sent
   */
  checkForProactivePrompt() {
    if (!this.isActive || !this.onPrompt) {
      return
    }

    const timeSinceLastInteraction = Date.now() - this.lastInteractionTime
    const shouldActivate = timeSinceLastInteraction > this.activationDelay

    if (shouldActivate) {
      this.sendProactivePrompt()
      this.updateInteractionTime() // Reset timer after sending prompt
    }
  }

  /**
   * Send appropriate proactive prompt
   */
  sendProactivePrompt() {
    let prompt
    let emotion = EMOTIONS.HAPPY

    if (this.promptType === 'dog_fact') {
      prompt = this.getRandomPrompt(this.dogFactPrompts)
      emotion = EMOTIONS.EXCITED
      this.promptType = 'feed'
    } else if (this.promptType === 'feed') {
      // Check if hunger-based prompt is appropriate
      const hungerLevel = this.getHungerLevel()
      
      if (hungerLevel <= 3) {
        prompt = this.getRandomPrompt(this.feedPrompts)
        emotion = EMOTIONS.HUNGRY
      } else {
        prompt = this.getRandomPrompt(this.generalPrompts)
        emotion = EMOTIONS.HAPPY
      }
      
      this.promptType = 'dog_fact'
    }

    if (prompt && this.onPrompt) {
      console.log('📢 Sending proactive prompt:', this.promptType)
      this.onPrompt(prompt, emotion)
    }
  }

  /**
   * Get random prompt from array
   * @param {Array} prompts - Array of prompt strings
   * @returns {string} Random prompt
   */
  getRandomPrompt(prompts) {
    return prompts[Math.floor(Math.random() * prompts.length)]
  }

  /**
   * Get current hunger level (override this method to connect to actual hunger system)
   * @returns {number} Hunger level
   */
  getHungerLevel() {
    // This should be overridden to connect to actual hunger system
    return 3
  }

  /**
   * Set hunger level provider
   * @param {Function} hungerProvider - Function that returns current hunger level
   */
  setHungerProvider(hungerProvider) {
    this.getHungerLevel = hungerProvider
  }

  /**
   * Configure proactive engagement settings
   * @param {Object} config - Configuration options
   */
  configure(config) {
    if (config.activationDelay) {
      this.activationDelay = config.activationDelay
    }
    
    if (config.checkInterval) {
      this.checkInterval = config.checkInterval
      
      // Restart timer with new interval if active
      if (this.isActive) {
        this.stop()
        this.start(this.onPrompt)
      }
    }
    
    if (config.customPrompts) {
      if (config.customPrompts.dogFact) {
        this.dogFactPrompts = [...config.customPrompts.dogFact]
      }
      
      if (config.customPrompts.feed) {
        this.feedPrompts = [...config.customPrompts.feed]
      }
      
      if (config.customPrompts.general) {
        this.generalPrompts = [...config.customPrompts.general]
      }
    }
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfiguration() {
    return {
      activationDelay: this.activationDelay,
      checkInterval: this.checkInterval,
      currentPromptType: this.promptType,
      isActive: this.isActive,
      timeSinceLastInteraction: Date.now() - this.lastInteractionTime
    }
  }

  /**
   * Force a proactive prompt (for testing)
   * @param {string} type - Type of prompt ('dog_fact', 'feed', 'general')
   */
  forcePrompt(type = null) {
    if (type) {
      this.promptType = type
    }
    
    this.sendProactivePrompt()
  }

  /**
   * Add custom prompts to existing arrays
   * @param {string} category - Prompt category
   * @param {Array} newPrompts - New prompts to add
   */
  addCustomPrompts(category, newPrompts) {
    switch (category) {
      case 'dog_fact':
        this.dogFactPrompts.push(...newPrompts)
        break
      case 'feed':
        this.feedPrompts.push(...newPrompts)
        break
      case 'general':
        this.generalPrompts.push(...newPrompts)
        break
      default:
        console.warn('Unknown prompt category:', category)
    }
  }

  /**
   * Get statistics about proactive engagement
   * @returns {Object} Engagement statistics
   */
  getStats() {
    return {
      isActive: this.isActive,
      currentPromptType: this.promptType,
      timeSinceLastInteraction: Date.now() - this.lastInteractionTime,
      activationDelay: this.activationDelay,
      checkInterval: this.checkInterval,
      promptCounts: {
        dogFact: this.dogFactPrompts.length,
        feed: this.feedPrompts.length,
        general: this.generalPrompts.length
      }
    }
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.stop()
    this.lastInteractionTime = Date.now()
    this.promptType = 'dog_fact'
  }
}

// Export singleton instance
export default new ProactiveEngagementService()
