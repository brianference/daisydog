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
   * Get fallback image source
   */
  const getFallbackSrc = () => {
    if (fallbackSrc) return fallbackSrc
    if (message?.emotionImage) return message.emotionImage
    return `/assets/images/emotions/${emotion}.png`
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
    return (
      <img 
        src={getFallbackSrc()}
        alt={`Daisy ${emotion}`}
        className={className}
        onError={(e) => {
          // Ultimate fallback
          if (e.target.src !== '/assets/images/emotions/happy.png') {
            e.target.src = '/assets/images/emotions/happy.png'
          }
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
