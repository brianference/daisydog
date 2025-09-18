/**
 * QuickActions - Reusable quick action buttons component
 * Implements Single Responsibility Principle for quick action UI
 */

import React from 'react'
import { motion } from 'framer-motion'

const QuickActions = ({
  actions = [],
  onActionClick,
  disabled = false,
  layout = 'grid', // 'grid' | 'horizontal' | 'vertical'
  size = 'medium', // 'small' | 'medium' | 'large'
  showIcons = true,
  className = '',
  maxVisible = null
}) => {
  /**
   * Default quick actions if none provided
   */
  const defaultActions = [
    { id: 'story', label: 'Tell me a story', icon: '📚', message: 'Tell me a story' },
    { id: 'joke', label: 'Tell a joke', icon: '😄', message: 'Tell me a joke' },
    { id: 'trick', label: 'Do a trick', icon: '🦴', message: 'Do a trick' },
    { id: 'dance', label: 'Dance', icon: '💃', message: 'Let\'s dance!' },
    { id: 'games', label: 'Play games', icon: '🎮', message: 'Let\'s play a game!' },
    { id: 'dogfacts', label: 'Dog facts', icon: '🧠', message: 'Tell me a dog fact' },
    { id: 'feelings', label: 'How are you?', icon: '🐾', message: 'How are you feeling?' },
    { id: 'compliment', label: 'Good dog!', icon: '⭐', message: 'You\'re such a good dog!' }
  ]

  const actionsToShow = actions.length > 0 ? actions : defaultActions
  const visibleActions = maxVisible ? actionsToShow.slice(0, maxVisible) : actionsToShow

  /**
   * Handle action button click
   * @param {Object} action - Action object
   */
  const handleActionClick = (action) => {
    if (disabled || !onActionClick) return
    
    onActionClick(action.message || action.label, action)
  }

  /**
   * Get button className based on props
   * @param {Object} action - Action object
   * @returns {string} Button className
   */
  const getButtonClassName = (action) => {
    const baseClass = 'quick-action-button'
    const sizeClass = `button-${size}`
    const disabledClass = disabled ? 'disabled' : ''
    const actionClass = action.id ? `action-${action.id}` : ''
    
    return `${baseClass} ${sizeClass} ${disabledClass} ${actionClass}`.trim()
  }

  /**
   * Get container className
   * @returns {string} Container className
   */
  const getContainerClassName = () => {
    const baseClass = 'quick-actions'
    const layoutClass = `layout-${layout}`
    const sizeClass = `size-${size}`
    
    return `${baseClass} ${layoutClass} ${sizeClass} ${className}`.trim()
  }

  /**
   * Get animation variants for buttons
   * @returns {Object} Framer Motion variants
   */
  const getButtonVariants = () => {
    return {
      initial: { opacity: 0, scale: 0.8, y: 20 },
      animate: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      },
      hover: { 
        scale: 1.05,
        y: -2,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      },
      tap: { 
        scale: 0.95,
        transition: {
          duration: 0.1
        }
      }
    }
  }

  /**
   * Get container animation variants
   * @returns {Object} Framer Motion variants
   */
  const getContainerVariants = () => {
    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    }
  }

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <motion.div
      className={getContainerClassName()}
      variants={getContainerVariants()}
      initial="initial"
      animate="animate"
      role="toolbar"
      aria-label="Quick actions"
    >
      {visibleActions.map((action, index) => (
        <motion.button
          key={action.id || index}
          className={getButtonClassName(action)}
          onClick={() => handleActionClick(action)}
          disabled={disabled}
          variants={getButtonVariants()}
          whileHover="hover"
          whileTap="tap"
          aria-label={action.ariaLabel || action.label}
          title={action.tooltip || action.label}
        >
          {showIcons && action.icon && (
            <span className="action-icon" aria-hidden="true">
              {action.icon}
            </span>
          )}
          <span className="action-label">
            {action.label}
          </span>
        </motion.button>
      ))}
      
      {/* Show more button if actions are truncated */}
      {maxVisible && actionsToShow.length > maxVisible && (
        <motion.button
          className={`${getButtonClassName({ id: 'more' })} more-button`}
          onClick={() => {
            // Could emit event to show all actions
            if (onActionClick) {
              onActionClick('show_more', { type: 'show_more' })
            }
          }}
          disabled={disabled}
          variants={getButtonVariants()}
          whileHover="hover"
          whileTap="tap"
          aria-label={`Show ${actionsToShow.length - maxVisible} more actions`}
        >
          <span className="action-icon" aria-hidden="true">⋯</span>
          <span className="action-label">More</span>
        </motion.button>
      )}
    </motion.div>
  )
}

export default QuickActions
