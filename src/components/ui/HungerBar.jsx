/**
 * HungerBar - Reusable hunger display component
 * Implements Single Responsibility Principle for hunger visualization
 */

import React from 'react'
import { FaBone } from 'react-icons/fa'
import { UI_CONFIG } from '../../constants/index.js'

const HungerBar = ({ 
  hungerLevel = 3, 
  maxLevel = UI_CONFIG.MAX_HUNGER_LEVEL,
  showLabel = true,
  size = 'medium',
  className = '',
  onBoneClick = null
}) => {
  /**
   * Get bone className based on hunger level
   * @param {number} boneIndex - Index of the bone (1-based)
   * @returns {string} CSS className for bone
   */
  const getBoneClassName = (boneIndex) => {
    const baseClass = 'bone'
    const sizeClass = `bone-${size}`
    
    if (boneIndex <= hungerLevel) {
      if (hungerLevel <= 1) {
        return `${baseClass} ${sizeClass} filled starving`
      } else if (hungerLevel <= 2) {
        return `${baseClass} ${sizeClass} filled hungry`
      } else {
        return `${baseClass} ${sizeClass} filled`
      }
    }
    
    return `${baseClass} ${sizeClass} empty`
  }

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
   * Handle bone click
   * @param {number} boneIndex - Index of clicked bone
   */
  const handleBoneClick = (boneIndex) => {
    if (onBoneClick) {
      onBoneClick(boneIndex, hungerLevel)
    }
  }

  return (
    <div className={`hunger-bar ${className}`} role="progressbar" aria-valuenow={hungerLevel} aria-valuemax={maxLevel}>
      {showLabel && (
        <span className="hunger-label" title={getHungerStatus()}>
          Hunger:
        </span>
      )}
      
      <div className="bones" role="group" aria-label={`Hunger level: ${hungerLevel} out of ${maxLevel}`}>
        {Array.from({ length: maxLevel }, (_, index) => {
          const boneNumber = index + 1
          return (
            <FaBone
              key={boneNumber}
              className={getBoneClassName(boneNumber)}
              onClick={() => handleBoneClick(boneNumber)}
              style={{ cursor: onBoneClick ? 'pointer' : 'default' }}
              title={`Hunger level ${boneNumber}${boneNumber <= hungerLevel ? ' (filled)' : ' (empty)'}`}
              aria-label={`Hunger bone ${boneNumber} of ${maxLevel}${boneNumber <= hungerLevel ? ', filled' : ', empty'}`}
            />
          )
        })}
      </div>
      
      {/* Screen reader only status */}
      <span className="sr-only">
        Hunger status: {getHungerStatus()}, {hungerLevel} out of {maxLevel} bones filled
      </span>
    </div>
  )
}

export default HungerBar
