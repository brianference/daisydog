/**
 * MessageBubble - Reusable message display component
 * Implements Single Responsibility Principle for message rendering
 */

import React from 'react'
import { motion } from 'framer-motion'
import EmotionService from '../../services/EmotionService.js'

const MessageBubble = ({
  message,
  isTyping = false,
  showAvatar = true,
  showTimestamp = true,
  className = '',
  onAvatarClick = null,
  onMessageClick = null
}) => {
  /**
   * Get avatar image source
   * @returns {string} Avatar image path
   */
  const getAvatarSrc = () => {
    if (message.sender === 'daisy') {
      return message.emotionImage || EmotionService.getEmotionImage()
    }
    return null // User messages don't have avatars
  }

  /**
   * Handle avatar error (fallback to happy emotion)
   * @param {Event} e - Error event
   */
  const handleAvatarError = (e) => {
    e.target.src = '/assets/images/emotions/happy.png'
  }

  /**
   * Format timestamp for display
   * @param {Date} timestamp - Message timestamp
   * @returns {string} Formatted time string
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    
    try {
      return timestamp.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (error) {
      return new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  /**
   * Get message content based on type
   * @returns {JSX.Element} Message content
   */
  const getMessageContent = () => {
    if (isTyping) {
      return (
        <div className="typing-indicator" aria-label="Daisy is typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )
    }

    return (
      <>
        <p className="message-text">{message.text}</p>
        {showTimestamp && message.timestamp && (
          <span className="timestamp" title={message.timestamp.toLocaleString()}>
            {formatTimestamp(message.timestamp)}
          </span>
        )}
      </>
    )
  }

  /**
   * Get animation variants for message
   * @returns {Object} Framer Motion variants
   */
  const getAnimationVariants = () => {
    return {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 30
        }
      },
      exit: { 
        opacity: 0, 
        y: -20, 
        scale: 0.95,
        transition: {
          duration: 0.2
        }
      }
    }
  }

  /**
   * Get ARIA label for message
   * @returns {string} Accessibility label
   */
  const getAriaLabel = () => {
    if (isTyping) {
      return "Daisy is typing a response"
    }
    
    const sender = message.sender === 'daisy' ? 'Daisy' : 'You'
    const time = message.timestamp ? ` at ${formatTimestamp(message.timestamp)}` : ''
    return `Message from ${sender}${time}: ${message.text}`
  }

  return (
    <motion.div
      className={`message ${message?.sender || 'daisy'} ${isTyping ? 'typing' : ''} ${className}`}
      variants={getAnimationVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      role="article"
      aria-label={getAriaLabel()}
      onClick={onMessageClick}
      style={{ cursor: onMessageClick ? 'pointer' : 'default' }}
    >
      {/* Avatar for Daisy messages */}
      {showAvatar && message?.sender === 'daisy' && (
        <div className="message-avatar-container">
          <img
            src={getAvatarSrc()}
            alt={`Daisy feeling ${message.emotion || 'happy'}`}
            className="message-avatar"
            onError={handleAvatarError}
            onClick={onAvatarClick}
            style={{ cursor: onAvatarClick ? 'pointer' : 'default' }}
            loading="lazy"
          />
        </div>
      )}

      {/* Message content */}
      <div className="message-content">
        {getMessageContent()}
      </div>

      {/* Message type indicator */}
      {message?.type && message.type !== 'chat' && (
        <div className="message-type-indicator" title={`Message type: ${message.type}`}>
          <span className={`type-badge type-${message.type}`}>
            {message.type}
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default MessageBubble
