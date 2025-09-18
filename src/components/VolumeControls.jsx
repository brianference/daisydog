import React from 'react'
import { FaVolumeUp, FaVolumeMute, FaVolumeDown } from 'react-icons/fa'
import './VolumeControls.css'

const VolumeControls = ({
  masterVolume,
  dogVolume,
  gamesVolume,
  eatingVolume,
  uiVolume,
  mute,
  onClose
}) => {
  const getVolumeIcon = (volume) => {
    if (volume === 0) return <FaVolumeMute />
    if (volume < 0.5) return <FaVolumeDown />
    return <FaVolumeUp />
  }

  return (
    <div className="volume-controls-overlay" onClick={onClose}>
      <div className="volume-controls-panel" onClick={(e) => e.stopPropagation()}>
        <div className="volume-controls-header">
          <h3>🔊 Sound Settings</h3>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="volume-controls-content">
          {/* Master Volume */}
          <div className="volume-control-group">
            <label className="volume-label">
              {getVolumeIcon(masterVolume.value)}
              Master Volume
            </label>
            <div className="volume-slider-container">
              <input
                type="range"
                min={masterVolume.min}
                max={masterVolume.max}
                step={masterVolume.step}
                value={masterVolume.value}
                onChange={(e) => masterVolume.onChange(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span className="volume-value">{Math.round(masterVolume.value * 100)}%</span>
            </div>
          </div>

          {/* Dog Sounds */}
          <div className="volume-control-group">
            <label className="volume-label">
              🐕 Dog Sounds
            </label>
            <div className="volume-slider-container">
              <input
                type="range"
                min={dogVolume.min}
                max={dogVolume.max}
                step={dogVolume.step}
                value={dogVolume.value}
                onChange={(e) => dogVolume.onChange(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span className="volume-value">{Math.round(dogVolume.value * 100)}%</span>
            </div>
          </div>

          {/* Game Sounds */}
          <div className="volume-control-group">
            <label className="volume-label">
              🎮 Game Sounds
            </label>
            <div className="volume-slider-container">
              <input
                type="range"
                min={gamesVolume.min}
                max={gamesVolume.max}
                step={gamesVolume.step}
                value={gamesVolume.value}
                onChange={(e) => gamesVolume.onChange(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span className="volume-value">{Math.round(gamesVolume.value * 100)}%</span>
            </div>
          </div>

          {/* Eating Sounds */}
          <div className="volume-control-group">
            <label className="volume-label">
              🦴 Eating Sounds
            </label>
            <div className="volume-slider-container">
              <input
                type="range"
                min={eatingVolume.min}
                max={eatingVolume.max}
                step={eatingVolume.step}
                value={eatingVolume.value}
                onChange={(e) => eatingVolume.onChange(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span className="volume-value">{Math.round(eatingVolume.value * 100)}%</span>
            </div>
          </div>

          {/* UI Sounds */}
          <div className="volume-control-group">
            <label className="volume-label">
              🎵 UI Sounds
            </label>
            <div className="volume-slider-container">
              <input
                type="range"
                min={uiVolume.min}
                max={uiVolume.max}
                step={uiVolume.step}
                value={uiVolume.value}
                onChange={(e) => uiVolume.onChange(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span className="volume-value">{Math.round(uiVolume.value * 100)}%</span>
            </div>
          </div>

          {/* Mute Button */}
          <div className="volume-control-group mute-group">
            <button
              onClick={mute.toggleMute}
              className={`mute-button ${mute.isMuted ? 'muted' : ''}`}
            >
              {mute.isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              {mute.isMuted ? 'Unmute' : 'Mute All'}
            </button>
          </div>

          <div className="volume-controls-footer">
            <p className="volume-note">
              💡 Settings are automatically saved
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolumeControls
