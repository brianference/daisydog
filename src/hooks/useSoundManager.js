import { useState, useEffect, useCallback, useRef } from 'react'
import useSound from 'use-sound'

const useSoundManager = () => {
  const [volume, setVolume] = useState(0.7)
  const [muted, setMuted] = useState(false)
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [preloaded, setPreloaded] = useState(false)

  // Sound file mappings
  const soundFiles = {
    dog: {
      happy: '/sounds/dog/happy-bark.mp3',
      excited: '/sounds/dog/excited-bark.mp3',
      content: '/sounds/dog/content-sigh.mp3',
      sleepy: '/sounds/dog/sleepy-yawn.mp3'
    },
    games: {
      bounce: '/sounds/games/ball-bounce.mp3',
      complete: '/sounds/games/game-complete.mp3',
      victory: '/sounds/games/tug-victory.mp3'
    },
    eating: {
      crunch: '/sounds/eating/crunchy-treats.mp3',
      munching: '/sounds/eating/happy-munching.mp3',
      satisfied: '/sounds/eating/satisfied-lick.mp3'
    },
    ui: {
      click: '/sounds/ui/button-click.mp3',
      send: '/sounds/ui/message-send.mp3',
      notification: '/sounds/ui/notification.mp3'
    }
  }

  // Load sounds with use-sound
  const [playHappyBark] = useSound(soundFiles.dog.happy, { volume: muted ? 0 : volume })
  const [playExcitedBark] = useSound(soundFiles.dog.excited, { volume: muted ? 0 : volume })
  const [playContentSigh] = useSound(soundFiles.dog.content, { volume: muted ? 0 : volume })
  const [playSleepyYawn] = useSound(soundFiles.dog.sleepy, { volume: muted ? 0 : volume })
  
  const [playBallBounce] = useSound(soundFiles.games.bounce, { volume: muted ? 0 : volume })
  const [playGameComplete] = useSound(soundFiles.games.complete, { volume: muted ? 0 : volume })
  const [playTugVictory] = useSound(soundFiles.games.victory, { volume: muted ? 0 : volume })
  
  const [playCrunchyTreats] = useSound(soundFiles.eating.crunch, { volume: muted ? 0 : volume })
  const [playHappyMunching] = useSound(soundFiles.eating.munching, { volume: muted ? 0 : volume })
  const [playSatisfiedLick] = useSound(soundFiles.eating.satisfied, { volume: muted ? 0 : volume })
  
  const [playButtonClick] = useSound(soundFiles.ui.click, { volume: muted ? 0 : volume })
  const [playMessageSend] = useSound(soundFiles.ui.send, { volume: muted ? 0 : volume })
  const [playNotification] = useSound(soundFiles.ui.notification, { volume: muted ? 0 : volume })

  // Sound player mapping
  const soundPlayers = {
    dog: {
      happy: playHappyBark,
      excited: playExcitedBark,
      content: playContentSigh,
      sleepy: playSleepyYawn
    },
    games: {
      bounce: playBallBounce,
      complete: playGameComplete,
      victory: playTugVictory
    },
    eating: {
      crunch: playCrunchyTreats,
      munching: playHappyMunching,
      satisfied: playSatisfiedLick
    },
    ui: {
      click: playButtonClick,
      send: playMessageSend,
      notification: playNotification
    }
  }

  // Load settings from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('daisydog-volume')
    const savedMuted = localStorage.getItem('daisydog-muted')
    const savedEnabled = localStorage.getItem('daisydog-sounds-enabled')

    if (savedVolume) setVolume(parseFloat(savedVolume))
    if (savedMuted) setMuted(savedMuted === 'true')
    if (savedEnabled) setSoundsEnabled(savedEnabled === 'true')
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('daisydog-volume', volume.toString())
    localStorage.setItem('daisydog-muted', muted.toString())
    localStorage.setItem('daisydog-sounds-enabled', soundsEnabled.toString())
  }, [volume, muted, soundsEnabled])

  // Play sound function
  const playSound = useCallback((category, soundName, options = {}) => {
    if (!soundsEnabled || muted) return

    try {
      const player = soundPlayers[category]?.[soundName]
      if (player) {
        player()
      } else {
        console.warn(`Sound not found: ${category}.${soundName}`)
      }
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }, [soundsEnabled, muted, soundPlayers])

  // Convenience methods for common sounds
  const playDogSound = useCallback((emotion) => {
    const emotionSoundMap = {
      happy: 'happy',
      excited: 'excited',
      hungry: 'content',
      sleepy: 'sleepy',
      playfetch: 'excited',
      dancing: 'excited',
      thinking: 'content'
    }
    
    const soundName = emotionSoundMap[emotion] || 'happy'
    playSound('dog', soundName)
  }, [playSound])

  const playUISound = useCallback((action) => {
    playSound('ui', action)
  }, [playSound])

  const playGameSound = useCallback((action) => {
    playSound('games', action)
  }, [playSound])

  const playEatingSound = useCallback((action) => {
    playSound('eating', action)
  }, [playSound])

  // Control functions
  const toggleMute = useCallback(() => {
    setMuted(prev => !prev)
  }, [])

  const toggleSounds = useCallback(() => {
    setSoundsEnabled(prev => !prev)
  }, [])

  const changeVolume = useCallback((newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)))
  }, [])

  return {
    // State
    volume,
    muted,
    soundsEnabled,
    preloaded,
    
    // Control functions
    toggleMute,
    toggleSounds,
    changeVolume,
    
    // Play functions
    playSound,
    playDogSound,
    playUISound,
    playGameSound,
    playEatingSound,
    
    // Sound files reference
    soundFiles
  }
}

export default useSoundManager