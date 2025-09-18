// DaisyDog Sound System - Volume Controls & Audio Management

import { useState, useEffect, useRef } from 'react'

// Sound configuration
const SOUND_CONFIG = {
  dog: {
    happyBark: '/sounds/dog/happy-bark.mp3',
    excitedBark: '/sounds/dog/excited-bark.mp3',
    sadWhimper: '/sounds/dog/sad-whimper.mp3',
    victoryBark: '/sounds/dog/victory-bark.mp3'
  },
  games: {
    ballBounce: '/sounds/games/ball-bounce.mp3',
    tugPull: '/sounds/games/tug-pull.mp3',
    tugSuccess: '/sounds/games/tug-success.mp3',
    tugFail: '/sounds/games/tug-fail.mp3',
    hideStart: '/sounds/games/hide-start.mp3',
    hideFound: '/sounds/games/hide-found.mp3',
    guessCorrect: '/sounds/games/guess-correct.mp3',
    guessWrong: '/sounds/games/guess-wrong.mp3',
    victory: '/sounds/games/victory.mp3'
  },
  eating: {
    crunchyTreats: '/sounds/eating/crunchy-treats.mp3',
    happyEating: '/sounds/eating/happy-eating.mp3'
  },
  ui: {
    buttonClick: '/sounds/ui/button-click.mp3',
    storyTell: '/sounds/ui/story-tell.mp3',
    jokeLaugh: '/sounds/ui/joke-laugh.mp3',
    danceMusic: '/sounds/ui/dance-music.mp3',
    gameStart: '/sounds/ui/game-start.mp3',
    success: '/sounds/ui/success.mp3',
    failure: '/sounds/ui/failure.mp3'
  }
}

// Default volume levels
const DEFAULT_VOLUMES = {
  master: 0.7,
  dog: 0.8,
  games: 0.6,
  eating: 0.9,
  ui: 0.5
}

export const useSoundSystem = () => {
  const [volumes, setVolumes] = useState(DEFAULT_VOLUMES)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioContextRef = useRef(null)
  const gainNodesRef = useRef({})

  // Initialize audio context
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContext()

      // Create gain nodes for volume control
      Object.keys(DEFAULT_VOLUMES).forEach(category => {
        const gainNode = audioContextRef.current.createGain()
        gainNode.connect(audioContextRef.current.destination)
        gainNode.gain.value = DEFAULT_VOLUMES[category]
        gainNodesRef.current[category] = gainNode
      })

      setIsLoaded(true)
    } catch (error) {
      console.warn('Audio context not supported:', error)
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Update volumes when changed
  useEffect(() => {
    if (!gainNodesRef.current) return

    Object.keys(volumes).forEach(category => {
      if (gainNodesRef.current[category]) {
        const actualVolume = isMuted ? 0 : volumes[category] * volumes.master
        gainNodesRef.current[category].gain.setValueAtTime(actualVolume, audioContextRef.current.currentTime)
      }
    })
  }, [volumes, isMuted])

  // Play sound function
  const playSound = async (category, soundName) => {
    if (!isLoaded || isMuted) return

    try {
      // Resume audio context if suspended (required by some browsers)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      const soundPath = SOUND_CONFIG[category]?.[soundName]
      if (!soundPath) {
        console.warn(`Sound not found: ${category}.${soundName}`)
        return
      }

      // Create audio element for simple playback
      const audio = new Audio(soundPath)
      audio.volume = volumes[category] * volumes.master

      // Connect to gain node for volume control
      if (gainNodesRef.current[category]) {
        const source = audioContextRef.current.createMediaElementSource(audio)
        source.connect(gainNodesRef.current[category])
      }

      await audio.play()

      return audio
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }

  // Volume control functions
  const setVolume = (category, volume) => {
    setVolumes(prev => ({
      ...prev,
      [category]: Math.max(0, Math.min(1, volume))
    }))
  }

  const setMasterVolume = (volume) => {
    setVolume('master', volume)
  }

  const toggleMute = () => {
    setIsMuted(prev => !prev)
  }

  // Save/load volume settings
  const saveSettings = () => {
    localStorage.setItem('daisyDogVolumes', JSON.stringify(volumes))
    localStorage.setItem('daisyDogMuted', isMuted)
  }

  const loadSettings = () => {
    try {
      const savedVolumes = localStorage.getItem('daisyDogVolumes')
      const savedMuted = localStorage.getItem('daisyDogMuted')

      if (savedVolumes) {
        setVolumes(JSON.parse(savedVolumes))
      }

      if (savedMuted !== null) {
        setIsMuted(JSON.parse(savedMuted))
      }
    } catch (error) {
      console.warn('Error loading sound settings:', error)
    }
  }

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  return {
    volumes,
    isMuted,
    isLoaded,
    playSound,
    setVolume,
    setMasterVolume,
    toggleMute,
    saveSettings,
    loadSettings
  }
}

// Sound trigger functions
export const useSoundTriggers = (playSound) => {
  const triggerHappyBark = () => playSound('dog', 'happyBark')
  const triggerExcitedBark = () => playSound('dog', 'excitedBark')
  const triggerSadWhimper = () => playSound('dog', 'sadWhimper')
  const triggerVictoryBark = () => playSound('dog', 'victoryBark')

  // Game sounds
  const triggerBallBounce = () => playSound('games', 'ballBounce')
  const triggerTugPull = () => playSound('games', 'tugPull')
  const triggerTugSuccess = () => playSound('games', 'tugSuccess')
  const triggerTugFail = () => playSound('games', 'tugFail')
  const triggerHideStart = () => playSound('games', 'hideStart')
  const triggerHideFound = () => playSound('games', 'hideFound')
  const triggerGuessCorrect = () => playSound('games', 'guessCorrect')
  const triggerGuessWrong = () => playSound('games', 'guessWrong')
  const triggerGameVictory = () => playSound('games', 'victory')

  // Eating sounds
  const triggerCrunchyTreats = () => playSound('eating', 'crunchyTreats')
  const triggerHappyEating = () => playSound('eating', 'happyEating')

  // UI sounds
  const triggerButtonClick = () => playSound('ui', 'buttonClick')
  const triggerStoryTell = () => playSound('ui', 'storyTell')
  const triggerJokeLaugh = () => playSound('ui', 'jokeLaugh')
  const triggerDanceMusic = () => playSound('ui', 'danceMusic')
  const triggerGameStart = () => playSound('ui', 'gameStart')
  const triggerSuccess = () => playSound('ui', 'success')
  const triggerFailure = () => playSound('ui', 'failure')

  return {
    // Dog sounds
    triggerHappyBark,
    triggerExcitedBark,
    triggerSadWhimper,
    triggerVictoryBark,

    // Game sounds
    triggerBallBounce,
    triggerTugPull,
    triggerTugSuccess,
    triggerTugFail,
    triggerHideStart,
    triggerHideFound,
    triggerGuessCorrect,
    triggerGuessWrong,
    triggerGameVictory,

    // Eating sounds
    triggerCrunchyTreats,
    triggerHappyEating,

    // UI sounds
    triggerButtonClick,
    triggerStoryTell,
    triggerJokeLaugh,
    triggerDanceMusic,
    triggerGameStart,
    triggerSuccess,
    triggerFailure
  }
}

// Volume control component props
export const createVolumeControls = (volumes, isMuted, setVolume, setMasterVolume, toggleMute) => {
  return {
    masterVolume: {
      value: volumes.master,
      onChange: setMasterVolume,
      min: 0,
      max: 1,
      step: 0.1
    },
    dogVolume: {
      value: volumes.dog,
      onChange: (value) => setVolume('dog', value),
      min: 0,
      max: 1,
      step: 0.1
    },
    gamesVolume: {
      value: volumes.games,
      onChange: (value) => setVolume('games', value),
      min: 0,
      max: 1,
      step: 0.1
    },
    eatingVolume: {
      value: volumes.eating,
      onChange: (value) => setVolume('eating', value),
      min: 0,
      max: 1,
      step: 0.1
    },
    uiVolume: {
      value: volumes.ui,
      onChange: (value) => setVolume('ui', value),
      min: 0,
      max: 1,
      step: 0.1
    },
    mute: {
      isMuted,
      toggleMute
    }
  }
}
