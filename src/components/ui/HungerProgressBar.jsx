/**
 * HungerProgressBar - Proper hunger bar with progress visualization
 * Restores the working hunger bar system that was previously functional
 */

import React from 'react'
import { UI_CONFIG } from '../../constants/index.js'

const HungerProgressBar = ({ 
  hungerLevel = 3, 
  maxLevel = UI_CONFIG.MAX_HUNGER_LEVEL,
  showLabel = true,
  className = ''
}) => {
  /**
   * Get hunger status description
   * @returns {string} Human-readable hunger status
   */
  const getHungerStatus = () => {
    if (hungerLevel <= 0) return 'Starving'
    if (hungerLevel <= 1) return 'Very Hungry'
    if (hungerLevel <= 2) return 'Hungry'
    if (hungerLevel <= 3) return 'Content'
    if (hungerLevel <= 4) return 'Satisfied'
    return 'Full'
  }

  /**
   * Get progress bar class based on hunger level
   * @returns {string} CSS class for progress bar
   */
  const getProgressBarClass = () => {
    let baseClass = 'hunger-progress-bar'
    
    if (hungerLevel <= 1) {
      baseClass += ' critical'
    } else if (hungerLevel <= 2) {
      baseClass += ' low'
    }
    
    return baseClass
  }

  const progressPercentage = (hungerLevel / maxLevel) * 100

  return (
    <div className={`hunger-bar ${className}`} role="progressbar" aria-valuenow={hungerLevel} aria-valuemax={maxLevel}>
      {showLabel && (
        <span className="hunger-label" title={getHungerStatus()}>
          Hunger:
        </span>
      )}
      
      <div className="hunger-level">
        <div className="hunger-progress-container">
          <div
            className={getProgressBarClass()}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <span className="hunger-text">{hungerLevel.toFixed(1)}/{maxLevel}</span>
      </div>
      
      {/* Screen reader only status */}
      <span className="sr-only">
        Hunger status: {getHungerStatus()}, {hungerLevel} out of {maxLevel}
      </span>
    </div>
  )
}

export default HungerProgressBar
