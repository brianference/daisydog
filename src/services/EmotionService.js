/**
 * EmotionService - Manages Daisy's emotional states and visual representations
 * Implements Single Responsibility Principle for emotion management
 */

import { EMOTIONS } from '../types/index.js'

class EmotionService {
  constructor() {
    this.emotionMap = {
      [EMOTIONS.HAPPY]: 'happy',
      [EMOTIONS.EXCITED]: 'excited',
      [EMOTIONS.PLAYFETCH]: 'playfetch',
      [EMOTIONS.THINKING]: 'thinking',
      [EMOTIONS.HUNGRY]: 'hungry',
      [EMOTIONS.PATIENT]: 'patient',
      [EMOTIONS.NERVOUS]: 'nervous',
      [EMOTIONS.DANCING]: 'dancing',
      [EMOTIONS.CROUCHINGDOWN]: 'crouchingdown',
      [EMOTIONS.EAGER]: 'eager',
      [EMOTIONS.PANTING]: 'panting',
      [EMOTIONS.WAITING]: 'waiting',
      [EMOTIONS.LOOKINGBEHIND]: 'lookingbehind',
      [EMOTIONS.STYLISH]: 'stylish',
      [EMOTIONS.SHAKEPAW]: 'shakepaw'
    }
  }

  /**
   * Get emotion image path for given emotion
   * @param {string} emotion - Emotion constant from EMOTIONS
   * @returns {string} Path to emotion image
   */
  getEmotionImage(emotion = EMOTIONS.HAPPY) {
    const mappedEmotion = this.emotionMap[emotion] || 'happy'
    return `/assets/images/emotions/${mappedEmotion}.png`
  }

  /**
   * Determine emotion based on context
   * @param {Object} context - Context object with game state, hunger, etc.
   * @returns {string} Appropriate emotion
   */
  determineEmotionFromContext(context) {
    const { gameState, hungerLevel, messageContent, currentEmotion } = context

    // Priority 1: Hunger-based emotions
    if (hungerLevel <= 1) {
      return EMOTIONS.HUNGRY
    }

    // Priority 2: Game-based emotions
    if (gameState) {
      switch (gameState) {
        case 'fetch':
          return EMOTIONS.PLAYFETCH
        case 'hide_and_seek':
          return EMOTIONS.LOOKINGBEHIND
        case 'tug_of_war':
          return EMOTIONS.EAGER
        case 'guessing_game':
          return EMOTIONS.THINKING
      }
    }

    // Priority 3: Content-based emotions
    if (messageContent) {
      const lowerContent = messageContent.toLowerCase()
      
      if (lowerContent.includes('story') || lowerContent.includes('think')) {
        return EMOTIONS.THINKING
      }
      if (lowerContent.includes('dance') || lowerContent.includes('party')) {
        return EMOTIONS.DANCING
      }
      if (lowerContent.includes('trick') || lowerContent.includes('sit')) {
        return EMOTIONS.CROUCHINGDOWN
      }
      if (lowerContent.includes('excited') || lowerContent.includes('hello')) {
        return EMOTIONS.EXCITED
      }
      if (lowerContent.includes('nervous') || lowerContent.includes('scared')) {
        return EMOTIONS.NERVOUS
      }
    }

    // Default: return current emotion or happy
    return currentEmotion || EMOTIONS.HAPPY
  }

  /**
   * Get random emotion for variety
   * @param {string[]} excludeEmotions - Emotions to exclude
   * @returns {string} Random emotion
   */
  getRandomEmotion(excludeEmotions = []) {
    const availableEmotions = Object.values(EMOTIONS)
      .filter(emotion => !excludeEmotions.includes(emotion))
    
    return availableEmotions[Math.floor(Math.random() * availableEmotions.length)]
  }

  /**
   * Validate if emotion is valid
   * @param {string} emotion - Emotion to validate
   * @returns {boolean} Whether emotion is valid
   */
  isValidEmotion(emotion) {
    return Object.values(EMOTIONS).includes(emotion)
  }

  /**
   * Get emotion for feeding response
   * @param {number} hungerLevel - Current hunger level
   * @returns {string} Appropriate emotion for feeding
   */
  getFeedingEmotion(hungerLevel) {
    if (hungerLevel >= 5) {
      return EMOTIONS.PATIENT // Full belly
    }
    return EMOTIONS.EXCITED // Happy to eat
  }

  /**
   * Get all available emotions
   * @returns {Object} All emotion constants
   */
  getAllEmotions() {
    return { ...EMOTIONS }
  }
}

// Export singleton instance
export default new EmotionService()
