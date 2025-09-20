/**
 * useSoundManagerModular - Custom hook for modular sound system integration
 * Implements Single Responsibility Principle for sound state management
 */

import { useState, useEffect, useCallback } from 'react'
import SoundService from '../services/SoundService.js'

const useSoundManagerModular = () => {
  const [volumes, setVolumes] = useState(SoundService.getVolumes())
  const [isMuted, setIsMuted] = useState(SoundService.isSoundMuted())
  const [isReady, setIsReady] = useState(SoundService.isReady())

  /**
   * Update local state when service state changes
   */
  const updateState = useCallback(() => {
    setVolumes(SoundService.getVolumes())
    setIsMuted(SoundService.isSoundMuted())
    setIsReady(SoundService.isReady())
  }, [])

  /**
   * Initialize and sync with service
   */
  useEffect(() => {
    // Wait for service to initialize if not ready
    if (!isReady) {
      const checkReady = setInterval(() => {
        if (SoundService.isReady()) {
          updateState()
          clearInterval(checkReady)
        }
      }, 100)
      
      return () => clearInterval(checkReady)
    }
  }, [isReady, updateState])

  /**
   * Play sound through service
   * @param {string} category - Sound category
   * @param {string} soundName - Sound name
   * @returns {Promise<HTMLAudioElement>} Audio element
   */
  const playSound = useCallback(async (category, soundName) => {
    try {
      return await SoundService.playSound(category, soundName)
    } catch (error) {
      console.warn('Error playing sound:', error)
      return null
    }
  }, [])

  /**
   * Set volume for category
   * @param {string} category - Volume category
   * @param {number} volume - Volume level (0-1)
   */
  const setVolume = useCallback((category, volume) => {
    SoundService.setVolume(category, volume)
    updateState()
  }, [updateState])

  /**
   * Set master volume
   * @param {number} volume - Master volume level (0-1)
   */
  const setMasterVolume = useCallback((volume) => {
    SoundService.setMasterVolume(volume)
    updateState()
  }, [updateState])

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    SoundService.toggleMute()
    updateState()
  }, [updateState])

  /**
   * Get volume control props for UI components
   * @returns {Object} Volume control props
   */
  const getVolumeControlProps = useCallback(() => {
    return SoundService.getVolumeControlProps()
  }, [])

  /**
   * Get sound triggers for easy access
   * @returns {Object} Sound trigger functions
   */
  const getSoundTriggers = useCallback(() => {
    return SoundService.getSoundTriggers()
  }, [])

  /**
   * Play emotion-based dog sound
   * @param {string} emotion - Emotion state
   */
  const playEmotionSound = useCallback((emotion) => {
    const emotionSoundMap = {
      happy: 'happyBark',
      excited: 'excitedBark',
      hungry: 'sadWhimper',
      sleepy: 'sadWhimper',
      playfetch: 'excitedBark',
      dancing: 'happyBark', // Use happy bark for dancing emotion (dance music handled separately)
      thinking: 'happyBark',
      victory: 'victoryBark'
    }
    
    const soundName = emotionSoundMap[emotion] || 'happyBark'
    return playSound('dog', soundName)
  }, [playSound])

  /**
   * Play game-related sound
   * @param {string} gameAction - Game action
   * @param {string} result - Action result (success, fail, etc.)
   */
  const playGameSound = useCallback((gameAction, result = null) => {
    let soundName = 'ballBounce' // default
    
    switch (gameAction) {
      case 'fetch':
        soundName = 'ballBounce'
        break
      case 'tug':
        soundName = result === 'success' ? 'tugSuccess' : 'tugPull'
        break
      case 'hide':
        soundName = result === 'found' ? 'hideFound' : 'hideStart'
        break
      case 'guess':
        soundName = result === 'correct' ? 'guessCorrect' : 'guessWrong'
        break
      case 'victory':
        soundName = 'victory'
        break
    }
    
    return playSound('games', soundName)
  }, [playSound])

  /**
   * Play UI interaction sound
   * @param {string} action - UI action
   */
  const playUISound = useCallback((action) => {
    const actionSoundMap = {
      click: 'buttonClick',
      send: 'buttonClick',
      story: 'storyTell',
      joke: 'jokeLaugh',
      dance: 'danceMusic',
      gameStart: 'gameStart',
      success: 'success',
      failure: 'failure'
    }
    
    const soundName = actionSoundMap[action] || 'buttonClick'
    return playSound('ui', soundName)
  }, [playSound])

  /**
   * Play eating sound
   * @param {string} type - Eating type
   */
  const playEatingSound = useCallback((type = 'treats') => {
    const soundName = type === 'happy' ? 'happyEating' : 'crunchyTreats'
    return playSound('eating', soundName)
  }, [playSound])

  /**
   * Play sound based on message content
   * @param {string} messageText - Message content
   * @param {string} emotion - Current emotion
   */
  const playContextualSound = useCallback((messageText, emotion) => {
    const lowerText = messageText.toLowerCase()
    
    // Game-related sounds
    if (lowerText.includes('fetch') || lowerText.includes('ball')) {
      playGameSound('fetch')
    } else if (lowerText.includes('tug')) {
      playGameSound('tug')
    } else if (lowerText.includes('hide') || lowerText.includes('seek')) {
      playGameSound('hide')
    } else if (lowerText.includes('guess')) {
      playGameSound('guess')
    } else if (lowerText.includes('story')) {
      playUISound('story')
    } else if (lowerText.includes('joke') || lowerText.includes('funny')) {
      playUISound('joke')
    } else if (lowerText.includes('dance') || lowerText.includes('spin') || lowerText.includes('ta-da')) {
      playUISound('dance')
    } else if (lowerText.includes('treat') || lowerText.includes('food')) {
      playEatingSound()
    } else {
      // Default to emotion-based sound
      playEmotionSound(emotion)
    }
  }, [playGameSound, playUISound, playEatingSound, playEmotionSound])

  return {
    // State
    volumes,
    isMuted,
    isReady,
    
    // Volume controls
    setVolume,
    setMasterVolume,
    toggleMute,
    getVolumeControlProps,
    
    // Sound playback
    playSound,
    playEmotionSound,
    playGameSound,
    playUISound,
    playEatingSound,
    playContextualSound,
    
    // Convenience
    getSoundTriggers,
    
    // Service access
    soundService: SoundService
  }
}

export default useSoundManagerModular
