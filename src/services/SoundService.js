/**
 * SoundService - Comprehensive audio management system
 * Implements Single Responsibility Principle for sound management
 */

import { TIMING } from '../constants/index.js'

class SoundService {
  constructor() {
    this.audioContext = null
    this.gainNodes = {}
    this.isInitialized = false
    this.volumes = {
      master: 0.7,
      dog: 0.8,
      games: 0.6,
      eating: 0.9,
      ui: 0.5
    }
    this.isMuted = false
    
    // Sound file mappings - arrays support variation
    this.soundConfig = {
      dog: {
        happyBark: '/sounds/dog/happy-bark.mp3',
        excitedBark: '/sounds/dog/excited-bark.mp3',
        sadWhimper: '/sounds/dog/mixkit-dog-whimper-sad-466.wav',
        victoryBark: '/sounds/dog/mixkit-happy-puppy-barks-741.wav'
      },
      games: {
        // Click sounds - can be shared across games
        click: [
          '/sounds/games/click-234708.mp3',
          '/sounds/games/mouse-click-290204.mp3',
          '/sounds/games/button-394464.mp3'
        ],
        // Success/combo sounds - variation per game
        success: [
          '/sounds/games/material-buy-success-394517.mp3',
          '/sounds/games/combine-special-394482.mp3'
        ],
        match: '/sounds/games/clear-combo-7-394494.mp3',
        error: '/sounds/games/error-05-199276.mp3',
        // Victory sounds - different options
        victory: [
          '/sounds/games/you-win-sequence-2-183949.mp3',
          '/sounds/games/level-win-6416.mp3',
          '/sounds/games/violin-win-5-185128.mp3'
        ],
        levelComplete: '/sounds/games/level-complete-394515.mp3',
        gameOver: '/sounds/games/sweet-game-over-sound-effect-230470.mp3',
        ballBounce: '/sounds/games/ball-bounce.mp3',
        // Legacy game sounds (keep for backward compatibility)
        tugPull: '/sounds/dog/excited-bark.mp3',
        tugSuccess: '/sounds/dog/mixkit-happy-puppy-barks-741.wav',
        tugFail: '/sounds/dog/mixkit-dog-whimper-sad-466.wav',
        hideStart: '/sounds/dog/happy-bark.mp3',
        hideFound: '/sounds/dog/excited-bark.mp3',
        guessCorrect: '/sounds/dog/mixkit-happy-puppy-barks-741.wav',
        guessWrong: '/sounds/dog/mixkit-dog-whimper-sad-466.wav'
      },
      eating: {
        crunchyTreats: '/sounds/eating/crunchy-treats2.mp3',
        happyEating: '/sounds/eating/crunchy-treats2.mp3'
      },
      ui: {
        buttonClick: '/sounds/ui/button-click.mp3',
        storyTell: '/sounds/dog/happy-bark.mp3',
        jokeLaugh: '/sounds/dog/excited-bark.mp3',
        danceMusic: '/sounds/dog/dance-sound.mp3',
        gameStart: '/sounds/dog/happy-bark.mp3',
        success: '/sounds/dog/excited-bark.mp3',
        failure: '/sounds/dog/mixkit-dog-whimper-sad-466.wav'
      }
    }
    
    // Background music for games
    this.backgroundMusic = null
    this.backgroundMusicVolume = 0.30 // 30% volume
    this.musicTracks = [
      '/sounds/music/song1.mp3',
      '/sounds/music/song2.mp3',
      '/sounds/music/song3.mp3',
      '/sounds/music/song4.mp3',
      '/sounds/music/song5.mp3'
    ]
    
    this.initialize()
  }

  /**
   * Initialize audio context and gain nodes
   */
  async initialize() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()

      // Create gain nodes for volume control
      Object.keys(this.volumes).forEach(category => {
        const gainNode = this.audioContext.createGain()
        gainNode.connect(this.audioContext.destination)
        gainNode.gain.value = this.volumes[category]
        this.gainNodes[category] = gainNode
      })

      this.isInitialized = true
      this.loadSettings()
      console.log('✅ SoundService initialized successfully')
    } catch (error) {
      console.warn('❌ Audio context not supported:', error)
      this.isInitialized = false
    }
  }

  /**
   * Play a sound from the sound library (supports variation with arrays)
   * @param {string} category - Sound category (dog, games, eating, ui)
   * @param {string} soundName - Specific sound name
   * @returns {Promise<HTMLAudioElement>} Audio element
   */
  async playSound(category, soundName) {
    if (!this.isInitialized || this.isMuted) {
      return null
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      let soundPath = this.soundConfig[category]?.[soundName]
      if (!soundPath) {
        console.warn(`Sound not found: ${category}.${soundName}`)
        return null
      }

      // Support variation - if soundPath is an array, pick random one
      if (Array.isArray(soundPath)) {
        soundPath = soundPath[Math.floor(Math.random() * soundPath.length)]
      }

      // Create and configure audio element
      const audio = new Audio(soundPath)
      audio.volume = this.volumes[category] * this.volumes.master

      // Connect to gain node for advanced volume control
      if (this.gainNodes[category]) {
        const source = this.audioContext.createMediaElementSource(audio)
        source.connect(this.gainNodes[category])
      }

      await audio.play()
      return audio

    } catch (error) {
      console.warn('Error playing sound:', error)
      return null
    }
  }

  /**
   * Play random background music for games (30% volume, 5s delay)
   * @param {number} delaySeconds - Delay before starting (default 5s)
   * @param {string|null} specificTrack - Specific track path, or null for random
   */
  async playBackgroundMusic(delaySeconds = 5, specificTrack = null) {
    if (!this.isInitialized || this.isMuted) {
      return null
    }

    try {
      // Wait for delay
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000))

      // Stop existing background music
      this.stopBackgroundMusic()

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Pick random track or use specified one
      const musicPath = specificTrack || this.musicTracks[Math.floor(Math.random() * this.musicTracks.length)]

      this.backgroundMusic = new Audio(musicPath)
      this.backgroundMusic.volume = this.backgroundMusicVolume * this.volumes.master
      this.backgroundMusic.loop = true

      await this.backgroundMusic.play()
      console.log(`🎵 Playing background music: ${musicPath}`)
      return this.backgroundMusic

    } catch (error) {
      console.warn('Error playing background music:', error)
      return null
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
      this.backgroundMusic = null
    }
  }

  /**
   * Set volume for a specific category
   * @param {string} category - Volume category
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(category, volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.volumes[category] = clampedVolume
    
    if (this.gainNodes[category]) {
      const actualVolume = this.isMuted ? 0 : clampedVolume * this.volumes.master
      this.gainNodes[category].gain.setValueAtTime(
        actualVolume, 
        this.audioContext.currentTime
      )
    }
    
    this.saveSettings()
  }

  /**
   * Set master volume
   * @param {number} volume - Master volume level (0-1)
   */
  setMasterVolume(volume) {
    this.setVolume('master', volume)
    
    // Update all gain nodes
    Object.keys(this.gainNodes).forEach(category => {
      if (category !== 'master' && this.gainNodes[category]) {
        const actualVolume = this.isMuted ? 0 : this.volumes[category] * volume
        this.gainNodes[category].gain.setValueAtTime(
          actualVolume,
          this.audioContext.currentTime
        )
      }
    })
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted
    
    // Update all gain nodes
    Object.keys(this.gainNodes).forEach(category => {
      if (this.gainNodes[category]) {
        const actualVolume = this.isMuted ? 0 : this.volumes[category] * this.volumes.master
        this.gainNodes[category].gain.setValueAtTime(
          actualVolume,
          this.audioContext.currentTime
        )
      }
    })
    
    this.saveSettings()
  }

  /**
   * Get current volume settings
   * @returns {Object} Volume settings
   */
  getVolumes() {
    return { ...this.volumes }
  }

  /**
   * Check if sound is muted
   * @returns {boolean} Mute state
   */
  isSoundMuted() {
    return this.isMuted
  }

  /**
   * Check if sound system is ready
   * @returns {boolean} Initialization state
   */
  isReady() {
    return this.isInitialized
  }

  /**
   * Save volume settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('daisyDogVolumes', JSON.stringify(this.volumes))
      localStorage.setItem('daisyDogMuted', JSON.stringify(this.isMuted))
    } catch (error) {
      console.warn('Failed to save sound settings:', error)
    }
  }

  /**
   * Load volume settings from localStorage
   */
  loadSettings() {
    try {
      const savedVolumes = localStorage.getItem('daisyDogVolumes')
      const savedMuted = localStorage.getItem('daisyDogMuted')

      if (savedVolumes) {
        this.volumes = { ...this.volumes, ...JSON.parse(savedVolumes) }
      }

      if (savedMuted !== null) {
        this.isMuted = JSON.parse(savedMuted)
      }

      // Update gain nodes with loaded settings
      this.updateAllGainNodes()
    } catch (error) {
      console.warn('Failed to load sound settings:', error)
    }
  }

  /**
   * Update all gain nodes with current settings
   */
  updateAllGainNodes() {
    Object.keys(this.gainNodes).forEach(category => {
      if (this.gainNodes[category]) {
        const actualVolume = this.isMuted ? 0 : this.volumes[category] * this.volumes.master
        this.gainNodes[category].gain.setValueAtTime(
          actualVolume,
          this.audioContext.currentTime
        )
      }
    })
  }

  /**
   * Get volume control props for UI components
   * @returns {Object} Volume control configuration
   */
  getVolumeControlProps() {
    return {
      masterVolume: {
        value: this.volumes.master,
        onChange: (value) => this.setMasterVolume(value),
        min: 0,
        max: 1,
        step: 0.1
      },
      dogVolume: {
        value: this.volumes.dog,
        onChange: (value) => this.setVolume('dog', value),
        min: 0,
        max: 1,
        step: 0.1
      },
      gamesVolume: {
        value: this.volumes.games,
        onChange: (value) => this.setVolume('games', value),
        min: 0,
        max: 1,
        step: 0.1
      },
      eatingVolume: {
        value: this.volumes.eating,
        onChange: (value) => this.setVolume('eating', value),
        min: 0,
        max: 1,
        step: 0.1
      },
      uiVolume: {
        value: this.volumes.ui,
        onChange: (value) => this.setVolume('ui', value),
        min: 0,
        max: 1,
        step: 0.1
      },
      mute: {
        isMuted: this.isMuted,
        toggleMute: () => this.toggleMute()
      }
    }
  }

  /**
   * Cleanup audio context
   */
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      this.gainNodes = {}
      this.isInitialized = false
    }
  }

  /**
   * Get sound triggers for easy access
   * @returns {Object} Sound trigger functions
   */
  getSoundTriggers() {
    return {
      // Dog sounds
      happyBark: () => this.playSound('dog', 'happyBark'),
      excitedBark: () => this.playSound('dog', 'excitedBark'),
      sadWhimper: () => this.playSound('dog', 'sadWhimper'),
      victoryBark: () => this.playSound('dog', 'victoryBark'),

      // BoardGame.io game sounds (with variation)
      gameClick: () => this.playSound('games', 'click'),
      gameSuccess: () => this.playSound('games', 'success'),
      gameMatch: () => this.playSound('games', 'match'),
      gameError: () => this.playSound('games', 'error'),
      gameVictory: () => this.playSound('games', 'victory'),
      gameLevelComplete: () => this.playSound('games', 'levelComplete'),
      gameOver: () => this.playSound('games', 'gameOver'),
      gameBallBounce: () => this.playSound('games', 'ballBounce'),

      // Legacy game sounds (backward compatibility)
      ballBounce: () => this.playSound('games', 'ballBounce'),
      tugPull: () => this.playSound('games', 'tugPull'),
      tugSuccess: () => this.playSound('games', 'tugSuccess'),
      tugFail: () => this.playSound('games', 'tugFail'),
      hideStart: () => this.playSound('games', 'hideStart'),
      hideFound: () => this.playSound('games', 'hideFound'),
      guessCorrect: () => this.playSound('games', 'guessCorrect'),
      guessWrong: () => this.playSound('games', 'guessWrong'),

      // Eating sounds
      crunchyTreats: () => this.playSound('eating', 'crunchyTreats'),
      happyEating: () => this.playSound('eating', 'happyEating'),

      // UI sounds
      buttonClick: () => this.playSound('ui', 'buttonClick'),
      storyTell: () => this.playSound('ui', 'storyTell'),
      jokeLaugh: () => this.playSound('ui', 'jokeLaugh'),
      danceMusic: () => this.playSound('ui', 'danceMusic'),
      gameStart: () => this.playSound('ui', 'gameStart'),
      success: () => this.playSound('ui', 'success'),
      failure: () => this.playSound('ui', 'failure'),

      // Background music controls
      startBackgroundMusic: (delay = 5) => this.playBackgroundMusic(delay),
      stopBackgroundMusic: () => this.stopBackgroundMusic()
    }
  }
}

// Export singleton instance
export default new SoundService()
