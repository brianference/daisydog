/**
 * useStableVideoIntegration - Stable video integration hook
 * Prevents re-render loops while providing video functionality
 * Includes quick restore mechanism to image-based system
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import useVideoEmotion from './useVideoEmotion.js'
import videoAssetManager from '../services/VideoAssetManager.js'

const useStableVideoIntegration = (options = {}) => {
  const {
    enableVideo = true,
    fallbackMode = false, // Quick restore flag
    debugMode = false
  } = options

  const [isVideoSystemReady, setIsVideoSystemReady] = useState(false)
  const [videoDecisions, setVideoDecisions] = useState(new Map())
  const analysisCache = useRef(new Map())
  const { analyzeResponseForVideo } = useVideoEmotion()

  /**
   * Initialize video system safely
   */
  useEffect(() => {
    if (!enableVideo || fallbackMode) {
      setIsVideoSystemReady(false)
      return
    }

    let mounted = true
    
    const initVideo = async () => {
      try {
        // Wait for video system to be ready
        const checkReady = () => {
          if (!mounted) return
          
          const ready = videoAssetManager.isReady()
          if (ready !== isVideoSystemReady) {
            setIsVideoSystemReady(ready)
            if (debugMode && ready) {
              console.log('🎬 Stable video system ready')
            }
          }
        }

        checkReady()
        
        // Check periodically until ready
        const interval = setInterval(() => {
          if (!mounted) return
          checkReady()
          if (videoAssetManager.isReady()) {
            clearInterval(interval)
          }
        }, 2000)

        return () => {
          clearInterval(interval)
        }
      } catch (error) {
        console.warn('Video system init failed:', error)
        setIsVideoSystemReady(false)
      }
    }

    initVideo()

    return () => {
      mounted = false
    }
  }, [enableVideo, fallbackMode, debugMode])

  /**
   * Stable video analysis with caching
   */
  const analyzeMessageForVideo = useMemo(() => {
    return (message) => {
      if (!enableVideo || fallbackMode || !isVideoSystemReady) {
        return { useVideo: false, emotion: 'happy', reason: 'disabled' }
      }

      try {
        // Create cache key from message properties
        const cacheKey = JSON.stringify({
          text: message.text?.substring(0, 100),
          safetyContext: message.safetyContext,
          responseType: message.responseType,
          emotion: message.emotion
        })

        // Check cache first
        if (analysisCache.current.has(cacheKey)) {
          return analysisCache.current.get(cacheKey)
        }

        // Perform analysis
        const analysis = analyzeResponseForVideo(message)
        
        // Debug logging
        if (debugMode) {
          console.log('🔍 Analysis input:', message)
          console.log('🔍 Analysis output:', analysis)
        }
        
        const result = {
          useVideo: analysis.priority === 'high' || analysis.confidence > 0.7,
          emotion: analysis.videoEmotion,
          videoEmotion: analysis.videoEmotion, // Add this for test compatibility
          priority: analysis.priority,
          reason: analysis.reason,
          confidence: analysis.confidence
        }
        
        if (debugMode) {
          console.log('🔍 Final result:', result)
        }

        // Cache result
        analysisCache.current.set(cacheKey, result)
        
        // Limit cache size
        if (analysisCache.current.size > 50) {
          const firstKey = analysisCache.current.keys().next().value
          analysisCache.current.delete(firstKey)
        }

        if (debugMode) {
          console.log('🎬 Stable video analysis:', result)
        }

        return result
      } catch (error) {
        console.warn('Video analysis failed:', error)
        return { useVideo: false, emotion: 'happy', reason: 'error' }
      }
    }
  }, [enableVideo, fallbackMode, isVideoSystemReady, analyzeResponseForVideo, debugMode])

  /**
   * Get video props for a message (stable)
   */
  const getVideoPropsForMessage = useMemo(() => {
    return (message) => {
      const analysis = analyzeMessageForVideo(message)
      
      return {
        emotion: analysis.emotion || message.emotion || 'happy',
        priority: analysis.priority || 'medium',
        useVideo: analysis.useVideo,
        fallbackOnly: !analysis.useVideo,
        message: message.text || '',
        key: `video-${message.id}` // Stable key for React
      }
    }
  }, [analyzeMessageForVideo])

  /**
   * Check if message should use video (stable)
   */
  const shouldMessageUseVideo = useMemo(() => {
    return (message) => {
      if (!enableVideo || fallbackMode || !isVideoSystemReady) {
        return false
      }
      
      const analysis = analyzeMessageForVideo(message)
      return analysis.useVideo
    }
  }, [enableVideo, fallbackMode, isVideoSystemReady, analyzeMessageForVideo])

  /**
   * Get system status
   */
  const getSystemStatus = () => {
    return {
      enableVideo,
      fallbackMode,
      isVideoSystemReady,
      cacheSize: analysisCache.current.size,
      videoManagerStatus: videoAssetManager.getStatus()
    }
  }

  /**
   * Quick restore to image mode
   */
  const enableFallbackMode = () => {
    console.log('🎬 Enabling fallback mode - switching to images')
    setIsVideoSystemReady(false)
    analysisCache.current.clear()
  }

  // Make available globally for debugging and quick restore
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.StableVideoIntegration = {
        getStatus: getSystemStatus,
        enableFallback: enableFallbackMode,
        clearCache: () => analysisCache.current.clear(),
        analyze: analyzeMessageForVideo
      }
    }
  }, [analyzeMessageForVideo])

  return {
    // Main functions
    shouldMessageUseVideo,
    getVideoPropsForMessage,
    analyzeMessageForVideo,
    
    // System status
    isVideoSystemReady,
    enableVideo,
    fallbackMode,
    
    // Utilities
    getSystemStatus,
    enableFallbackMode
  }
}

export default useStableVideoIntegration
