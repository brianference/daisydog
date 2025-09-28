/**
 * SmartDaisyAvatar - Intelligent avatar component
 * Automatically switches between video and image based on system state
 * Includes quick restore mechanism and error handling
 */

import React, { memo } from 'react'
import DaisyVideoResponse from './DaisyVideoResponse.jsx'

const SmartDaisyAvatar = memo(({ 
  message = null,
  emotion = 'happy',
  useVideo = false,
  videoProps = {},
  className = 'message-avatar',
  onVideoError = null,
  onVideoComplete = null,
  fallbackSrc = null
}) => {
  
  /**
   * Get fallback image source based on emotion
   */
  const getFallbackSrc = () => {
    // Priority order: explicit fallbackSrc > message emotion image > emotion-based path
    if (fallbackSrc) return fallbackSrc
    if (message?.emotionImage) return message.emotionImage
    
    // Map emotions to available image files
    const emotionImageMap = {
      'happy': '/assets/images/emotions/happy.png',
      'excited': '/assets/images/emotions/excited.png',
      'confused': '/assets/images/emotions/thinking.png', // Use thinking for confused
      'safety': '/assets/images/emotions/nervous.png', // Use nervous for safety
      'educational': '/assets/images/emotions/thinking.png', // Use thinking for educational
      'playful': '/assets/images/emotions/playfetch.png', // Use playfetch for playful
      'dance': '/assets/images/emotions/dancing.png', // Correct dancing image
      'nervous': '/assets/images/emotions/nervous.png',
      'curious': '/assets/images/emotions/eager.png', // Use eager for curious
      'sleepy': '/assets/images/emotions/patient.png', // Use patient for sleepy
      'eating': '/assets/images/emotions/hungry.png', // Use hungry for eating
      'patient': '/assets/images/emotions/patient.png',
      'waiting': '/assets/images/emotions/waiting.png',
      'stylish': '/assets/images/emotions/stylish.png',
      'panting': '/assets/images/emotions/panting.png',
      'eager': '/assets/images/emotions/eager.png',
      'hungry': '/assets/images/emotions/hungry.png',
      'crouchingdown': '/assets/images/emotions/crouchingdown.png',
      'lookingbehind': '/assets/images/emotions/lookingbehind.png',
      'shakepaw': '/assets/images/emotions/shakepaw.png'
    }
    
    return emotionImageMap[emotion] || '/assets/images/emotions/happy.png'
  }

  /**
   * Handle video errors by falling back to image
   */
  const handleVideoError = (error) => {
    // Don't log AbortError as it's normal during video switching
    if (error.name === 'AbortError') {
      console.log('🎬 Video play interrupted (normal behavior)')
    } else {
      console.warn('🎬 Video error, using image fallback:', error)
    }
    
    if (onVideoError) {
      onVideoError(error)
    }
  }

  /**
   * Render video component
   */
  const renderVideo = () => {
    return (
      <DaisyVideoResponse
        emotion={videoProps.emotion || emotion}
        priority={videoProps.priority || 'medium'}
        className={className}
        message={videoProps.message || message?.text || ''}
        fallbackOnly={videoProps.fallbackOnly || false}
        onVideoError={handleVideoError}
        onVideoComplete={onVideoComplete}
        key={videoProps.key || `video-${message?.id || 'default'}`}
      />
    )
  }

  /**
   * Render image component
   */
  const renderImage = () => {
    const imageSrc = getFallbackSrc()
    
    return (
      <img 
        src={imageSrc}
        alt={`Daisy ${emotion}`}
        className={className}
        key={`avatar-${emotion}-${message?.id || 'default'}`} // Force re-render on emotion change
        onError={(e) => {
          // Only log if it's not already the fallback image
          if (e.target.src !== '/assets/images/emotions/happy.png') {
            if (import.meta.env.VITE_DEBUG_MODE === 'true') {
              console.warn(`🖼️ Avatar image failed to load: ${imageSrc}, using fallback`)
            }
            e.target.src = '/assets/images/emotions/happy.png'
          }
        }}
        onLoad={() => {
          // Log successful emotion image loads for debugging
          console.log(`🖼️ Avatar loaded: ${emotion} → ${imageSrc}`)
        }}
      />
    )
  }

  // Decide what to render
  try {
    if (useVideo && videoProps && !videoProps.fallbackOnly) {
      return renderVideo()
    }
  } catch (error) {
    console.warn('🎬 Video render error, falling back to image:', error)
  }

  // Default to image
  return renderImage()
})

SmartDaisyAvatar.displayName = 'SmartDaisyAvatar'

export default SmartDaisyAvatar
