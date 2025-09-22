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
import useSoundManagerModular from '../hooks/useSoundManagerModular.js'
import useSafetyFilter from '../hooks/useSafetyFilter.js'
import SoundControls from '../components/SoundControls.jsx'
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

  // Bible service initialization
  const initializeBibleService = async () => {
    try {
      const { default: BibleService } = await import('../services/BibleService.js');
      console.log('📖 Bible Service imported and initializing...');
    } catch (error) {
      console.error('❌ Failed to initialize Bible Service:', error);
    }
  }

  // Bible service integration
  useEffect(() => {
    const initializeBibleService = async () => {
      try {
        const { default: BibleService } = await import('../services/BibleService.js');
        console.log('📖 Bible Service imported and initializing...');
        // Service auto-initializes in constructor
      } catch (error) {
        console.error('❌ Failed to import Bible Service:', error);
      }
    };
    
    initializeBibleService();
  }, []);

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
  
  // Auto-scroll to bottom
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
      if (typeof response === 'object' && response.text) {
        addDaisyMessage(response.text, 'chat', response.emotion)
      } else {
        addDaisyMessage(response)
      }
    }, 1000 + Math.random() * 1000)
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
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
        addDaisyMessage(response.text, 'chat', response.emotion)
      } else {
        addDaisyMessage(response)
      }
    }, 1000 + Math.random() * 1000)
  }

  // Add Daisy message function
  const addDaisyMessage = (text, type = 'chat', emotion = null) => {
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
      emotionImage: getEmotionImage(finalEmotion)
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Enhanced response generation with AI integration
  const generateDaisyResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // PRIORITY 1: SAFETY CHECK FIRST
    console.log('🔍 Running safety check FIRST on:', userMessage)
    
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
        
        let response = safetyCheck.response
        if (safetyCheck.safetyTip) {
          response += '\n\n' + safetyCheck.safetyTip
        }
        
        return { text: response, emotion: safetyCheck.emotion || 'nervous' }
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
      
      if (!isGameCommand && userMessage.length > 1 && userMessage.length < 20) {
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
    
    // General responses
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
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
                className={`message ${message.sender}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {message.sender === 'daisy' && (
                  <img 
                    src={message.emotionImage || getEmotionImage()} 
                    alt="Daisy"
                    className="message-avatar"
                    onError={(e) => {
                      e.target.src = '/assets/images/emotions/happy.png'
                    }}
                  />
                )}
                <div className="message-content">
                  <div className="message-text">
                    {message.text}
                  </div>
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
            <img 
              src={getEmotionImage()} 
              alt="Daisy"
              className="message-avatar"
              onError={(e) => {
                e.target.src = '/assets/images/emotions/happy.png'
              }}
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

      {/* Input Form */}
      <div className="input-container">
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
            <button type="submit" disabled={isTyping || !inputMessage.trim()} className="send-button">
              <FaPaw />
            </button>
            <button type="button" onClick={feedDaisy} className="feed-button" disabled={isTyping}>
              <FaBone />
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => window.open('https://www.readkidz.com/share/ebook/1969460528838705153', '_blank', 'noopener,noreferrer')}>
          📖 Read the Book
        </button>
        <button onClick={() => handleQuickMessage('Tell me a story')}>
          📚 Tell me a story
        </button>
        <button onClick={() => handleQuickMessage('Tell me a joke')}>
          😄 Tell a joke
        </button>
        <button onClick={() => handleQuickMessage('Do a trick')}>
          🦴 Do a trick
        </button>
        <button onClick={() => handleQuickMessage('Dance for me')}>
          💃 Dance
        </button>
        <button onClick={() => setGameState({ type: 'selection' })}>
          🎮 Play Games
        </button>
        <button onClick={() => setBibleMenuState({ type: 'selection' })}>
          📖 Bible
        </button>
        <button onClick={() => handleQuickMessage('How are you feeling?')}>
          🐾 How are you?
        </button>
      </div>
      
      {/* Game Selection Menu */}
      {gameState?.type === 'selection' && (
        <div className="game-selection">
          <h3>🎮 Choose a Game!</h3>
          <div className="game-buttons">
            <button onClick={() => handleGameAction('fetch')}>
              🎾 Fetch Game
            </button>
            <button onClick={() => handleGameAction('tug')}>
              🪢 Tug of War
            </button>
            <button onClick={() => handleGameAction('hide')}>
              🙈 Hide & Seek
            </button>
            <button onClick={() => handleGameAction('ball')}>
              🏀 Ball Catch
            </button>
            <button onClick={() => handleGameAction('guess')}>
              🤔 Guessing Game
            </button>
            <button onClick={() => setGameState(null)} className="stop-game">
              🛑 Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Bible Menu */}
      {bibleMenuState?.type === 'selection' && (
        <div className="game-selection">
          <h3>📖 Choose a Bible Topic!</h3>
          <div className="game-buttons">
            <button onClick={() => setBibleMenuState({ type: 'people' })}>
              👥 People in the Bible
            </button>
            <button onClick={() => setBibleMenuState({ type: 'search' })}>
              🔍 Search the Bible
            </button>
            <button onClick={() => setBibleMenuState({ type: 'curriculum' })}>
              📚 Teach Me the Bible
            </button>
            <button onClick={() => setBibleMenuState({ type: 'verse' })}>
              ✨ Verse of the Day
            </button>
            <button onClick={() => setBibleMenuState(null)} className="stop-game">
              🛑 Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Bible People Submenu */}
      {bibleMenuState?.type === 'people' && (
        <div className="game-selection">
          <h3>👥 People in the Bible</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('Tell me about Jesus')}>
              ✝️ Jesus
            </button>
            <button onClick={() => handleQuickMessage('Tell me about Mary')}>
              💙 Mary (Jesus's Mom)
            </button>
            <button onClick={() => handleQuickMessage('Tell me about David')}>
              🎯 David & Goliath
            </button>
            <button onClick={() => handleQuickMessage('Tell me about Moses')}>
              🌊 Moses
            </button>
            <button onClick={() => handleQuickMessage('Tell me about Noah')}>
              🚢 Noah
            </button>
            <button onClick={() => handleQuickMessage('Tell me about Daniel')}>
              🦁 Daniel
            </button>
            <button onClick={() => setBibleMenuState({ type: 'selection' })} className="stop-game">
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Bible Search Submenu */}
      {bibleMenuState?.type === 'search' && (
        <div className="game-selection">
          <h3>🔍 Search the Bible</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('Tell me about love in the Bible')}>
              💕 Love
            </button>
            <button onClick={() => handleQuickMessage('Tell me about kindness in the Bible')}>
              🤗 Kindness
            </button>
            <button onClick={() => handleQuickMessage('Tell me about forgiveness in the Bible')}>
              🕊️ Forgiveness
            </button>
            <button onClick={() => handleQuickMessage('Tell me about prayer in the Bible')}>
              🙏 Prayer
            </button>
            <button onClick={() => handleQuickMessage('Tell me about the Ten Commandments')}>
              📜 Ten Commandments
            </button>
            <button onClick={() => setBibleMenuState({ type: 'selection' })} className="stop-game">
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Catholic Curriculum Submenu */}
      {bibleMenuState?.type === 'curriculum' && (
        <div className="game-selection">
          <h3>📚 Teach Me the Bible - Catholic Curriculum</h3>
          <div className="game-buttons">
            <button onClick={() => setBibleMenuState({ type: 'kindergarten-lessons' })}>
              🌟 Kindergarten - "Jesus Loves Me!"
            </button>
            <button onClick={() => setBibleMenuState({ type: 'grade1-lessons' })}>
              👨‍👩‍👧‍👦 Grade 1 - "We Belong to God's Family"
            </button>
            <button onClick={() => setBibleMenuState({ type: 'grade2-lessons' })}>
              🍞 Grade 2 - "Jesus Gives Us the Sacraments"
            </button>
            <button onClick={() => setBibleMenuState({ type: 'grade3-lessons' })}>
              ✝️ Grade 3 - "Following Jesus"
            </button>
            <button onClick={() => setBibleMenuState({ type: 'grade4-lessons' })}>
              📖 Grade 4 - "Scripture Stories"
            </button>
            <button onClick={() => setBibleMenuState({ type: 'selection' })} className="stop-game">
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Verse of the Day Submenu */}
      {bibleMenuState?.type === 'verse' && (
        <div className="game-selection">
          <h3>✨ Verse of the Day</h3>
          <div className="game-buttons">
            <button onClick={() => handleVerseOfDay()}>
              🎲 Get Random Verse
            </button>
            <button onClick={() => handleQuickMessage('Tell me about Psalm 23')}>
              🐑 Psalm 23 (The Good Shepherd)
            </button>
            <button onClick={() => handleQuickMessage('Tell me about John 3:16')}>
              💕 John 3:16 (God's Love)
            </button>
            <button onClick={() => handleQuickMessage('Tell me about Matthew 19:14')}>
              👶 Matthew 19:14 (Jesus Loves Children)
            </button>
            <button onClick={() => setBibleMenuState({ type: 'selection' })} className="stop-game">
              ⬅️ Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Kindergarten Lessons Submenu */}
      {bibleMenuState?.type === 'kindergarten-lessons' && (
        <div className="game-selection">
          <h3>🌟 Kindergarten Lessons - "Jesus Loves Me!"</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('Kindergarten lesson 1')}>
              📚 Lesson 1: God Made Everything
            </button>
            <button onClick={() => handleQuickMessage('Kindergarten lesson 2')}>
              👶 Lesson 2: Jesus is God's Son
            </button>
            <button onClick={() => handleQuickMessage('Kindergarten lesson 3')}>
              👨‍👩‍👧‍👦 Lesson 3: God's Family, the Church
            </button>
            <button onClick={() => handleQuickMessage('Kindergarten lesson 4')}>
              🙏 Lesson 4: We Pray to God
            </button>
            <button onClick={() => handleQuickMessage('Kindergarten lesson 5')}>
              🤗 Lesson 5: We are Kind Like Jesus
            </button>
            <button onClick={() => setBibleMenuState({ type: 'curriculum' })} className="stop-game">
              ⬅️ Back to Curriculum
            </button>
          </div>
        </div>
      )}

      {/* Grade 1 Lessons Submenu */}
      {bibleMenuState?.type === 'grade1-lessons' && (
        <div className="game-selection">
          <h3>👨‍👩‍👧‍👦 Grade 1 Lessons - "We Belong to God's Family"</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('Grade 1 lesson 1')}>
              📚 Lesson 1: We Belong to God's Family
            </button>
            <button onClick={() => handleQuickMessage('Grade 1 lesson 2')}>
              ⛪ Lesson 2: The Church is Our Home
            </button>
            <button onClick={() => handleQuickMessage('Grade 1 lesson 3')}>
              🙏 Lesson 3: We Worship Together
            </button>
            <button onClick={() => handleQuickMessage('Grade 1 lesson 4')}>
              💕 Lesson 4: God's Love Never Ends
            </button>
            <button onClick={() => handleQuickMessage('Grade 1 lesson 5')}>
              🌟 Lesson 5: We Share God's Love
            </button>
            <button onClick={() => setBibleMenuState({ type: 'curriculum' })} className="stop-game">
              ⬅️ Back to Curriculum
            </button>
          </div>
        </div>
      )}

      {/* Grade 2 Lessons Submenu */}
      {bibleMenuState?.type === 'grade2-lessons' && (
        <div className="game-selection">
          <h3>🍞 Grade 2 Lessons - "Jesus Gives Us the Sacraments"</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('Grade 2 lesson 1')}>
              💧 Lesson 1: Baptism - Welcome to God's Family
            </button>
            <button onClick={() => handleQuickMessage('Grade 2 lesson 2')}>
              🕊️ Lesson 2: Reconciliation - God Forgives Us
            </button>
            <button onClick={() => handleQuickMessage('Grade 2 lesson 3')}>
              🍞 Lesson 3: Eucharist - Jesus Comes to Us
            </button>
            <button onClick={() => handleQuickMessage('Grade 2 lesson 4')}>
              ✝️ Lesson 4: Confirmation - The Holy Spirit Helps Us
            </button>
            <button onClick={() => handleQuickMessage('Grade 2 lesson 5')}>
              💒 Lesson 5: Living the Sacraments
            </button>
            <button onClick={() => setBibleMenuState({ type: 'curriculum' })} className="stop-game">
              ⬅️ Back to Curriculum
            </button>
          </div>
        </div>
      )}

      {/* Grade 3 Lessons Submenu */}
      {bibleMenuState?.type === 'grade3-lessons' && (
        <div className="game-selection">
          <h3>✝️ Grade 3 Lessons - "Following Jesus"</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('Grade 3 lesson 1')}>
              👨‍🏫 Lesson 1: Jesus Our Teacher
            </button>
            <button onClick={() => handleQuickMessage('Grade 3 lesson 2')}>
              😇 Lesson 2: The Beatitudes
            </button>
            <button onClick={() => handleQuickMessage('Grade 3 lesson 3')}>
              🚶‍♂️ Lesson 3: Living Like Jesus
            </button>
            <button onClick={() => handleQuickMessage('Grade 3 lesson 4')}>
              👼 Lesson 4: Saints as Examples
            </button>
            <button onClick={() => handleQuickMessage('Grade 3 lesson 5')}>
              ⚖️ Lesson 5: Making Good Choices
            </button>
            <button onClick={() => setBibleMenuState({ type: 'curriculum' })} className="stop-game">
              ⬅️ Back to Curriculum
            </button>
          </div>
        </div>
      )}

      {/* Grade 4 Lessons Submenu */}
      {bibleMenuState?.type === 'grade4-lessons' && (
        <div className="game-selection">
          <h3>📖 Grade 4 Lessons - "Scripture Stories"</h3>
          <div className="game-buttons">
            <button onClick={() => handleQuickMessage('Grade 4 lesson 1')}>
              🦸‍♂️ Lesson 1: Old Testament Heroes
            </button>
            <button onClick={() => handleQuickMessage('Grade 4 lesson 2')}>
              📖 Lesson 2: Jesus's Parables
            </button>
            <button onClick={() => handleQuickMessage('Grade 4 lesson 3')}>
              ✨ Lesson 3: Miracles of Jesus
            </button>
            <button onClick={() => handleQuickMessage('Grade 4 lesson 4')}>
              ⛪ Lesson 4: The Early Church
            </button>
            <button onClick={() => handleQuickMessage('Grade 4 lesson 5')}>
              📚 Lesson 5: Living Scripture Today
            </button>
            <button onClick={() => setBibleMenuState({ type: 'curriculum' })} className="stop-game">
              ⬅️ Back to Curriculum
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
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Quick Tests:</h4>
            <button 
              onClick={() => handleQuickMessage('tell me the full 10 commandments')}
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
              Test Ten Commandments
            </button>
            <button 
              onClick={() => handleQuickMessage('Grade 1 lesson 1')}
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
              Test Grade 1 Lesson 1
            </button>
            <button 
              onClick={() => handleQuickMessage('what is my name')}
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
              Test Name Recall
            </button>
            <button 
              onClick={() => handleQuickMessage('what is the our father')}
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
              Test Our Father Prayer
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
              onClick={async () => {
                console.log('🧪 === COMPREHENSIVE SYSTEM TEST STARTING ===');
                
                // Test all detection systems
                const testMessages = [
                  'tell me the full 10 commandments',
                  'Grade 1 lesson 1', 
                  'what is my name',
                  'what is the our father',
                  'Tell me about Moses',
                  'Teach me Kindergarten faith',
                  'Tell me about love in the Bible'
                ];
                
                for (const message of testMessages) {
                  console.log(`\n🧪 Testing: "${message}"`);
                  
                  // Import all detection functions
                  const { containsBibleTopicKeywords, containsLessonKeywords, containsCurriculumKeywords, findCurriculumGrade } = await import('../data/catholicCurriculum');
                  const { containsBibleCharacterKeywords } = await import('../data/bibleCharacters');
                  const { containsDogFactKeywords } = await import('../data/dogFacts');
                  
                  // Test all systems
                  console.log('  → Bible Topics:', containsBibleTopicKeywords(message) || 'NO');
                  console.log('  → Bible Characters:', containsBibleCharacterKeywords(message) ? 'YES' : 'NO');
                  console.log('  → Curriculum:', containsCurriculumKeywords(message) ? 'YES' : 'NO');
                  console.log('  → Lessons:', containsLessonKeywords(message) ? 'YES' : 'NO');
                  console.log('  → Dog Facts:', containsDogFactKeywords(message) ? 'YES' : 'NO');
                  console.log('  → Grade Detected:', findCurriculumGrade(message)?.grade || 'NO');
                }
                
                console.log('\n🧪 === COMPREHENSIVE SYSTEM TEST COMPLETE ===');
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
              🧪 Run Comprehensive Test
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