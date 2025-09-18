/**
 * GameSubButtons - Dynamic game-specific action buttons
 * Implements Single Responsibility Principle for game UI controls
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameManager from '../../services/GameManager.js'
import { GAME_STATES } from '../../types/index.js'

const GameSubButtons = ({
  currentGame,
  gameState,
  onActionClick,
  disabled = false,
  className = ''
}) => {
  /**
   * Get available actions for current game
   * @returns {Array} Available game actions
   */
  const getGameActions = () => {
    if (!currentGame || !GameManager.isGameActive()) {
      return []
    }

    return GameManager.getAvailableActions()
  }

  /**
   * Handle game action click
   * @param {Object} action - Game action object
   */
  const handleActionClick = (action) => {
    if (disabled || !onActionClick) return
    
    onActionClick(action.message, action)
  }

  /**
   * Get animation variants for game buttons
   * @returns {Object} Framer Motion variants
   */
  const getButtonVariants = () => {
    return {
      initial: { opacity: 0, scale: 0.8, y: 10 },
      animate: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 30
        }
      },
      exit: { 
        opacity: 0, 
        scale: 0.8, 
        y: -10,
        transition: {
          duration: 0.2
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
      initial: { opacity: 0, height: 0 },
      animate: {
        opacity: 1,
        height: "auto",
        transition: {
          height: {
            type: "spring",
            stiffness: 500,
            damping: 30
          },
          opacity: {
            duration: 0.3
          },
          staggerChildren: 0.1,
          delayChildren: 0.1
        }
      },
      exit: {
        opacity: 0,
        height: 0,
        transition: {
          height: {
            type: "spring",
            stiffness: 500,
            damping: 30
          },
          opacity: {
            duration: 0.2
          }
        }
      }
    }
  }

  /**
   * Get button style based on action type
   * @param {Object} action - Action object
   * @returns {Object} Button style object
   */
  const getButtonStyle = (action) => {
    const styles = {
      stop: { backgroundColor: '#dc3545' },
      primary: { backgroundColor: '#ff6b35' },
      secondary: { backgroundColor: '#28a745' },
      warning: { backgroundColor: '#ffc107' }
    }

    if (action.id === 'stop') return styles.stop
    if (action.primary) return styles.primary
    if (action.secondary) return styles.secondary
    if (action.warning) return styles.warning
    
    return styles.primary
  }

  /**
   * Get game title for display
   * @returns {string} Game title
   */
  const getGameTitle = () => {
    const titles = {
      [GAME_STATES.FETCH]: 'Fetch Game',
      [GAME_STATES.HIDE_AND_SEEK]: 'Hide & Seek',
      [GAME_STATES.TUG_OF_WAR]: 'Tug of War',
      [GAME_STATES.GUESSING_GAME]: 'Guessing Game',
      'GAME_SELECTION': 'Choose a Game'
    }
    
    return titles[currentGame] || 'Game'
  }

  const actions = getGameActions()

  if (!currentGame || actions.length === 0) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentGame}
        className={`game-sub-buttons ${className}`}
        variants={getContainerVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        role="toolbar"
        aria-label={`${getGameTitle()} controls`}
      >
        <div className="game-title">
          <span className="game-name">{getGameTitle()}</span>
        </div>
        
        <div className="game-actions">
          {actions.map((action, index) => (
            <motion.button
              key={action.id || index}
              className={`game-action-button ${action.id === 'stop' ? 'stop-game' : ''}`}
              onClick={() => handleActionClick(action)}
              disabled={disabled}
              variants={getButtonVariants()}
              whileHover="hover"
              whileTap="tap"
              style={getButtonStyle(action)}
              aria-label={action.ariaLabel || action.label}
              title={action.tooltip || action.label}
            >
              <span className="action-content">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GameSubButtons
