/**
 * InlineVideoMessage - Video component that plays within message text area
 * More prominent display and better user experience than avatar videos
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import videoAssetManager from '../services/VideoAssetManager.js'
import useSoundManagerModular from '../hooks/useSoundManagerModular.js'
import './InlineVideoMessage.css'

// Global sound limiter to prevent multiple sounds playing at once
let lastSoundTime = 0
const SOUND_COOLDOWN = 2000 // 2 seconds between sounds

const InlineVideoMessage = ({ 
  emotion = 'happy',
  message = '',
  shouldShowVideo = false,
  priority = 'medium',
  onVideoComplete = null,
  onVideoError = null
}) => {
  const [videoState, setVideoState] = useState('loading') // loading, ready, playing, ended, error
  const [videoElement, setVideoElement] = useState(null)
  const [showVideo, setShowVideo] = useState(false)
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const soundPlayedRef = useRef(false) // Track if sound has been played for this video

  // Sound system integration
  const { playEmotionSound, playContextualSound, isMuted } = useSoundManagerModular()

  /**
   * Load video when component mounts
   */
  useEffect(() => {
    if (!shouldShowVideo) {
      setShowVideo(false)
      return
    }

    const loadVideo = async () => {
      try {
        setVideoState('loading')
        soundPlayedRef.current = false // Reset sound flag for new video
        console.log(`🎬 Loading inline video for emotion: ${emotion}`)
        
        const mediaData = await videoAssetManager.getVideoForEmotion(emotion, {
          priority,
          allowFallback: false, // Don't fallback, just don't show video
          maxWaitTime: priority === 'high' ? 3000 : 2000
        })

        if (mediaData.type === 'video' && mediaData.element) {
          setVideoElement(mediaData.element)
          setVideoState('ready')
          setShowVideo(true)
          console.log(`✅ Inline video ready for ${emotion}`)
        } else {
          console.log(`🖼️ No video available for ${emotion}, showing text only`)
          setShowVideo(false)
          setVideoState('error')
        }
        
      } catch (error) {
        console.log(`❌ Inline video failed for ${emotion}:`, error)
        setShowVideo(false)
        setVideoState('error')
        if (onVideoError) {
          onVideoError(error)
        }
      }
    }

    loadVideo()
  }, [emotion, shouldShowVideo, priority, onVideoError])

  /**
   * Set up video element and auto-play
   */
  useEffect(() => {
    if (videoElement && videoRef.current && videoState === 'ready') {
      const video = videoRef.current
      
      // Set up video properties
      video.src = videoElement.src
      video.muted = true
      video.loop = true // Loop for better visibility
      video.playsInline = true
      video.controls = false
      // Event handlers
      const handleLoadedData = () => {
        console.log(`🎬 Inline video loaded and starting playback for ${emotion}`)
        setVideoState('playing')
        
        // Don't play sound here - will be handled by play event
        
        // Auto-play with error handling
        const playVideo = async () => {
          try {
            await video.play()
            console.log(`▶️ Inline video playing for ${emotion}`)
          } catch (playError) {
            if (playError.name !== 'AbortError') {
              console.warn('Inline video play failed:', playError)
              setShowVideo(false)
            }
          }
        }
        
        playVideo()
      }

      const handleEnded = () => {
        console.log(`🏁 Inline video ended for ${emotion}`)
        setVideoState('ended')
        if (onVideoComplete) {
          onVideoComplete()
        }
      }

      const handleError = (e) => {
        setShowVideo(false)
        setVideoState('error')
      }

      video.addEventListener('loadeddata', handleLoadedData)
      video.addEventListener('error', handleError)
      video.addEventListener('ended', handleEnded)
      
      // Play sound only on first play, not on loops
      const handlePlay = () => {
        if (soundPlayedRef.current) {
          console.log('🔇 Video looping - sound already played, skipping')
          return
        }
        
        // Play appropriate sound for video type (with global cooldown)
        if (!isMuted) {
          const currentTime = Date.now()
          
          // Check if enough time has passed since last sound
          if (currentTime - lastSoundTime > SOUND_COOLDOWN) {
            soundPlayedRef.current = true // Mark sound as played
            lastSoundTime = currentTime // Update global sound time
            
            setTimeout(() => {
              if (emotion === 'barking') {
                playEmotionSound('nervous')
                console.log('🔊 Playing barking sound for safety video')
              } else if (emotion === 'ears-up') {
                playEmotionSound('curious')
                console.log('🔊 Playing curious sound for learning video')
              } else if (emotion === 'happy') {
                playEmotionSound('happy')
                console.log('🔊 Playing happy sound for fun video')
              }
            }, 200) // Small delay to sync with video
          } else {
            console.log('🔇 Sound skipped - too soon after last sound')
            soundPlayedRef.current = true // Still mark as played to prevent retries
          }
        } else {
          soundPlayedRef.current = true // Mark as played even if muted
        }
      }
      
      video.addEventListener('play', handlePlay)

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData)
        video.removeEventListener('ended', handleEnded)
        video.removeEventListener('error', handleError)
        video.removeEventListener('play', handlePlay)
      }
    }
  }, [videoElement, videoState, emotion, onVideoComplete])

  /**
   * Render video with message text
   */
  return (
    <div className="inline-video-message" ref={containerRef}>
      {/* Message text */}
      <div className="message-text-content">
        {message}
      </div>
      
      {/* Video section */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            className="video-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="video-wrapper">
              <video
                ref={videoRef}
                className="inline-video"
                muted
                playsInline
                loop
              />
              
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading indicator */}
      {shouldShowVideo && videoState === 'loading' && (
        <motion.div
          className="video-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="loading-spinner">🎬</div>
          <span>Loading Daisy's video response...</span>
        </motion.div>
      )}
    </div>
  )
}

export default InlineVideoMessage
