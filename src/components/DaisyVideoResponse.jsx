/**
 * DaisyVideoResponse - Video response component for chat integration
 * Seamlessly integrates with existing ChatPage without breaking changes
 * Provides fallback to existing static images
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import videoAssetManager from '../services/VideoAssetManager.js'
import './DaisyVideoResponse.css'

const DaisyVideoResponse = ({ 
  emotion = 'happy',
  message = '',
  priority = 'medium',
  onVideoComplete = null,
  onVideoError = null,
  className = '',
  style = {},
  fallbackOnly = false // For testing/debugging
}) => {
  const [videoState, setVideoState] = useState('loading') // loading, ready, playing, ended, error
  const [mediaElement, setMediaElement] = useState(null)
  const [mediaType, setMediaType] = useState('image') // video, image
  const [aspectRatio, setAspectRatio] = useState('landscape') // landscape, tall
  const [isVisible, setIsVisible] = useState(true)
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)

  /**
   * Load appropriate media (video or fallback image)
   */
  const loadMedia = useCallback(async () => {
    try {
      setVideoState('loading')
      
      // Check if video system is ready and not in fallback mode
      if (!fallbackOnly && videoAssetManager.isReady()) {
        console.log(`🎬 Loading video for emotion: ${emotion}`)
        
        const mediaData = await videoAssetManager.getVideoForEmotion(emotion, {
          priority,
          allowFallback: true,
          maxWaitTime: priority === 'high' ? 2000 : 1000
        })

        if (mediaData.type === 'video' && mediaData.element) {
          // Successfully got video
          const video = mediaData.element
          video.muted = true // Required for autoplay
          video.loop = false
          video.playsInline = true
          
          setMediaElement(video)
          setMediaType('video')
          setAspectRatio(mediaData.aspectRatio || 'landscape')
          setVideoState('ready')
          
          console.log(`✅ Video loaded for ${emotion}`)
          return
        }
      }
      
      // Fallback to image (existing behavior)
      console.log(`🖼️ Using image fallback for emotion: ${emotion}`)
      const fallbackData = videoAssetManager.getFallbackForEmotion(emotion)
      
      setMediaElement({ src: fallbackData.src })
      setMediaType('image')
      setVideoState('ready')
      
    } catch (error) {
      console.warn(`❌ Media load failed for ${emotion}:`, error)
      handleError(error)
    }
  }, [emotion, priority, fallbackOnly])

  /**
   * Handle media loading errors
   */
  const handleError = useCallback((error) => {
    console.warn('🎬 Video error, falling back to image:', error)
    
    // Always fallback to existing emotion images
    const fallbackSrc = `/assets/images/emotions/${emotion}.png`
    setMediaElement({ src: fallbackSrc })
    setMediaType('image')
    setVideoState('error')
    
    if (onVideoError) {
      onVideoError(error)
    }
  }, [emotion, onVideoError])

  /**
   * Play video if available (with interruption handling)
   */
  const playVideo = useCallback(async () => {
    if (mediaType !== 'video' || !mediaElement || videoState !== 'ready') {
      return
    }

    try {
      setVideoState('playing')
      
      // Set up video element
      if (videoRef.current) {
        const video = videoRef.current
        
        // Reset video to beginning
        video.currentTime = 0
        
        // Handle play interruption gracefully
        try {
          const playPromise = video.play()
          
          if (playPromise !== undefined) {
            await playPromise
            console.log(`▶️ Playing video for ${emotion}`)
          }
        } catch (playError) {
          // Handle AbortError specifically (common when videos are interrupted)
          if (playError.name === 'AbortError') {
            console.log(`🎬 Video play interrupted for ${emotion}, this is normal`)
            // Don't treat this as an error - just continue with fallback
            return
          } else {
            throw playError
          }
        }
      }
      
    } catch (error) {
      console.warn('Video play failed:', error)
      handleError(error)
    }
  }, [mediaType, mediaElement, videoState, emotion, handleError])

  /**
   * Handle video end
   */
  const handleVideoEnd = useCallback(() => {
    console.log(`🏁 Video ended for ${emotion}`)
    setVideoState('ended')
    
    if (onVideoComplete) {
      onVideoComplete()
    }
  }, [emotion, onVideoComplete])

  /**
   * Load media when component mounts or emotion changes
   */
  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  /**
   * Set up video element when it becomes available
   */
  useEffect(() => {
    if (mediaType === 'video' && mediaElement && videoRef.current) {
      const video = videoRef.current
      
      // Copy video properties
      video.src = mediaElement.src
      video.muted = true // Always muted for autoplay compliance
      video.loop = false
      video.playsInline = true
      video.preload = 'metadata'
      
      // Set up event listeners
      const handleEnd = () => handleVideoEnd()
      const handleErr = (e) => {
        // Only handle actual video errors, not play interruptions
        if (e.target.error && e.target.error.code !== 0) {
          handleError(e)
        }
      }
      
      video.addEventListener('ended', handleEnd)
      video.addEventListener('error', handleErr)
      video.addEventListener('loadeddata', () => {
        console.log(`🎬 Video loaded and ready for ${emotion}`)
      })
      
      // Auto-play for high priority (safety) videos with delay
      if (priority === 'high' && videoState === 'ready') {
        // Small delay to ensure video is fully ready
        setTimeout(() => {
          playVideo()
        }, 100)
      }
      
      return () => {
        video.removeEventListener('ended', handleEnd)
        video.removeEventListener('error', handleErr)
      }
    }
  }, [mediaType, mediaElement, videoState, priority, emotion, playVideo, handleVideoEnd, handleError])

  /**
   * Render video element
   */
  const renderVideo = () => {
    if (mediaType !== 'video') return null
    
    return (
      <video
        ref={videoRef}
        className="daisy-video"
        data-aspect={aspectRatio}
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%'
        }}
      />
    )
  }

  /**
   * Render image element (fallback or primary)
   */
  const renderImage = () => {
    if (mediaType !== 'image' || !mediaElement) return null
    
    return (
      <img
        src={mediaElement.src}
        alt={`Daisy ${emotion}`}
        className="daisy-image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%'
        }}
        onError={(e) => {
          // Try ultimate fallback if available
          if (mediaElement.fallbackSrc && e.target.src !== mediaElement.fallbackSrc) {
            e.target.src = mediaElement.fallbackSrc
          } else {
            // Final fallback to happy emotion
            e.target.src = '/assets/images/emotions/happy.png'
          }
        }}
      />
    )
  }

  /**
   * Render loading state
   */
  const renderLoading = () => {
    if (videoState !== 'loading') return null
    
    return (
      <div className="daisy-loading" style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        color: 'white',
        fontSize: '2rem'
      }}>
        🐕
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`daisy-video-response ${className}`}
      style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        overflow: 'hidden',
        ...style
      }}
    >
      <AnimatePresence mode="wait">
        {videoState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {renderLoading()}
          </motion.div>
        )}
        
        {videoState !== 'loading' && (
          <motion.div
            key="media"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {renderVideo()}
            {renderImage()}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '0',
          fontSize: '10px',
          color: '#666',
          whiteSpace: 'nowrap'
        }}>
          {mediaType} | {videoState} | {emotion}
        </div>
      )}
    </div>
  )
}

export default DaisyVideoResponse
