/**
 * useChatState - Custom hook for managing chat state
 * Implements Single Responsibility Principle for state management
 */

import { useState, useEffect, useCallback } from 'react'
import { EMOTIONS, MESSAGE_TYPES } from '../types/index.js'
import { TIMING, UI_CONFIG } from '../constants/index.js'
import CheckpointService from '../services/CheckpointService.js'
import EmotionService from '../services/EmotionService.js'

const useChatState = () => {
  // Core chat state
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState(EMOTIONS.HAPPY)
  const [hungerLevel, setHungerLevel] = useState(3)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [userName, setUserName] = useState('')
  const [storyIndex, setStoryIndex] = useState(0)
  const [lastSaved, setLastSaved] = useState(null)

  /**
   * Add a new message to the chat
   * @param {string} text - Message text
   * @param {string} sender - Message sender ('user' or 'daisy')
   * @param {string} type - Message type
   * @param {string} emotion - Emotion for Daisy messages
   */
  const addMessage = useCallback((text, sender = 'daisy', type = MESSAGE_TYPES.CHAT, emotion = currentEmotion) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
      type,
      emotionImage: sender === 'daisy' ? EmotionService.getEmotionImage(emotion) : null
    }

    setMessages(prev => [...prev, newMessage])
    
    // Update emotion if it's a Daisy message
    if (sender === 'daisy' && emotion !== currentEmotion) {
      setCurrentEmotion(emotion)
    }
  }, [currentEmotion])

  /**
   * Add user message
   * @param {string} text - Message text
   */
  const addUserMessage = useCallback((text) => {
    addMessage(text, 'user', MESSAGE_TYPES.CHAT)
  }, [addMessage])

  /**
   * Add Daisy message with emotion
   * @param {string} text - Message text
   * @param {string} emotion - Emotion state
   * @param {string} type - Message type
   */
  const addDaisyMessage = useCallback((text, emotion = currentEmotion, type = MESSAGE_TYPES.CHAT) => {
    addMessage(text, 'daisy', type, emotion)
  }, [addMessage, currentEmotion])

  /**
   * Update current emotion
   * @param {string} emotion - New emotion
   */
  const updateEmotion = useCallback((emotion) => {
    if (EmotionService.isValidEmotion(emotion)) {
      setCurrentEmotion(emotion)
    }
  }, [])

  /**
   * Feed Daisy (increase hunger level)
   */
  const feedDaisy = useCallback(() => {
    if (hungerLevel < UI_CONFIG.MAX_HUNGER_LEVEL) {
      setHungerLevel(prev => Math.min(prev + 1, UI_CONFIG.MAX_HUNGER_LEVEL))
      
      const feedResponses = [
        "*munches happily* Nom nom nom! Thank you! These treats are delicious! 🦴",
        "*wags tail excitedly* Yummy! You're the best! I feel so much better now! 🐕",
        "*does a happy spin* Woof! Those were tasty! I love treat time! ✨"
      ]
      
      const randomResponse = feedResponses[Math.floor(Math.random() * feedResponses.length)]
      setTimeout(() => {
        addDaisyMessage(randomResponse, EMOTIONS.EXCITED)
      }, TIMING.FEED_RESPONSE_DELAY)
    } else {
      setTimeout(() => {
        addDaisyMessage("*pats full belly* I'm completely full! Thank you though! Maybe we can play instead? 🐾", EMOTIONS.PATIENT)
      }, TIMING.FEED_RESPONSE_DELAY)
    }
  }, [hungerLevel, addDaisyMessage])

  /**
   * Set typing state with automatic clear
   * @param {boolean} typing - Whether Daisy is typing
   * @param {number} duration - Duration in milliseconds
   */
  const setTypingWithTimeout = useCallback((typing, duration = TIMING.TYPING_DELAY_MIN) => {
    setIsTyping(typing)
    
    if (typing && duration > 0) {
      setTimeout(() => {
        setIsTyping(false)
      }, duration)
    }
  }, [])

  /**
   * Save current state to localStorage
   */
  const saveState = useCallback(() => {
    const state = {
      messages,
      currentEmotion,
      hungerLevel,
      hasGreeted,
      userName,
      storyIndex
    }
    
    const success = CheckpointService.saveState(state)
    if (success) {
      setLastSaved(new Date())
    }
  }, [messages, currentEmotion, hungerLevel, hasGreeted, userName, storyIndex])

  /**
   * Load state from localStorage
   */
  const loadState = useCallback(() => {
    const savedState = CheckpointService.loadState()
    if (savedState) {
      setMessages(savedState.messages || [])
      setCurrentEmotion(savedState.currentEmotion || EMOTIONS.HAPPY)
      setHungerLevel(savedState.hungerLevel || 3)
      setHasGreeted(savedState.hasGreeted || false)
      setUserName(savedState.userName || '')
      setStoryIndex(savedState.storyIndex || 0)
      setLastSaved(savedState.savedAt || null)
      return true
    }
    return false
  }, [])

  /**
   * Reset all chat state
   */
  const resetState = useCallback(() => {
    setMessages([])
    setCurrentEmotion(EMOTIONS.HAPPY)
    setHungerLevel(3)
    setHasGreeted(false)
    setUserName('')
    setStoryIndex(0)
    setLastSaved(null)
    setIsTyping(false)
    
    CheckpointService.clearState()
  }, [])

  /**
   * Get current chat context for AI services
   * @returns {Object} Chat context
   */
  const getChatContext = useCallback(() => {
    return {
      userName,
      hungerLevel,
      currentEmotion,
      hasGreeted,
      messageCount: messages.length,
      storyIndex
    }
  }, [userName, hungerLevel, currentEmotion, hasGreeted, messages.length, storyIndex])

  // Auto-save state when it changes
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(saveState, TIMING.AUTO_SAVE_DEBOUNCE)
      return () => clearTimeout(timeoutId)
    }
  }, [messages, currentEmotion, hungerLevel, hasGreeted, userName, storyIndex, saveState])

  // Hunger decrease over time
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        const newLevel = Math.max(prev - 1, UI_CONFIG.MIN_HUNGER_LEVEL)
        
        // Notify when getting hungry
        if (newLevel === UI_CONFIG.HUNGER_WARNING_LEVEL && prev > UI_CONFIG.HUNGER_WARNING_LEVEL) {
          setTimeout(() => {
            addDaisyMessage("*stomach rumbles* I'm getting a little hungry... 🦴", EMOTIONS.HUNGRY)
          }, 1000)
        }
        
        return newLevel
      })
    }, TIMING.HUNGER_DECREASE_INTERVAL)
    
    return () => clearInterval(hungerTimer)
  }, [addDaisyMessage])

  // Load saved state on mount
  useEffect(() => {
    loadState()
  }, [loadState])

  return {
    // State
    messages,
    isTyping,
    currentEmotion,
    hungerLevel,
    hasGreeted,
    userName,
    storyIndex,
    lastSaved,
    
    // Actions
    addMessage,
    addUserMessage,
    addDaisyMessage,
    updateEmotion,
    feedDaisy,
    setTypingWithTimeout,
    saveState,
    loadState,
    resetState,
    
    // Computed
    getChatContext,
    
    // State setters (for direct updates when needed)
    setHasGreeted,
    setUserName,
    setStoryIndex
  }
}

export default useChatState
