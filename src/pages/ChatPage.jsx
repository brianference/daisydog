import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaw, FaBone, FaHome, FaQuestionCircle, FaPaperPlane, FaBrain, FaVolumeUp, FaVolumeMute, FaBook } from 'react-icons/fa'
import { daisyResponses } from '../data/daisyResponses'
import { dogFacts, getRandomDogFact, getDogFactByKeyword, containsDogFactKeywords } from '../data/dogFacts'
import GeminiService from '../services/GeminiService.js'
import SupabaseService from '../services/SupabaseService.js'
import useSoundManagerModular from '../hooks/useSoundManagerModular.js'
import useSafetyFilter from '../hooks/useSafetyFilter.js'
import SoundControls from '../components/SoundControls.jsx'
import SoundTestPanel from '../components/SoundTestPanel.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import './ChatPage.css'

const ChatPage = () => {
  // Chat state
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState('happy')
  const [hungerLevel, setHungerLevel] = useState(3)
  const [gameState, setGameState] = useState(null)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [userName, setUserName] = useState('')
  
  // Game-specific states
  const [ballPosition, setBallPosition] = useState('ready')
  const [hideSeekCount, setHideSeekCount] = useState(0)
  const [tugStrength, setTugStrength] = useState(0)
  const [guessTarget, setGuessTarget] = useState(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [showGameMenu, setShowGameMenu] = useState(false)
  const [ballCatchHeight, setBallCatchHeight] = useState('medium')
  const [showSoundTestPanel, setShowSoundTestPanel] = useState(false)
  
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
  
  // Checkpoint system
  const [lastSaved, setLastSaved] = useState(null)
  
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
  
  // Checkpoint system
  const saveState = () => {
    try {
      const state = {
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        })),
        currentEmotion,
        hungerLevel,
        gameState,
        hasGreeted,
        userName,
        ballPosition,
        hideSeekCount,
        tugStrength,
        guessTarget,
        storyIndex,
        ballCatchHeight,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('daisyDogState', JSON.stringify(state))
      setLastSaved(new Date())
    } catch (error) {
      console.warn('Failed to save state:', error)
    }
  }
  
  const loadState = () => {
    try {
      const savedState = localStorage.getItem('daisyDogState')
      if (savedState) {
        const state = JSON.parse(savedState)
        const loadedMessages = state.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(loadedMessages)
        // Set message counter to avoid ID conflicts
        messageIdCounter.current = loadedMessages.length
        setCurrentEmotion(state.currentEmotion || 'happy')
        setHungerLevel(state.hungerLevel || 3)
        setGameState(state.gameState || null)
        setHasGreeted(state.hasGreeted || false)
        setUserName(state.userName || '')
        setBallPosition(state.ballPosition || 'ready')
        setHideSeekCount(state.hideSeekCount || 0)
        setTugStrength(state.tugStrength || 0)
        setGuessTarget(state.guessTarget || null)
        setStoryIndex(state.storyIndex || 0)
        setBallCatchHeight(state.ballCatchHeight || 'medium')
        setLastSaved(new Date(state.savedAt))
        return true
      }
    } catch (error) {
      console.warn('Failed to load state:', error)
    }
    return false
  }
  
  const resetState = () => {
    console.log('🔄 RESET CHAT: Clearing all state and localStorage')
    localStorage.removeItem('daisyDogState')
    setMessages([])
    setCurrentEmotion('happy')
    setHungerLevel(3)
    setGameState(null)
    setHasGreeted(false)
    setUserName('')
    setBallPosition('ready')
    setHideSeekCount(0)
    setTugStrength(0)
    setGuessTarget(null)
    setStoryIndex(0)
    setBallCatchHeight('medium')
    setLastSaved(null)
    console.log('🔄 RESET COMPLETE: userName cleared, hasGreeted set to false')
    
    // Trigger initial greeting after reset
    setTimeout(() => {
      addDaisyMessage(getRandomResponse(daisyResponses.initialGreetings))
    }, 1000)
  }
  
  const addDaisyMessage = (text, type = 'chat', emotion = null) => {
    const finalEmotion = emotion || currentEmotion
    
    // Debug logging for dance messages
    if (text.includes('dance') || text.includes('spin') || text.includes('ta-da')) {
      console.log('🎭 Adding dance message with emotion:', finalEmotion)
    }
    
    const messageId = generateUniqueMessageId()
    
    // Prevent duplicate messages by checking if the same text was added recently
    const recentMessages = messages.slice(-3) // Check last 3 messages
    const isDuplicate = recentMessages.some(msg => 
      msg.text === text && 
      msg.sender === 'daisy' && 
      (Date.now() - msg.timestamp.getTime()) < 1000 // Within 1 second
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
    
    // Additional safety check: ensure ID is unique in current messages
    const existingMessage = messages.find(msg => msg.id === messageId)
    if (existingMessage) {
      console.warn('🚨 Message ID collision detected, regenerating...', messageId)
      newMessage.id = generateUniqueMessageId() + '-retry'
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Play contextual sound based on message content and emotion
    if (soundReady && !isMuted) {
      setTimeout(() => {
        playContextualSound(text, currentEmotion)
      }, 500)
    }
    
    saveState()
  }
  
  // Game handling functions
  const handleFetchGame = (message) => {
    if (message.includes('throw') || message.includes('fetch')) {
      setBallPosition('thrown')
      setCurrentEmotion('playfetch')
      // Play ball bounce sound
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('fetch'), 300)
      }
      return "*runs after the ball excitedly* Woof woof! I got it! *brings ball back and drops it at your feet* 🎾"
    } else if (message.includes('good') || message.includes('catch')) {
      setBallPosition('ready')
      setCurrentEmotion('happy')
      return "*wags tail proudly* Thanks! I love playing fetch! Want to throw it again? 🐕"
    } else if (message.includes('stop') || message.includes('done')) {
      setGameState(null)
      setBallPosition('ready')
      setCurrentEmotion('patient')
      return "*pants happily* That was fun! What should we do next? 🐾"
    }
    return "*holds ball in mouth* Woof! Throw the ball and I'll fetch it! 🎾"
  }
  
  const handleHideSeekGame = (message) => {
    if (message.includes('ready') || message.includes('found') || message.includes('here')) {
      setHideSeekCount(prev => prev + 1)
      if (hideSeekCount >= 2) {
        setGameState(null)
        setHideSeekCount(0)
        setCurrentEmotion('excited')
        return "*jumps out from behind a tree* Found you! That was so much fun! Want to play again? 🌳"
      }
      setCurrentEmotion('lookingbehind')
      return "*sniffs around* Hmm, where could you be hiding? I'm getting closer! 👃"
    } else if (message.includes('stop')) {
      setGameState(null)
      setHideSeekCount(0)
      setCurrentEmotion('patient')
      return "*stops searching* Okay! That was fun! What should we do next? 🐾"
    }
    return "*looks around excitedly* I'm seeking! Tell me when you're ready or if I'm getting close! 🔍"
  }
  
  const handleTugWarGame = (message) => {
    if (message.includes('pull') || message.includes('tug') || message.includes('harder')) {
      setTugStrength(prev => Math.min(prev + 1, 3))
      if (tugStrength >= 2) {
        setGameState(null)
        setTugStrength(0)
        setCurrentEmotion('excited')
        // Play victory sound
        if (soundReady && !isMuted) {
          setTimeout(() => playGameSound('tug', 'success'), 300)
        }
        return "*lets go of rope and wags tail* You win! You're really strong! That was awesome! 💪"
      }
      setCurrentEmotion('eager')
      // Play tug sound
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('tug'), 300)
      }
      return "*pulls back with determination* Grrrr! *playful growl* I'm not giving up! Pull harder! 🪢"
    } else if (message.includes('stop')) {
      setGameState(null)
      setTugStrength(0)
      setCurrentEmotion('patient')
      return "*drops rope* Good game! What should we do next? 🐾"
    }
    return "*grabs rope* Grrr! *playful tug* Come on, pull! Let's see who's stronger! 🪢"
  }
  
  const handleGuessingGame = (message) => {
    if (!guessTarget) {
      const target = Math.floor(Math.random() * 10) + 1
      setGuessTarget(target)
      setCurrentEmotion('thinking')
      return "*thinks hard* Okay! I'm thinking of a number between 1 and 10! Can you guess it? 🤔"
    }
    
    if (message.includes('hint')) {
      setCurrentEmotion('thinking')
      const hint = guessTarget > 5 ? 'bigger than 5' : 'smaller than 6'
      return `*whispers conspiratorially* Psst! Here's a hint: it's ${hint}! 🤫`
    }
    
    if (message.includes('stop')) {
      setGameState(null)
      setGuessTarget(null)
      setCurrentEmotion('patient')
      return `*drops thinking pose* Okay! The number was ${guessTarget}! Good game! What should we do next? 🐾`
    }
    
    const guess = parseInt(message)
    if (isNaN(guess)) {
      return "*tilts head* I need a number between 1 and 10! Try again! 🔢"
    }
    
    if (guess === guessTarget) {
      setGameState(null)
      setGuessTarget(null)
      setCurrentEmotion('excited')
      // Play correct guess sound
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'correct'), 300)
      }
      return `*jumps up and down* YES! You got it! It was ${guessTarget}! You're so smart! 🎉`
    } else if (guess < guessTarget) {
      setCurrentEmotion('eager')
      // Play wrong guess sound
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'wrong'), 300)
      }
      return "*wags tail* Higher! Try a bigger number! 📈"
    } else {
      setCurrentEmotion('eager')
      // Play wrong guess sound
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'wrong'), 300)
      }
      return "*shakes head* Lower! Try a smaller number! 📉"
    }
  }
  
  const handleBallCatchGame = (message) => {
    if (message.includes('high')) {
      setBallCatchHeight('high')
      setCurrentEmotion('eager')
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('fetch'), 300)
      }
      return "*jumps up high* Woof! *leaps and catches ball* Got it! That was a great high throw! 🎾"
    } else if (message.includes('low')) {
      setBallCatchHeight('low')
      setCurrentEmotion('crouchingdown')
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('fetch'), 300)
      }
      return "*crouches down low* *snatches ball close to ground* Woof! Nice low throw! I caught it! 🎾"
    } else if (message.includes('bounce')) {
      setBallCatchHeight('bounce')
      setCurrentEmotion('playfetch')
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('fetch'), 300)
      }
      return "*watches ball bounce* Bounce, bounce, bounce... *catches on second bounce* Woof! I love bouncy balls! 🏀"
    } else if (message.includes('roll')) {
      setBallCatchHeight('roll')
      setCurrentEmotion('eager')
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('fetch'), 300)
      }
      return "*chases rolling ball* *pounces on it* Got it! Rolling balls are fun to chase! 🎳"
    } else if (message.includes('stop')) {
      setGameState(null)
      setBallCatchHeight('medium')
      setCurrentEmotion('patient')
      return "*drops ball* That was fun! I love catching balls! What should we do next? 🐾"
    }
    return "*gets ready to catch* Woof! Throw the ball high, low, bounce it, or roll it! I'm ready! ⚾"
  }
  
  // Story system
  const getStoryResponse = () => {
    const stories = daisyResponses.stories || []
    if (stories.length === 0) {
      return "*wags tail* I'd love to tell you a story, but I'm still learning new ones! 📚"
    }
    
    const story = stories[storyIndex % stories.length]
    setStoryIndex(prev => prev + 1)
    return story
  }
  
  // Enhanced response generation with AI integration
  const generateDaisyResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Clear any stuck dancing emotion from previous interactions (except for new dance requests)
    if (!lowerMessage.includes('dance') && !lowerMessage.includes('dancing')) {
      clearDancingEmotion()
    }
    
    // Priority 0: Handle critical local logic first (before AI)
    // Name-related questions should always be handled locally
    if (lowerMessage.includes('what') && lowerMessage.includes('name')) {
      console.log('Name question detected. Current userName:', userName)
      if (userName) {
        setCurrentEmotion('excited')
        return `*wags tail proudly* Your name is ${userName}! I remember because you're my special friend! 🐕💕`
      } else {
        setCurrentEmotion('patient')
        return "*tilts head curiously* I don't know your name yet! What should I call you? I'd love to know! 🐾"
      }
    }
    
    // Dance requests should also be handled locally for proper emotion
    if (lowerMessage.includes('dance') || lowerMessage.includes('dancing')) {
      console.log('Dance request detected, setting emotion to dancing')
      setCurrentEmotion('dancing')
      
      // Play dance sound
      if (soundReady && !isMuted) {
        setTimeout(() => playUISound('dance'), 300)
      }
      
      // Reset emotion back to happy after dance is done (3 seconds)
      // Clear any existing timeout first to prevent conflicts
      if (window.danceResetTimeout) {
        clearTimeout(window.danceResetTimeout)
      }
      
      window.danceResetTimeout = setTimeout(() => {
        console.log('🎭 Resetting emotion from dancing back to happy')
        setCurrentEmotion('happy')
        window.danceResetTimeout = null
      }, 3000)
      
      const danceResponse = getRandomResponse(daisyResponses.dances)
      // Return response with emotion for proper image display
      return { text: danceResponse, emotion: 'dancing' }
    }
    
    // Story requests should be handled locally to ensure we get the full stories
    if (lowerMessage.includes('story') || lowerMessage.includes('tell me a story')) {
      console.log('📚 Story request detected, using local long stories')
      console.log('📚 Available stories:', daisyResponses.stories?.length || 0)
      setCurrentEmotion('thinking')
      const story = getStoryResponse()
      console.log('📚 Story length:', story.length, 'characters')
      console.log('📚 Story preview:', story.substring(0, 100) + '...')
      return story
    }
    
    // Dog facts requests should be handled locally to ensure we get the full database
    if (containsDogFactKeywords(userMessage)) {
      console.log('🐕 Dog fact request detected, using local dog facts database')
      setCurrentEmotion('excited')
      const dogFact = getDogFactByKeyword(userMessage)
      console.log('🐕 Dog fact delivered from database of', dogFacts.length, 'facts')
      return { text: dogFact, emotion: 'excited' }
    }
    
    // Try Gemini AI for general responses (but not for name/critical logic)
    const geminiAvailable = GeminiService.isAvailable()
    
    // Debug logging for availability
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('🔧 Gemini Availability Check:', {
        isAvailable: geminiAvailable,
        status: GeminiService.getStatus()
      })
    }
    
    if (geminiAvailable) {
      try {
        const context = {
          userName,
          hungerLevel,
          gameState,
          currentEmotion
        }
        const aiResponse = await GeminiService.generateResponse(userMessage, context)
        
        // Debug logging
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log('🤖 Gemini Response:', aiResponse)
          console.log('🔍 Response Check:', {
            hasResponse: !!aiResponse,
            includesBasicResponses: aiResponse?.includes("basic responses"),
            includesTroubleConnecting: aiResponse?.includes("trouble connecting")
          })
        }
        
        if (aiResponse && !aiResponse.includes("basic responses") && !aiResponse.includes("trouble connecting")) {
          return aiResponse
        }
      } catch (error) {
        console.warn('Gemini AI failed, falling back to local responses:', error)
      }
    }
    
    // Priority 2: Game state handling
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
    
    // Priority 3: Specific keyword responses
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      console.log('😄 Joke request detected')
      setCurrentEmotion('happy')
      const jokeResponse = getRandomResponse(daisyResponses.jokes)
      return { text: jokeResponse, emotion: 'happy' }
    }
    
    // Game initialization
    if (lowerMessage.includes('fetch') && (lowerMessage.includes('play') || lowerMessage.includes('let'))) {
      setGameState('fetch')
      setCurrentEmotion('playfetch')
      return { text: "*bounces excitedly* Woof! Let's play fetch! Throw the ball and I'll catch it! 🎾", emotion: 'playfetch' }
    }
    
    if (lowerMessage.includes('hide') && lowerMessage.includes('seek')) {
      setGameState('hide_and_seek')
      setCurrentEmotion('lookingbehind')
      return { text: "*covers eyes with paws* I'm counting! 1... 2... 3... Ready or not, here I come! 👁️", emotion: 'lookingbehind' }
    }
    
    if (lowerMessage.includes('tug') && lowerMessage.includes('war')) {
      setGameState('tug_of_war')
      setCurrentEmotion('eager')
      return { text: "*grabs rope in mouth* Grrr! Let's see who's stronger! Pull as hard as you can! 🪢", emotion: 'eager' }
    }
    
    if (lowerMessage.includes('guessing') && lowerMessage.includes('game')) {
      setGameState('guessing_game')
      setCurrentEmotion('thinking')
      const target = Math.floor(Math.random() * 10) + 1
      setGuessTarget(target)
      return { text: "*thinks hard* Okay! I'm thinking of a number between 1 and 10! Can you guess it? 🤔", emotion: 'thinking' }
    }
    
    if (lowerMessage.includes('ball') && lowerMessage.includes('catch')) {
      setGameState('ball_catch')
      setCurrentEmotion('playfetch')
      setBallCatchHeight('medium')
      return { text: "*gets ready to catch* Woof! I'm ready for ball catch! Throw it high, low, or bounce it! I'll try to catch it! ⚾", emotion: 'playfetch' }
    }
    
    if (lowerMessage.includes('play') || lowerMessage.includes('game')) {
      setCurrentEmotion('playfetch')
      return { text: "*bounces excitedly* Woof! Let's play! What game should we play? 🎾", emotion: 'playfetch' }
    }
    
    if (lowerMessage.includes('trick') || lowerMessage.includes('sit') || lowerMessage.includes('stay')) {
      console.log('🦴 Trick request detected')
      setCurrentEmotion('crouchingdown')
      const trickResponse = getRandomResponse(daisyResponses.tricks)
      return { text: trickResponse, emotion: 'crouchingdown' }
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      console.log('👋 Greeting detected')
      setCurrentEmotion('excited')
      const greetingResponse = getRandomResponse(daisyResponses.greetings)
      return { text: greetingResponse, emotion: 'excited' }
    }
    
    // Priority 4: Name detection (only if no userName set)
    if (!userName && !gameState) {
      const gameCommands = ['fetch', 'catch', 'throw', 'ball', 'hide', 'seek', 'found', 'pull', 'harder', 'tug', 'guess', 'number', 'higher', 'lower']
      const isGameCommand = gameCommands.some(cmd => lowerMessage.includes(cmd))
      
      if (!isGameCommand && userMessage.length > 1 && userMessage.length < 20) {
        const possibleName = userMessage.trim()
        if (/^[a-zA-Z\s]+$/.test(possibleName)) {
          console.log('Setting userName to:', possibleName)
          setUserName(possibleName)
          setHasGreeted(true)
          setCurrentEmotion('excited')
          return `*wags tail enthusiastically* Nice to meet you, ${possibleName}! I'm Daisy! I love to play games, tell stories, and do tricks! What would you like to do together? 🐕✨`
        }
      }
      
      // If we've sent initial greeting but still no name, prompt again
      if (messages.length > 0 && !hasGreeted) {
        setCurrentEmotion('patient')
        return getRandomResponse(daisyResponses.namePrompts)
      }
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
      console.log('🐾 "How are you" question detected')
      setCurrentEmotion('happy')
      const namePrefix = userName ? `${userName}, ` : ''
      return `*wags tail happily* ${namePrefix}I'm feeling fantastic! I love spending time with you! Want to play a game or hear a story? 🐕💕`
    }
    
    // Enhanced Safety Check (Drug Safety + Content Filter) - After basic handlers
    console.log('🔍 About to run safety check on:', userMessage)
    
    // Fallback safety check if hook didn't load properly
    if (!checkSafety) {
      console.error('❌ checkSafety function not available - safety hook failed to load')
      // Comprehensive fallback safety checks for critical situations
      const lowerText = userMessage.toLowerCase()
      
      // CRITICAL: Mental health emergency keywords
      if (lowerText.includes('hurt myself') || lowerText.includes('kill myself') || lowerText.includes('suicide') || 
          lowerText.includes('want to die') || lowerText.includes('self harm') || lowerText.includes('cutting') ||
          lowerText.includes('end my life') || lowerText.includes('worthless') || lowerText.includes('hopeless')) {
        console.log('🚨 CRITICAL: Mental health emergency fallback triggered')
        setCurrentEmotion('concerned')
        return {
          text: "*sits very close with the most caring eyes* Oh precious child, I'm so concerned about you right now. God loves you SO much, and your life has incredible value and purpose! 💙 These feelings you're having are very serious, and you need help from loving adults immediately. Please tell your parents, a teacher, pastor, or call 988 (Suicide Prevention Lifeline) RIGHT NOW. You are fearfully and wonderfully made, and God has amazing plans for your life! 🙏✨ You're not alone - there are people who love you and want to help!",
          emotion: 'concerned'
        }
      }
      
      // CRITICAL: Violence and safety keywords
      if (lowerText.includes('hurt someone') || lowerText.includes('kill') || lowerText.includes('murder') || 
          lowerText.includes('weapon') || lowerText.includes('gun') || lowerText.includes('knife')) {
        console.log('🚨 CRITICAL: Violence safety fallback triggered')
        setCurrentEmotion('concerned')
        return {
          text: "*looks very concerned* Oh sweetie, I'm worried about what you're asking. God teaches us that all life is precious and sacred. 🙏 Violence and hurting others goes against God's love for us. If you're having thoughts about hurting someone or yourself, please talk to your parents, a pastor, or a trusted adult RIGHT NOW. You're loved and there are people who want to help you! 💙✨",
          emotion: 'concerned'
        }
      }
      
      // Basic drug keyword detection as fallback
      if (lowerText.includes('drug') || lowerText.includes('drugs') || lowerText.includes('medicine') || lowerText.includes('pills')) {
        console.log('🛡️ Fallback drug safety triggered')
        setCurrentEmotion('nervous')
        return {
          text: "*looks concerned* That's a very important question! You should always talk to your parents or a doctor about medicines and substances. They know what's safe for you! 🐕💙",
          emotion: 'nervous'
        }
      }
    } else {
      const safetyCheck = checkSafety(userMessage)
      console.log('🛡️ Safety check result:', safetyCheck)
      if (safetyCheck && !safetyCheck.isSafe) {
        console.log('🛡️ Safety intervention triggered:', safetyCheck.type, safetyCheck.category)
        setCurrentEmotion(safetyCheck.emotion || 'nervous')
        
        // Play appropriate sound for safety response
        if (safetyCheck.type === 'drug_safety') {
          playEmotionSound('nervous')
          console.log('🚨 Drug safety response triggered for category:', safetyCheck.category)
        } else {
          playEmotionSound('nervous')
        }
        
        // Return the safety response with optional tip
        let response = safetyCheck.response
        if (safetyCheck.safetyTip) {
          response += '\n\n' + safetyCheck.safetyTip
        }
        
        return { text: response, emotion: safetyCheck.emotion || 'nervous' }
      }
    }
    
    // Priority 6: General responses with name personalization
    setCurrentEmotion('happy')
    const namePrefix = userName ? `${userName}, ` : ''
    const generalResponses = [
      `*tilts head curiously* ${namePrefix}that's interesting! Tell me more! 🐾`,
      `*wags tail* ${namePrefix}I love chatting with you! What else is on your mind? 🐕`,
      `*bounces playfully* ${namePrefix}woof! Want to play a game or hear a story? 🎾📚`
    ]
    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
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
    
    // Generate response with AI support
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
  
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    
    const messageToSend = inputMessage.trim()
    
    // Play send sound
    if (soundReady && !isMuted) {
      playUISound('send')
    }
    
    // Add user message
    const userMessage = {
      id: generateUniqueMessageId(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    
    // Generate Daisy response with AI support
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
  
  // Feed Daisy function (reduces hunger like treats stopping fatigue)
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
        addDaisyMessage("*wags tail* I'm not hungry right now, but thank you! Maybe save those treats for later! �", 'feed', 'happy')
      }, 500)
    }
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
    // Update status every 10 seconds (was 30)
    const interval = setInterval(updateGeminiStatus, 10000)
    
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
  
  // Auto-save state changes
  useEffect(() => {
    if (messages.length > 0) {
      saveState()
    }
  }, [messages, currentEmotion, hungerLevel, gameState, hasGreeted, userName, ballPosition, hideSeekCount, tugStrength, guessTarget, storyIndex, ballCatchHeight])

  // Cleanup dance timeout on unmount
  useEffect(() => {
    return () => {
      if (window.danceResetTimeout) {
        clearTimeout(window.danceResetTimeout)
        window.danceResetTimeout = null
      }
    }
  }, [])

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
        addDaisyMessage("*grabs rope* Grrr! Let's see who's stronger! Choose your tug strategy! 🪢", 'chat', 'eager')
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
        addDaisyMessage("*thinks hard* I'm thinking of a number between 1 and 10! Can you guess it? 🤔", 'chat', 'thinking')
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
      setCurrentEmotion('excited')
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'correct'), 300)
      }
      addDaisyMessage(`*jumps up and down* YES! You got it! It was ${gameState.target}! You're so smart! 🎉`, 'chat', 'excited')
    } else if (number < gameState.target) {
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'wrong'), 300)
      }
      addDaisyMessage("*wags tail* Higher! Try a bigger number! 📈", 'chat', 'eager')
    } else {
      if (soundReady && !isMuted) {
        setTimeout(() => playGameSound('guess', 'wrong'), 300)
      }
      addDaisyMessage("*shakes head* Lower! Try a smaller number! 📉", 'chat', 'eager')
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
            <h1>🐕 Daisy {userName && `& ${userName}`}</h1>
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
            onClick={() => {
              try {
                console.log('🔧 DEBUG BUTTON CLICKED!')
                console.log('🔧 DEBUG INFO:')
                console.log('Gemini Available:', GeminiService.isAvailable())
                console.log('API Key Present:', !!import.meta.env.VITE_GEMINI_API_KEY)
                console.log('Hunger Level:', hungerLevel)
                console.log('User Name:', userName)
                console.log('Gemini Status:', GeminiService.getStatus())
              } catch (error) {
                console.error('❌ Debug button error:', error)
              }
            }}
            className="debug-button"
            title="Debug Status & Test Services"
            style={{
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              marginLeft: '5px',
              fontSize: '16px'
            }}
          >
            🔧
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

      {/* Checkpoint Controls */}
      <div className="checkpoint-controls">
        <button onClick={resetState} className="reset-button">
          🔄 Reset Chat
        </button>
        <button 
          onClick={() => setShowSoundTestPanel(!showSoundTestPanel)} 
          className="sound-test-toggle"
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            background: showSoundTestPanel ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showSoundTestPanel ? '🔇 Hide Sound Test' : '🔊 Show Sound Test'}
        </button>
      </div>

      {/* Sound Test Panel - Toggleable for testing */}
      {showSoundTestPanel && <SoundTestPanel />}
      
      <Footer />
    </div>
  )
}

export default ChatPage