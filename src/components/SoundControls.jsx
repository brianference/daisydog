import React from 'react'
import { FaVolumeUp, FaVolumeMute, FaVolumeDown } from 'react-icons/fa'
import './SoundControls.css'

const SoundControls = ({ 
  volume, 
  muted, 
  soundsEnabled, 
  onVolumeChange, 
  onToggleMute, 
  onToggleSounds 
}) => {
  const getVolumeIcon = () => {
    if (muted || !soundsEnabled) return <FaVolumeMute />
    if (volume < 0.3) return <FaVolumeDown />
    return <FaVolumeUp />
  }

  return (
    <div className="sound-controls">
      <button 
        className={`sound-toggle ${soundsEnabled && !muted ? 'enabled' : 'disabled'}`}
        onClick={onToggleSounds}
        title={soundsEnabled ? 'Disable sounds' : 'Enable sounds'}
      >
        {getVolumeIcon()}
      </button>
      
      {soundsEnabled && (
        <>
          <button 
            className="mute-toggle"
            onClick={onToggleMute}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
            title="Volume control"
          />
        </>
      )}
    </div>
  )
}

export default SoundControls