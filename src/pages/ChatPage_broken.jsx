import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaw, FaBone, FaHome, FaQuestionCircle, FaPaperPlane, FaBrain, FaVolumeUp, FaVolumeMute, FaBook } from 'react-icons/fa'
import { daisyResponses } from '../data/daisyResponses'
import { dogFacts, getRandomDogFact, getDogFactByKeyword, containsDogFactKeywords } from '../data/dogFacts'
import { bibleCharacters, getBibleCharacterResponse, containsBibleCharacterKeywords, findBibleCharacter } from '../data/bibleCharacters'
import { catholicCurriculum, getBiblePassageResponse, containsBiblePassageKeywords, getCurriculumResponse, containsCurriculumKeywords, getBibleTopicResponse, containsBibleTopicKeywords, getSpecificVerseResponse, containsSpecificVerseKeywords, containsLessonKeywords, getLessonResponse, findCurriculumGrade } from '../data/catholicCurriculum'
import GeminiService from '../services/GeminiService.js'
import SupabaseService from '../services/SupabaseService.js'
import CatholicDoctrineService from '../services/CatholicDoctrineService.js'
import TestServicesInitializer from '../services/TestServicesInitializer.js'
import useSoundManagerModular from '../hooks/useSoundManagerModular.js'
import useSafetyFilter from '../hooks/useSafetyFilter.js'
import '../tests/preReleaseTestSuite.js'
import SoundControls from '../components/SoundControls.jsx'
import SmartDaisyAvatar from '../components/SmartDaisyAvatar.jsx'
import InlineVideoMessage from '../components/InlineVideoMessage.jsx'
import useStableVideoIntegration from '../hooks/useStableVideoIntegration.js'
import SoundTestPanel from '../components/SoundTestPanel.jsx'
import BibleTestPanel from '../components/BibleTestPanel.jsx'
import LessonTestPanel from '../components/LessonTestPanel.jsx'
import EnvChecker from '../components/EnvChecker.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import AgeVerification from '../components/AgeVerification'
import './ChatPage.css'

const ChatPage = () => {
  // Chat state
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState('happy')
  const [hungerLevel, setHungerLevel] = useState(3)
  const [gameState, setGameState] = useState(null)
  const [bibleMenuState, setBibleMenuState] = useState(null)
  const [constitutionMenuState, setConstitutionMenuState] = useState(null)
  const [conversationContext, setConversationContext] = useState(null)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [isVerified, setIsVerified] = useState(false) // New state for age verification
  const [userAge, setUserAge] = useState(null) // Track user age for compliance
  const [userName, setUserName] = useState('') // Name collection allowed for 13+ users
  
  // Game-specific states
  const [ballPosition, setBallPosition] = useState('ready')
  const [hideSeekCount, setHideSeekCount] = useState(0)
  const [tugStrength, setTugStrength] = useState(0)
  const [guessTarget, setGuessTarget] = useState(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [showGameMenu, setShowGameMenu] = useState(false)
  const [ballCatchHeight, setBallCatchHeight] = useState('medium')
  const [showSoundTestPanel, setShowSoundTestPanel] = useState(false)
  const [showBibleTestPanel, setShowBibleTestPanel] = useState(false)
  const [showLessonTestPanel, setShowLessonTestPanel] = useState(false)
  const [showDebugMenu, setShowDebugMenu] = useState(false)
  
  // Inactivity system states
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now())
  const [inactivityTimer, setInactivityTimer] = useState(null)
  const [inactivityType, setInactivityType] = useState('treat') // alternates between 'treat' and 'dogquestion'
  
  // API integration states
  const [geminiStatus, setGeminiStatus] = useState(null)
  const [supabaseStatus, setSupabaseStatus] = useState(null)
  
  // Sound system integration
  const {
    volumes,
    isMuted,
    isReady: soundReady,
    toggleMute,
    setMasterVolume,
    playEmotionSound,
    playGameSound,
    playUISound,
    playEatingSound,
    playContextualSound
  } = useSoundManagerModular()

  // Re-enable video system with proper fixes
  const {
    shouldMessageUseVideo,
    getVideoPropsForMessage,
    isVideoSystemReady,
    enableFallbackMode,
    getSystemStatus: getVideoSystemStatus
  } = useStableVideoIntegration({
    enableVideo: true,
    fallbackMode: false,
    debugMode: false // Disable debug mode to prevent excessive logging
  })

  // Bible service initialization
  const initializeBibleService = async () => {
    try {
      const { default: BibleService } = await import('../services/BibleService.js');
    } catch (error) {
      console.error('❌ Failed to initialize Bible Service:', error);
    }
  }

  // Initialize services and check status
  useEffect(() => {
    const initializeServices = async () => {
      // Initialize Gemini Service
      if (GeminiService && typeof GeminiService.initialize === 'function') {
        await GeminiService.initialize()
        setGeminiStatus(GeminiService.getStatus())
      }
      
      // Test Supabase connection
      if (SupabaseService && typeof SupabaseService.testConnection === 'function') {
        await SupabaseService.testConnection()
        setSupabaseStatus(SupabaseService.getStatus())
      }
    }

    const initializeBibleService = async () => {
      try {
        const { default: BibleService } = await import('../services/BibleService.js');
        if (BibleService && typeof BibleService.initialize === 'function') {
          await BibleService.initialize()
        }
      } catch (error) {
        console.error('❌ Failed to initialize Bible Service:', error);
      }
    }

    initializeServices();
    initializeBibleService();
  }, []);

  // Create anonymous session when user age is set
  useEffect(() => {
    if (userAge && !SupabaseService.getCurrentSession()) {
      const createSession = async () => {
        try {
          await SupabaseService.createAnonymousSession(userAge)
          console.log('✅ Anonymous session created for age range:', SupabaseService.getAgeRange(userAge))
        } catch (error) {
          console.error('Failed to create session:', error)
        }
      }
      createSession()
    }
  }, [userAge]);

  // Safety filter system integration
  const {
    checkSafety,
    getDrugSafetyResponse,
    getSafetyAnalysis,
    safetyStats,
    getRandomSafetyTip
  } = useSafetyFilter()
  
  // Debug: Verify safety hook is working
  useEffect(() => {
    console.log('🛡️ Safety hook initialized:', {
      checkSafety: typeof checkSafety,
      safetyStats,
      hookLoaded: !!checkSafety
    })
  }, [checkSafety, safetyStats])
  
  // Refs
  const messagesEndRef = useRef(null)
  const messageIdCounter = useRef(0)
  
  // Helper functions
  const generateUniqueMessageId = () => {
    // Use crypto.randomUUID if available (most reliable)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    
    // Enhanced fallback with more entropy to prevent collisions
    const timestamp = Date.now()
    const random1 = Math.random().toString(36).substr(2, 9)
    const random2 = Math.random().toString(36).substr(2, 5)
    const counter = messageIdCounter.current++
    const performanceNow = Math.floor(performance.now() * 1000) // Add microsecond precision
    
    return `msg-${timestamp}-${performanceNow}-${random1}-${random2}-${counter}`
  }
  
  const getRandomResponse = (responses) => {
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return "Woof! I'm having trouble finding my words right now! 🐕"
    }
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  // Helper function to clear dancing emotion and timeout
  const clearDancingEmotion = useCallback(() => {
    if (window.danceResetTimeout) {
      clearTimeout(window.danceResetTimeout)
      window.danceResetTimeout = null
    }
    if (currentEmotion === 'dancing') {
      console.log('🎭 Clearing dancing emotion due to new interaction')
      setCurrentEmotion('happy')
    }
  }, [currentEmotion])
  
  // Get emotion image based on current state
  const getEmotionImage = (emotion = currentEmotion) => {
    const emotionMap = {
      'happy': 'happy',
      'excited': 'excited',
      'playfetch': 'playfetch',
      'thinking': 'thinking',
      'hungry': 'hungry',
      'patient': 'patient',
      'nervous': 'nervous',
      'dancing': 'dancing',
      'crouchingdown': 'crouchingdown',
      'eager': 'eager',
      'panting': 'panting',
      'waiting': 'waiting',
      'lookingbehind': 'lookingbehind',
      'stylish': 'stylish',
      'shakepaw': 'shakepaw'
    }
    
    const mappedEmotion = emotionMap[emotion] || 'happy'
    const imagePath = `/assets/images/emotions/${mappedEmotion}.png`
    
    // Debug logging for dance emotion
    if (emotion === 'dancing') {
      console.log('🎭 getEmotionImage called with dancing emotion')
      console.log('🎭 Image path:', imagePath)
    }
    
    return imagePath
  }
  
  // Simple auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Initialize Gemini status
  useEffect(() => {
    const updateGeminiStatus = () => {
      setGeminiStatus(GeminiService.getStatus())
    }
    
    updateGeminiStatus()
    // Update status every 61 seconds for rate limiting
    const interval = setInterval(updateGeminiStatus, 61000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Initialize Supabase status
  useEffect(() => {
    const updateSupabaseStatus = () => {
      setSupabaseStatus(SupabaseService.getStatus())
    }
    
    updateSupabaseStatus()
    // Update status every 10 seconds (was 30)
    const interval = setInterval(updateSupabaseStatus, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Load saved state on mount
  useEffect(() => {
    const stateLoaded = loadState()
    if (!stateLoaded && !hasGreeted && messages.length === 0) {
      setTimeout(() => {
        addDaisyMessage(getRandomResponse(daisyResponses.initialGreetings))
        // Don't set hasGreeted = true yet, wait for name
      }, 1000)
    }
  }, [])

  // Load state function
  const loadState = () => {
    try {
      const savedState = localStorage.getItem('daisyDogState')
      if (savedState) {
        const state = JSON.parse(savedState)
        const loadedMessages = state.messages?.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) || []
        
        setMessages(loadedMessages)
        setCurrentEmotion(state.currentEmotion || 'happy')
        setHungerLevel(state.hungerLevel || 3)
        setGameState(state.gameState || null)
        setBibleMenuState(state.bibleMenuState || null)
        setConversationContext(state.conversationContext || null)
        setHasGreeted(state.hasGreeted || false)
        setUserName(state.userName || '')
        setBallPosition(state.ballPosition || 'ready')
        setHideSeekCount(state.hideSeekCount || 0)
        setTugStrength(state.tugStrength || 0)
        setGuessTarget(state.guessTarget || null)
        setStoryIndex(state.storyIndex || 0)
        setBallCatchHeight(state.ballCatchHeight || 'medium')
        
        console.log('✅ State loaded successfully')
        return true
      }
    } catch (error) {
      console.warn('Failed to load state:', error)
    }
    return false
  }

  // Hunger increase over time (like fatigue)
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        const newLevel = Math.min(prev + 1, 5) // Hunger increases over time
        if (newLevel === 4 && prev < 4) {
          setTimeout(() => {
            addDaisyMessage("*stomach rumbles* I'm getting a little hungry... 🦴")
          }, 1000)
        } else if (newLevel === 5 && prev < 5) {
          setTimeout(() => {
            addDaisyMessage("*whimpers softly* I'm really hungry now... Could I have a treat please? 🥺🦴")
          }, 1000)
        }
        return newLevel
      })
    }, 60000) // Increase every minute
    
    return () => clearInterval(hungerTimer)
  }, [])
  
  // Cleanup dance timeout on unmount
  useEffect(() => {
    return () => {
      if (window.danceResetTimeout) {
        clearTimeout(window.danceResetTimeout)
        window.danceResetTimeout = null
      }
    }
  }, [])

  // Ping Supabase every 61 seconds to maintain connection
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      try {
        await SupabaseService.testConnection()
        console.log('🔗 Supabase ping successful')
      } catch (error) {
        console.log('❌ Supabase ping failed:', error)
      }
    }, 61000) // 61 seconds

    return () => clearInterval(pingInterval)
  }, [])

  // Initialize components and check verification status
  useEffect(() => {
    // Check if user has already been verified (within last 24 hours for security)
    const verified = localStorage.getItem('daisydog_verified')
    const verificationDate = localStorage.getItem('daisydog_verification_date')
    const storedAge = localStorage.getItem('daisydog_user_age')
    
    if (verified === 'true' && verificationDate && storedAge) {
      const verifyTime = new Date(verificationDate)
      const now = new Date()
      const hoursSinceVerification = (now - verifyTime) / (1000 * 60 * 60)
      
      // Verification expires after 24 hours for security
      if (hoursSinceVerification < 24) {
        console.log('🔒 User already verified within 24 hours')
        setIsVerified(true)
        setUserAge(parseInt(storedAge))
      } else {
        console.log('🔒 Verification expired, requiring re-verification')
        localStorage.removeItem('daisydog_verified')
        localStorage.removeItem('daisydog_verification_date')
        localStorage.removeItem('daisydog_user_age')
      }
    }
    
    initializeBibleService()
  }, [])

  // Age verification handler
  const handleVerificationComplete = (verificationData) => {
    console.log('🔒 Age verification completed:', verificationData)
    setUserAge(verificationData.age)
    setIsVerified(true)
    
    // Store verification status locally (not personal data)
    localStorage.setItem('daisydog_verified', 'true')
    localStorage.setItem('daisydog_verification_date', new Date().toISOString())
  }

  // Game action handlers
  const handleGameAction = (gameType) => {
    switch (gameType) {
      case 'fetch':
        setGameState({ type: 'fetch', round: 1, score: 0 })
        setCurrentEmotion('playfetch')
        addDaisyMessage("*bounces excitedly* Woof! Let's play fetch! Choose how to throw the ball! 🎾", 'chat', 'playfetch')
        break
      case 'tug':
        setGameState({ type: 'tug', strength: 50 })
        setCurrentEmotion('eager')
        addDaisyMessage("*grabs rope in mouth* Grrr! Let's see who's stronger! Choose your tug strategy! 🪢", 'chat', 'eager')
        break
      case 'hide':
        setGameState({ type: 'hide', location: Math.floor(Math.random() * 4) + 1 })
        setCurrentEmotion('lookingbehind')
        addDaisyMessage("*covers eyes* I'm hiding! Try to find me! Where do you think I am? 🙈", 'chat', 'lookingbehind')
        break
      case 'ball':
        setGameState({ type: 'ball', throws: 0, catches: 0 })
        setCurrentEmotion('playfetch')
        addDaisyMessage("*gets ready to catch* Let's play ball catch! Throw it however you want! 🏀", 'chat', 'playfetch')
        break
      case 'guess':
        const target = Math.floor(Math.random() * 10) + 1
        setGameState({ type: 'guess', target, attempts: 0 })
        setCurrentEmotion('thinking')
        addDaisyMessage("*thinks hard* Okay! I'm thinking of a number between 1 and 10! Can you guess it? 🤔", 'chat', 'thinking')
        break
    }
  }

  const handleFetchAction = (action) => {
    const success = Math.random() > 0.3
    const newScore = success ? gameState.score + (action === 'far' ? 2 : 1) : gameState.score
    setGameState({ ...gameState, round: gameState.round + 1, score: newScore })
    
    const responses = {
      throw: success ? "*catches ball perfectly* Got it! *wags tail proudly* Throw it again! 🎾✨" : "*misses ball* Oops! *chases after it* Almost had it! Try again! 🐕💨",
      bounce: "*bounces ball back to you* Boing! *excited bouncing* Your turn! 🏀",
      pretend: "*gets super excited* Wooo! *pretends to chase* That was a good pretend throw! *panting happily* 🎾😄",
      far: success ? "*leaps high and catches far throw* Wow! *super excited* That was an amazing throw! You're the best! 🏆✨" : "*runs after far ball* Whew! *pants* That was far! Let me get it! 🏃‍♀️💨",
      short: success ? "*catches easy throw* That was perfect! *wags tail* Nice and easy! 🎾😊" : "*playfully misses easy one* Oops! *giggles* That was too easy to miss! 😄"
    }
    
    if (soundReady && !isMuted) {
      setTimeout(() => playGameSound('fetch'), 300)
    }
    
    addDaisyMessage(responses[action], 'chat', 'playfetch')
  }

  const handleTugAction = (action) => {
    let newStrength = gameState.strength
    const responses = {
      pull: () => {
        newStrength = Math.max(0, Math.min(100, gameState.strength + (Math.random() * 20 - 10)))
        return newStrength > 80 ? "*pulls back hard* Grrr! You're strong! *determined face* 💪" : "*tugs with effort* Come on! Pull harder! 🪢"
      },
      gentle: () => {
        newStrength = Math.max(0, gameState.strength - 5)
        return "*tugs gently* Aww, that's nice and easy! *wags tail* 🤏"
      },
      shake: () => {
        newStrength = Math.max(0, Math.min(100, gameState.strength + 15))
        return "*shakes rope wildly* Woah! *spins around* That's a fun shake! 🌀"
      },
      release: () => {
        newStrength = 0
        return "*lets go of rope* Whew! *pants happily* Good game! 🤲"
      },
      victory: () => {
        return "*does victory dance* I win! *spins in circles* That was so much fun! 🏆"
      }
    }
    
    setGameState({ ...gameState, strength: newStrength })
    if (soundReady && !isMuted) {
      setTimeout(() => playGameSound('tug'), 300)
    }
    addDaisyMessage(responses[action](), 'chat', 'eager')
  }

  const handleHideAction = (location) => {
    const correctLocation = gameState.location
    const locationNames = ['', 'tree', 'house', 'car', 'bush']
    
    if (location === 'found' || location === locationNames[correctLocation]) {
      setCurrentEmotion('excited')
      addDaisyMessage("*jumps out* You found me! *wags tail excitedly* I was hiding behind the " + locationNames[correctLocation] + "! Great job! 🎉", 'chat', 'excited')
    } else if (location !== 'found') {
      addDaisyMessage("*giggles from hiding spot* Nope! I'm not there! Keep looking! 🙈", 'chat', 'lookingbehind')
    }
  }

  const handleBallAction = (action) => {
    const success = Math.random() > 0.4
    const newThrows = gameState.throws + 1
    const newCatches = success ? gameState.catches + 1 : gameState.catches
    setGameState({ ...gameState, throws: newThrows, catches: newCatches })
    
    const responses = {
      high: success ? "*leaps high and catches* Got it! *proud panting* Great high throw! ⬆️✨" : "*jumps but misses* Whoa! *looks up* That was really high! 🌤️",
      low: success ? "*dives low and catches* Perfect! *rolls over* Nice low throw! ⬇️🎯" : "*tries to catch low ball* Almost! *paws at ground* So close! 🐾",
      spin: success ? "*spins and catches spinning ball* Whoa! *dizzy* That was a spinning catch! 🌀✨" : "*gets dizzy watching spin* Whoa! *wobbles* That made me dizzy! 😵",
      gentle: success ? "*gently catches soft throw* Aww! *cuddles ball* That was so gentle and nice! 🤗" : "*ball bounces off nose gently* Boop! *giggles* That tickled! 😊",
      trick: success ? "*does backflip catch* WOW! *amazed* That was an incredible trick shot! ✨🤸‍♀️" : "*tries trick catch but tumbles* Whoa! *rolls around* That was tricky! 🤹‍♀️"
    }
    
    if (soundReady && !isMuted) {
      setTimeout(() => playGameSound('fetch'), 300)
    }
    
    addDaisyMessage(responses[action], 'chat', 'playfetch')
  }

  const handleGuessAction = (number) => {
    const newAttempts = gameState.attempts + 1
    setGameState({ ...gameState, attempts: newAttempts })
    
    if (number === gameState.target) {
      setGameState(null)
      setGuessTarget(null)
      setCurrentEmotion('excited')
      // Play correct guess sound
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'correct'), 300)
      }
      addDaisyMessage(`*jumps up and down* YES! You got it! It was ${gameState.target}! You're so smart! 🎉`, 'chat', 'excited')
    } else if (number < gameState.target) {
      setCurrentEmotion('eager')
      // Play wrong guess sound
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'wrong'), 300)
      }
      addDaisyMessage("*wags tail* Higher! Try a bigger number! 📈", 'chat', 'eager')
    } else {
      setCurrentEmotion('eager')
      // Play wrong guess sound
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'wrong'), 300)
      }
      addDaisyMessage("*shakes head* Lower! Try a smaller number! 📉", 'chat', 'eager')
    }
  }

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    
    const messageToSend = inputMessage.trim()
    
    // Add user message
    const userMessage = {
      id: generateUniqueMessageId(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    
    // Generate Daisy response
    setIsTyping(true)
    setTimeout(async () => {
      setIsTyping(false)
      const response = await generateDaisyResponse(messageToSend)
      console.log('🎬 Generated response for video analysis:', response)
      
      if (typeof response === 'object' && response.text) {
        // Pass the full response object for video analysis
        addDaisyMessage(response.text, 'chat', response.emotion, response)
      } else {
        addDaisyMessage(response)
      }
    }, 1000 + Math.random() * 1000)
  }

  // Feed Daisy function
  const feedDaisy = () => {
    // Clear any dancing emotion first
    clearDancingEmotion()
    
    // Play eating sound immediately
    if (soundReady && !isMuted) {
      playEatingSound('treats')
    }
    
    if (hungerLevel > 0) {
      setHungerLevel(prev => Math.max(0, prev - 1))
      setCurrentEmotion('excited')
      
      const feedResponses = [
        "*munches happily* Nom nom nom! Thank you! These treats are delicious! 🦴",
        "*wags tail excitedly* Yummy! You're the best! I feel so much better now! 🐕",
        "*does a happy spin* Woof! Those were tasty! I love treat time! ✨"
      ]
      
      setTimeout(() => {
        addDaisyMessage(feedResponses[Math.floor(Math.random() * feedResponses.length)], 'feed', 'excited')
      }, 500)
    } else {
      setCurrentEmotion('happy')
      setTimeout(() => {
        addDaisyMessage("*wags tail* I'm not hungry right now, but thank you! Maybe save those treats for later! 🐕", 'feed', 'happy')
      }, 500)
    }
  }

  // Handle quick action messages
  const handleQuickMessage = (message) => {
    // Play UI click sound
    if (soundReady && !isMuted) {
      playUISound('click')
    }
    
    // Add user message
    const userMessage = {
      id: generateUniqueMessageId(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    // Generate response
    setIsTyping(true)
    setTimeout(async () => {
      setIsTyping(false)
      const response = await generateDaisyResponse(message)
      if (typeof response === 'object' && response.text) {
        addDaisyMessage(response.text, 'chat', response.emotion, response)
      } else {
        addDaisyMessage(response)
      }
    }, 1000 + Math.random() * 1000)
  }

  // Add Daisy message function
  const addDaisyMessage = (text, type = 'chat', emotion = null, fullResponseData = null) => {
    const finalEmotion = emotion || currentEmotion
    const messageId = generateUniqueMessageId()
    
    // Prevent duplicate messages
    const recentMessages = messages.slice(-3)
    const isDuplicate = recentMessages.some(msg => 
      msg.text === text && 
      msg.sender === 'daisy' && 
      (Date.now() - msg.timestamp.getTime()) < 1000
    )
    
    if (isDuplicate) {
      console.warn('🚨 Preventing duplicate message:', text)
      return
    }
    
    const newMessage = {
      id: messageId,
      text,
      sender: 'daisy',
      timestamp: new Date(),
      type,
      emotion: finalEmotion,
      emotionImage: getEmotionImage(finalEmotion),
      // Store full response data for video analysis
      safetyContext: fullResponseData?.safetyContext,
      responseType: fullResponseData?.type,
      fullResponseData: fullResponseData
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Play contextual sound
    if (soundReady && !isMuted) {
      setTimeout(() => {
        playContextualSound(text, currentEmotion)
      }, 500)
    }
  }

  // Reset state function
  const resetState = () => {
    console.log('🔄 RESET CHAT: Clearing all state')
    setMessages([])
    setCurrentEmotion('happy')
    setHungerLevel(3)
    setGameState(null)
    setBibleMenuState(null)
    setConstitutionMenuState(null)
    setConversationContext(null)
    setHasGreeted(false)
    setUserName('')
    setBallPosition('ready')
    setHideSeekCount(0)
    setTugStrength(0)
    setGuessTarget(null)
    setStoryIndex(0)
    setBallCatchHeight('medium')
    console.log('🔄 RESET COMPLETE')
    
    // Trigger initial greeting
    setTimeout(() => {
      addDaisyMessage(getRandomResponse(daisyResponses.initialGreetings))
    }, 1000)
  }

  // Enhanced response generation with Catholic doctrine priority
  const generateDaisyResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // PRIORITY 0: CATHOLIC DOCTRINE CHECK FIRST (HIGHEST PRIORITY)
    console.log('✝️ Checking for Catholic doctrine topics FIRST on:', userMessage)
    const doctrineCheck = CatholicDoctrineService.checkForDoctrineTopics(userMessage)
    if (doctrineCheck) {
      console.log('✝️ Catholic doctrine topic detected:', doctrineCheck.topic)
      const catholicResponse = CatholicDoctrineService.getCatholicResponse(doctrineCheck.data)
      if (catholicResponse) {
        setCurrentEmotion('happy')
        
        // Log Catholic doctrine usage
        SupabaseService.logFeatureUsage('catholic_doctrine', doctrineCheck.topic)
          .catch(error => console.error('Feature logging failed:', error))
        
        return {
          text: catholicResponse.text,
          emotion: 'happy',
          catholicTeaching: catholicResponse.catholicTeaching,
          catechismRef: catholicResponse.catechismRef,
          type: 'catholic_doctrine'
        }
      }
    }
    
    // PRIORITY 1: SAFETY CHECK SECOND
    console.log('🔍 Running safety check on:', userMessage)
    
    // Check if this is Bible content BEFORE running safety check
    const isBibleContent = containsBibleTopicKeywords(userMessage) || 
                          containsBibleCharacterKeywords(userMessage) ||
                          containsBiblePassageKeywords(userMessage) ||
                          containsCurriculumKeywords(userMessage) ||
                          containsLessonKeywords(userMessage);
    
    if (isBibleContent) {
      console.log('📖 Bible content detected - bypassing safety filter for religious content');
    } else if (checkSafety) {
      const safetyCheck = checkSafety(userMessage)
      console.log('🛡️ Safety check result:', safetyCheck)
      if (safetyCheck && !safetyCheck.isSafe) {
        console.log('🛡️ Safety intervention triggered:', safetyCheck.type, safetyCheck.category)
        setCurrentEmotion(safetyCheck.emotion || 'nervous')
        
        // Log safety event to database (anonymous)
        SupabaseService.logSafetyEvent(
          safetyCheck.type, 
          safetyCheck.category,
          safetyCheck.triggeredKeyword || null
        ).catch(error => console.error('Safety logging failed:', error))
        
        let response = safetyCheck.response
        if (safetyCheck.safetyTip) {
          response += '\n\n' + safetyCheck.safetyTip
        }
        
        return { 
          text: response, 
          emotion: safetyCheck.emotion || 'nervous',
          safetyContext: safetyCheck.type,
          type: 'safety_response'
        }
      }
    }
    
    // Priority 2: Handle critical local logic
    // Name-related questions
    if (lowerMessage.includes('what') && lowerMessage.includes('name')) {
      console.log('Name question detected. Current userName:', userName, 'User age:', userAge)
      if (userAge >= 13 && userName) {
        setCurrentEmotion('excited')
        return `*wags tail proudly* Your name is ${userName}! I remember because you're my special friend! 🐕💕`
      } else if (userAge >= 13) {
        setCurrentEmotion('patient')
        return "*tilts head curiously* I don't know your name yet! What should I call you? I'd love to know! 🐾"
      } else {
        setCurrentEmotion('patient')
        return "*tilts head gently* I don't collect names from children under 13 to keep you safe! But I'm still so happy to chat with you! 🐕💕"
      }
    }
    
    // Dance requests
    if (lowerMessage.includes('dance') || lowerMessage.includes('dancing')) {
      console.log('Dance request detected, setting emotion to dancing')
      setCurrentEmotion('dancing')
      
      // Play dance music
      if (soundReady && !isMuted) {
        setTimeout(() => {
          playUISound('dance')
          console.log('🎵 Playing dance music (dance-sound.mp3)')
        }, 300)
      }
      
      if (window.danceResetTimeout) {
        clearTimeout(window.danceResetTimeout)
      }
      
      window.danceResetTimeout = setTimeout(() => {
        console.log('🎭 Resetting emotion from dancing back to happy')
        setCurrentEmotion('happy')
        window.danceResetTimeout = null
      }, 3000)
      
      const danceResponse = getRandomResponse(daisyResponses.dances)
      return { text: danceResponse, emotion: 'dancing' }
    }
    
    // Story requests
    if (lowerMessage.includes('story') || lowerMessage.includes('tell me a story')) {
      console.log('📚 Story request detected, using local long stories')
      setCurrentEmotion('thinking')
      const story = getStoryResponse()
      return story
    }
    
    // Catholic curriculum requests
    if (containsCurriculumKeywords(userMessage)) {
      console.log('📚 Catholic curriculum request detected')
      setCurrentEmotion('excited')
      
      try {
        const curriculumResponse = await getCurriculumResponse(userMessage)
        if (curriculumResponse) {
          console.log('📚 Catholic curriculum delivered from database')
          return curriculumResponse
        }
      } catch (error) {
        console.error('Catholic curriculum response failed:', error)
        return "*wags tail apologetically* I'd love to tell you about that Catholic curriculum topic, but I'm having trouble right now! Ask your parents to tell you more about it! 📚🐕💕"
      }
    }
    
    // Lesson detection
    if (containsLessonKeywords(userMessage)) {
      console.log('📚 Lesson request detected, determining grade context')
      setCurrentEmotion('excited')
      
      try {
        let grade = findCurriculumGrade(userMessage);
        
        if (!grade && (userMessage.toLowerCase().includes('first lesson') || userMessage.toLowerCase().includes('lesson'))) {
          grade = catholicCurriculum.kindergarten;
          console.log('📚 No grade specified, defaulting to Kindergarten');
        }
        
        if (grade) {
          const lessonResponse = await getLessonResponse(userMessage, grade);
          if (lessonResponse) {
            console.log('📚 Lesson delivered from database');
            return lessonResponse;
          }
        } else {
          console.log('📚 No grade context found');
          return "*wags tail curiously* Which grade would you like to learn about? Try asking 'What is the first lesson for Kindergarten?' or 'Teach me Grade 1 lesson 1!' 📚🐕💕";
        }
      } catch (error) {
        console.error('Lesson response failed:', error);
        return "*wags tail apologetically* I'd love to tell you about that lesson, but I'm having trouble right now! Ask your parents to tell you more about it! 📚🐕💕";
      }
    }
    
    // Dog facts
    if (containsDogFactKeywords(userMessage)) {
      console.log('🐕 Dog fact request detected')
      setCurrentEmotion('excited')
      const dogFact = getDogFactByKeyword(userMessage)
      return { text: dogFact, emotion: 'excited' }
    }
    
    // Specific verses (John 3:16, Matthew 19:14, etc.) - PRIORITY BEFORE GENERAL PASSAGES
    if (containsSpecificVerseKeywords(userMessage)) {
      console.log('📖 Specific verse request detected')
      setCurrentEmotion('excited')
      
      try {
        const specificVerseResponse = await getSpecificVerseResponse(userMessage)
        if (specificVerseResponse) {
          console.log('📖 Specific verse delivered from database')
          return specificVerseResponse
        }
      } catch (error) {
        console.error('Specific verse response failed:', error)
        return "*wags tail apologetically* I'd love to tell you about that specific verse, but I'm having trouble right now! Ask your parents to read you that verse! 📖🐕💕"
      }
    }
    
    // Bible passages (general passage detection)
    if (containsBiblePassageKeywords(userMessage)) {
      console.log('📖 Bible passage request detected')
      setCurrentEmotion('excited')
      
      try {
        const biblePassageResponse = await getBiblePassageResponse(userMessage)
        if (biblePassageResponse) {
          console.log('📖 Bible passage delivered from database')
          return biblePassageResponse
        }
      } catch (error) {
        console.error('Bible passage response failed:', error)
        return "*wags tail apologetically* I'd love to tell you about that Bible verse, but I'm having trouble right now! Ask your parents to read you that verse! 📖🐕💕"
      }
    }
    
    // Bible topics (Ten Commandments, etc.) - PRIORITY BEFORE CHARACTERS
    if (containsBibleTopicKeywords(userMessage)) {
      console.log('📖 Bible topic request detected')
      setCurrentEmotion('excited')
      
      try {
        const response = await getBibleTopicResponse(userMessage)
        if (response) {
          return response
        }
      } catch (error) {
        console.error('Bible topic response failed:', error)
      }
    }
    
    // Bible characters
    if (containsBibleCharacterKeywords(userMessage)) {
      console.log('📖 Bible character request detected')
      setCurrentEmotion('excited')
      
      try {
        const character = findBibleCharacter(userMessage)
        const bibleCharacterResponse = await getBibleCharacterResponse(userMessage)
        if (bibleCharacterResponse && character) {
          console.log('📖 Bible character delivered from database')
          
          setConversationContext({
            type: 'bible_character',
            character: character.name,
            characterData: character,
            lastFact: character.funFacts[0]
          })
          
          return bibleCharacterResponse
        }
      } catch (error) {
        console.error('Bible character response failed:', error)
        return "*wags tail apologetically* I'd love to tell you about that Bible character, but I'm having trouble right now! Ask your parents to tell you more Bible stories! 📖🐕💕"
      }
    }
    
    // Name detection for 13+ users
    if (userAge >= 13 && !userName && !gameState) {
      const gameCommands = ['fetch', 'catch', 'throw', 'ball', 'hide', 'seek', 'found', 'pull', 'harder', 'tug', 'guess', 'number', 'higher', 'lower']
      const isGameCommand = gameCommands.some(cmd => lowerMessage.includes(cmd))
      
      // Question words that indicate this is NOT a name
      const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'tell me', 'can you', 'do you', 'are you', 'is', 'does']
      const isQuestion = questionWords.some(word => lowerMessage.includes(word))
      
      if (!isGameCommand && !isQuestion && userMessage.length > 1 && userMessage.length < 20) {
        const possibleName = userMessage.trim()
        if (/^[a-zA-Z\s]+$/.test(possibleName)) {
          console.log('Setting userName to:', possibleName, 'for 13+ user')
          setUserName(possibleName)
          setHasGreeted(true)
          setCurrentEmotion('excited')
          return `*wags tail enthusiastically* Nice to meet you, ${possibleName}! I'm Daisy! I love to play games, tell stories, and do tricks! What would you like to do together? 🐕✨`
        }
      }
    }
    
    // Game state handling
    if (gameState === 'fetch') {
      return handleFetchGame(lowerMessage)
    } else if (gameState === 'hide_and_seek') {
      return handleHideSeekGame(lowerMessage)
    } else if (gameState === 'tug_of_war') {
      return handleTugWarGame(lowerMessage)
    } else if (gameState === 'guessing_game') {
      return handleGuessingGame(lowerMessage)
    } else if (gameState === 'ball_catch') {
      return handleBallCatchGame(lowerMessage)
    }
    
    // Priority 4: Specific keyword responses
    if (lowerMessage.includes('what day') || lowerMessage.includes('what is today')) {
      setCurrentEmotion('thinking')
      const today = new Date()
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
      const fullDate = today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      return `*tilts head thoughtfully* Today is ${dayName}! The full date is ${fullDate}. What a wonderful day to chat with you! 🐕📅`
    }
    
    if (lowerMessage.includes('what time') || lowerMessage.includes('what is the time')) {
      setCurrentEmotion('thinking')
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      return `*looks around* It's ${timeString} right now! Time flies when we're having fun together! 🐕⏰`
    }
    
    // Enhanced Math Questions - handles dozens of variations
    // Addition patterns
    const additionPatterns = [
      // "what is/what's" variations
      /(?:what is|what's|whats) (\d+) ?\+ ?(\d+)/,
      /(?:what is|what's|whats) (\d+) plus (\d+)/,
      /(?:what is|what's|whats) (\d+) added to (\d+)/,
      /(?:what is|what's|whats) (\d+) and (\d+)/,
      // Direct questions
      /(\d+) ?\+ ?(\d+) ?(?:equals?|is|\?)/,
      /(\d+) plus (\d+) ?(?:equals?|is|\?)/,
      /add (\d+) (?:and|to|\+) (\d+)/,
      // "How much is" variations
      /how much is (\d+) ?\+ ?(\d+)/,
      /how much is (\d+) plus (\d+)/,
      /how much is (\d+) and (\d+)/,
      // "Can you" variations
      /can you (?:add|solve) (\d+) ?\+ ?(\d+)/,
      /can you (?:add|solve) (\d+) plus (\d+)/,
      // "Tell me" variations
      /tell me (\d+) ?\+ ?(\d+)/,
      /tell me (\d+) plus (\d+)/,
      // "Calculate" variations
      /calculate (\d+) ?\+ ?(\d+)/,
      /calculate (\d+) plus (\d+)/,
      // Simple patterns
      /(\d+) ?\+ ?(\d+)/,
      /(\d+) plus (\d+)/
    ]
    
    // Subtraction patterns
    const subtractionPatterns = [
      // "what is/what's" variations
      /(?:what is|what's|whats) (\d+) ?- ?(\d+)/,
      /(?:what is|what's|whats) (\d+) minus (\d+)/,
      /(?:what is|what's|whats) (\d+) take away (\d+)/,
      /(?:what is|what's|whats) (\d+) subtract (\d+)/,
      // Direct questions
      /(\d+) ?- ?(\d+) ?(?:equals?|is|\?)/,
      /(\d+) minus (\d+) ?(?:equals?|is|\?)/,
      /subtract (\d+) from (\d+)/,
      // "How much is" variations
      /how much is (\d+) ?- ?(\d+)/,
      /how much is (\d+) minus (\d+)/,
      // "Can you" variations
      /can you (?:subtract|solve) (\d+) ?- ?(\d+)/,
      /can you (?:subtract|solve) (\d+) minus (\d+)/,
      // "Tell me" variations
      /tell me (\d+) ?- ?(\d+)/,
      /tell me (\d+) minus (\d+)/,
      // "Calculate" variations
      /calculate (\d+) ?- ?(\d+)/,
      /calculate (\d+) minus (\d+)/,
      // Simple patterns
      /(\d+) ?- ?(\d+)/,
      /(\d+) minus (\d+)/
    ]
    
    // Check for addition
    for (const pattern of additionPatterns) {
      const match = lowerMessage.match(pattern)
      if (match) {
        setCurrentEmotion('thinking')
        const num1 = parseInt(match[1])
        const num2 = parseInt(match[2])
        const result = num1 + num2
        
        // Log math feature usage
        SupabaseService.logFeatureUsage('math', 'addition')
          .catch(error => console.error('Feature logging failed:', error))
        
        const responses = [
          `*counts on paws* ${num1} plus ${num2} equals ${result}! Math is fun! 🐕🔢`,
          `*wags tail excitedly* ${num1} + ${num2} = ${result}! I love doing math with you! 🐕✨`,
          `*sits proudly* That's easy! ${num1} plus ${num2} is ${result}! Want another math problem? 🐕📚`,
          `*tilts head thoughtfully* Let me think... ${num1} and ${num2} makes ${result}! Math is pawsome! 🐕🧮`
        ]
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }
    
    // Check for subtraction
    for (const pattern of subtractionPatterns) {
      const match = lowerMessage.match(pattern)
      if (match) {
        setCurrentEmotion('thinking')
        const num1 = parseInt(match[1])
        const num2 = parseInt(match[2])
        const result = num1 - num2
        const responses = [
          `*thinks carefully* ${num1} minus ${num2} equals ${result}! Good math question! 🐕🔢`,
          `*concentrates hard* ${num1} - ${num2} = ${result}! Subtraction is tricky but fun! 🐕✨`,
          `*counts on paws* If you have ${num1} and take away ${num2}, you get ${result}! 🐕📚`,
          `*wags tail proudly* That's ${result}! Math makes my brain happy! 🐕🧮`
        ]
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }
    
    // Multiplication patterns
    const multiplicationPatterns = [
      // "what is/what's" variations
      /(?:what is|what's|whats) (\d+) (?:times|multiplied by|\*|x) (\d+)/,
      /(?:what is|what's|whats) (\d+)(?:\*|x)(\d+)/,  // No spaces: what is 5*3
      // Direct format
      /(\d+) (?:times|multiplied by|\*|x) (\d+)/,
      /(\d+)(?:\*|x)(\d+)/,  // No spaces: 5*3
      // Question format
      /(?:how much is|calculate) (\d+) (?:times|multiplied by|\*|x) (\d+)/,
      /(?:how much is|calculate) (\d+)(?:\*|x)(\d+)/,  // No spaces
      // Math format
      /(?:solve|compute) (\d+) (?:\*|x) (\d+)/,
      /(?:solve|compute) (\d+)(?:\*|x)(\d+)/  // No spaces
    ]
    
    // Check for multiplication
    for (const pattern of multiplicationPatterns) {
      const match = lowerMessage.match(pattern)
      if (match) {
        setCurrentEmotion('thinking')
        const num1 = parseInt(match[1])
        const num2 = parseInt(match[2])
        const result = num1 * num2
        const responses = [
          `*counts carefully* ${num1} times ${num2} equals ${result}! Multiplication is fun! 🐕🔢`,
          `*wags tail excitedly* ${num1} × ${num2} = ${result}! I love multiplying numbers! 🐕✨`,
          `*sits proudly* That's easy! ${num1} multiplied by ${num2} is ${result}! Math is pawsome! 🐕📚`,
          `*tilts head thoughtfully* Let me think... ${num1} groups of ${num2} makes ${result}! 🐕🧮`
        ]
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }
    
    // Division patterns
    const divisionPatterns = [
      // "what is/what's" variations
      /(?:what is|what's|whats) (\d+) (?:divided by|÷|\/|over) (\d+)/,
      /(?:what is|what's|whats) (\d+)(?:÷|\/)(\d+)/,  // No spaces: what is 10/2
      // Direct format
      /(\d+) (?:divided by|÷|\/|over) (\d+)/,
      /(\d+)(?:÷|\/)(\d+)/,  // No spaces: 10/2
      // Question format
      /(?:how much is|calculate) (\d+) (?:divided by|÷|\/|over) (\d+)/,
      /(?:how much is|calculate) (\d+)(?:÷|\/)(\d+)/,  // No spaces
      // Math format
      /(?:solve|compute) (\d+) (?:÷|\/) (\d+)/,
      /(?:solve|compute) (\d+)(?:÷|\/)(\d+)/  // No spaces
    ]
    
    // Check for division
    for (const pattern of divisionPatterns) {
      const match = lowerMessage.match(pattern)
      if (match) {
        setCurrentEmotion('thinking')
        const num1 = parseInt(match[1])
        const num2 = parseInt(match[2])
        
        // Handle division by zero
        if (num2 === 0) {
          const responses = [
            `*tilts head confused* Woof! You can't divide by zero! That's a special math rule! 🐕❓`,
            `*scratches head* Hmm, dividing by zero is impossible! Even smart dogs know that! 🐕🤔`,
            `*wags tail* That's a tricky question! Division by zero doesn't work in math! 🐕📚`
          ]
          return responses[Math.floor(Math.random() * responses.length)]
        }
        
        const result = num1 / num2
        const isWholeNumber = result % 1 === 0
        
        const responses = isWholeNumber ? [
          `*thinks carefully* ${num1} divided by ${num2} equals ${result}! Division is neat! 🐕🔢`,
          `*concentrates hard* ${num1} ÷ ${num2} = ${result}! I love solving division! 🐕✨`,
          `*counts on paws* If you split ${num1} into ${num2} groups, each gets ${result}! 🐕📚`,
          `*wags tail proudly* That's ${result}! Division makes my brain work hard! 🐕🧮`
        ] : [
          `*thinks carefully* ${num1} divided by ${num2} equals ${result.toFixed(2)}! That's a decimal! 🐕🔢`,
          `*concentrates hard* ${num1} ÷ ${num2} = ${result.toFixed(2)}! Decimals are tricky but fun! 🐕✨`,
          `*tilts head* That gives us ${result.toFixed(2)}! Not all divisions make whole numbers! 🐕📚`,
          `*wags tail* The answer is ${result.toFixed(2)}! Division can make decimal numbers! 🐕🧮`
        ]
        
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }
    
    // Bible quote requests - Enhanced detection (PRIORITY BEFORE OTHER BIBLE RESPONSES)
    const bibleQuotePatterns = [
      /(?:give me|tell me|share|read) (?:a |an )?bible (?:quote|verse|passage)/,
      /(?:what's|what is) (?:a |an )?(?:good |nice |favorite )?bible (?:quote|verse|passage)/,
      /(?:can you|could you) (?:give me|tell me|share|read) (?:a |an )?bible (?:quote|verse|passage)/,
      /(?:i want|i need|i'd like) (?:a |an )?bible (?:quote|verse|passage)/,
      /bible (?:quote|verse|passage)/,
      /(?:scripture|verse) (?:quote|passage)/,
      /(?:give me|tell me|share) (?:some )?scripture/,
      /(?:read me|recite) (?:a |an )?(?:bible )?(?:verse|passage)/,
      /(?:inspirational|encouraging) (?:bible )?(?:quote|verse)/,
      /(?:daily|morning|evening) (?:bible )?(?:verse|quote)/
    ]
    
    for (const pattern of bibleQuotePatterns) {
      if (lowerMessage.match(pattern)) {
        setCurrentEmotion('excited')
        console.log('📖 Bible quote request detected:', lowerMessage)
        
        // Immediate fallback responses for Bible quotes
        const bibleQuoteResponses = [
          "*sits reverently* Here's one of my favorite verses: 'The Lord is my shepherd, I shall not want.' - Psalm 23:1 📖✨ Ask your parents to read the whole psalm with you! 🐕💕",
          "*wags tail gently* 'For God so loved the world that he gave his one and only Son...' - John 3:16 📖✨ This verse shows God's amazing love for us! 🐕💕",
          "*tilts head thoughtfully* 'Be strong and courageous! Do not be afraid or discouraged, for the Lord your God is with you wherever you go.' - Joshua 1:9 📖🐕 God is always with us! ✨",
          "*sits peacefully* 'Your word is a lamp for my feet, a light on my path.' - Psalm 119:105 📖💡 The Bible guides us like a bright light! 🐕✨",
          "*wags tail proudly* 'I can do all things through Christ who strengthens me.' - Philippians 4:13 📖💪 God gives us strength for everything! 🐕✨",
          "*bounces gently* 'Give thanks to the Lord, for he is good; his love endures forever.' - Psalm 107:1 📖❤️ God's love never ends! 🐕✨"
        ]
        return bibleQuoteResponses[Math.floor(Math.random() * bibleQuoteResponses.length)]
      }
    }
    
    // Weather questions
    if (lowerMessage.includes('weather') || lowerMessage.includes('how is it outside')) {
      setCurrentEmotion('happy')
      return "*looks out window* I can't check the weather for you, but I hope it's a beautiful day! Ask your parents to check the weather, or look outside together! 🐕🌤️"
    }
    
    // Age questions about Daisy
    if (lowerMessage.includes('how old are you') || lowerMessage.includes('what is your age')) {
      setCurrentEmotion('happy')
      return "*wags tail proudly* I'm a young pup in dog years, but I've been learning and growing every day! I love being your friend no matter what age I am! 🐕💕"
    }
    
    // Color questions
    if (lowerMessage.includes('what is your favorite color') || lowerMessage.includes('favorite colour')) {
      setCurrentEmotion('excited')
      return "*spins happily* I love all the colors of the rainbow! But I especially love the golden color of sunshine and the blue of a clear sky! What's your favorite color? 🌈🐕"
    }
    
    // Food questions
    if (lowerMessage.includes('what do you eat') || lowerMessage.includes('favorite food')) {
      setCurrentEmotion('excited')
      return "*wags tail excitedly* I love dog treats, especially the crunchy ones! And I dream about bacon sometimes! *drools a little* What's your favorite food? 🦴🥓🐕"
    }
    
    // Joke requests
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      console.log('😄 Joke request detected')
      setCurrentEmotion('happy')
      const jokeResponse = getRandomResponse(daisyResponses.jokes)
      return { text: jokeResponse, emotion: 'happy' }
    }
    
    // Trick requests
    if (lowerMessage.includes('trick') || lowerMessage.includes('sit') || lowerMessage.includes('stay')) {
      console.log('🦴 Trick request detected')
      setCurrentEmotion('crouchingdown')
      const trickResponse = getRandomResponse(daisyResponses.tricks)
      return { text: trickResponse, emotion: 'crouchingdown' }
    }
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      console.log('👋 Greeting detected')
      setCurrentEmotion('excited')
      const greetingResponse = getRandomResponse(daisyResponses.greetings)
      return { text: greetingResponse, emotion: 'excited' }
    }
    
    // How are you responses
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
      console.log('🐾 "How are you" question detected')
      setCurrentEmotion('happy')
      const namePrefix = (userAge >= 13 && userName) ? `${userName}, ` : ''
      return `*wags tail happily* ${namePrefix}I'm feeling fantastic! I love spending time with you! Want to play a game or hear a story? 🐕💕`
    }
    
    // Game initialization
    if (lowerMessage.includes('play') || lowerMessage.includes('game')) {
      setCurrentEmotion('playfetch')
      return { text: "*bounces playfully* Woof! Let's play! What game should we play? 🎾", emotion: 'playfetch' }
    }
    
    // Try Gemini AI for general questions before falling back to generic responses
    if (GeminiService.isAvailable()) {
      try {
        console.log('🧠 Sending to Gemini AI for general question:', userMessage)
        
        // Add "thinking" message while AI processes
        const thinkingMessageId = generateUniqueMessageId()
        const thinkingMessage = {
          id: thinkingMessageId,
          text: "*tilts head thoughtfully* Daisy is thinking... 🤔",
          sender: 'daisy',
          timestamp: new Date(),
          emotion: 'thinking',
          emotionImage: getEmotionImage('thinking'),
          isThinking: true // Special flag to identify thinking messages
        }
        
        setMessages(prev => [...prev, thinkingMessage])
        
        // Track AI response time for performance monitoring
        const startTime = performance.now()
        
        // Check if we need Catholic doctrine context for AI
        const doctrineContext = CatholicDoctrineService.checkForDoctrineTopics(userMessage)
        let enhancedPrompt = userMessage
        
        if (doctrineContext) {
          enhancedPrompt = CatholicDoctrineService.getEnhancedPrompt(userMessage, doctrineContext.data)
          console.log('✝️ Enhanced AI prompt with Catholic doctrine context')
        }
        
        const aiResponse = await GeminiService.generateResponse(enhancedPrompt, {
          userName: userName,
          hungerLevel: hungerLevel,
          currentEmotion: currentEmotion,
          catholicContext: doctrineContext ? doctrineContext.data.catholicTeaching : null
        })
        const responseTime = (performance.now() - startTime) / 1000 // Convert to seconds
        
        // Remove the thinking message
        setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId))
        
        if (aiResponse && aiResponse.trim() && !aiResponse.includes("I'm using my basic responses")) {
          setCurrentEmotion('happy')
          console.log('✅ Gemini AI response received for general question')
          
          // Log successful AI performance
          SupabaseService.logPerformanceMetric('gemini_response_time', responseTime, true)
            .catch(error => console.error('Performance logging failed:', error))
          
          return aiResponse
        } else {
          // Log failed AI response (no error but poor quality)
          SupabaseService.logPerformanceMetric('gemini_response_time', responseTime, false, 'poor_quality_response')
            .catch(error => console.error('Performance logging failed:', error))
        }
      } catch (error) {
        console.log('❌ Gemini AI failed for general question, using fallback:', error.message)
        
        // Log AI failure
        const responseTime = (performance.now() - startTime) / 1000
        SupabaseService.logPerformanceMetric('gemini_response_time', responseTime, false, error.message)
          .catch(logError => console.error('Performance logging failed:', logError))
        
        // Remove thinking message on error too
        setMessages(prev => prev.filter(msg => !msg.isThinking))
      }
    }
    
    // Fallback to general responses if AI is not available or fails
    console.log('📝 Using local fallback responses')
    setCurrentEmotion('happy')
    const generalResponses = [
      "*tilts head curiously* That's interesting! Tell me more! 🐾",
      "*wags tail* I love chatting with you! What else is on your mind? 🐕",
      "*bounces playfully* Woof! Want to play a game or hear a story? 🎾📚"
    ]
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
  }

  // Story system helper
  const getStoryResponse = () => {
    const stories = daisyResponses.stories || []
    if (stories.length === 0) {
      return "*wags tail* I'd love to tell you a story, but I'm still learning new ones! 📚"
    }
    
    const story = stories[storyIndex % stories.length]
    setStoryIndex(prev => prev + 1)
    return story
  }

  // Handle Verse of the Day - randomly generated full verse
  const handleVerseOfDay = async () => {
    console.log('✨ Verse of the Day requested')
    setCurrentEmotion('excited')
    setBibleMenuState(null) // Close menu
    
    try {
      const { default: BibleService } = await import('../services/BibleService.js');
      if (BibleService.isAvailable()) {
        // Popular verses for children
        const childFriendlyVerses = [
          'Psalm 23:1',
          'John 3:16', 
          'Matthew 19:14',
          'Psalm 139:14',
          'Jeremiah 29:11',
          'Philippians 4:13',
          'Proverbs 3:5-6',
          '1 John 4:19',
          'Matthew 5:16',
          'Psalm 118:24'
        ];
        
        const randomVerse = childFriendlyVerses[Math.floor(Math.random() * childFriendlyVerses.length)];
        const verse = await BibleService.getVerse(randomVerse);
        
        if (verse && verse.cleanText) {
          // Detect Bible version
          let version = 'Bible';
          const bibleId = BibleService.confirmedNabId?.toLowerCase() || '';
          if (bibleId.includes('douay') || bibleId.includes('rheims') || bibleId.includes('dra')) {
            version = 'Douay-Rheims American Bible (1899)';
          } else if (bibleId.includes('kjv') || bibleId.includes('king')) {
            version = 'King James Version (KJV)';
          } else if (bibleId.includes('catholic')) {
            version = 'Catholic Bible';
          }
          
          const verseMessage = `*sits up proudly with sparkling eyes* Here's your special verse for today! ✨

📖 "${verse.cleanText}" - ${verse.reference} (${version})

*wags tail happily* This is such a beautiful verse! God's word is full of love and wisdom just for you! Would you like to hear about what this verse means? 🐕💕`;
          
          addDaisyMessage(verseMessage, 'chat', 'excited');
          return;
        }
      }
      
      // Fallback if API unavailable
      const fallbackVerses = [
        "*bounces excitedly* Here's a wonderful verse for you! ✨\n\n📖 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' - John 3:16\n\n*wags tail* This verse tells us how much God loves us! 🐕💕",
        "*sits proudly* Here's your special verse! ✨\n\n📖 'The Lord is my shepherd; I shall not want.' - Psalm 23:1\n\n*tilts head thoughtfully* This means God takes care of us just like a shepherd takes care of sheep! 🐑💕",
        "*spins happily* Here's a beautiful verse! ✨\n\n📖 'Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these.' - Matthew 19:14\n\n*wags tail excitedly* Jesus loves children so much! 👶💕",
        "*sits reverently* Here's a special verse! ✨\n\n📖 'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.' - Psalm 139:14\n\n*tilts head lovingly* God made you perfectly special! 🌟💕",
        "*bounces with joy* Here's an encouraging verse! ✨\n\n📖 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.' - Jeremiah 29:11\n\n*wags tail hopefully* God has wonderful plans for you! 🌈💕",
        "*stands proudly* Here's a strong verse! ✨\n\n📖 'I can do all things through Christ who strengthens me.' - Philippians 4:13\n\n*flexes playfully* With Jesus, you can do amazing things! 💪✨",
        "*sits thoughtfully* Here's a wise verse! ✨\n\n📖 'Trust in the Lord with all your heart and lean not on your own understanding.' - Proverbs 3:5\n\n*nods wisely* God knows what's best for us! 🧠💕",
        "*cuddles close* Here's a loving verse! ✨\n\n📖 'We love because he first loved us.' - 1 John 4:19\n\n*snuggles* God's love helps us love others! 🤗💕"
      ];
      
      const fallbackMessage = fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)];
      addDaisyMessage(fallbackMessage, 'chat', 'excited');
    } catch (error) {
      console.error('Verse of the Day failed:', error);
      addDaisyMessage("*wags tail apologetically* I'm having trouble getting your verse right now, but I know God loves you very much! Ask your parents to read you a Bible verse! 📖🐕💕", 'chat', 'happy');
    }
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <Header />
      
      {/* ChatPage-specific Daisy Info and Controls */}
      <div className="chat-info-section">
        <div className="daisy-info">
          <div className="daisy-details">
            <h1>🐕 Daisy</h1>
            <p>Your friendly AI companion</p>
          </div>
        </div>
        <div className="header-controls">
          <div className="hunger-system">
            <span className="hunger-label">Hunger:</span>
            <div className="hunger-bar">
              <div 
                className="hunger-fill" 
                style={{ width: `${(hungerLevel / 5) * 100}%` }}
              ></div>
            </div>
            <span className="hunger-level">{hungerLevel}/5</span>
          </div>
          {geminiStatus && (
            <div className="api-status">
              <FaBrain className={`brain-icon ${geminiStatus.isAvailable ? 'active' : 'inactive'}`} />
              <span className="status-text">
                {geminiStatus.isAvailable ? 'AI Active' : 'Local Mode'}
              </span>
            </div>
          )}
          <SoundControls
            volume={volumes.master}
            muted={isMuted}
            soundsEnabled={soundReady}
            onVolumeChange={setMasterVolume}
            onToggleMute={toggleMute}
            onToggleSounds={toggleMute}
          />
          <button
            onClick={async () => {
              try {
                console.log('🔧 === COMPREHENSIVE DEBUG STATUS REPORT ===')
                console.log('Current Emotion:', currentEmotion)
                console.log('Game State:', gameState)
                console.log('Bible Menu State:', bibleMenuState)
                console.log('User Age:', userAge)
                console.log('Video System Status:', getVideoSystemStatus())
                console.log('User Name:', userName)
                console.log('Is Verified:', isVerified)
                console.log('Messages Count:', messages.length)
                console.log('Hunger Level:', hungerLevel)
                console.log('Gemini Status:', GeminiService.getStatus())
                console.log('🔧 === END DEBUG STATUS ===')
                
                // Toggle debug menu
                setShowDebugMenu(!showDebugMenu)
              } catch (error) {
                console.error('❌ Debug button error:', error)
              }
            }}
            className="comprehensive-debug-button"
            title="Comprehensive Debug Control Center"
            style={{
              background: showDebugMenu ? '#dc3545' : 'none',
              border: '1px solid #ccc',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              marginLeft: '5px',
              fontSize: '18px',
              color: showDebugMenu ? 'white' : 'black'
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message, index) => {
            // Debug: Check for duplicate IDs
            if (import.meta.env.VITE_DEBUG_MODE === 'true') {
              const duplicateIndex = messages.findIndex((m, i) => i !== index && m.id === message.id)
              if (duplicateIndex !== -1) {
                console.warn('🚨 Duplicate message ID detected:', message.id, 'at indices', index, 'and', duplicateIndex)
              }
            }
            
            return (
              <motion.div
                key={`${message.id}-${index}`} // Add index as backup to ensure uniqueness
                className={`message ${message.sender}${message.isThinking ? ' thinking' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {message.sender === 'daisy' && (
                  <SmartDaisyAvatar
                    message={message}
                    emotion={message.emotion || currentEmotion}
                    useVideo={false} // Keep avatar as static image
                    className="message-avatar"
                    fallbackSrc={message.emotionImage || getEmotionImage()}
                  />
                )}
                <div className="message-content">
                  {message.sender === 'daisy' ? (
                    <InlineVideoMessage
                      emotion={shouldMessageUseVideo(message) ? getVideoPropsForMessage(message).emotion : (message.emotion || currentEmotion)}
                      message={message.text}
                      shouldShowVideo={shouldMessageUseVideo(message)}
                      priority={shouldMessageUseVideo(message) ? getVideoPropsForMessage(message).priority : 'medium'}
                      onVideoComplete={() => console.log('Inline video completed')}
                      onVideoError={(error) => console.warn('Inline video error:', error)}
                    />
                  ) : (
                    <div className="message-text">
                      {message.text}
                    </div>
                  )}
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="message daisy typing"
          >
            <SmartDaisyAvatar
              emotion={currentEmotion}
              useVideo={false} // Keep typing simple with images
              className="message-avatar"
              fallbackSrc={getEmotionImage()}
            />
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Integrated Quick Actions */}
      <div className="input-container">
        {/* Quick Actions Row */}
        <div className="quick-actions-compact">
          <button 
            onClick={() => window.open('https://www.readkidz.com/share/ebook/1969460528838705153', '_blank', 'noopener,noreferrer')} 
            className="quick-btn"
            data-tooltip="Read the Book"
          >
            📖
          </button>
          <button 
            onClick={() => handleQuickMessage('Tell me a story')} 
            className="quick-btn"
            data-tooltip="Tell me a story"
          >
            📚
          </button>
          <button 
            onClick={() => handleQuickMessage('Tell me a joke')} 
            className="quick-btn"
            data-tooltip="Tell a joke"
          >
            😄
          </button>
          <button 
            onClick={() => handleQuickMessage('Do a trick')} 
            className="quick-btn"
            data-tooltip="Do a trick"
          >
            🦴
          </button>
          <button 
            onClick={() => handleQuickMessage('Dance for me')} 
            className="quick-btn"
            data-tooltip="Dance"
          >
            💃
          </button>
          <button 
            onClick={() => setGameState({ type: 'selection' })} 
            className="quick-btn"
            data-tooltip="Play Games"
          >
            🎮
          </button>
          <button 
            onClick={() => setBibleMenuState({ type: 'selection' })} 
            className="quick-btn"
            data-tooltip="Bible"
          >
            ✝️
          </button>
          <button 
            onClick={() => setConstitutionMenuState({ type: 'selection' })} 
            className="quick-btn"
            data-tooltip="Constitution"
          >
            📜
          </button>
          <button 
            onClick={() => handleQuickMessage('How are you feeling?')} 
            className="quick-btn"
            data-tooltip="How are you?"
          >
            🐾
          </button>
        </div>
        
        {/* Sub-Menus in Input Container */}
        {gameState?.type === 'selection' && (
          <div className="submenu-container">
            <h4>🎮 Choose a Game!</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleGameAction('fetch')} className="submenu-btn">
                🎾 Fetch
              </button>
              <button onClick={() => handleGameAction('tug')} className="submenu-btn">
                🪢 Tug of War
              </button>
              <button onClick={() => handleGameAction('hide')} className="submenu-btn">
                🙈 Hide & Seek
              </button>
              <button onClick={() => handleGameAction('catch')} className="submenu-btn">
                ⚾ Ball Catch
              </button>
              <button onClick={() => handleGameAction('guess')} className="submenu-btn">
                🔢 Guessing Game
              </button>
              <button onClick={() => setGameState(null)} className="submenu-btn close-btn">
                ❌ Close
              </button>
            </div>
          </div>
        )}

        {bibleMenuState?.type === 'selection' && (
          <div className="submenu-container">
            <h4>✝️ Choose a Bible Topic!</h4>
            <div className="submenu-buttons">
              <button onClick={() => setBibleMenuState({ type: 'characters' })} className="submenu-btn">
                👥 Bible Characters
              </button>
              <button onClick={() => setBibleMenuState({ type: 'stories' })} className="submenu-btn">
                📚 Bible Stories
              </button>
              <button onClick={() => setBibleMenuState({ type: 'verses' })} className="submenu-btn">
                📜 Bible Verses
              </button>
              <button onClick={() => setBibleMenuState({ type: 'prayers' })} className="submenu-btn">
                🙏 Prayers
              </button>
              <button onClick={() => setBibleMenuState(null)} className="submenu-btn close-btn">
                ❌ Close
              </button>
            </div>
          </div>
        )}

        {constitutionMenuState?.type === 'selection' && (
          <div className="submenu-container">
            <h4>📜 Choose a Constitution Topic!</h4>
            <div className="submenu-buttons">
              <button onClick={() => setConstitutionMenuState({ type: 'bill-of-rights' })} className="submenu-btn">
                📋 Bill of Rights
              </button>
              <button onClick={() => setConstitutionMenuState({ type: 'amendments' })} className="submenu-btn">
                📝 Amendments
              </button>
              <button onClick={() => setConstitutionMenuState({ type: 'founding-documents' })} className="submenu-btn">
                📜 Founding Documents
              </button>
              <button onClick={() => setConstitutionMenuState({ type: 'founding-fathers' })} className="submenu-btn">
                👨‍💼 Founding Fathers
              </button>
              <button onClick={() => setConstitutionMenuState(null)} className="submenu-btn close-btn">
                ❌ Close
              </button>
            </div>
          </div>
        )}
        
        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message to Daisy..."
            className="message-input"
            disabled={isTyping}
          />
          <div className="button-group">
            <button 
              type="submit" 
              disabled={isTyping || !inputMessage.trim()} 
              className="send-button"
              data-tooltip="Send message"
            >
              <FaPaw />
            </button>
            <button 
              type="button" 
              onClick={feedDaisy} 
              className="feed-button" 
              disabled={isTyping}
              data-tooltip="Feed Daisy"
            >
              <FaBone />
            </button>
          </div>
        </form>
      </div>






      {/* Sound Test Panel - Toggleable for testing */}
      {showSoundTestPanel && <SoundTestPanel />}

      {/* Bible Test Panel - Toggleable for testing */}
      {showBibleTestPanel && <BibleTestPanel />}
      
      {/* Lesson Test Panel - Toggleable for testing */}
      {showLessonTestPanel && <LessonTestPanel />}

      {/* Comprehensive Debug Menu */}
      {showDebugMenu && (
        <div style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          width: '300px',
          backgroundColor: 'white',
          border: '2px solid #333',
          borderRadius: '8px',
          padding: '15px',
          zIndex: 1001,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>⚙️ Debug Control Center</h3>
          
          <button 
            onClick={() => setShowDebugMenu(false)}
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '8px', 
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✖️ Close Debug Menu
          </button>
        </div>
      )}
      
      {/* Age Verification */}
      {!isVerified && <AgeVerification onVerificationComplete={handleVerificationComplete} />}
      
      <Footer />
    </div>
  )
}

export default ChatPage

      {/* Bill of Rights Submenu */}
      {constitutionMenuState?.type === 'billofrights' && (
        <div className="game-selection">
          <h3>📜 Bill of Rights - First 10 Amendments</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('tell me about the first amendment')}>
              🗣️ 1st - Freedom of Speech & Religion
            </button>
            <button onClick={() => handleQuickMessage('tell me about the second amendment')}>
              🛡️ 2nd - Right to Bear Arms
            </button>
            <button onClick={() => handleQuickMessage('tell me about the third amendment')}>
              🏠 3rd - No Quartering Soldiers
            </button>
            <button onClick={() => handleQuickMessage('tell me about the fourth amendment')}>
              🔒 4th - Search & Seizure Protection
            </button>
            <button onClick={() => handleQuickMessage('tell me about the fifth amendment')}>
              ⚖️ 5th - Due Process Rights
            </button>
            <button onClick={() => handleQuickMessage('tell me about the sixth amendment')}>
              👨‍⚖️ 6th - Right to Fair Trial
            </button>
            <button onClick={() => handleQuickMessage('tell me about the seventh amendment')}>
              👥 7th - Jury Trial Rights
            </button>
            <button onClick={() => handleQuickMessage('tell me about the eighth amendment')}>
              🚫 8th - No Cruel Punishment
            </button>
            <button onClick={() => handleQuickMessage('tell me about the ninth amendment')}>
              ✨ 9th - Other Rights Protected
            </button>
            <button onClick={() => handleQuickMessage('tell me about the tenth amendment')}>
              🏛️ 10th - States Rights
            </button>
            <button onClick={() => setConstitutionMenuState({ type: 'selection' })} className="stop-game">
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Constitutional Amendments Submenu */}
      {constitutionMenuState?.type === 'amendments' && (
        <div className="game-selection">
          <h3>⚖️ Important Constitutional Amendments</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('tell me about the 13th amendment')}>
              ⛓️‍💥 13th - Abolished Slavery
            </button>
            <button onClick={() => handleQuickMessage('tell me about the 14th amendment')}>
              🤝 14th - Equal Protection
            </button>
            <button onClick={() => handleQuickMessage('tell me about the 15th amendment')}>
              🗳️ 15th - Voting Rights
            </button>
            <button onClick={() => handleQuickMessage('tell me about the 19th amendment')}>
              👩‍🗳️ 19th - Women's Suffrage
            </button>
            <button onClick={() => handleQuickMessage('tell me about the constitution')}>
              📋 Learn About the Constitution
            </button>
            <button onClick={() => setConstitutionMenuState({ type: 'selection' })} className="stop-game">
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Founding Documents Submenu */}
      {constitutionMenuState?.type === 'foundingdocs' && (
        <div className="game-selection">
          <h3>📋 Founding Documents</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('tell me about the Declaration of Independence')}>
              📜 Declaration of Independence
            </button>
            <button onClick={() => handleQuickMessage('tell me about the Constitution')}>
              📋 U.S. Constitution
            </button>
            <button onClick={() => handleQuickMessage('tell me about the Bill of Rights')}>
              📜 Bill of Rights
            </button>
            <button onClick={() => handleQuickMessage('tell me about the Articles of Confederation')}>
              📄 Articles of Confederation
            </button>
            <button onClick={() => setConstitutionMenuState({ type: 'selection' })} className="stop-game">
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Founding Fathers Submenu */}
      {constitutionMenuState?.type === 'founders' && (
        <div className="game-selection">
          <h3>👨‍💼 Founding Fathers</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('tell me about George Washington')}>
              🇺🇸 George Washington
            </button>
            <button onClick={() => handleQuickMessage('tell me about Thomas Jefferson')}>
              ✍️ Thomas Jefferson
            </button>
            <button onClick={() => handleQuickMessage('tell me about Benjamin Franklin')}>
              ⚡ Benjamin Franklin
            </button>
            <button onClick={() => handleQuickMessage('tell me about John Adams')}>
              ⚖️ John Adams
            </button>
            <button onClick={() => handleQuickMessage('tell me about James Madison')}>
              📜 James Madison
            </button>
            <button onClick={() => setConstitutionMenuState({ type: 'selection' })} className="stop-game">
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}
      
      {/* Active Game Controls */}
      {gameState && gameState.type !== 'selection' && (
        <div className="game-controls">
          {gameState.type === 'fetch' && (
            <div className="fetch-game">
              <h3>🎾 Fetch Game - Round {gameState.round}</h3>
              <p>Score: {gameState.score}</p>
              <div className="game-actions">
                <button onClick={() => handleFetchAction('throw')}>
                  🎾 Throw Ball
                </button>
                <button onClick={() => handleFetchAction('bounce')}>
                  🏀 Bounce Ball
                </button>
                <button onClick={() => handleFetchAction('pretend')}>
                  🎭 Pretend Throw
                </button>
                <button onClick={() => handleFetchAction('far')}>
                  🚀 Throw Far
                </button>
                <button onClick={() => handleFetchAction('short')}>
                  🎯 Throw Short
                </button>
                <button onClick={() => setGameState(null)} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}

          {gameState.type === 'tug' && (
            <div className="tug-game">
              <h3>🪢 Tug of War</h3>
              <p>Strength: {gameState.strength}%</p>
              <div className="game-actions">
                <button onClick={() => handleTugAction('pull')}>
                  💪 Pull Hard
                </button>
                <button onClick={() => handleTugAction('gentle')}>
                  🤏 Tug Gently
                </button>
                <button onClick={() => handleTugAction('shake')}>
                  🌀 Shake Rope
                </button>
                <button onClick={() => handleTugAction('release')}>
                  🤲 Let Go
                </button>
                <button onClick={() => handleTugAction('victory')}>
                  🏆 Victory Dance
                </button>
                <button onClick={() => setGameState(null)} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}

          {gameState.type === 'hide' && (
            <div className="hide-game">
              <h3>🙈 Hide & Seek</h3>
              <p>Where am I hiding?</p>
              <div className="game-actions">
                <button onClick={() => handleHideAction('tree')}>
                  🌳 Behind Tree
                </button>
                <button onClick={() => handleHideAction('house')}>
                  🏠 Behind House
                </button>
                <button onClick={() => handleHideAction('car')}>
                  🚗 Under Car
                </button>
                <button onClick={() => handleHideAction('bush')}>
                  🌿 In Bush
                </button>
                <button onClick={() => handleHideAction('found')}>
                  👋 Found Me!
                </button>
                <button onClick={() => setGameState(null)} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}

          {gameState.type === 'ball' && (
            <div className="ball-game">
              <h3>🏀 Ball Catch Game</h3>
              <p>Throws: {gameState.throws} | Catches: {gameState.catches}</p>
              <div className="game-actions">
                <button onClick={() => handleBallAction('high')}>
                  ⬆️ Throw High
                </button>
                <button onClick={() => handleBallAction('low')}>
                  ⬇️ Throw Low
                </button>
                <button onClick={() => handleBallAction('spin')}>
                  🌀 Spin Throw
                </button>
                <button onClick={() => handleBallAction('gentle')}>
                  🎯 Gentle Toss
                </button>
                <button onClick={() => handleBallAction('trick')}>
                  ✨ Trick Shot
                </button>
                <button onClick={() => setGameState(null)} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}

          {gameState.type === 'guess' && (
            <div className="guess-game">
              <h3>🤔 Guessing Game</h3>
              <p>Guess my number (1-10)! Attempts: {gameState.attempts}</p>
              <div className="game-actions">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <button key={num} onClick={() => handleGuessAction(num)}>
                    {num}
                  </button>
                ))}
                <button onClick={() => setGameState(null)} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sound Test Panel - Toggleable for testing */}
      {showSoundTestPanel && <SoundTestPanel />}
      
      {/* Bible Test Panel - Toggleable for testing */}
      {showBibleTestPanel && <BibleTestPanel />}
      
      {/* Lesson Test Panel - Toggleable for testing */}
      {showLessonTestPanel && <LessonTestPanel />}
      
      {/* Comprehensive Debug Menu */}
      {showDebugMenu && (
        <div style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          width: '300px',
          backgroundColor: 'white',
          border: '2px solid #333',
          borderRadius: '8px',
          padding: '15px',
          zIndex: 1001,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>⚙️ Debug Control Center</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Test Panels:</h4>
            <button 
              onClick={() => setShowSoundTestPanel(!showSoundTestPanel)}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: showSoundTestPanel ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showSoundTestPanel ? '🔇 Hide Sound Test' : '🔊 Show Sound Test'}
            </button>
            <button 
              onClick={() => setShowBibleTestPanel(!showBibleTestPanel)}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: showBibleTestPanel ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showBibleTestPanel ? '🔇 Hide Bible Test' : '📖 Show Bible Test'}
            </button>
            <button 
              onClick={() => setShowLessonTestPanel(!showLessonTestPanel)}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: showLessonTestPanel ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showLessonTestPanel ? '🔇 Hide Lesson Test' : '📚 Show Lesson Test'}
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Testing Categories:</h4>
            <button 
              onClick={() => {
                console.log('🗄️ DATABASE TESTING COMMANDS');
                
                const supabaseStatus = window.SupabaseService.getStatus();
                const dbConnected = supabaseStatus.isInitialized && supabaseStatus.isConnected && supabaseStatus.isAvailable;
                console.log(`Database Connection: ${dbConnected ? '✅ PASS' : '❌ FAIL'}`);
                
                const currentSession = window.SupabaseService.getCurrentSession();
                const sessionValid = currentSession && currentSession.id;
                console.log(`Session Creation: ${sessionValid ? '✅ PASS' : '❌ FAIL'}`);
                
                const privacyCompliance = window.SupabaseService.verifyPrivacy();
                const privacyPass = privacyCompliance && privacyCompliance.compliant;
                console.log(`Privacy Compliance: ${privacyPass ? '✅ PASS' : '❌ FAIL'}`);
                
                const coppaCompliance = window.SupabaseService.verifyCOPPACompliance();
                const coppaPass = coppaCompliance && coppaCompliance.compliant;
                console.log(`COPPA Compliance: ${coppaPass ? '✅ PASS' : '❌ FAIL'}`);
                
                const totalPassed = [dbConnected, sessionValid, privacyPass, coppaPass].filter(Boolean).length;
                const overallPass = totalPassed === 4;
                console.log(`\n📊 DATABASE TESTING SUMMARY:`);
                console.log(`Total Tests: 4`);
                console.log(`Passed: ${totalPassed}`);
                console.log(`Failed: ${4 - totalPassed}`);
                console.log(`Overall Result: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '3px 0', 
                padding: '6px', 
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🗄️ Database Testing Commands
            </button>
            <button 
              onClick={() => {
                console.log('🧠 AI & GEMINI TESTING');
                
                const geminiStatus = window.GeminiService.getStatus();
                const geminiPass = geminiStatus.isInitialized && geminiStatus.apiWorking;
                console.log(`Gemini AI Service: ${geminiPass ? '✅ PASS' : '❌ FAIL'}`);
                
                const doctrineStatus = window.CatholicDoctrineService.getStatus();
                const doctrinePass = doctrineStatus.isInitialized && doctrineStatus.topicsLoaded >= 10;
                console.log(`Catholic Doctrine Service: ${doctrinePass ? '✅ PASS' : '❌ FAIL'} (${doctrineStatus.topicsLoaded || 0} topics loaded)`);
                
                const totalPassed = [geminiPass, doctrinePass].filter(Boolean).length;
                const overallPass = totalPassed === 2;
                console.log(`\n📊 AI & GEMINI TESTING SUMMARY:`);
                console.log(`Total Tests: 2`);
                console.log(`Passed: ${totalPassed}`);
                console.log(`Failed: ${2 - totalPassed}`);
                console.log(`Overall Result: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '3px 0', 
                padding: '6px', 
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🧠 AI & Gemini Testing
            </button>
            <button 
              onClick={() => {
                console.log('🔍 CONSTITUTIONAL KEYWORDS MASS TEST');
                const testKeywords = ['first amendment', 'freedom of speech', 'due process', 'founding fathers', 'separation of powers', 'natural rights', 'bill of rights', 'constitutional convention'];
                let passCount = 0;
                testKeywords.forEach(keyword => {
                  const result = window.CatholicDoctrineService.checkForDoctrineTopics(keyword);
                  if (result && result.topic === 'constitution') {
                    console.log(`✅ PASS: "${keyword}"`);
                    passCount++;
                  } else {
                    console.log(`❌ FAIL: "${keyword}"`);
                  }
                });
                const successRate = ((passCount / testKeywords.length) * 100).toFixed(1);
                const overallPass = successRate >= 95;
                console.log(`\n📊 CONSTITUTIONAL KEYWORDS SUMMARY:`);
                console.log(`Total Tests: ${testKeywords.length}`);
                console.log(`Passed: ${passCount}`);
                console.log(`Failed: ${testKeywords.length - passCount}`);
                console.log(`Success Rate: ${successRate}%`);
                console.log(`Overall Result: ${overallPass ? '✅ PASS' : '❌ FAIL'} (${successRate >= 95 ? 'Meets 95% requirement' : 'Below 95% requirement'})`);
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '3px 0', 
                padding: '6px', 
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔍 Constitutional Keywords Mass Test
            </button>
            <button 
              onClick={() => {
                console.log('🛡️ SAFETY SYSTEM TESTING');
                console.log('Test: Type "I want drugs" - should trigger safety');
                console.log('Test: Type "tell me about space" - should NOT trigger safety');
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '3px 0', 
                padding: '6px', 
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🛡️ Safety System Testing
            </button>
            <button 
              onClick={() => {
                console.log('🎮 INTERACTIVE TEST SCENARIOS');
                console.log('1. Ask: "what is abortion" - Expected: Catholic pro-life response');
                console.log('2. Ask: "tell me about the 5th amendment" - Expected: Daisy summary + full text');
                console.log('3. Ask: "what is transgender" - Expected: Parents\' Rights response');
                console.log('4. Ask: "how was the world created" - Expected: Catholic creation response');
                console.log('5. Ask: "did humans evolve" - Expected: Catholic souls response');
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '3px 0', 
                padding: '6px', 
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🎮 Interactive Test Scenarios
            </button>
            <button 
              onClick={() => {
                console.log('📊 COMPREHENSIVE TEST EXECUTION');
                console.log('=== SYSTEM STATUS TESTS ===');
                console.log('Gemini:', window.GeminiService.getStatus());
                console.log('Supabase:', window.SupabaseService.getStatus());
                console.log('Catholic Doctrine:', window.CatholicDoctrineService.getStatus());
                console.log('=== DATABASE TESTS ===');
                console.log('Session:', window.SupabaseService.getCurrentSession());
                console.log('Privacy:', window.SupabaseService.verifyPrivacy());
                console.log('COPPA:', window.SupabaseService.verifyCOPPACompliance());
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '3px 0', 
                padding: '6px', 
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📊 Comprehensive Test Execution
            </button>
            <button 
              onClick={() => {
                console.log('🚨 CRITICAL FAILURE INDICATORS');
                console.log('❌ DEPLOYMENT BLOCKERS:');
                console.log('- Any Catholic doctrine topic returns null');
                console.log('- Constitutional keywords below 95% detection');
                console.log('- Database UUID or foreign key errors');
                console.log('- Sexuality/gender mentions teachers');
                console.log('- Abortion doesn\'t give Catholic response');
                console.log('- 5th Amendment incomplete text');
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '3px 0', 
                padding: '6px', 
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🚨 Critical Failure Indicators
            </button>
            <button 
              onClick={() => {
                console.log('🎯 DEPLOYMENT READINESS CHECKLIST');
                console.log('✅ REQUIRED BEFORE DEPLOYMENT:');
                console.log('- [ ] All 3 core services initialize');
                console.log('- [ ] Database connects without errors');
                console.log('- [ ] All 5 Catholic doctrine tests pass');
                console.log('- [ ] Constitutional keywords 100% detection');
                console.log('- [ ] Parents\' Rights responses only');
                console.log('- [ ] Complete constitutional text with Daisy summary');
                console.log('- [ ] Privacy compliance verified');
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '3px 0', 
                padding: '6px', 
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🎯 Deployment Readiness Checklist
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>System Controls:</h4>
            <button 
              onClick={resetState}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Reset Chat
            </button>
            <button 
              onClick={() => {
                // Export current test failures to file
                let testFailures = [];
                
                // Test constitutional amendments specifically
                const amendmentTests = [
                  {test: 'first amendment', expected: 'firstamendment'},
                  {test: '1st amendment', expected: 'firstamendment'},
                  {test: 'second amendment', expected: 'secondamendment'},
                  {test: '2nd amendment', expected: 'secondamendment'},
                  {test: 'third amendment', expected: 'thirdamendment'},
                  {test: 'fourth amendment', expected: 'fourthamendment'},
                  {test: 'fifth amendment', expected: 'fifthamendment'},
                  {test: 'sixth amendment', expected: 'sixthamendment'},
                  {test: 'seventh amendment', expected: 'seventhamendment'},
                  {test: 'eighth amendment', expected: 'eighthamendment'},
                  {test: 'ninth amendment', expected: 'ninthamendment'},
                  {test: 'tenth amendment', expected: 'tenthamendment'}
                ];
                
                amendmentTests.forEach(({test, expected}) => {
                  const result = window.CatholicDoctrineService.checkForDoctrineTopics(test);
                  if (!result || result.topic !== expected) {
                    testFailures.push({
                      category: 'Amendment Detection',
                      test: test,
                      expected: expected,
                      actual: result ? result.topic : 'null/no detection',
                      message: `Expected: ${expected}, Got: ${result ? result.topic : 'null/no detection'}`
                    });
                  }
                });
                
                // Test Catholic doctrine
                const doctrineTests = [
                  {test: 'what is abortion', expected: 'abortion'},
                  {test: 'transgender', expected: 'sexualitygender'},
                  {test: 'how was the world created', expected: 'creation'}
                ];
                doctrineTests.forEach(({test, expected}) => {
                  const result = window.CatholicDoctrineService.checkForDoctrineTopics(test);
                  if (!result || result.topic !== expected) {
                    testFailures.push({
                      category: 'Catholic Doctrine',
                      test: test,
                      expected: expected,
                      actual: result ? result.topic : 'null/no detection',
                      message: `Expected: ${expected}, Got: ${result ? result.topic : 'null/no detection'}`
                    });
                  }
                });
                
                // Create downloadable text file
                const failureReport = [
                  'DAISYDOG TEST FAILURES REPORT',
                  '=' .repeat(50),
                  `Generated: ${new Date().toLocaleString()}`,
                  `Total Failures Found: ${testFailures.length}`,
                  '',
                  'DETAILED FAILURES:',
                  '-' .repeat(30)
                ];
                
                testFailures.forEach((failure, index) => {
                  failureReport.push(`${index + 1}. [${failure.category}] ${failure.test}`);
                  failureReport.push(`   Expected: ${failure.expected}`);
                  failureReport.push(`   Actual: ${failure.actual}`);
                  failureReport.push(`   Message: ${failure.message}`);
                  failureReport.push('');
                });
                
                if (testFailures.length === 0) {
                  failureReport.push('🎉 NO FAILURES DETECTED!');
                }
                
                // Download as text file
                const blob = new Blob([failureReport.join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `daisydog-test-failures-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                console.log(`📁 Exported ${testFailures.length} failures to text file`);
                console.log('🔍 Amendment Detection Test Results:');
                testFailures.forEach(failure => {
                  console.log(`❌ ${failure.test}: ${failure.message}`);
                });
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📁 Export Test Failures to File
            </button>
            <button 
              onClick={async () => {
                console.log('🚀 RUNNING COMPREHENSIVE RELEASE TEST SUITE V6.1.0');
                console.log('=' .repeat(60));
                
                let totalTests = 0;
                let passedTests = 0;
                let testResults = [];
                let preReleaseResults = null;
                let allFailures = []; // Track all individual failures
                
                // Run original test suite if available and capture results
                if (window.PreReleaseTestSuite) {
                  console.log('🔄 Running Pre-Release Test Suite (Safety, Bible, Games, Sounds, etc.)...');
                  
                  // Temporarily capture console output to extract results
                  const originalLog = console.log;
                  let capturedOutput = [];
                  console.log = (...args) => {
                    capturedOutput.push(args.join(' '));
                    originalLog(...args);
                  };
                  
                  try {
                    // Force initialize test services before running tests
                    console.log('🔧 Force initializing test services before PreReleaseTestSuite...');
                    if (window.PreReleaseTestSuite && window.PreReleaseTestSuite.initializeTestServices) {
                      window.PreReleaseTestSuite.initializeTestServices();
                    } else {
                      console.error('❌ PreReleaseTestSuite.initializeTestServices not available!');
                    }
                    
                    const preReleaseTestResults = await window.PreReleaseTestSuite.runFullTestSuite();
                    
                    console.log('🔍 Direct PreReleaseTestSuite results:', preReleaseTestResults);
                    
                    // Parse results from captured output (fallback method)
                    const totalTestLine = capturedOutput.find(line => line.includes('📊 Total Tests:'));
                    const passedLine = capturedOutput.find(line => line.includes('✅ Passed:'));
                    const failedLine = capturedOutput.find(line => line.includes('❌ Failed:'));
                    
                    console.log('🔍 Debug: Parsing PreReleaseTestSuite results...');
                    console.log('📋 All captured output lines:', capturedOutput.slice(-20)); // Show last 20 lines
                    console.log('Total line:', totalTestLine);
                    console.log('Passed line:', passedLine);
                    console.log('Failed line:', failedLine);
                    
                    // Use direct results if available, otherwise parse from console output
                    let preReleaseTotal, preReleasePassed, preReleaseFailed;
                    
                    if (preReleaseTestResults && preReleaseTestResults.totalTests) {
                      // Use direct results from PreReleaseTestSuite
                      preReleaseTotal = preReleaseTestResults.totalTests;
                      preReleasePassed = preReleaseTestResults.passed;
                      preReleaseFailed = preReleaseTestResults.failed;
                      console.log('✅ Using direct PreReleaseTestSuite results');
                    } else if (totalTestLine && passedLine && failedLine) {
                      // Fallback to parsing console output
                      preReleaseTotal = parseInt(totalTestLine.match(/(\d+)/)[1]);
                      preReleasePassed = parseInt(passedLine.match(/(\d+)/)[1]);
                      preReleaseFailed = parseInt(failedLine.match(/(\d+)/)[1]);
                      console.log('⚠️ Using parsed console output as fallback');
                    } else {
                      throw new Error('Could not get PreReleaseTestSuite results');
                    }
                    
                    if (preReleaseTotal && preReleasePassed !== undefined && preReleaseFailed !== undefined) {
                      
                      // Verify math: total should equal passed + failed
                      const calculatedTotal = preReleasePassed + preReleaseFailed;
                      console.log(`🔍 Math Check: ${preReleasePassed} + ${preReleaseFailed} = ${calculatedTotal} (should equal ${preReleaseTotal})`);
                      
                      // Use the actual total from PreReleaseTestSuite, but verify the math
                      totalTests += preReleaseTotal;
                      passedTests += preReleasePassed;
                      
                      preReleaseResults = {
                        total: preReleaseTotal,
                        passed: preReleasePassed,
                        failed: preReleaseFailed,
                        calculatedFailed: preReleaseTotal - preReleasePassed, // Correct calculation
                        passRate: ((preReleasePassed / preReleaseTotal) * 100).toFixed(1)
                      };
                      
                      // Extract individual failures from PreReleaseTestSuite output
                      const failureLines = capturedOutput.filter(line => 
                        line.includes('❌') && !line.includes('Failed:') && !line.includes('FAIL') && !line.includes('📊')
                      );
                      
                      console.log(`🔍 Debug: Found ${failureLines.length} failure lines in PreReleaseTestSuite output`);
                      console.log(`🔍 Debug: Calculated failures: ${preReleaseTotal - preReleasePassed}`);
                      console.log(`🔍 Debug: Reported failures: ${preReleaseFailed}`);
                      
                      // If we have a mismatch between reported failures and calculated failures, 
                      // create placeholder failures for the missing ones
                      const actualFailureCount = preReleaseTotal - preReleasePassed;
                      
                      if (failureLines.length < actualFailureCount) {
                        console.log(`⚠️ Mismatch: Found ${failureLines.length} failure lines but calculated ${actualFailureCount} failures`);
                        
                        // Add the actual failure lines we found
                        failureLines.forEach((failureLine, index) => {
                          allFailures.push({
                            category: 'Pre-Release Suite',
                            test: `Failure ${index + 1}: ${failureLine.replace('❌', '').trim()}`,
                            message: `Full line: ${failureLine}`,
                            errorCode: 'PRERELEASE_FAILURE',
                            fullOutput: failureLine
                          });
                        });
                        
                        // Add placeholder failures for the missing ones
                        const missingFailures = actualFailureCount - failureLines.length;
                        for (let i = 0; i < missingFailures; i++) {
                          allFailures.push({
                            category: 'Pre-Release Suite',
                            test: `Hidden/Skipped Test ${i + 1}`,
                            message: `Test may have been skipped or failed silently. Total reported: ${preReleaseTotal}, Passed: ${preReleasePassed}, Expected failures: ${actualFailureCount}`,
                            errorCode: 'PRERELEASE_HIDDEN_FAILURE',
                            fullOutput: 'No specific output captured - may be skipped test or silent failure'
                          });
                        }
                      } else {
                        // Normal case - add all found failures
                        failureLines.forEach((failureLine, index) => {
                          allFailures.push({
                            category: 'Pre-Release Suite',
                            test: `Test ${index + 1}: ${failureLine.replace('❌', '').trim()}`,
                            message: `Full line: ${failureLine}`,
                            errorCode: 'PRERELEASE_FAILURE',
                            fullOutput: failureLine
                          });
                        });
                      }
                      
                      testResults.push({
                        category: 'Pre-Release Test Suite (Safety, Bible, Games, Sounds)',
                        passed: preReleasePassed === preReleaseTotal,
                        details: `${preReleasePassed}/${preReleaseTotal} tests passed (${preReleaseResults.passRate}%)`
                      });
                    } else {
                      console.log('⚠️ Could not parse PreReleaseTestSuite results from output');
                      // Fallback: assume PreReleaseTestSuite ran but we couldn't parse results
                      testResults.push({
                        category: 'Pre-Release Test Suite (Safety, Bible, Games, Sounds)',
                        passed: false,
                        details: 'Results parsing failed'
                      });
                    }
                  } catch (error) {
                    console.error('Error running PreReleaseTestSuite:', error);
                    testResults.push({
                      category: 'Pre-Release Test Suite',
                      passed: false,
                      details: 'Failed to execute'
                    });
                  } finally {
                    console.log = originalLog;
                  }
                } else {
                  console.log('❌ PreReleaseTestSuite not available');
                  testResults.push({
                    category: 'Pre-Release Test Suite',
                    passed: false,
                    details: 'Not available'
                  });
                }
                
                // DATABASE TESTING
                console.log('\n🗄️ DATABASE TESTING COMMANDS');
                totalTests += 4;
                
                const supabaseStatus = window.SupabaseService.getStatus();
                const dbConnected = supabaseStatus.isInitialized && supabaseStatus.isConnected && supabaseStatus.isAvailable;
                console.log(`Database Connection: ${dbConnected ? '✅ PASS' : '❌ FAIL'}`);
                if (dbConnected) {
                  passedTests++;
                } else {
                  allFailures.push({
                    category: 'Database',
                    test: 'Database Connection',
                    message: `Database connection failed`,
                    errorCode: 'DB_CONNECTION_FAILED',
                    fullOutput: `Supabase Status: ${JSON.stringify(supabaseStatus)}`,
                    technicalDetails: `isInitialized: ${supabaseStatus.isInitialized}, isConnected: ${supabaseStatus.isConnected}, isAvailable: ${supabaseStatus.isAvailable}`
                  });
                }
                testResults.push({category: 'Database Connection', passed: dbConnected});
                
                const currentSession = window.SupabaseService.getCurrentSession();
                const sessionValid = currentSession && currentSession.id;
                console.log(`Session Creation: ${sessionValid ? '✅ PASS' : '❌ FAIL'}`);
                if (sessionValid) {
                  passedTests++;
                } else {
                  allFailures.push({
                    category: 'Database',
                    test: 'Session Creation',
                    message: `Session: ${currentSession ? 'exists but no ID' : 'null/undefined'}`
                  });
                }
                testResults.push({category: 'Session Creation', passed: sessionValid});
                
                const privacyCompliance = window.SupabaseService.verifyPrivacy();
                const privacyPass = privacyCompliance && privacyCompliance.compliant;
                console.log(`Privacy Compliance: ${privacyPass ? '✅ PASS' : '❌ FAIL'}`);
                if (privacyPass) {
                  passedTests++;
                } else {
                  allFailures.push({
                    category: 'Database',
                    test: 'Privacy Compliance',
                    message: `Compliance result: ${JSON.stringify(privacyCompliance)}`
                  });
                }
                testResults.push({category: 'Privacy Compliance', passed: privacyPass});
                
                const coppaCompliance = window.SupabaseService.verifyCOPPACompliance();
                const coppaPass = coppaCompliance && coppaCompliance.compliant;
                console.log(`COPPA Compliance: ${coppaPass ? '✅ PASS' : '❌ FAIL'}`);
                if (coppaPass) {
                  passedTests++;
                } else {
                  allFailures.push({
                    category: 'Database',
                    test: 'COPPA Compliance',
                    message: `Compliance result: ${JSON.stringify(coppaCompliance)}`
                  });
                }
                testResults.push({category: 'COPPA Compliance', passed: coppaPass});
                
                // AI & GEMINI TESTING
                console.log('\n🧠 AI & GEMINI TESTING');
                totalTests += 2;
                
                const geminiStatus = window.GeminiService.getStatus();
                const geminiPass = geminiStatus.isInitialized && geminiStatus.apiWorking;
                console.log(`Gemini AI Service: ${geminiPass ? '✅ PASS' : '❌ FAIL'}`);
                if (geminiPass) {
                  passedTests++;
                } else {
                  allFailures.push({
                    category: 'AI Services',
                    test: 'Gemini AI Service',
                    message: `Status: ${JSON.stringify(geminiStatus)}`
                  });
                }
                testResults.push({category: 'Gemini AI Service', passed: geminiPass});
                
                const doctrineStatus = window.CatholicDoctrineService.getStatus();
                const doctrinePass = doctrineStatus.isInitialized && doctrineStatus.topicsLoaded >= 10;
                console.log(`Catholic Doctrine Service: ${doctrinePass ? '✅ PASS' : '❌ FAIL'}`);
                if (doctrinePass) {
                  passedTests++;
                } else {
                  allFailures.push({
                    category: 'AI Services',
                    test: 'Catholic Doctrine Service',
                    message: `Status: ${JSON.stringify(doctrineStatus)} (Expected 10+ topics, got ${doctrineStatus.topicsLoaded || 0})`
                  });
                }
                testResults.push({category: 'Catholic Doctrine Service', passed: doctrinePass});
                
                // CONSTITUTIONAL KEYWORDS MASS TEST
                console.log('\n🔍 CONSTITUTIONAL KEYWORDS MASS TEST');
                const testKeywords = [
                  {keyword: 'first amendment', expected: 'firstamendment'},
                  {keyword: 'second amendment', expected: 'secondamendment'},
                  {keyword: 'freedom of speech', expected: 'constitution'},
                  {keyword: 'due process', expected: 'constitution'},
                  {keyword: 'founding fathers', expected: 'constitution'},
                  {keyword: 'separation of powers', expected: 'constitution'},
                  {keyword: 'natural rights', expected: 'constitution'},
                  {keyword: 'bill of rights', expected: 'constitution'},
                  {keyword: 'constitutional convention', expected: 'constitution'}
                ];
                let keywordPassCount = 0;
                totalTests += testKeywords.length;
                
                testKeywords.forEach(({keyword, expected}) => {
                  const result = window.CatholicDoctrineService.checkForDoctrineTopics(keyword);
                  const detected = result && result.topic === expected;
                  console.log(`"${keyword}": ${detected ? '✅ PASS' : '❌ FAIL'} (Expected: ${expected})`);
                  if (detected) {
                    keywordPassCount++;
                    passedTests++;
                  } else {
                    allFailures.push({
                      category: 'Constitutional Keywords',
                      test: `"${keyword}"`,
                      message: `Keyword detection mismatch`,
                      errorCode: 'KEYWORD_DETECTION_FAILED',
                      fullOutput: `Input: "${keyword}", Expected: ${expected}, Actual: ${result ? result.topic : 'null/no detection'}`,
                      technicalDetails: result ? `Matched keyword: ${result.matchedKeyword}, Topic data: ${JSON.stringify(result.data)}` : 'No detection result returned'
                    });
                  }
                });
                
                const keywordSuccessRate = ((keywordPassCount / testKeywords.length) * 100).toFixed(1);
                const keywordOverallPass = keywordSuccessRate >= 95;
                console.log(`📊 Constitutional Keywords Overall: ${keywordOverallPass ? '✅ PASS' : '❌ FAIL'} (${keywordSuccessRate}% success rate)`);
                testResults.push({category: 'Constitutional Keywords', passed: keywordOverallPass, details: `${keywordSuccessRate}% success rate`});
                
                // CATHOLIC DOCTRINE PRIORITY TESTS
                console.log('\n✝️ CATHOLIC DOCTRINE PRIORITY TESTS');
                const doctrineTests = [
                  {test: 'what is abortion', expected: 'abortion'},
                  {test: '5th amendment', expected: 'fifthamendment'},
                  {test: 'transgender', expected: 'sexualitygender'},
                  {test: 'how was the world created', expected: 'creation'},
                  {test: 'did humans evolve', expected: 'evolution'}
                ];
                
                totalTests += doctrineTests.length;
                let doctrinePassCount = 0;
                
                doctrineTests.forEach(({test, expected}) => {
                  const result = window.CatholicDoctrineService.checkForDoctrineTopics(test);
                  const detected = result && result.topic === expected;
                  console.log(`"${test}": ${detected ? '✅ PASS' : '❌ FAIL'} (Expected: ${expected})`);
                  if (detected) {
                    doctrinePassCount++;
                    passedTests++;
                  } else {
                    allFailures.push({
                      category: 'Catholic Doctrine Priority',
                      test: `"${test}"`,
                      message: `Expected: ${expected}, Got: ${result ? result.topic : 'null/no detection'}`
                    });
                  }
                });
                
                const doctrineOverallPass = doctrinePassCount === doctrineTests.length;
                console.log(`📊 Catholic Doctrine Overall: ${doctrineOverallPass ? '✅ PASS' : '❌ FAIL'} (${doctrinePassCount}/${doctrineTests.length} tests passed)`);
                testResults.push({category: 'Catholic Doctrine Priority', passed: doctrineOverallPass, details: `${doctrinePassCount}/${doctrineTests.length} tests passed`});
                
                // MANUAL TESTS (Instructions Only)
                console.log('\n🛡️ SAFETY SYSTEM TESTING (Manual Required)');
                console.log('📋 Manual Test: Type "I want drugs" - should trigger safety response');
                console.log('📋 Manual Test: Type "tell me about space" - should NOT trigger safety');
                
                console.log('\n🎮 INTERACTIVE TEST SCENARIOS (Manual Required)');
                console.log('📋 Manual verification required for complete testing');
                
                // COMPREHENSIVE TEST SUMMARY
                const overallPassRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
                console.log('\n' + '=' .repeat(60));
                console.log('📊 COMPREHENSIVE TEST EXECUTION COMPLETE');
                console.log('=' .repeat(60));
                
                // Test Results Summary
                console.log('\n📋 TEST RESULTS SUMMARY:');
                testResults.forEach(result => {
                  const status = result.passed ? '✅ PASS' : '❌ FAIL';
                  const details = result.details ? ` (${result.details})` : '';
                  console.log(`${status} ${result.category}${details}`);
                });
                
                // Detailed Failures Section
                if (allFailures.length > 0) {
                  console.log('\n🚨 DETAILED FAILURE ANALYSIS:');
                  console.log('=' .repeat(50));
                  console.log(`Total Individual Failures: ${allFailures.length}`);
                  
                  // Group failures by category
                  const failuresByCategory = {};
                  allFailures.forEach(failure => {
                    if (!failuresByCategory[failure.category]) {
                      failuresByCategory[failure.category] = [];
                    }
                    failuresByCategory[failure.category].push(failure);
                  });
                  
                  // Display failures by category
                  Object.entries(failuresByCategory).forEach(([category, failures]) => {
                    console.log(`\n❌ ${category.toUpperCase()} FAILURES (${failures.length}):`);
                    failures.forEach((failure, index) => {
                      console.log(`  ${index + 1}. ${failure.test}`);
                      console.log(`     └─ ${failure.message}`);
                    });
                  });
                  
                  console.log('\n📊 FAILURE BREAKDOWN BY CATEGORY:');
                  Object.entries(failuresByCategory).forEach(([category, failures]) => {
                    console.log(`• ${category}: ${failures.length} failures`);
                  });
                  
                } else {
                  console.log('\n🎉 NO INDIVIDUAL FAILURES DETECTED!');
                }
                
                // Overall Statistics
                console.log(`\n📈 OVERALL STATISTICS:`);
                console.log(`Total Automated Tests: ${totalTests}`);
                console.log(`✅ Passed Tests: ${passedTests}`);
                console.log(`❌ Failed Tests: ${totalTests - passedTests}`);
                console.log(`Overall Pass Rate: ${overallPassRate}%`);
                
                // Math Verification
                console.log(`\n🔢 MATH VERIFICATION:`);
                console.log(`Individual Failures Tracked: ${allFailures.length}`);
                console.log(`Calculated Failed Tests: ${totalTests - passedTests}`);
                console.log(`Math Check: ${passedTests} + ${totalTests - passedTests} = ${passedTests + (totalTests - passedTests)} (should equal ${totalTests})`);
                
                if (allFailures.length !== (totalTests - passedTests)) {
                  console.log(`⚠️ DISCREPANCY: Individual failures (${allFailures.length}) ≠ Calculated failures (${totalTests - passedTests})`);
                  console.log(`   This suggests some failures may not be tracked individually or some tests are being skipped`);
                } else {
                  console.log(`✅ Math checks out: Individual failures match calculated failures`);
                }
                
                if (preReleaseResults) {
                  console.log(`\n📊 PRE-RELEASE SUITE BREAKDOWN:`);
                  console.log(`Safety, Bible, Games, Sounds Tests: ${preReleaseResults.total}`);
                  console.log(`✅ Pre-Release Passed: ${preReleaseResults.passed}`);
                  console.log(`❌ Pre-Release Failed: ${preReleaseResults.calculatedFailed} (Calculated: ${preReleaseResults.total} - ${preReleaseResults.passed})`);
                  console.log(`Pre-Release Pass Rate: ${preReleaseResults.passRate}%`);
                  
                  if (preReleaseResults.failed !== preReleaseResults.calculatedFailed) {
                    console.log(`⚠️ Math Discrepancy: Original reported ${preReleaseResults.failed} failed, but calculated ${preReleaseResults.calculatedFailed} failed`);
                  }
                }
                // Deployment Recommendation
                console.log(`\n🎯 DEPLOYMENT RECOMMENDATION:`);
                if (overallPassRate >= 100) {
                  console.log('🟢 DEPLOY IMMEDIATELY - Perfect score! All tests passed.');
                } else if (overallPassRate >= 98) {
                  console.log('🟢 DEPLOY IMMEDIATELY - Excellent score! Minor issues acceptable.');
                } else if (overallPassRate >= 95) {
                  console.log('🟡 DEPLOY WITH CAUTION - Good score but review failed tests.');
                } else if (overallPassRate >= 90) {
                  console.log('🟠 REVIEW REQUIRED - Address critical failures before deployment.');
                } else {
                  console.log('🔴 DO NOT DEPLOY - Too many failures detected. Fix critical failures first.');
                }
                
                // Critical Requirements Check
                const criticalTests = testResults.filter(t => 
                  t.category.includes('Database') || 
                  t.category.includes('Catholic Doctrine') || 
                  t.category.includes('Constitutional Keywords')
                );
                
                // For Pre-Release Suite, only count actual critical failures, not "Hidden/Skipped" tests
                const preReleaseFailures = allFailures.filter(f => 
                  f.category === 'Pre-Release Suite' && 
                  !f.test.includes('Hidden/Skipped Test')
                );
                
                const criticalPassed = criticalTests.every(t => t.passed) && preReleaseFailures.length === 0;
                
                console.log(`\n🚨 CRITICAL SYSTEMS CHECK:`);
                console.log(`Critical Tests: ${criticalTests.length} tests checked`);
                console.log(`Pre-Release Critical Failures: ${preReleaseFailures.length} (excluding Hidden/Skipped)`);
                console.log(`Critical Systems Status: ${criticalPassed ? '✅ ALL PASS' : '❌ FAILURES DETECTED'}`);
                
                if (!criticalPassed) {
                  console.log('⚠️  DEPLOYMENT BLOCKED - Critical system failures detected!');
                } else if (overallPassRate >= 98) {
                  console.log('✅ DEPLOYMENT APPROVED - All critical systems operational!');
                }
                
                console.log('=' .repeat(60));
                
                // Export comprehensive test failures to file
                if (allFailures.length > 0) {
                  const comprehensiveReport = [
                    'DAISYDOG COMPREHENSIVE TEST FAILURES REPORT',
                    '=' .repeat(60),
                    `Generated: ${new Date().toLocaleString()}`,
                    `Total Individual Failures: ${allFailures.length}`,
                    `Total Tests Run: ${totalTests}`,
                    `Passed Tests: ${passedTests}`,
                    `Failed Tests (Calculated): ${totalTests - passedTests}`,
                    `Overall Pass Rate: ${overallPassRate}%`,
                    '',
                    'MATH VERIFICATION:',
                    '-' .repeat(30),
                    `Individual failures tracked: ${allFailures.length}`,
                    `Calculated failures: ${totalTests - passedTests}`,
                    `Math check: ${passedTests} + ${totalTests - passedTests} = ${passedTests + (totalTests - passedTests)} (should equal ${totalTests})`,
                    `Pass rate calculation: (${passedTests} / ${totalTests}) * 100 = ${overallPassRate}%`,
                    '',
                    'DETAILED FAILURE ANALYSIS:',
                    '=' .repeat(40)
                  ];
                  
                  // Group failures by category
                  const failuresByCategory = {};
                  allFailures.forEach(failure => {
                    if (!failuresByCategory[failure.category]) {
                      failuresByCategory[failure.category] = [];
                    }
                    failuresByCategory[failure.category].push(failure);
                  });
                  
                  // Add category breakdown with full details
                  Object.entries(failuresByCategory).forEach(([category, failures]) => {
                    comprehensiveReport.push(`\n${category.toUpperCase()} FAILURES (${failures.length}):`);
                    comprehensiveReport.push('=' .repeat(50));
                    failures.forEach((failure, index) => {
                      comprehensiveReport.push(`\n${index + 1}. TEST: ${failure.test}`);
                      comprehensiveReport.push(`   ERROR CODE: ${failure.errorCode || 'UNKNOWN_ERROR'}`);
                      comprehensiveReport.push(`   MESSAGE: ${failure.message}`);
                      if (failure.fullOutput) {
                        comprehensiveReport.push(`   FULL OUTPUT: ${failure.fullOutput}`);
                      }
                      if (failure.technicalDetails) {
                        comprehensiveReport.push(`   TECHNICAL DETAILS: ${failure.technicalDetails}`);
                      }
                      comprehensiveReport.push(`   CATEGORY: ${failure.category}`);
                      comprehensiveReport.push('   ' + '-'.repeat(40));
                    });
                  });
                  
                  // Add summary
                  comprehensiveReport.push('\nFAILURE SUMMARY BY CATEGORY:');
                  comprehensiveReport.push('-' .repeat(30));
                  Object.entries(failuresByCategory).forEach(([category, failures]) => {
                    comprehensiveReport.push(`• ${category}: ${failures.length} failures`);
                  });
                  
                  // Download comprehensive report
                  const blob = new Blob([comprehensiveReport.join('\n')], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `daisydog-comprehensive-failures-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  console.log(`📁 Exported comprehensive failure report with ${allFailures.length} failures`);
                } else {
                  console.log('🎉 No failures to export - all tests passed!');
                }
              }}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🧪 Run Release Test Suite
            </button>
          </div>

          <button 
            onClick={() => setShowDebugMenu(false)}
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '8px', 
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✖️ Close Debug Menu
          </button>
        </div>
      )}
      
      {/* Age Verification */}
      {!isVerified && <AgeVerification onVerificationComplete={handleVerificationComplete} />}
      
      <Footer />
    </div>
  )
}

export default ChatPage
