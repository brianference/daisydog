/**
 * VideoAssetManager - Modular video asset management service
 * Handles video loading, caching, and fallback systems
 * Integrates with existing DaisyDog architecture without breaking changes
 */

class VideoAssetManager {
  constructor() {
    this.videos = new Map()
    this.thumbnails = new Map()
    this.loadingPromises = new Map()
    this.isInitialized = false
    this.connectionSpeed = 'fast' // Default assumption
    
    /**
     * Video asset configuration - Updated with new video files
     */
    this.videoAssets = {
      // Barking video - for alerts, safety responses, protective situations
      barking: {
        src: '/assets/barking.mp4',
        fallback: '/assets/images/emotions/nervous.png',
        preload: true,
        priority: 'high',
        emotions: ['nervous', 'concerned', 'protective', 'alert', 'warning']
      },
      // Ears up video - for curious, attentive, listening situations  
      'ears-up': {
        src: '/assets/ears-up.mp4',
        fallback: '/assets/images/emotions/curious.png',
        preload: true,
        priority: 'medium',
        emotions: ['curious', 'attentive', 'listening', 'interested', 'focused']
      },
      // Happy video - for joy, excitement, positive responses
      happy: {
        src: '/assets/happy.mp4',
        fallback: '/assets/images/emotions/happy.png',
        preload: true,
        priority: 'medium',
        emotions: ['happy', 'excited', 'joyful', 'loving']
      },
      // Lay down video - for calm, relaxed, resting situations
      'lay-down': {
        src: '/assets/lay-down.mp4',
        fallback: '/assets/images/emotions/content.png',
        preload: false,
        priority: 'low',
        emotions: ['calm', 'relaxed', 'resting', 'peaceful', 'content', 'sleepy']
      },
      // Roll over video - for playful, fun, trick situations
      'roll-over': {
        src: '/assets/roll-over.mp4',
        fallback: '/assets/images/emotions/playful.png',
        preload: false,
        priority: 'low',
        emotions: ['playful', 'silly', 'entertaining', 'tricks', 'fun', 'acrobatic']
      },
      // Dance video - for celebration, music, rhythm, party situations
      dance: {
        src: '/assets/dance.mp4',
        fallback: '/assets/images/emotions/excited.png',
        preload: false,
        priority: 'medium',
        emotions: ['dance', 'dancing', 'music', 'rhythm', 'celebration', 'party', 'festive', 'groove']
      }
    }
    
    this.init()
  }

  /**
   * Initialize the video system with lazy loading
   */
  async init() {
    try {
      console.log('🎬 VideoAssetManager: Initializing with lazy loading...')
      
      // Mark as initialized immediately for basic functionality
      this.isInitialized = true
      
      // Make available globally for debugging immediately
      if (typeof window !== 'undefined') {
        window.VideoAssetManager = this
        window.checkVideoFiles = () => this.debugVideoAvailability()
        window.videoStatus = () => this.getStatus()
      }
      
      // Lazy load in background after a short delay
      setTimeout(async () => {
        try {
          console.log('🎬 Starting background video preloading...')
          
          // Detect connection speed
          await this.detectConnectionSpeed()
          
          // Preload critical videos based on priority (in background)
          this.preloadCriticalVideos().then(() => {
            console.log('✅ VideoAssetManager: Background preloading complete')
          }).catch(error => {
            console.warn('⚠️ Background preloading failed:', error)
          })
          
        } catch (error) {
          console.warn('⚠️ VideoAssetManager: Background init failed:', error)
        }
      }, 2000) // Wait 2 seconds after page load
      
      console.log('✅ VideoAssetManager: Ready (lazy loading in background)')
      
    } catch (error) {
      console.warn('⚠️ VideoAssetManager: Init failed, using fallbacks:', error)
      this.isInitialized = false
    }
  }

  /**
   * Detect user's connection speed for optimal video selection
   */
  async detectConnectionSpeed() {
    try {
      // Use Navigator API if available
      if ('connection' in navigator) {
        const connection = navigator.connection
        if (connection.effectiveType) {
          this.connectionSpeed = connection.effectiveType.includes('4g') ? 'fast' : 'slow'
          console.log(`📡 Connection speed detected: ${this.connectionSpeed}`)
          return
        }
      }
      
      // Fallback: Simple timing test with small image
      const startTime = performance.now()
      const testImage = new Image()
      
      await new Promise((resolve, reject) => {
        testImage.onload = resolve
        testImage.onerror = reject
        testImage.src = '/assets/images/emotions/happy.png?t=' + Date.now()
      })
      
      const loadTime = performance.now() - startTime
      this.connectionSpeed = loadTime < 500 ? 'fast' : 'slow'
      console.log(`📡 Connection speed estimated: ${this.connectionSpeed} (${loadTime}ms)`)
      
    } catch (error) {
      console.warn('📡 Connection speed detection failed, assuming fast')
      this.connectionSpeed = 'fast'
    }
  }

  /**
   * Preload critical videos (safety responses first, then happy for general use)
   */
  async preloadCriticalVideos() {
    // Priority order: safety first, then general use
    const preloadOrder = [
      'thinking', // Safety responses - highest priority
      'happy'     // General positive responses - medium priority
    ]
    
    for (const emotion of preloadOrder) {
      if (this.videoAssets[emotion]) {
        try {
          console.log(`🎬 Preloading ${emotion} video...`)
          await this.preloadVideo(emotion)
          console.log(`✅ Preloaded ${emotion} video`)
          
          // Small delay between preloads to not block UI
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (error) {
          console.warn(`⚠️ Failed to preload ${emotion}:`, error)
          // Continue with next video even if one fails
        }
      }
    }
    
    console.log('🎬 Critical video preloading complete')
  }

  /**
   * Preload a specific video
   */
  async preloadVideo(emotion) {
    const config = this.videoAssets[emotion]
    if (!config) {
      throw new Error(`Unknown video emotion: ${emotion}`)
    }

    // Check if already loading
    if (this.loadingPromises.has(emotion)) {
      return this.loadingPromises.get(emotion)
    }

    // Create loading promise
    const loadingPromise = new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true // Required for autoplay policies
      
      video.addEventListener('loadedmetadata', () => {
        this.videos.set(emotion, video)
        resolve(video)
      })
      
      video.addEventListener('error', (e) => {
        console.warn(`Video load error for ${emotion}:`, e)
        reject(e)
      })
      
      video.src = config.src
    })

    this.loadingPromises.set(emotion, loadingPromise)
    
    try {
      const video = await loadingPromise
      return video
    } finally {
      this.loadingPromises.delete(emotion)
    }
  }

  /**
   * Map emotion to available video emotion
   */
  mapEmotionToVideo(emotion) {
    // Find video by checking emotion arrays in each video asset
    for (const [videoKey, config] of Object.entries(this.videoAssets)) {
      if (config.emotions && config.emotions.includes(emotion)) {
        // Reduced logging - only log in debug mode
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log(`🎬 Mapping emotion "${emotion}" to video "${videoKey}"`)
        }
        return videoKey
      }
    }
    
    // Direct mapping for available emotions
    if (this.videoAssets[emotion]) {
      // Reduced logging - only log in debug mode
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`🎬 Direct mapping emotion "${emotion}" to video "${emotion}"`)
      }
      return emotion
    }
    
    // Fallback mapping based on emotion categories
    if (['nervous', 'concerned', 'protective', 'worried', 'cautious', 'alert', 'warning'].includes(emotion)) {
      // Reduced logging - only log in debug mode
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`🎬 Mapping safety emotion "${emotion}" to video "barking"`)
      }
      return 'barking'
    }
    
    if (['curious', 'attentive', 'listening', 'interested', 'focused', 'thinking'].includes(emotion)) {
      // Reduced logging - only log in debug mode
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`🎬 Mapping curious emotion "${emotion}" to video "ears-up"`)
      }
      return 'ears-up'
    }
    
    if (['happy', 'excited', 'joyful', 'loving', 'cheerful'].includes(emotion)) {
      // Reduced logging - only log in debug mode
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`🎬 Mapping happy emotion "${emotion}" to video "happy"`)
      }
      return 'happy'
    }
    
    if (['calm', 'relaxed', 'resting', 'peaceful', 'content', 'sleepy', 'tired'].includes(emotion)) {
      // Reduced logging - only log in debug mode
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`🎬 Mapping calm emotion "${emotion}" to video "lay-down"`)
      }
      return 'lay-down'
    }
    
    if (['silly', 'entertaining', 'tricks', 'fun', 'acrobatic'].includes(emotion)) {
      // Reduced logging - only log in debug mode
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`🎬 Mapping tricks emotion "${emotion}" to video "roll-over"`)
      }
      return 'roll-over'
    }
    
    if (['playful'].includes(emotion)) {
      // Reduced logging - only log in debug mode
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`🎬 Mapping playful emotion "${emotion}" to video "roll-over"`)
      }
      return 'roll-over'
    }
    
    if (['dance', 'dancing', 'music', 'rhythm', 'celebration', 'party', 'festive', 'groove'].includes(emotion)) {
      // Reduced logging - only log in debug mode
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log(`🎬 Mapping dance emotion "${emotion}" to video "dance"`)
      }
      return 'dance'
    }
    
    // Default fallback - only log in debug mode
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`🎬 Using default mapping for "${emotion}" to video "happy"`)
    }
    return 'happy'
  }

  /**
   * Get video for emotion with intelligent fallback
   */
  async getVideoForEmotion(emotion, options = {}) {
    const {
      priority = 'medium',
      allowFallback = true,
      maxWaitTime = 1000
    } = options

    // Map the emotion to an available video emotion
    const mappedEmotion = this.mapEmotionToVideo(emotion)
    
    // Reduced logging - only log in debug mode
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`🎬 Mapping emotion "${emotion}" to video "${mappedEmotion}"`)
    }

    try {
      // Check if video is already loaded
      if (this.videos.has(mappedEmotion)) {
        return {
          type: 'video',
          element: this.videos.get(mappedEmotion).cloneNode(),
          src: this.videoAssets[mappedEmotion]?.src,
          originalEmotion: emotion,
          mappedEmotion: mappedEmotion
        }
      }

      // For high priority (safety), wait longer
      const waitTime = priority === 'high' ? maxWaitTime * 2 : maxWaitTime

      // Try to load with timeout
      const videoPromise = this.preloadVideo(mappedEmotion)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Video load timeout')), waitTime)
      )

      const video = await Promise.race([videoPromise, timeoutPromise])
      
      return {
        type: 'video',
        element: video.cloneNode(),
        src: this.videoAssets[mappedEmotion]?.src,
        originalEmotion: emotion,
        mappedEmotion: mappedEmotion
      }

    } catch (error) {
      console.warn(`Failed to get video for ${emotion} (mapped to ${mappedEmotion}):`, error)
      
      if (allowFallback) {
        return this.getFallbackForEmotion(emotion)
      }
      
      throw error
    }
  }

  /**
   * Get fallback image for emotion
   */
  getFallbackForEmotion(emotion) {
    // Try to get fallback for mapped emotion first
    const mappedEmotion = this.mapEmotionToVideo(emotion)
    const config = this.videoAssets[mappedEmotion]
    
    // If we have a specific fallback for the mapped emotion, use it
    if (config?.fallback) {
      return {
        type: 'image',
        src: config.fallback,
        element: null,
        originalEmotion: emotion,
        mappedEmotion: mappedEmotion
      }
    }
    
    // Otherwise, try to use the original emotion image
    const originalEmotionSrc = `/assets/images/emotions/${emotion}.png`
    
    return {
      type: 'image',
      src: originalEmotionSrc,
      element: null,
      originalEmotion: emotion,
      fallbackSrc: '/assets/images/emotions/happy.png' // Ultimate fallback
    }
  }

  /**
   * Check if video system is ready
   */
  isReady() {
    return this.isInitialized
  }

  /**
   * Check if video files actually exist
   */
  async checkVideoAvailability() {
    const availability = {}
    
    for (const [emotion, config] of Object.entries(this.videoAssets)) {
      try {
        // Try to fetch just the headers to check if file exists
        const response = await fetch(config.src, { method: 'HEAD' })
        availability[emotion] = {
          available: response.ok,
          status: response.status,
          size: response.headers.get('content-length')
        }
      } catch (error) {
        availability[emotion] = {
          available: false,
          error: error.message
        }
      }
    }
    
    return availability
  }

  /**
   * Get system status for debugging
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      connectionSpeed: this.connectionSpeed,
      loadedVideos: Array.from(this.videos.keys()),
      loadingVideos: Array.from(this.loadingPromises.keys()),
      availableEmotions: Object.keys(this.videoAssets),
      videoAssetPaths: Object.fromEntries(
        Object.entries(this.videoAssets).map(([emotion, config]) => [emotion, config.src])
      )
    }
  }

  /**
   * Debug function to check video availability
   */
  async debugVideoAvailability() {
    console.log('🎬 Checking video file availability...')
    const availability = await this.checkVideoAvailability()
    console.table(availability)
    return availability
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.videos.clear()
    this.thumbnails.clear()
    this.loadingPromises.clear()
    console.log('🧹 VideoAssetManager: Cleaned up')
  }
}

// Create singleton instance
const videoAssetManager = new VideoAssetManager()

export default videoAssetManager
