/**
 * useStableVideoIntegration - Simple video integration hook
 * Focuses only on safety responses to prevent infinite loops
 */

import { useState, useEffect, useCallback, useRef } from 'react'

const useStableVideoIntegration = (options = {}) => {
  const {
    enableVideo = true,
    fallbackMode = false,
    debugMode = false
  } = options

  const [isVideoSystemReady, setIsVideoSystemReady] = useState(true)

  // Throttle console logging to reduce spam
  const logThrottle = useRef(new Map())
  const logMessage = (key, message) => {
    if (!debugMode) return // Only log in debug mode
    const now = Date.now()
    const lastLog = logThrottle.current.get(key) || 0
    if (now - lastLog > 5000) { // Only log every 5 seconds
      console.log(message)
      logThrottle.current.set(key, now)
    }
  }

  /**
   * Simple video analysis - only for safety responses
   */
  const analyzeMessageForVideo = useCallback((message) => {
    if (!enableVideo || fallbackMode) {
      return { useVideo: false, emotion: 'happy', reason: 'disabled' }
    }

    // Enable videos for different categories
    
    // 1. Safety responses (highest priority)
    if (message?.safetyContext) {
      logMessage('safety', `🎬 Safety message detected, enabling barking video: ${message.safetyContext}`)
      return {
        useVideo: true,
        emotion: 'barking',
        videoEmotion: 'barking',
        priority: 'high',
        reason: 'safety_response',
        confidence: 1.0
      }
    }

    // 2. Check message text for other video categories
    const text = message?.text?.toLowerCase() || ''
    
    // Dance videos - music, celebration, party
    if (text.includes('dance') || text.includes('music') || text.includes('celebrate') || 
        text.includes('party') || text.includes('song') || text.includes('rhythm')) {
      logMessage('dance', '🎬 Dance content detected, enabling dance video')
      return {
        useVideo: true,
        emotion: 'dance',
        videoEmotion: 'dance',
        priority: 'medium',
        reason: 'dance_content',
        confidence: 0.8
      }
    }

    // Tricks videos - check first for specific tricks keywords
    if (text.includes('trick') || text.includes('silly') || text.includes('performance') || 
        text.includes('entertaining') || text.includes('flip') || text.includes('acrobat')) {
      logMessage('tricks', '🎬 Tricks content detected, enabling roll-over video')
      return {
        useVideo: true,
        emotion: 'roll-over',
        videoEmotion: 'roll-over',
        priority: 'low',
        reason: 'tricks_content',
        confidence: 0.7
      }
    }

    // Learning videos - specific learning questions, Bible, education
    // Make Bible detection more specific to avoid false positives
    const hasBibleQuestion = (text.includes('bible') && (text.includes('tell me about') || text.includes('what') || text.includes('who') || text.includes('how'))) ||
                           text.includes('jesus') || text.includes('prayer')
    
    if (text.includes('how does') || text.includes('what is') || text.includes('why does') || 
        hasBibleQuestion ||
        text.includes('explain') || text.includes('teach me')) {
      logMessage('learning', '🎬 Learning content detected, enabling ears-up video')
      return {
        useVideo: true,
        emotion: 'ears-up',
        videoEmotion: 'ears-up',
        priority: 'medium',
        reason: 'learning_content',
        confidence: 0.8
      }
    }

    // Joy videos - jokes, fun, games, excitement
    if (text.includes('joke') || text.includes('funny') || text.includes('amazing') || 
        text.includes('excited') || text.includes('happy') || text.includes('game')) {
      logMessage('joy', '🎬 Joy content detected, enabling happy video')
      return {
        useVideo: true,
        emotion: 'happy',
        videoEmotion: 'happy',
        priority: 'medium',
        reason: 'joy_content',
        confidence: 0.8
      }
    }

    // Calm videos - tired, rest, sleep, peaceful
    if (text.includes('tired') || text.includes('rest') || text.includes('sleep') || 
        text.includes('peaceful') || text.includes('calm') || text.includes('relax')) {
      logMessage('calm', '🎬 Calm content detected, enabling lay-down video')
      return {
        useVideo: true,
        emotion: 'lay-down',
        videoEmotion: 'lay-down',
        priority: 'low',
        reason: 'calm_content',
        confidence: 0.7
      }
    }

    return { useVideo: false, emotion: 'happy', reason: 'no_match' }
  }, [enableVideo, fallbackMode])

  /**
   * Check if message should use video
   */
  const shouldMessageUseVideo = useCallback((message) => {
    const analysis = analyzeMessageForVideo(message)
    return analysis.useVideo || false
  }, [analyzeMessageForVideo])

  /**
   * Get video props for message
   */
  const getVideoPropsForMessage = useCallback((message) => {
    const analysis = analyzeMessageForVideo(message)
    return {
      emotion: analysis.emotion || 'happy',
      priority: analysis.priority || 'medium',
      confidence: analysis.confidence || 0.5
    }
  }, [analyzeMessageForVideo])

  /**
   * Get system status
   */
  const getSystemStatus = useCallback(() => {
    return {
      enabled: enableVideo,
      ready: isVideoSystemReady,
      fallbackMode,
      debugMode
    }
  }, [enableVideo, isVideoSystemReady, fallbackMode, debugMode])

  /**
   * Enable fallback mode
   */
  const enableFallbackMode = useCallback(() => {
    setIsVideoSystemReady(false)
  }, [])

  // Make available globally for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.StableVideoIntegration = {
        analyze: analyzeMessageForVideo,
        shouldUse: shouldMessageUseVideo,
        getProps: getVideoPropsForMessage,
        getStatus: getSystemStatus
      }
    }
  }, [analyzeMessageForVideo, shouldMessageUseVideo, getVideoPropsForMessage, getSystemStatus])

  return {
    shouldMessageUseVideo,
    getVideoPropsForMessage,
    analyzeMessageForVideo,
    isVideoSystemReady,
    enableVideo,
    fallbackMode,
    getSystemStatus: getSystemStatus,
    enableFallbackMode
  }
}

export default useStableVideoIntegration
