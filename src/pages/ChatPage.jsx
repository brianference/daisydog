import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaw, FaBone, FaHome, FaQuestionCircle, FaPaperPlane, FaBrain, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { daisyResponses } from '../data/daisyResponses'
import { dogFacts, getRandomDogFact, getDogFactByKeyword, containsDogFactKeywords } from '../data/dogFacts'
import GeminiService from '../services/GeminiService.js'
import useSoundManagerModular from '../hooks/useSoundManagerModular.js'
import SoundControls from '../components/SoundControls.jsx'
import SoundTestPanel from '../components/SoundTestPanel.jsx'
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
  
  // Checkpoint system
  const [lastSaved, setLastSaved] = useState(null)
  
  // Refs
  const messagesEndRef = useRef(null)
  const messageIdCounter = useRef(0)
  
  // Helper functions
  const generateUniqueMessageId = () => {
    // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    
    // Fallback: timestamp + random string + counter
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const counter = messageIdCounter.current++
    return `msg-${timestamp}-${random}-${counter}`
  }
  
  const getRandomResponse = (responses) => {
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return "Woof! I'm having trouble finding my words right now! 🐕"
    }
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
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
    if (finalEmotion === 'dancing' || text.toLowerCase().includes('dance')) {
      console.log('💃 addDaisyMessage called with dance content')
      console.log('💃 Emotion parameter:', emotion)
      console.log('💃 Current emotion:', currentEmotion)
      console.log('💃 Final emotion used:', finalEmotion)
    }
    
    const newMessage = {
      id: `daisy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender: 'daisy',
      timestamp: new Date(),
      type,
      emotionImage: getEmotionImage(finalEmotion)
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
      const danceResponse = getRandomResponse(daisyResponses.dances)
      // Return response with emotion for proper image display
      return { text: danceResponse, emotion: 'dancing' }
    }
    
    // Story requests should be handled locally to ensure we get the full stories
    if (lowerMessage.includes('story') || lowerMessage.includes('tell me a story')) {
      console.log('Story request detected, using local long stories')
      setCurrentEmotion('thinking')
      const story = getStoryResponse()
      console.log('Story length:', story.length, 'characters')
      return story
    }
    
    // Dog facts requests should be handled locally to ensure we get the full database
    if (containsDogFactKeywords(userMessage)) {
      console.log('Dog fact request detected, using local dog facts database')
      setCurrentEmotion('excited')
      const dogFact = getDogFactByKeyword(userMessage)
      console.log('Dog fact delivered from database of', dogFacts.length, 'facts')
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
    
    // Priority 1: Check for inappropriate content
    const inappropriateWords = ['stupid', 'dumb', 'hate', 'kill', 'die', 'bad dog']
    if (inappropriateWords.some(word => lowerMessage.includes(word))) {
      setCurrentEmotion('nervous')
      return "*whimpers softly* That makes me sad. Can we talk about something happier? I love playing games and hearing stories! 🐕💙"
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
    }
  }
}