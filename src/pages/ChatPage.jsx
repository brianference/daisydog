import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaw, FaBone, FaHome, FaQuestionCircle, FaPaperPlane, FaBrain, FaVolumeUp, FaVolumeMute, FaBook, FaMicrophone } from 'react-icons/fa'
import { daisyResponses } from '../data/daisyResponses'
import { dogFacts, getRandomDogFact, getDogFactByKeyword, containsDogFactKeywords } from '../data/dogFacts'
import { bibleCharacters, getBibleCharacterResponse, containsBibleCharacterKeywords, findBibleCharacter } from '../data/bibleCharacters'
import { catholicCurriculum, getBiblePassageResponse, containsBiblePassageKeywords, getCurriculumResponse, containsCurriculumKeywords, getBibleTopicResponse, containsBibleTopicKeywords, getSpecificVerseResponse, containsSpecificVerseKeywords, containsLessonKeywords, getLessonResponse, findCurriculumGrade } from '../data/catholicCurriculum'
import geminiService from '../services/GeminiService.js'
import supabaseService from '../services/SupabaseService.js'
import catholicDoctrineService from '../services/CatholicDoctrineService.js'
import voiceService from '../services/VoiceService.js'
import TestServicesInitializer from '../services/TestServicesInitializer.js'
import useSoundManagerModular from '../hooks/useSoundManagerModular.js'
import useSafetyFilter from '../hooks/useSafetyFilter.js'
import '../tests/preReleaseTestSuite.js'
import '../tests/gameActionButtonTest.js'
import SoundControls from '../components/SoundControls.jsx'
import SmartDaisyAvatar from '../components/SmartDaisyAvatar.jsx'
import InlineVideoMessage from '../components/InlineVideoMessage.jsx'
import useStableVideoIntegration from '../hooks/useStableVideoIntegration.js'
import GameManager from '../services/GameManager.js'
import { GAME_STATES } from '../types/index.js'
import SoundTestPanel from '../components/SoundTestPanel.jsx'
import BibleTestPanel from '../components/BibleTestPanel.jsx'
import LessonTestPanel from '../components/LessonTestPanel.jsx'
import EnvChecker from '../components/EnvChecker.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import AgeVerification from '../components/AgeVerification'
import VoiceRecorder from '../components/VoiceRecorder.jsx'
import GameSelector from '../components/boardgames/GameSelector.jsx'
import GameContainer from '../components/boardgames/GameContainer.jsx'
import { GameThemeProvider } from '../contexts/GameThemeContext.jsx'
import MemoryMatch from '../components/boardgames/MemoryMatch.jsx'
import TicTacToe from '../components/boardgames/TicTacToe.jsx'
import ConnectFour from '../components/boardgames/ConnectFour.jsx'
import Checkers from '../components/boardgames/Checkers.jsx'
import GoFish from '../components/boardgames/GoFish.jsx'
import SimplePuzzle from '../components/boardgames/SimplePuzzle.jsx'
import ColorMatching from '../components/boardgames/ColorMatching.jsx'
import PatternBuilder from '../components/boardgames/PatternBuilder.jsx'
import WordScramble from '../components/boardgames/WordScramble.jsx'
import { BOARD_GAME_TYPES, GAME_STATUS } from '../types/boardGameTypes.js'
import DebugControlCenter from '../testing/DebugControlCenter.jsx'
import './ChatPage.css'

const ChatPage = () => {
  // Chat state
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [hungerLevel, setHungerLevel] = useState(3)
  const [gameState, setGameState] = useState(null)
  const [bibleMenuState, setBibleMenuState] = useState(null)
  const [constitutionMenuState, setConstitutionMenuState] = useState(null)
  const [activeGameActions, setActiveGameActions] = useState(null) // Track active game action buttons
  const [showDebugMenu, setShowDebugMenu] = useState(false)
  const [showSoundTestPanel, setShowSoundTestPanel] = useState(false)
  const [showBibleTestPanel, setShowBibleTestPanel] = useState(false)
  const [showLessonTestPanel, setShowLessonTestPanel] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [voiceMutedSounds, setVoiceMutedSounds] = useState(false)
  const [showBoardGames, setShowBoardGames] = useState(false)
  const [selectedBoardGame, setSelectedBoardGame] = useState(null)
  const [boardGameStatus, setBoardGameStatus] = useState(GAME_STATUS.NOT_STARTED)

  // Refs
  const messagesEndRef = useRef(null)
  const previousMuteStateRef = useRef(null)

  // Custom hooks - using fallback values if hooks fail
  let soundHook, safetyHook, videoHook
  let volumes, isMuted, playSound, toggleMute, setVolume, setMasterVolume, playEmotionSound, playGameSound, playUISound, playEatingSound, playContextualSound, checkSafety, getVideoForEmotion
  
  try {
    soundHook = useSoundManagerModular()
    volumes = soundHook?.volumes || { master: 0.7 }
    isMuted = soundHook?.isMuted || false
    playSound = soundHook?.playSound || (() => {})
    toggleMute = soundHook?.toggleMute || (() => {})
    setVolume = soundHook?.setVolume || (() => {})
    setMasterVolume = soundHook?.setMasterVolume || (() => {})
    playEmotionSound = soundHook?.playEmotionSound || (() => {})
    playGameSound = soundHook?.playGameSound || (() => {})
    playUISound = soundHook?.playUISound || (() => {})
    playEatingSound = soundHook?.playEatingSound || (() => {})
    playContextualSound = soundHook?.playContextualSound || (() => {})
  } catch (error) {
    console.warn('Sound hook failed:', error)
    volumes = { master: 0.7 }
    isMuted = false
    playSound = () => {}
    toggleMute = () => {}
    setVolume = () => {}
    setMasterVolume = () => {}
    playEmotionSound = () => {}
    playGameSound = () => {}
    playUISound = () => {}
    playEatingSound = () => {}
    playContextualSound = () => {}
  }
  
  try {
    safetyHook = useSafetyFilter()
    checkSafety = safetyHook?.checkSafety || (() => ({ isBlocked: false }))
  } catch (error) {
    console.warn('Safety hook failed:', error)
    checkSafety = () => ({ isBlocked: false })
  }
  
  try {
    videoHook = useStableVideoIntegration()
    // Create a simple getVideoForEmotion function that returns video URLs
    getVideoForEmotion = (emotion) => {
      const videoMap = {
        // Original landscape videos
        'happy': '/assets/happy.mp4',
        'excited': '/assets/dance.mp4',
        'playful': '/assets/roll-over.mp4',
        'curious': '/assets/ears-up.mp4',
        'safety': '/assets/barking.mp4',
        'educational': '/assets/ears-up.mp4',
        'confused': '/assets/lay-down.mp4',
        'calm': '/assets/lay-down.mp4',
        'dance': '/assets/dance.mp4',
        'barking': '/assets/barking.mp4',
        
        // New portrait videos
        'bouncing': '/assets/bouncing.mp4',
        'digging': '/assets/digging.mp4',
        'jumping': '/assets/jumping.mp4',
        'layback': '/assets/layback.mp4',
        'paws': '/assets/paws.mp4',
        'tail-chase': '/assets/tail-chase.mp4',
        'tired': '/assets/tired.mp4',
        'waving': '/assets/waving.mp4',
        
        // Emotion aliases
        'greeting': '/assets/waving.mp4',
        'hello': '/assets/waving.mp4',
        'silly': '/assets/tail-chase.mp4',
        'goofy': '/assets/tail-chase.mp4',
        'searching': '/assets/digging.mp4',
        'exploring': '/assets/digging.mp4',
        'begging': '/assets/paws.mp4',
        'sleepy': '/assets/tired.mp4',
        'exhausted': '/assets/tired.mp4',
        'hyper': '/assets/bouncing.mp4',
        'energetic': '/assets/bouncing.mp4',
        'lounging': '/assets/layback.mp4',
        'comfortable': '/assets/layback.mp4',
        'caring': '/assets/paws.mp4'
      }
      return videoMap[emotion] || videoMap['happy']
    }
  } catch (error) {
    console.warn('Video hook failed:', error)
    getVideoForEmotion = () => null
  }

  // Map app-level emotions to VideoAssetManager canonical keys
  // This ensures InlineVideoMessage can load videos from VideoAssetManager
  const mapEmotionToCanonical = (emotion) => {
    const emotionMap = {
      // App emotions -> VideoAssetManager canonical keys
      'safety': 'barking',
      'educational': 'ears-up',
      'confused': 'lay-down',
      'calm': 'lay-down',
      'playful': 'roll-over',
      'curious': 'ears-up',
      'excited': 'dance',
      'greeting': 'waving',
      'hello': 'waving',
      'silly': 'tail-chase',
      'goofy': 'tail-chase',
      'searching': 'digging',
      'exploring': 'digging',
      'begging': 'paws',
      'caring': 'paws',
      'sleepy': 'tired',
      'exhausted': 'tired',
      'hyper': 'bouncing',
      'energetic': 'bouncing',
      'lounging': 'layback',
      'comfortable': 'layback'
    }
    // Return canonical key if mapped, otherwise return original (assumes it's already canonical)
    return emotionMap[emotion] || emotion
  }

  // Services are imported as singleton instances

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle board games overlay
  useEffect(() => {
    if (gameState?.type === 'boardgames') {
      setShowBoardGames(true);
      setSelectedBoardGame(null);
    } else if (gameState?.type?.startsWith('board_')) {
      // Direct game selection (e.g., board_MEMORY_MATCH)
      const gameType = gameState.type.replace('board_', '');
      setSelectedBoardGame(gameType);
      setShowBoardGames(true);
      setBoardGameStatus(GAME_STATUS.PLAYING);
    }
  }, [gameState])
  
  // Handle board game selection
  const handleBoardGameSelect = (gameType) => {
    setSelectedBoardGame(gameType);
    setBoardGameStatus(GAME_STATUS.PLAYING);
  };
  
  // Handle board game exit
  const handleBoardGameExit = () => {
    setSelectedBoardGame(null);
    setBoardGameStatus(GAME_STATUS.NOT_STARTED);
    setShowBoardGames(false);
    setGameState(null);
  };
  
  // Render selected board game
  const renderBoardGame = () => {
    const gameProps = {
      onExit: handleBoardGameExit,
      onGameEnd: () => setBoardGameStatus(GAME_STATUS.ENDED)
    };
    
    switch(selectedBoardGame) {
      case BOARD_GAME_TYPES.MEMORY_MATCH:
        return <MemoryMatch {...gameProps} />;
      case BOARD_GAME_TYPES.TIC_TAC_TOE:
        return <TicTacToe {...gameProps} />;
      case BOARD_GAME_TYPES.CONNECT_FOUR:
        return <ConnectFour {...gameProps} />;
      case BOARD_GAME_TYPES.CHECKERS:
        return <Checkers {...gameProps} />;
      case BOARD_GAME_TYPES.GO_FISH:
        return <GoFish {...gameProps} />;
      case BOARD_GAME_TYPES.SIMPLE_PUZZLE:
        return <SimplePuzzle {...gameProps} />;
      case BOARD_GAME_TYPES.COLOR_MATCHING:
        return <ColorMatching {...gameProps} />;
      case BOARD_GAME_TYPES.PATTERN_BUILDER:
        return <PatternBuilder {...gameProps} />;
      case BOARD_GAME_TYPES.WORD_SCRAMBLE:
        return <WordScramble {...gameProps} />;
      default:
        return null;
    }
  }

  // Handle verification and create session
  const handleVerificationComplete = (verificationData) => {
    setIsVerified(true)
    
    // Create anonymous session for voice features
    const userAge = verificationData?.age || verificationData
    if (!supabaseService.getCurrentSession()) {
      supabaseService.createAnonymousSession(userAge)
        .then(() => {
          console.log('✅ Session created for voice features')
        })
        .catch(error => {
          console.error('Failed to create session:', error)
        })
    }
  }

  // Handle quick messages
  const handleQuickMessage = (message) => {
    setInputMessage(message)
    handleSendMessage({ preventDefault: () => {} }, message)
  }

  // Handle game action buttons
  const handleGameActionClick = (action) => {
    handleSendMessage({ preventDefault: () => {} }, action.message)
  }

  // Handle voice transcript
  const handleVoiceTranscript = (transcript) => {
    console.log('🎤 Voice transcript received:', transcript)
    setShowVoiceRecorder(false)
    setInputMessage(transcript)
    // Auto-send the voice message with TTS enabled
    handleSendMessage({ preventDefault: () => {} }, transcript, true)
  }

  // Handle voice error
  const handleVoiceError = (error) => {
    console.error('🎤 Voice error:', error)
    setShowVoiceRecorder(false)
    
    // Restore sound if muted by voice
    if (voiceMutedSounds && isMuted) {
      toggleMute()
      setVoiceMutedSounds(false)
    }
    
    // Show error message
    const errorMessage = {
      id: Date.now(),
      text: `Sorry, I couldn't hear that clearly. ${error}`,
      sender: 'daisy',
      timestamp: new Date(),
      videoUrl: getVideoForEmotion('confused'),
      emotion: 'confused'
    }
    setMessages(prev => [...prev, errorMessage])
  }

  // Mute sound effects for voice recording
  const handleMuteSoundForVoice = () => {
    if (!isMuted) {
      toggleMute()
      setVoiceMutedSounds(true)
      console.log('🔇 Muted sounds for voice recording')
    }
  }

  // Unmute sound effects after voice recording
  const handleUnmuteSoundForVoice = () => {
    if (voiceMutedSounds && isMuted) {
      toggleMute()
      setVoiceMutedSounds(false)
      console.log('🔊 Restored sounds after voice')
    }
  }

  // Play TTS with sound muting
  const playTTSWithMute = async (text, emotion = 'HAPPY', mode = 'play') => {
    try {
      // Mute sounds before TTS
      if (!isMuted) {
        toggleMute()
        setVoiceMutedSounds(true)
        console.log('🔇 Muted sounds for TTS playback')
      }
      
      console.log('🗣️ Playing TTS response')
      const audioBlob = await voiceService.generateSpeech(text, emotion, mode)
      await voiceService.playSpeech(audioBlob)
      console.log('✅ TTS playback complete')
    } catch (ttsError) {
      console.error('❌ TTS playback failed:', ttsError)
    } finally {
      // Restore sounds after TTS
      if (voiceMutedSounds && isMuted) {
        toggleMute()
        setVoiceMutedSounds(false)
        console.log('🔊 Restored sounds after TTS')
      }
    }
  }

  // Handle sending messages
  const handleSendMessage = async (e, quickMessage = null, isVoiceInput = false) => {
    e.preventDefault()
    const messageToSend = quickMessage || inputMessage.trim()
    
    if (!messageToSend) return

    setIsTyping(true)
    setInputMessage('')

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Check if a game is active - process game input first
      if (GameManager.isGameActive()) {
        const gameResponse = GameManager.processGameInput(messageToSend)
        
        if (gameResponse) {
          const gameMessage = {
            id: Date.now() + 1,
            text: gameResponse.message,
            sender: 'daisy',
            timestamp: new Date(),
            videoUrl: getVideoForEmotion(gameResponse.emotion || 'happy'),
            emotion: gameResponse.emotion || 'happy'
          }
          setMessages(prev => [...prev, gameMessage])
          
          // Play appropriate sound based on game outcome
          if (gameResponse.gameEnded) {
            playUISound('success').catch(() => {})
            setActiveGameActions(null) // Clear game actions when game ends
          } else {
            playGameSound(GameManager.getCurrentGame()).catch(() => {})
            // Update game actions for next turn
            const gameActions = GameManager.getAvailableActions()
            setActiveGameActions(gameActions)
          }
          
          // Play TTS if voice input was used
          if (isVoiceInput && gameResponse.message) {
            await playTTSWithMute(gameResponse.message, gameResponse.emotion || 'HAPPY', 'play')
          }
          return
        }
      }
      
      // Check safety first
      const safetyResult = checkSafety(messageToSend)
      if (safetyResult && safetyResult.isBlocked) {
        const safetyMessage = {
          id: Date.now() + 1,
          text: safetyResult.response || "Let's talk about something else! 🐕",
          sender: 'daisy',
          timestamp: new Date(),
          videoUrl: getVideoForEmotion('safety'),
          emotion: 'barking'
        }
        setMessages(prev => [...prev, safetyMessage])
        playUISound('failure').catch(() => {})
        
        // Play TTS if voice input was used
        if (isVoiceInput && safetyMessage.text) {
          await playTTSWithMute(safetyMessage.text, 'SAFETY', 'play')
        }
        return
      }
      // Check for biblical character content first
      let biblicalResult = null
      try {
        // Check for biblical characters
        if (containsBibleCharacterKeywords(messageToSend)) {
          biblicalResult = await getBibleCharacterResponse(messageToSend)
        }
      } catch (biblicalError) {
        console.warn('Biblical character check failed:', biblicalError)
      }
      
      if (biblicalResult) {
        const biblicalMessage = {
          id: Date.now() + 2,
          text: biblicalResult,
          sender: 'daisy',
          timestamp: new Date(),
          videoUrl: getVideoForEmotion('educational'),
          emotion: 'ears-up'
        }
        setMessages(prev => [...prev, biblicalMessage])
        playUISound('story').catch(() => {})
        
        // Play TTS if voice input was used
        if (isVoiceInput && biblicalResult) {
          await playTTSWithMute(biblicalResult, 'TEACHING', 'story')
        }
        return
      }

      // Check for constitutional content
      let constitutionalResult = null
      try {
        constitutionalResult = catholicDoctrineService.checkForDoctrineTopics(messageToSend)
      } catch (doctrineError) {
        console.warn('Constitutional doctrine check failed:', doctrineError)
      }
      
      if (constitutionalResult && constitutionalResult.data && constitutionalResult.data.responses) {
        const constitutionalMessage = {
          id: Date.now() + 3,
          text: constitutionalResult.data.responses[0],
          sender: 'daisy',
          timestamp: new Date(),
          videoUrl: getVideoForEmotion('educational'),
          emotion: 'ears-up'
        }
        setMessages(prev => [...prev, constitutionalMessage])
        playUISound('story').catch(() => {})
        
        // Play TTS if voice input was used
        if (isVoiceInput && constitutionalResult.data.responses[0]) {
          await playTTSWithMute(constitutionalResult.data.responses[0], 'TEACHING', 'prayer')
        }
        return
      }

      // If voice input, show thinking message first
      let thinkingMessageId = null
      if (isVoiceInput) {
        thinkingMessageId = Date.now() + 3
        const thinkingMessage = {
          id: thinkingMessageId,
          text: "🐾 Daisy is thinking...",
          sender: 'daisy',
          timestamp: new Date(),
          videoUrl: getVideoForEmotion('thinking'),
          emotion: 'thinking'
        }
        setMessages(prev => [...prev, thinkingMessage])
      }

      // Send to Gemini AI
      const response = await geminiService.generateResponse(messageToSend)
      
      const daisyMessage = {
        id: Date.now() + 4,
        text: response || "*wags tail* I heard you! Let me think about that... 🐕",
        sender: 'daisy',
        timestamp: new Date(),
        videoUrl: getVideoForEmotion('happy'),
        emotion: 'happy'
      }
      
      // Replace thinking message with actual response if voice input
      if (isVoiceInput && thinkingMessageId) {
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingMessageId ? daisyMessage : msg
        ))
      } else {
        setMessages(prev => [...prev, daisyMessage])
      }
      
      // Play TTS if voice input was used (use actual message text, not response)
      console.log('🔍 TTS check:', { isVoiceInput, messageText: daisyMessage.text })
      if (isVoiceInput && daisyMessage.text) {
        // Skip sound effects when using voice to avoid interrupting TTS
        await playTTSWithMute(daisyMessage.text, 'HAPPY', 'play')
      } else {
        // Only play sound effects when NOT using voice
        playEmotionSound('happy').catch(() => {})
      }

      // Log feature usage (COPPA compliant - no personal data)
      try {
        await supabaseService.logFeatureUsage('ai_chat', 'message_sent')
      } catch (logError) {
        console.warn('Logging failed:', logError)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 5,
        text: "*wags tail apologetically* Woof! I'm having trouble thinking right now. Can you try asking me again? 🐕",
        sender: 'daisy',
        timestamp: new Date(),
        videoUrl: getVideoForEmotion('confused'),
        emotion: 'lay-down'
      }
      setMessages(prev => [...prev, errorMessage])
      playUISound('failure').catch(() => {})
    } finally {
      setIsTyping(false)
    }
  }

  // Handle feeding Daisy
  const feedDaisy = () => {
    if (hungerLevel < 5) {
      setHungerLevel(prev => Math.min(prev + 1, 5))
      playEatingSound('happy').catch(() => {})
      
      const feedMessage = {
        id: Date.now(),
        text: "*wags tail excitedly* Woof woof! Thank you for the treat! I feel much better now! 🦴🐕",
        sender: 'daisy',
        timestamp: new Date(),
        videoUrl: getVideoForEmotion('excited'),
        emotion: 'dance'
      }
      setMessages(prev => [...prev, feedMessage])
    }
  }

  // Handle game actions - using GameManager for full gameplay
  const handleGameAction = (gameType) => {
    // Map submenu game types to GAME_STATES
    let actualGameType = null
    let gameResponse = null
    
    // Map game types
    if (gameType.startsWith('fetch-')) {
      actualGameType = GAME_STATES.FETCH
    } else if (gameType.startsWith('hide-')) {
      actualGameType = GAME_STATES.HIDE_AND_SEEK
    } else if (gameType.startsWith('tug-')) {
      actualGameType = GAME_STATES.TUG_OF_WAR
    } else if (gameType.startsWith('guess-')) {
      actualGameType = GAME_STATES.GUESSING_GAME
    } else if (gameType.startsWith('catch-')) {
      // Ball catch - simple one-off game (no game manager)
      const catchMessages = {
        'catch-tennis': "*focuses intently* Tennis ball catch! 🎾 *jumps and catches perfectly* Got it!",
        'catch-baseball': "*gets ready* Baseball catch! ⚾ *makes spectacular diving catch* Nice throw!",
        'catch-football': "*positions carefully* Football catch! 🏈 *leaps high for the catch* Touchdown!",
        'catch-frisbee': "*watches the sky* Frisbee catch! 🥏 *spins and catches gracefully* Perfect catch!"
      }
      
      const gameMessage = {
        id: Date.now(),
        text: catchMessages[gameType] || "*jumps up* I'll catch it! 🏀 *leaps in the air*",
        sender: 'daisy',
        timestamp: new Date(),
        videoUrl: getVideoForEmotion('playful'),
        emotion: 'jumping'
      }
      setMessages(prev => [...prev, gameMessage])
      playGameSound('catch').catch(() => {})
      setGameState(null)
      return
    }
    
    // Start the actual game using GameManager
    if (actualGameType) {
      try {
        gameResponse = GameManager.startGame(actualGameType)
        
        const gameMessage = {
          id: Date.now(),
          text: gameResponse.message,
          sender: 'daisy',
          timestamp: new Date(),
          videoUrl: getVideoForEmotion(gameResponse.emotion || 'playful'),
          emotion: gameResponse.emotion || 'jumping'
        }
        setMessages(prev => [...prev, gameMessage])
        playGameSound(actualGameType).catch(() => {})
        setGameState(null) // Close the game menu
        
        // Get and display game action buttons
        const gameActions = GameManager.getAvailableActions()
        setActiveGameActions(gameActions)
      } catch (error) {
        console.error('Error starting game:', error)
        const errorMessage = {
          id: Date.now(),
          text: "*wags tail apologetically* Woof! Let's try a different game! 🐕",
          sender: 'daisy',
          timestamp: new Date(),
          videoUrl: getVideoForEmotion('confused'),
          emotion: 'lay-down'
        }
        setMessages(prev => [...prev, errorMessage])
        setGameState(null)
        setActiveGameActions(null)
      }
    }
  }

  // Handle dance action
  const handleDanceAction = () => {
    const danceMessage = {
      id: Date.now(),
      text: "*starts dancing excitedly* 💃 Woof woof! Look at me dance! *spins around* I love to dance and move to the music! *does happy dance moves* 🎵✨",
      sender: 'daisy',
      timestamp: new Date(),
      videoUrl: getVideoForEmotion('excited'),
      emotion: 'tail-chase'
    }
    setMessages(prev => [...prev, danceMessage])
    playUISound('dance').catch(() => {})
  }

  // Handle verse of the day
  const handleVerseOfDay = () => {
    const verses = [
      "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. - John 3:16",
      "The Lord is my shepherd, I lack nothing. - Psalm 23:1",
      "And we know that in all things God works for the good of those who love him. - Romans 8:28"
    ]
    const randomVerse = verses[Math.floor(Math.random() * verses.length)]
    const verseMessage = {
      id: Date.now(),
      text: `*sits peacefully* 📖 Here's today's verse:\n\n"${randomVerse}"\n\n*wags tail gently* This verse reminds us of God's love and guidance! 🙏✨`,
      sender: 'daisy',
      timestamp: new Date(),
      videoUrl: getVideoForEmotion('caring'),
      emotion: 'waving'
    }
    setMessages(prev => [...prev, verseMessage])
    playUISound('scripture').catch(() => {})
  }

  // Handle tell a story action
  const handleStoryAction = () => {
    const stories = [
      "*settles down comfortably* 📚 Woof! Let me tell you about the time I helped a little squirrel find his acorns! *wags tail* It was a sunny day and...",
      "*gets cozy* 📚 Once upon a time, there was a brave little puppy who went on an amazing adventure! *eyes sparkle* Want to hear what happened?",
      "*curls up happily* 📚 Ooh, story time! Let me tell you about my friend the wise old owl who taught me something special! *wags tail excitedly*"
    ]
    const randomStory = stories[Math.floor(Math.random() * stories.length)]
    const storyMessage = {
      id: Date.now(),
      text: randomStory,
      sender: 'daisy',
      timestamp: new Date(),
      videoUrl: getVideoForEmotion('happy'),
      emotion: 'digging'
    }
    setMessages(prev => [...prev, storyMessage])
    playUISound('play').catch(() => {})
  }

  // Handle do a trick action
  const handleTrickAction = () => {
    const tricks = [
      "*does a perfect spin* 🦴 Woof! Check out my spin trick! *spins around twice* Ta-da! Did you like it? *wags tail proudly*",
      "*sits up on hind legs* 🦴 Watch this! *balances perfectly* I can sit pretty! *beams with pride* Pretty cool, right?",
      "*rolls over completely* 🦴 Look at this! *does barrel roll* I can roll over! *jumps up excitedly* Want to see it again?"
    ]
    const randomTrick = tricks[Math.floor(Math.random() * tricks.length)]
    const trickMessage = {
      id: Date.now(),
      text: randomTrick,
      sender: 'daisy',
      timestamp: new Date(),
      videoUrl: getVideoForEmotion('playful'),
      emotion: 'roll-over'
    }
    setMessages(prev => [...prev, trickMessage])
    playUISound('trick').catch(() => {})
  }

  // Handle tell a joke action
  const handleJokeAction = () => {
    const jokes = [
      "*bounces excitedly* 😄 Woof! Why don't dogs make good dancers? *bounces* Because they have two left feet! *giggles* Get it? *wags tail*",
      "*bounces around* 😄 Ooh! What do you call a dog magician? *bounces* A labracadabrador! *bounces happily* Isn't that funny?",
      "*bounces with joy* 😄 Here's one! What's a dog's favorite dessert? *bounces* Pupcakes! *bounces excitedly* I love pupcakes too!"
    ]
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
    const jokeMessage = {
      id: Date.now(),
      text: randomJoke,
      sender: 'daisy',
      timestamp: new Date(),
      videoUrl: getVideoForEmotion('bouncing'),
      emotion: 'bouncing'
    }
    setMessages(prev => [...prev, jokeMessage])
    playUISound('play').catch(() => {})
  }

  // Handle export chat functionality
  const handleExportChat = () => {
    try {
      const timestamp = new Date().toISOString()
      const sessionDuration = Math.round((Date.now() - (window.sessionStartTime || Date.now())) / 1000)
      
      let chatReport = `DAISYDOG CHAT EXPORT
========================================
Generated: ${timestamp}
Session Duration: ${sessionDuration}s
Total Messages: ${messages.length}
Daisy Messages: ${messages.filter(m => m.sender === 'daisy').length}
User Messages: ${messages.filter(m => m.sender === 'user').length}
Hunger Level: ${hungerLevel}/5

CHAT CONVERSATION:
========================================`

      messages.forEach((message, index) => {
        const sender = message.sender === 'daisy' ? '🐕 DAISY' : '👤 USER'
        const emotion = message.emotion ? ` (${message.emotion})` : ''
        chatReport += `

[${index + 1}] ${message.timestamp.toLocaleTimeString()} - ${sender}${emotion}:
${message.text}
---`
      })

      chatReport += `

========================================
End of Chat Export
Generated by DaisyDog v6.2.0`

      // Export as .txt file
      console.log('💬 Exporting chat as .txt file with', chatReport.length, 'characters')
      const dataBlob = new Blob([chatReport], { type: 'text/plain' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `daisy-chat-${new Date().toISOString().split('T')[0]}.txt`
      console.log('💬 Download filename:', link.download)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('✅ Chat exported successfully as .txt file')
    } catch (error) {
      console.error('❌ Error exporting chat:', error)
    }
  }

  // Handle export error logs and failures
  const handleExportErrorLogs = async () => {
    try {
      console.log('📋 Collecting comprehensive error logs...')
      
      // Run test suite to get latest errors if available
      let testResults = null
      if (window.runPreReleaseTests) {
        console.log('🧪 Running test suite to capture latest errors...')
        testResults = await window.runPreReleaseTests()
        window.lastTestResults = testResults
      }
      
      // Build comprehensive error report in text format
      const timestamp = new Date().toISOString()
      const sessionDuration = Math.round((Date.now() - (window.sessionStartTime || Date.now())) / 1000)
      
      let errorReport = `DAISYDOG ERROR LOG REPORT
========================================
Generated: ${timestamp}
Session Duration: ${sessionDuration}s
User Agent: ${navigator.userAgent}
URL: ${window.location.href}

SYSTEM STATUS:
========================================
Sound System: ${soundHook?.isReady ? '✅ Ready' : '❌ Not Ready'} (Muted: ${isMuted})
Video System: ${getVideoForEmotion ? '✅ Available' : '❌ Not Available'}
Database: ${supabaseService?.isAvailable() ? '✅ Connected' : '❌ Disconnected'}
Gemini AI: ${geminiService?.isAvailable() ? '✅ Online' : '❌ Offline'}

PERFORMANCE METRICS:
========================================`

      if (performance.memory) {
        errorReport += `
Memory Used: ${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB
Memory Total: ${Math.round(performance.memory.totalJSHeapSize / 1048576)}MB
Memory Limit: ${Math.round(performance.memory.jsHeapSizeLimit / 1048576)}MB`
      } else {
        errorReport += `
Memory Info: Not available`
      }

      // Add console errors
      errorReport += `

CONSOLE ERRORS (${window.errorLog?.length || 0} total):
========================================`
      
      if (window.errorLog && window.errorLog.length > 0) {
        window.errorLog.forEach((error, index) => {
          errorReport += `
[${index + 1}] ${error.timestamp}
Type: ${error.type}
Message: ${error.message}
Stack: ${error.stack ? error.stack.split('\n').slice(0, 3).join('\n    ') : 'No stack trace'}
Filename: ${error.filename || 'Unknown'}
Line: ${error.lineno || 'Unknown'}
Column: ${error.colno || 'Unknown'}
---`
        })
      } else {
        errorReport += `
No console errors recorded in this session.`
      }

      // Add test suite results if available
      if (testResults) {
        errorReport += `

TEST SUITE RESULTS:
========================================
Total Tests: ${testResults.totalTests || 'Unknown'}
Passed: ${testResults.passed || 0}
Failed: ${testResults.failed || 0}
Pass Rate: ${testResults.totalTests ? ((testResults.passed / testResults.totalTests) * 100).toFixed(1) : '0.0'}%

FAILED TESTS BY CATEGORY:`

        if (testResults.categories) {
          Object.entries(testResults.categories).forEach(([category, data]) => {
            if (data.failedTests && data.failedTests.length > 0) {
              errorReport += `

${category.toUpperCase()} FAILURES (${data.failedTests.length}):`
              data.failedTests.forEach((failure, index) => {
                errorReport += `
  ${index + 1}. ${failure}`
              })
            }
            
            // Also include detailed error information from the category
            if (data.details && data.details.length > 0) {
              const errorDetails = data.details.filter(detail => 
                detail.includes('❌') || 
                detail.includes('ERROR') || 
                detail.includes('FAILED') || 
                detail.includes('error:') ||
                detail.toLowerCase().includes('fail')
              );
              
              if (errorDetails.length > 0) {
                errorReport += `

${category.toUpperCase()} DETAILED ERRORS:`
                errorDetails.forEach((detail, index) => {
                  errorReport += `
  ${index + 1}. ${detail}`
                })
              }
            }
          })
        }

        // Add all test details for comprehensive analysis
        errorReport += `

COMPLETE TEST DETAILS BY CATEGORY:`
        Object.entries(testResults.categories).forEach(([category, data]) => {
          errorReport += `

${category.toUpperCase()} CATEGORY:
  Passed: ${data.passed || 0}
  Failed: ${data.failed || 0}
  Total: ${data.total || 0}
  Pass Rate: ${data.total > 0 ? ((data.passed / data.total) * 100).toFixed(1) : '0.0'}%`
          
          if (data.details && data.details.length > 0) {
            errorReport += `
  All Details:`
            data.details.forEach((detail, index) => {
              errorReport += `
    ${index + 1}. ${detail}`
            })
          }
        })

        // Add general errors from test results
        if (testResults.errors && testResults.errors.length > 0) {
          errorReport += `

GENERAL TEST ERRORS:`
          testResults.errors.forEach((error, index) => {
            errorReport += `
  ${index + 1}. ${error}`
          })
        }
      } else {
        errorReport += `

TEST SUITE RESULTS:
========================================
No test results available. Run the test suite first for comprehensive error analysis.`
      }

      // Add system recommendations
      errorReport += `

SYSTEM RECOMMENDATIONS:
========================================`
      
      const recommendations = []
      if (!geminiService?.isAvailable()) {
        recommendations.push('⚠️ Gemini AI offline - Check API key configuration')
      }
      if (!soundHook?.isReady) {
        recommendations.push('⚠️ Sound system not ready - Check audio permissions')
      }
      if (!supabaseService?.isAvailable()) {
        recommendations.push('⚠️ Database disconnected - Check network connection')
      }
      if (window.errorLog && window.errorLog.length > 10) {
        recommendations.push('🚨 High error count - Review console errors above')
      }
      if (testResults && testResults.failed > 5) {
        recommendations.push('🚨 Multiple test failures - Do not deploy until resolved')
      }
      
      if (recommendations.length > 0) {
        recommendations.forEach(rec => {
          errorReport += `
${rec}`
        })
      } else {
        errorReport += `
✅ No critical issues detected`
      }

      errorReport += `

========================================
End of Error Log Report
Generated by DaisyDog Debug Control Center v6.2.0`

      // Export as .txt file
      console.log('📄 Exporting as .txt file with', errorReport.length, 'characters')
      const dataBlob = new Blob([errorReport], { type: 'text/plain' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `daisy-error-logs-${new Date().toISOString().split('T')[0]}.txt`
      console.log('📄 Download filename:', link.download)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('✅ Error logs exported successfully as .txt file')
    } catch (error) {
      console.error('❌ Error exporting error logs:', error)
    }
  }

  // Handle system status check
  const handleSystemStatus = () => {
    try {
      const systemStatus = {
        timestamp: new Date().toISOString(),
        systems: {
          geminiAI: {
            available: geminiService?.isAvailable() || false,
            status: geminiService?.isAvailable() ? '✅ Online' : '❌ Offline'
          },
          soundSystem: {
            available: !!soundHook?.isReady,
            muted: isMuted,
            volumes: volumes,
            status: soundHook?.isReady ? '✅ Ready' : '❌ Not Ready'
          },
          videoSystem: {
            available: !!getVideoForEmotion,
            status: getVideoForEmotion ? '✅ Available' : '❌ Not Available'
          },
          databaseSystem: {
            available: supabaseService?.isAvailable() || false,
            status: supabaseService?.isAvailable() ? '✅ Connected' : '❌ Disconnected'
          },
          menuSystem: {
            gameMenus: !!gameState,
            bibleMenus: !!bibleMenuState,
            constitutionMenus: !!constitutionMenuState,
            status: '✅ Operational'
          }
        },
        performance: {
          memoryUsage: performance.memory ? {
            used: `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB`,
            total: `${Math.round(performance.memory.totalJSHeapSize / 1048576)}MB`,
            limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1048576)}MB`
          } : 'Not available',
          sessionDuration: `${Math.round((Date.now() - (window.sessionStartTime || Date.now())) / 1000)}s`,
          errorCount: window.errorLog?.length || 0
        },
        chatStatus: {
          totalMessages: messages.length,
          daisyMessages: messages.filter(m => m.sender === 'daisy').length,
          userMessages: messages.filter(m => m.sender === 'user').length,
          hungerLevel: hungerLevel
        }
      }
      
      console.log('🔍 SYSTEM STATUS REPORT')
      console.log('========================')
      Object.entries(systemStatus.systems).forEach(([system, data]) => {
        console.log(`${system.toUpperCase()}: ${data.status}`)
      })
      console.log('========================')
      console.log('Performance:', systemStatus.performance)
      console.log('Chat Status:', systemStatus.chatStatus)
      console.log('Full Report:', systemStatus)
      
      // Also store for potential export
      window.lastSystemStatus = systemStatus
      
    } catch (error) {
      console.error('❌ Error checking system status:', error)
    }
  }

  // Handle export test failures
  const handleExportTestFailures = async () => {
    try {
      console.log('🧪 Running comprehensive test suite for export...')
      
      // Run the test suite and capture results
      let testResults = null
      if (window.runPreReleaseTests) {
        testResults = await window.runPreReleaseTests()
      } else {
        console.warn('Test suite not available, exporting cached results')
        testResults = window.lastTestResults || {
          error: 'Test suite not available',
          timestamp: new Date().toISOString()
        }
      }
      
      const failureReport = {
        timestamp: new Date().toISOString(),
        testSuiteVersion: '6.2.0',
        systemInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          connectionType: navigator.connection?.effectiveType || 'unknown'
        },
        testResults: testResults,
        failureAnalysis: {
          criticalFailures: [],
          warningFailures: [],
          errorCodes: [],
          recommendedActions: []
        },
        environmentStatus: {
          geminiAI: geminiService?.isAvailable() || false,
          soundSystem: soundHook?.isReady || false,
          videoSystem: !!getVideoForEmotion,
          databaseConnection: supabaseService?.isAvailable() || false
        }
      }
      
      // Analyze failures if test results are available
      if (testResults && testResults.categories) {
        Object.entries(testResults.categories).forEach(([category, data]) => {
          if (data.failedTests && data.failedTests.length > 0) {
            data.failedTests.forEach(failure => {
              const failureObj = {
                category: category,
                description: failure,
                severity: failure.includes('CRITICAL') ? 'critical' : 'warning',
                timestamp: new Date().toISOString()
              }
              
              if (failureObj.severity === 'critical') {
                failureReport.failureAnalysis.criticalFailures.push(failureObj)
              } else {
                failureReport.failureAnalysis.warningFailures.push(failureObj)
              }
            })
          }
        })
      }
      
      // Add error codes from console
      if (window.errorLog) {
        failureReport.failureAnalysis.errorCodes = window.errorLog.map(error => ({
          code: error.code || 'UNKNOWN',
          message: error.message || error,
          timestamp: error.timestamp || new Date().toISOString(),
          stack: error.stack || 'No stack trace'
        }))
      }
      
      // Generate recommended actions
      if (failureReport.failureAnalysis.criticalFailures.length > 0) {
        failureReport.failureAnalysis.recommendedActions.push('🚨 CRITICAL: Do not deploy until critical failures are resolved')
      }
      if (!failureReport.environmentStatus.geminiAI) {
        failureReport.failureAnalysis.recommendedActions.push('⚠️ Gemini AI not available - check API key')
      }
      if (!failureReport.environmentStatus.soundSystem) {
        failureReport.failureAnalysis.recommendedActions.push('⚠️ Sound system not initialized - check audio permissions')
      }
      
      // Convert to text format
      let failureReportText = `DAISYDOG TEST FAILURE REPORT
========================================
Generated: ${failureReport.timestamp}
Test Suite Version: ${failureReport.testSuiteVersion}
User Agent: ${failureReport.systemInfo.userAgent}
Viewport: ${failureReport.systemInfo.viewport}
Connection: ${failureReport.systemInfo.connectionType}

ENVIRONMENT STATUS:
========================================
Gemini AI: ${failureReport.environmentStatus.geminiAI ? '✅ Online' : '❌ Offline'}
Sound System: ${failureReport.environmentStatus.soundSystem ? '✅ Ready' : '❌ Not Ready'}
Video System: ${failureReport.environmentStatus.videoSystem ? '✅ Available' : '❌ Not Available'}
Database: ${failureReport.environmentStatus.databaseConnection ? '✅ Connected' : '❌ Disconnected'}

TEST RESULTS SUMMARY:
========================================`

      if (failureReport.testResults) {
        failureReportText += `
Total Tests: ${failureReport.testResults.totalTests || 'Unknown'}
Passed: ${failureReport.testResults.passed || 0}
Failed: ${failureReport.testResults.failed || 0}
Pass Rate: ${failureReport.testResults.totalTests ? ((failureReport.testResults.passed / failureReport.testResults.totalTests) * 100).toFixed(1) : '0.0'}%`
      }

      failureReportText += `

CRITICAL FAILURES (${failureReport.failureAnalysis.criticalFailures.length}):
========================================`
      failureReport.failureAnalysis.criticalFailures.forEach((failure, index) => {
        failureReportText += `
${index + 1}. ${failure.category}: ${failure.description}
   Severity: ${failure.severity}
   Time: ${failure.timestamp}`
      })

      failureReportText += `

WARNING FAILURES (${failureReport.failureAnalysis.warningFailures.length}):
========================================`
      failureReport.failureAnalysis.warningFailures.forEach((failure, index) => {
        failureReportText += `
${index + 1}. ${failure.category}: ${failure.description}
   Severity: ${failure.severity}
   Time: ${failure.timestamp}`
      })

      failureReportText += `

ERROR CODES (${failureReport.failureAnalysis.errorCodes.length}):
========================================`
      failureReport.failureAnalysis.errorCodes.forEach((error, index) => {
        failureReportText += `
${index + 1}. Code: ${error.code}
   Message: ${error.message}
   Time: ${error.timestamp}
   Stack: ${error.stack}`
      })

      failureReportText += `

RECOMMENDED ACTIONS:
========================================`
      failureReport.failureAnalysis.recommendedActions.forEach((action, index) => {
        failureReportText += `
${index + 1}. ${action}`
      })

      failureReportText += `

========================================
End of Test Failure Report
Generated by DaisyDog Debug Control Center v6.2.0`

      console.log('📊 Exporting test failures as .txt file with', failureReportText.length, 'characters')
      const dataBlob = new Blob([failureReportText], { type: 'text/plain' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `daisy-test-failures-${new Date().toISOString().split('T')[0]}.txt`
      console.log('📊 Download filename:', link.download)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('✅ Test failure report exported successfully')
    } catch (error) {
      console.error('❌ Error exporting test failures:', error)
    }
  }

  // Initialize error logging system
  useEffect(() => {
    // Set up global error logging
    if (!window.errorLog) {
      window.errorLog = []
      window.sessionStartTime = Date.now()
    }
    
    // Capture console errors
    const originalConsoleError = console.error
    console.error = (...args) => {
      const errorMessage = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      }).join(' ')
      
      window.errorLog.push({
        type: 'console.error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
        args: args.length > 1 ? args : undefined
      })
      originalConsoleError.apply(console, args)
    }
    
    // Capture console warnings
    const originalConsoleWarn = console.warn
    console.warn = (...args) => {
      window.errorLog.push({
        type: 'console.warn',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      })
      originalConsoleWarn.apply(console, args)
    }
    
    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      window.errorLog.push({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || event.reason,
        timestamp: new Date().toISOString(),
        stack: event.reason?.stack || 'No stack trace'
      })
    }
    
    // Capture JavaScript errors
    const handleError = (event) => {
      window.errorLog.push({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        stack: event.error?.stack || 'No stack trace'
      })
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)
    
    return () => {
      // Cleanup
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  // Initialize services and welcome message on mount
  useEffect(() => {
    try {
      TestServicesInitializer.initialize()
      
      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        text: "*wags tail excitedly* Woof woof! Hi there! I'm Daisy, your friendly AI companion! 🐕 I'm so happy to see you! We can chat, play games, learn about the Bible and Constitution, or I can tell you stories and jokes! What would you like to do today? *bounces with joy* 🎾✨",
        sender: 'daisy',
        timestamp: new Date(),
        videoUrl: getVideoForEmotion('happy'),
        emotion: 'happy'
      }
      setMessages([welcomeMessage])
      playEmotionSound('happy').catch(() => {})
    } catch (error) {
      console.error('Error initializing ChatPage:', error)
      // Fallback welcome message without video/sound
      const fallbackMessage = {
        id: Date.now(),
        text: "Hi there! I'm Daisy, your friendly AI companion! 🐕 Welcome to our chat!",
        sender: 'daisy',
        timestamp: new Date()
      }
      setMessages([fallbackMessage])
    }
  }, [])

  return (
    <div className="chat-page">
      <Header />
      
      {/* Debug Button */}
      <button
        onClick={() => setShowDebugMenu(!showDebugMenu)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1002,
          background: showDebugMenu ? '#dc3545' : 'none',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '5px',
          cursor: 'pointer'
        }}
        className="comprehensive-debug-button"
        title="Comprehensive Debug Control Center"
      >
        ⚙️
      </button>

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
          <div className="api-status">
            <FaBrain className={`brain-icon ${geminiService.isAvailable() ? 'active' : 'inactive'}`} />
            <span className="status-text">
              {geminiService.isAvailable() ? 'AI Active' : 'Local Mode'}
            </span>
          </div>
          <SoundControls
            volume={volumes.master}
            muted={isMuted}
            soundsEnabled={true}
            onVolumeChange={(v) => setMasterVolume(v)}
            onToggleMute={toggleMute}
            onToggleSounds={() => { /* sounds always enabled in current build */ }}
          />
        </div>
      </div>
      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            {message.sender === 'daisy' && (
              <SmartDaisyAvatar 
                message={message}
                emotion={message.emotion || 'happy'}
                useVideo={false}
                className="message-avatar"
                key={`avatar-${message.id}-${message.emotion || 'happy'}`}
              />
            )}
            <div className="message-content">
              {/* Inline video for enhanced experience */}
              {message.sender === 'daisy' && message.emotion ? (
                <InlineVideoMessage
                  emotion={message.emotion}
                  message={message.text}
                  shouldShowVideo={true}
                  priority="medium"
                />
              ) : (
                <div className="message-text">{message.text}</div>
              )}
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <motion.div 
            className="message daisy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Integrated Quick Actions */}
      <div className="input-container">
        {/* Sub-Menus in Input Container - RENDER ABOVE BUTTONS */}
        {gameState?.type === 'selection' && (
          <div className="submenu-container">
            <h4>🎮 Choose a Game!</h4>
            <div className="submenu-buttons">
              <button onClick={() => setGameState({ type: 'board_MEMORY_MATCH' })} className="submenu-btn">
                🃏 Memory Match
              </button>
              <button onClick={() => setGameState({ type: 'board_TIC_TAC_TOE' })} className="submenu-btn">
                ❌⭕ Tic-Tac-Toe
              </button>
              <button onClick={() => setGameState({ type: 'board_CONNECT_FOUR' })} className="submenu-btn">
                🔴🟡 Connect Four
              </button>
              <button onClick={() => setGameState({ type: 'boardgames' })} className="submenu-btn">
                🎲 More Games
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

        {/* Bible Third-Level Menus */}
        {bibleMenuState?.type === 'characters' && (
          <div className="submenu-container">
            <h4>👥 Bible Characters</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleQuickMessage('Tell me about Jesus')} className="submenu-btn">
                ✝️ Jesus
              </button>
              <button onClick={() => handleQuickMessage('Tell me about Mary')} className="submenu-btn">
                💙 Mary
              </button>
              <button onClick={() => handleQuickMessage('Tell me about David')} className="submenu-btn">
                🎯 David
              </button>
              <button onClick={() => handleQuickMessage('Tell me about Moses')} className="submenu-btn">
                🌊 Moses
              </button>
              <button onClick={() => handleQuickMessage('Tell me about Noah')} className="submenu-btn">
                🚢 Noah
              </button>
              <button onClick={() => setBibleMenuState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {bibleMenuState?.type === 'stories' && (
          <div className="submenu-container">
            <h4>📚 Bible Stories</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleQuickMessage('Tell me about Noah and the ark')} className="submenu-btn">
                🚢 Noah's Ark
              </button>
              <button onClick={() => handleQuickMessage('Tell me about David and Goliath')} className="submenu-btn">
                🎯 David & Goliath
              </button>
              <button onClick={() => handleQuickMessage('Tell me about the Good Samaritan')} className="submenu-btn">
                🤗 Good Samaritan
              </button>
              <button onClick={() => handleQuickMessage('Tell me about the Christmas story')} className="submenu-btn">
                🌟 Christmas Story
              </button>
              <button onClick={() => setBibleMenuState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {bibleMenuState?.type === 'verses' && (
          <div className="submenu-container">
            <h4>📜 Bible Verses</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleQuickMessage('Tell me about John 3:16')} className="submenu-btn">
                💕 John 3:16
              </button>
              <button onClick={() => handleQuickMessage('Tell me about Psalm 23')} className="submenu-btn">
                🐑 Psalm 23
              </button>
              <button onClick={() => handleQuickMessage('Tell me about Matthew 19:14')} className="submenu-btn">
                👶 Matthew 19:14
              </button>
              <button onClick={() => handleVerseOfDay()} className="submenu-btn">
                🎲 Random Verse
              </button>
              <button onClick={() => setBibleMenuState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {bibleMenuState?.type === 'prayers' && (
          <div className="submenu-container">
            <h4>🙏 Prayers</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleQuickMessage('Teach me the Our Father prayer')} className="submenu-btn">
                ✝️ Our Father
              </button>
              <button onClick={() => handleQuickMessage('Teach me the Hail Mary prayer')} className="submenu-btn">
                💙 Hail Mary
              </button>
              <button onClick={() => handleQuickMessage('Teach me a bedtime prayer')} className="submenu-btn">
                🌙 Bedtime Prayer
              </button>
              <button onClick={() => handleQuickMessage('Teach me a meal prayer')} className="submenu-btn">
                🍽️ Meal Prayer
              </button>
              <button onClick={() => setBibleMenuState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {/* Constitution Third-Level Menus */}
        {constitutionMenuState?.type === 'bill-of-rights' && (
          <div className="submenu-container">
            <h4>📋 Bill of Rights</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleQuickMessage('tell me about the first amendment')} className="submenu-btn">
                🗣️ 1st Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the second amendment')} className="submenu-btn">
                🔫 2nd Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the third amendment')} className="submenu-btn">
                🏠 3rd Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the fourth amendment')} className="submenu-btn">
                🔍 4th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the fifth amendment')} className="submenu-btn">
                ⚖️ 5th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the sixth amendment')} className="submenu-btn">
                👨‍⚖️ 6th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the seventh amendment')} className="submenu-btn">
                🏛️ 7th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the eighth amendment')} className="submenu-btn">
                ⛓️ 8th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the ninth amendment')} className="submenu-btn">
                📜 9th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the tenth amendment')} className="submenu-btn">
                🏛️ 10th Amendment
              </button>
              <button onClick={() => setConstitutionMenuState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {constitutionMenuState?.type === 'amendments' && (
          <div className="submenu-container">
            <h4>📝 Constitutional Amendments</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleQuickMessage('tell me about the thirteenth amendment')} className="submenu-btn">
                ⛓️ 13th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the fourteenth amendment')} className="submenu-btn">
                ⚖️ 14th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the fifteenth amendment')} className="submenu-btn">
                🗳️ 15th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the sixteenth amendment')} className="submenu-btn">
                💰 16th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the seventeenth amendment')} className="submenu-btn">
                🏛️ 17th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the eighteenth amendment')} className="submenu-btn">
                🚫 18th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the nineteenth amendment')} className="submenu-btn">
                👩‍🦳 19th Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the twenty-first amendment')} className="submenu-btn">
                🍷 21st Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the twenty-second amendment')} className="submenu-btn">
                🎩 22nd Amendment
              </button>
              <button onClick={() => handleQuickMessage('tell me about the twenty-sixth amendment')} className="submenu-btn">
                🗳️ 26th Amendment
              </button>
              <button onClick={() => setConstitutionMenuState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {constitutionMenuState?.type === 'founding-documents' && (
          <div className="submenu-container">
            <h4>📜 Founding Documents</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleQuickMessage('tell me about the Declaration of Independence')} className="submenu-btn">
                📜 Declaration
              </button>
              <button onClick={() => handleQuickMessage('tell me about the Constitution')} className="submenu-btn">
                🇺🇸 Constitution
              </button>
              <button onClick={() => handleQuickMessage('tell me about the Bill of Rights')} className="submenu-btn">
                📋 Bill of Rights
              </button>
              <button onClick={() => setConstitutionMenuState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {constitutionMenuState?.type === 'founding-fathers' && (
          <div className="submenu-container">
            <h4>👨‍💼 Founding Fathers</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleQuickMessage('tell me about George Washington')} className="submenu-btn">
                🎩 Washington
              </button>
              <button onClick={() => handleQuickMessage('tell me about Thomas Jefferson')} className="submenu-btn">
                ✍️ Jefferson
              </button>
              <button onClick={() => handleQuickMessage('tell me about Benjamin Franklin')} className="submenu-btn">
                ⚡ Franklin
              </button>
              <button onClick={() => handleQuickMessage('tell me about John Adams')} className="submenu-btn">
                👨‍⚖️ Adams
              </button>
              <button onClick={() => setConstitutionMenuState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {/* Game Third-Level Menus */}
        {gameState?.type === 'fetch' && (
          <div className="submenu-container">
            <h4>🎾 Fetch Game Options</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleGameAction('fetch-easy')} className="submenu-btn">
                🟢 Easy Fetch
              </button>
              <button onClick={() => handleGameAction('fetch-medium')} className="submenu-btn">
                🟡 Medium Fetch
              </button>
              <button onClick={() => handleGameAction('fetch-hard')} className="submenu-btn">
                🔴 Hard Fetch
              </button>
              <button onClick={() => handleGameAction('fetch-super')} className="submenu-btn">
                ⭐ Super Fetch
              </button>
              <button onClick={() => setGameState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {gameState?.type === 'catch' && (
          <div className="submenu-container">
            <h4>⚾ Ball Catch Options</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleGameAction('catch-tennis')} className="submenu-btn">
                🎾 Tennis Ball
              </button>
              <button onClick={() => handleGameAction('catch-baseball')} className="submenu-btn">
                ⚾ Baseball
              </button>
              <button onClick={() => handleGameAction('catch-football')} className="submenu-btn">
                🏈 Football
              </button>
              <button onClick={() => handleGameAction('catch-frisbee')} className="submenu-btn">
                🥏 Frisbee
              </button>
              <button onClick={() => setGameState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {gameState?.type === 'tug' && (
          <div className="submenu-container">
            <h4>🪢 Tug of War Options</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleGameAction('tug-rope')} className="submenu-btn">
                🪢 Rope Tug
              </button>
              <button onClick={() => handleGameAction('tug-toy')} className="submenu-btn">
                🧸 Toy Tug
              </button>
              <button onClick={() => handleGameAction('tug-stick')} className="submenu-btn">
                🪵 Stick Tug
              </button>
              <button onClick={() => handleGameAction('tug-challenge')} className="submenu-btn">
                💪 Challenge Mode
              </button>
              <button onClick={() => setGameState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {gameState?.type === 'hide' && (
          <div className="submenu-container">
            <h4>🙈 Hide & Seek Options</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleGameAction('hide-easy')} className="submenu-btn">
                🟢 Easy Hiding
              </button>
              <button onClick={() => handleGameAction('hide-medium')} className="submenu-btn">
                🟡 Medium Hiding
              </button>
              <button onClick={() => handleGameAction('hide-hard')} className="submenu-btn">
                🔴 Hard Hiding
              </button>
              <button onClick={() => handleGameAction('hide-master')} className="submenu-btn">
                🎭 Master Level
              </button>
              <button onClick={() => setGameState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}

        {gameState?.type === 'guess' && (
          <div className="submenu-container">
            <h4>🔢 Guessing Game Options</h4>
            <div className="submenu-buttons">
              <button onClick={() => handleGameAction('guess-numbers')} className="submenu-btn">
                🔢 Number Guess
              </button>
              <button onClick={() => handleGameAction('guess-colors')} className="submenu-btn">
                🌈 Color Guess
              </button>
              <button onClick={() => handleGameAction('guess-animals')} className="submenu-btn">
                🐾 Animal Guess
              </button>
              <button onClick={() => handleGameAction('guess-riddle')} className="submenu-btn">
                🧩 Riddle Game
              </button>
              <button onClick={() => setGameState({ type: 'selection' })} className="submenu-btn close-btn">
                ⬅️ Back
              </button>
            </div>
          </div>
        )}
        
        {/* Game Action Buttons - Show when game is active */}
        {activeGameActions && activeGameActions.length > 0 ? (
          <div className="submenu-container game-actions-active">
            <h4>🎮 Game Actions</h4>
            <div className="submenu-buttons">
              {activeGameActions.map((action) => (
                <button 
                  key={action.id} 
                  onClick={() => handleGameActionClick(action)} 
                  className="submenu-btn game-action-btn"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Quick Actions Row - Show when no game active */
          <div className="quick-actions-compact">
            <button 
              onClick={() => window.open('https://www.readkidz.com/share/ebook/1969460528838705153', '_blank', 'noopener,noreferrer')} 
              className="quick-btn"
              data-tooltip="Read the Book"
            >
              📖
            </button>
            <button 
              onClick={handleStoryAction} 
              className="quick-btn"
              data-tooltip="Tell me a story"
            >
              📚
            </button>
            <button 
              onClick={handleJokeAction} 
              className="quick-btn"
              data-tooltip="Tell a joke"
            >
              😄
            </button>
            <button 
              onClick={handleTrickAction} 
              className="quick-btn"
              data-tooltip="Do a trick"
            >
              🦴
            </button>
            <button 
              onClick={handleDanceAction} 
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
        )}
        
        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <div className="voice-recorder-container">
            <VoiceRecorder
              onTranscriptComplete={handleVoiceTranscript}
              onError={handleVoiceError}
              onMuteSound={handleMuteSoundForVoice}
              onUnmuteSound={handleUnmuteSoundForVoice}
              disabled={isTyping}
            />
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
              type="button"
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              className="voice-button"
              disabled={isTyping}
              data-tooltip="Voice message"
            >
              <FaMicrophone />
            </button>
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
      
      {/* Debug Control Center */}
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
                backgroundColor: showSoundTestPanel ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔊 {showSoundTestPanel ? 'Hide' : 'Show'} Sound Test Panel
            </button>
            <button 
              onClick={() => setShowBibleTestPanel(!showBibleTestPanel)}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: showBibleTestPanel ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📖 {showBibleTestPanel ? 'Hide' : 'Show'} Bible Test Panel
            </button>
            <button 
              onClick={() => setShowLessonTestPanel(!showLessonTestPanel)}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: showLessonTestPanel ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📚 {showLessonTestPanel ? 'Hide' : 'Show'} Lesson Test Panel
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Quick Tests:</h4>
            <button 
              onClick={async () => {
                if (window.quickTest) {
                  console.log('🚀 Starting Quick Test...');
                  try {
                    const results = await window.quickTest();
                    console.log('✅ Quick Test completed successfully!', results);
                  } catch (error) {
                    console.error('❌ Quick Test failed:', error);
                  }
                } else {
                  console.log('❌ Quick test not available - test suite not loaded');
                }
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
                cursor: 'pointer'
              }}
            >
              ⚡ Run Quick Test
            </button>
            <button 
              onClick={async () => {
                if (window.runPreReleaseTests) {
                  console.log('🧪 Starting Full Test Suite...');
                  try {
                    const results = await window.runPreReleaseTests();
                    console.log('✅ Full Test Suite completed!', results);
                    window.lastTestResults = results; // Store for export
                  } catch (error) {
                    console.error('❌ Full Test Suite failed:', error);
                  }
                } else {
                  console.log('❌ Pre-release tests not available - test suite not loaded');
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
            <button 
              onClick={handleExportChat}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💾 Export Chat
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Export Reports:</h4>
            <button 
              onClick={handleExportErrorLogs}
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
              🚨 Export Error Logs
            </button>
            <button 
              onClick={handleExportTestFailures}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: '#fd7e14',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📊 Export Test Failures
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>System Monitoring:</h4>
            <button 
              onClick={handleSystemStatus}
              style={{ 
                display: 'block', 
                width: '100%', 
                margin: '5px 0', 
                padding: '8px', 
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔍 System Status Check
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
      
      {/* Test Panels */}
      {showSoundTestPanel && <SoundTestPanel />}
      {showBibleTestPanel && <BibleTestPanel />}
      {showLessonTestPanel && <LessonTestPanel />}
      
      {/* Board Games Overlay */}
      {showBoardGames && (
        <GameThemeProvider>
          {!selectedBoardGame ? (
            <GameSelector 
              onSelectGame={handleBoardGameSelect}
              onClose={handleBoardGameExit}
            />
          ) : (
            <GameContainer
              gameType={selectedBoardGame}
              gameStatus={boardGameStatus}
              onExit={handleBoardGameExit}
              onRestart={() => {
                setSelectedBoardGame(null);
                setBoardGameStatus(GAME_STATUS.NOT_STARTED);
              }}
            >
              {renderBoardGame()}
            </GameContainer>
          )}
        </GameThemeProvider>
      )}
      
      {/* Age Verification */}
      {!isVerified && <AgeVerification onVerificationComplete={handleVerificationComplete} />}
      
      <Footer />
      
      {/* Debug Control Center */}
      <DebugControlCenter />
    </div>
  )
}

export default ChatPage
