/**
 * VolumeControls - Reusable volume control component
 * Implements Single Responsibility Principle for audio controls
 */

import React, { useState } from 'react'
import { FaVolumeUp, FaVolumeMute, FaVolumeDown, FaCog } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const VolumeControls = ({
  volumes,
  isMuted,
  isEnabled = true,
  onVolumeChange,
  onToggleMute,
  onToggleEnabled,
  showAdvanced = false,
  className = ''
}) => {
  const [showPanel, setShowPanel] = useState(false)

  /**
   * Get appropriate volume icon
   * @param {number} volume - Volume level
   * @returns {JSX.Element} Volume icon
   */
  const getVolumeIcon = (volume = volumes?.master || 0) => {
    if (!isEnabled || isMuted || volume === 0) {
      return <FaVolumeMute />
    }
    if (volume < 0.5) {
      return <FaVolumeDown />
    }
    return <FaVolumeUp />
  }

  /**
   * Handle volume slider change
   * @param {string} category - Volume category
   * @param {number} value - New volume value
   */
  const handleVolumeChange = (category, value) => {
    if (onVolumeChange) {
      onVolumeChange(category, value)
    }
  }

  /**
   * Toggle volume panel visibility
   */
  const togglePanel = () => {
    setShowPanel(!showPanel)
  }

  /**
   * Close panel when clicking outside
   * @param {Event} e - Click event
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPanel(false)
    }
  }

  /**
   * Get panel animation variants
   */
  const panelVariants = {
    initial: { opacity: 0, scale: 0.9, y: -10 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <div className={`volume-controls ${className}`}>
      {/* Main volume button */}
      <button
        className={`volume-main-button ${isEnabled && !isMuted ? 'enabled' : 'disabled'}`}
        onClick={onToggleEnabled || onToggleMute}
        title={isEnabled ? (isMuted ? 'Unmute' : 'Mute') : 'Enable sounds'}
        aria-label="Toggle sound"
      >
        {getVolumeIcon()}
      </button>

      {/* Advanced controls toggle */}
      {showAdvanced && isEnabled && (
        <button
          className="volume-settings-button"
          onClick={togglePanel}
          title="Sound settings"
          aria-label="Open sound settings"
        >
          <FaCog />
        </button>
      )}

      {/* Quick volume slider (when enabled but not showing advanced) */}
      {isEnabled && !showAdvanced && !isMuted && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volumes?.master || 0}
          onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
          className="volume-quick-slider"
          title="Master volume"
          aria-label="Master volume"
        />
      )}

      {/* Advanced volume panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="volume-panel-overlay"
            onClick={handleOverlayClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="volume-panel"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="volume-panel-header">
                <h3>🔊 Sound Settings</h3>
                <button 
                  onClick={() => setShowPanel(false)}
                  className="volume-panel-close"
                  aria-label="Close sound settings"
                >
                  ✕
                </button>
              </div>

              <div className="volume-panel-content">
                {/* Master Volume */}
                <div className="volume-control-group">
                  <label className="volume-label">
                    {getVolumeIcon(volumes?.master)}
                    Master Volume
                  </label>
                  <div className="volume-slider-container">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volumes?.master || 0}
                      onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
                      className="volume-slider"
                      aria-label="Master volume"
                    />
                    <span className="volume-value">
                      {Math.round((volumes?.master || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Individual Category Controls */}
                {volumes && Object.keys(volumes).filter(key => key !== 'master').map(category => (
                  <div key={category} className="volume-control-group">
                    <label className="volume-label">
                      {category === 'dog' && '🐕'} 
                      {category === 'games' && '🎮'} 
                      {category === 'eating' && '🦴'} 
                      {category === 'ui' && '🎵'} 
                      {category.charAt(0).toUpperCase() + category.slice(1)} Sounds
                    </label>
                    <div className="volume-slider-container">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volumes[category] || 0}
                        onChange={(e) => handleVolumeChange(category, parseFloat(e.target.value))}
                        className="volume-slider"
                        aria-label={`${category} volume`}
                      />
                      <span className="volume-value">
                        {Math.round((volumes[category] || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}

                {/* Mute Button */}
                <div className="volume-control-group mute-group">
                  <button
                    onClick={onToggleMute}
                    className={`mute-button ${isMuted ? 'muted' : ''}`}
                    aria-label={isMuted ? 'Unmute all sounds' : 'Mute all sounds'}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    {isMuted ? 'Unmute All' : 'Mute All'}
                  </button>
                </div>

                <div className="volume-panel-footer">
                  <p className="volume-note">
                    💡 Settings are automatically saved
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VolumeControls
