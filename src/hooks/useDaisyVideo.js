/**
 * useDaisyVideo - Simple integration hook for video responses
 * Designed to be easily added to existing ChatPage without breaking changes
 * Provides gradual enhancement to existing functionality
 */

import { useState, useCallback, useEffect } from 'react'
import useVideoEmotion from './useVideoEmotion.js'
import videoAssetManager from '../services/VideoAssetManager.js'

const useDaisyVideo = (options = {}) => {
  const {
    enableVideo = true,
    fallbackToImage = true,
    debugMode = false
  } = options

  const [isVideoSystemReady, setIsVideoSystemReady] = useState(false)
  const [lastVideoAnalysis, setLastVideoAnalysis] = useState(null)
  
  const { analyzeResponseForVideo, shouldUseVideo, getVideoOptions } = useVideoEmotion()

  /**
   * Check if video system is ready (stable version)
   */
  useEffect(() => {
    let mounted = true
    
    const checkVideoSystem = () => {
      if (!mounted) return
      
      const ready = videoAssetManager.isReady()
      if (ready !== isVideoSystemReady) {
        setIsVideoSystemReady(ready)
        
        if (debugMode) {
          console.log('🎬 Video system ready:', ready)
        }
      }
    }

    // Check immediately
    checkVideoSystem()
    
    // Check periodically until ready (but stop checking once ready)
    let interval = null
    if (!isVideoSystemReady) {
      interval = setInterval(() => {
        if (!mounted) return
        checkVideoSystem()
        if (videoAssetManager.isReady()) {
          clearInterval(interval)
        }
      }, 2000) // Reduced frequency to prevent excessive re-renders
    }

    return () => {
      mounted = false
      if (interval) clearInterval(interval)
    }
  }, []) // Remove dependencies to prevent re-render loops

  /**
   * Analyze response and determine if video should be used (stable version)
   */
  const analyzeResponse = useCallback((responseData) => {
    if (!enableVideo) {
      return {
        useVideo: false,
        videoEmotion: null,
        analysis: null,
        reason: 'video_disabled'
      }
    }

    try {
      const analysis = analyzeResponseForVideo(responseData)
      const useVideo = shouldUseVideo(responseData, {
        minConfidence: 0.6,
        allowLowPriority: true
      })

      // Only update state if analysis actually changed
      if (!lastVideoAnalysis || 
          lastVideoAnalysis.videoEmotion !== analysis.videoEmotion ||
          lastVideoAnalysis.priority !== analysis.priority) {
        setLastVideoAnalysis(analysis)
      }

      if (debugMode) {
        console.log('🎬 Response analysis:', {
          useVideo,
          analysis,
          responseData: typeof responseData === 'string' ? responseData.substring(0, 50) : responseData
        })
      }

      return {
        useVideo: useVideo && isVideoSystemReady,
        videoEmotion: analysis.videoEmotion,
        videoPriority: analysis.priority,
        analysis,
        reason: useVideo ? 'analysis_positive' : 'analysis_negative'
      }

    } catch (error) {
      console.warn('🎬 Response analysis failed:', error)
      return {
        useVideo: false,
        videoEmotion: null,
        analysis: null,
        reason: 'analysis_error',
        error: error.message
      }
    }
  }, [enableVideo]) // Removed problematic dependencies

  /**
   * Get video props for DaisyVideoResponse component (stable version)
   */
  const getVideoProps = useCallback((responseData, currentEmotion = 'happy') => {
    const analysis = analyzeResponse(responseData)
    
    if (!analysis.useVideo) {
      // Return props that will show fallback image
      return {
        emotion: currentEmotion,
        fallbackOnly: true,
        priority: 'low'
      }
    }

    const videoOptions = getVideoOptions(responseData)
    
    return {
      emotion: videoOptions.emotion,
      priority: videoOptions.priority,
      fallbackOnly: false,
      message: typeof responseData === 'string' ? responseData : responseData?.text || ''
    }
  }, []) // Remove dependencies to prevent loops

  /**
   * Enhanced version of existing emotion setting that considers video (stable)
   */
  const setEmotionWithVideo = useCallback((emotion, responseData = null) => {
    if (responseData) {
      const analysis = analyzeResponse(responseData)
      if (analysis.useVideo && analysis.videoEmotion) {
        return analysis.videoEmotion
      }
    }
    return emotion
  }, [])

  /**
   * Check if a specific response should use video (stable)
   */
  const shouldResponseUseVideo = useCallback((responseData) => {
    if (!enableVideo || !isVideoSystemReady) {
      return false
    }
    
    const analysis = analyzeResponse(responseData)
    return analysis.useVideo
  }, [])

  /**
   * Get system status for debugging
   */
  const getSystemStatus = useCallback(() => {
    return {
      videoSystemReady: isVideoSystemReady,
      videoManagerStatus: videoAssetManager.getStatus(),
      lastAnalysis: lastVideoAnalysis,
      enableVideo,
      fallbackToImage
    }
  }, [isVideoSystemReady, lastVideoAnalysis, enableVideo, fallbackToImage])

  // Make available globally for debugging
  useEffect(() => {
    if (typeof window !== 'undefined' && debugMode) {
      window.DaisyVideoHook = {
        analyze: analyzeResponse,
        getProps: getVideoProps,
        shouldUse: shouldResponseUseVideo,
        getStatus: getSystemStatus
      }
    }
  }, [analyzeResponse, getVideoProps, shouldResponseUseVideo, getSystemStatus, debugMode])

  return {
    // Main integration functions
    analyzeResponse,
    getVideoProps,
    shouldResponseUseVideo,
    setEmotionWithVideo,
    
    // System status
    isVideoSystemReady,
    lastVideoAnalysis,
    
    // Utilities
    getSystemStatus,
    
    // Direct access to underlying hooks (for advanced usage)
    videoEmotion: useVideoEmotion(),
    videoAssetManager
  }
}

export default useDaisyVideo
