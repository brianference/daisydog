import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaw, FaBone, FaHome, FaQuestionCircle, FaPaperPlane, FaBrain } from 'react-icons/fa'
import { daisyResponses } from '../data/daisyResponses'
import GeminiService from '../services/GeminiService.js'
import './ChatPage.css'

const ChatPage = () => {
  // Core state
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
  
  // API integration states
  const [geminiStatus, setGeminiStatus] = useState(null)
  
  // Checkpoint system
  const [lastSaved, setLastSaved] = useState(null)
  
  // Refs
  const messagesEndRef = useRef(null)
  
  // Helper functions
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
    return `/assets/images/emotions/${mappedEmotion}.png`
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
        setMessages(state.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
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
        setLastSaved(new Date(state.savedAt))
        return true
      }
    } catch (error) {
      console.warn('Failed to load state:', error)
    }
    return false
  }
  
  const resetState = () => {
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
    setLastSaved(null)
  }
  
  const addDaisyMessage = (text, type = 'chat') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'daisy',
      timestamp: new Date(),
      type,
      emotionImage: getEmotionImage()
    }
    setMessages(prev => [...prev, newMessage])
    saveState()
  }
  
  // Game handling functions
  const handleFetchGame = (message) => {
    if (message.includes('throw') || message.includes('fetch')) {
      setBallPosition('thrown')
      setCurrentEmotion('playfetch')
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
        return "*lets go of rope and wags tail* You win! You're really strong! That was awesome! 💪"
      }
      setCurrentEmotion('eager')
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
    
    const guess = parseInt(message)
    if (isNaN(guess)) {
      return "*tilts head* I need a number between 1 and 10! Try again! 🔢"
    }
    
    if (guess === guessTarget) {
      setGameState(null)
      setGuessTarget(null)
      setCurrentEmotion('excited')
      return `*jumps up and down* YES! You got it! It was ${guessTarget}! You're so smart! 🎉`
    } else if (guess < guessTarget) {
      setCurrentEmotion('eager')
      return "*wags tail* Higher! Try a bigger number! 📈"
    } else {
      setCurrentEmotion('eager')
      return "*shakes head* Lower! Try a smaller number! 📉"
    }
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
    
    // Try Gemini AI first if available
    if (GeminiService.isAvailable()) {
      try {
        const context = {
          userName,
          hungerLevel,
          gameState,
          currentEmotion
        }
        const aiResponse = await GeminiService.generateResponse(userMessage, context)
        if (aiResponse && !aiResponse.includes("I'm using my basic responses")) {
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
    }
    
    // Priority 3: Specific keyword responses
    if (lowerMessage.includes('story') || lowerMessage.includes('tell me a story')) {
      setCurrentEmotion('thinking')
      return getStoryResponse()
    }
    
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      setCurrentEmotion('happy')
      return getRandomResponse(daisyResponses.jokes)
    }
    
    // Game initialization
    if (lowerMessage.includes('fetch') && (lowerMessage.includes('play') || lowerMessage.includes('let'))) {
      setGameState('fetch')
      setCurrentEmotion('playfetch')
      return "*bounces excitedly* Woof! Let's play fetch! Throw the ball and I'll catch it! 🎾"
    }
    
    if (lowerMessage.includes('hide') && lowerMessage.includes('seek')) {
      setGameState('hide_and_seek')
      setCurrentEmotion('lookingbehind')
      return "*covers eyes with paws* I'm counting! 1... 2... 3... Ready or not, here I come! 👁️"
    }
    
    if (lowerMessage.includes('tug') && lowerMessage.includes('war')) {
      setGameState('tug_of_war')
      setCurrentEmotion('eager')
      return "*grabs rope in mouth* Grrr! Let's see who's stronger! Pull as hard as you can! 🪢"
    }
    
    if (lowerMessage.includes('guessing') && lowerMessage.includes('game')) {
      setGameState('guessing_game')
      setCurrentEmotion('thinking')
      const target = Math.floor(Math.random() * 10) + 1
      setGuessTarget(target)
      return "*thinks hard* Okay! I'm thinking of a number between 1 and 10! Can you guess it? 🤔"
    }
    
    if (lowerMessage.includes('play') || lowerMessage.includes('game')) {
      setCurrentEmotion('playfetch')
      return "*bounces excitedly* Woof! Let's play! What game should we play? 🎾"
    }
    
    if (lowerMessage.includes('trick') || lowerMessage.includes('sit') || lowerMessage.includes('stay')) {
      setCurrentEmotion('crouchingdown')
      return getRandomResponse(daisyResponses.tricks)
    }
    
    if (lowerMessage.includes('dance') || lowerMessage.includes('dancing')) {
      setCurrentEmotion('dancing')
      return getRandomResponse(daisyResponses.dances)
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      setCurrentEmotion('excited')
      return getRandomResponse(daisyResponses.greetings)
    }
    
    // Priority 4: Name detection (only if not greeted and no userName set)
    if (!hasGreeted && !userName && !gameState) {
      const gameCommands = ['fetch', 'catch', 'throw', 'ball', 'hide', 'seek', 'found', 'pull', 'harder', 'tug', 'guess', 'number', 'higher', 'lower']
      const isGameCommand = gameCommands.some(cmd => lowerMessage.includes(cmd))
      
      if (!isGameCommand && userMessage.length > 1 && userMessage.length < 20) {
        const possibleName = userMessage.trim()
        if (/^[a-zA-Z\s]+$/.test(possibleName)) {
          setUserName(possibleName)
          setHasGreeted(true)
          setCurrentEmotion('excited')
          return `*wags tail enthusiastically* Nice to meet you, ${possibleName}! I'm Daisy! I love to play games, tell stories, and do tricks! What would you like to do together? 🐕✨`
        }
      }
    }
    
    // Priority 5: General responses with alternating prompts
    setCurrentEmotion('happy')
    const generalResponses = [
      "*tilts head curiously* That's interesting! Tell me more! 🐾",
      "*wags tail* I love chatting with you! What else is on your mind? 🐕",
      "*bounces playfully* Woof! Want to play a game or hear a story? 🎾📚"
    ]
    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
  }
  
  // Handle quick action messages
  const handleQuickMessage = (message) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
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
      addDaisyMessage(response)
    }, 1000 + Math.random() * 1000)
  }
  
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    
    const messageToSend = inputMessage.trim()
    
    // Add user message
    const userMessage = {
      id: Date.now(),
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
      addDaisyMessage(response)
    }, 1000 + Math.random() * 1000)
  }
  
  // Feed Daisy function
  const feedDaisy = () => {
    if (hungerLevel < 5) {
      setHungerLevel(prev => Math.min(prev + 1, 5))
      setCurrentEmotion('excited')
      
      const feedResponses = [
        "*munches happily* Nom nom nom! Thank you! These treats are delicious! 🦴",
        "*wags tail excitedly* Yummy! You're the best! I feel so much better now! 🐕",
        "*does a happy spin* Woof! Those were tasty! I love treat time! ✨"
      ]
      
      setTimeout(() => {
        addDaisyMessage(getRandomResponse(feedResponses))
      }, 500)
    } else {
      setCurrentEmotion('patient')
      setTimeout(() => {
        addDaisyMessage("*pats full belly* I'm completely full! Thank you though! Maybe we can play instead? 🐾")
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
    // Update status every 30 seconds
    const interval = setInterval(updateGeminiStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Load saved state on mount
  useEffect(() => {
    const stateLoaded = loadState()
    if (!stateLoaded && !hasGreeted && messages.length === 0) {
      setTimeout(() => {
        addDaisyMessage(getRandomResponse(daisyResponses.greetings))
        setHasGreeted(true)
      }, 1000)
    }
  }, [])
  
  // Hunger decrease over time
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        const newLevel = Math.max(prev - 1, 0)
        if (newLevel === 1 && prev > 1) {
          setTimeout(() => {
            addDaisyMessage("*stomach rumbles* I'm getting a little hungry... 🦴")
          }, 1000)
        }
        return newLevel
      })
    }, 60000) // Decrease every minute
    
    return () => clearInterval(hungerTimer)
  }, [])
  
  // Auto-save state changes
  useEffect(() => {
    if (messages.length > 0) {
      saveState()
    }
  }, [messages, currentEmotion, hungerLevel, gameState, hasGreeted, userName, ballPosition, hideSeekCount, tugStrength, guessTarget, storyIndex])

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <Link to="/" className="home-link">
          <FaHome /> Home
        </Link>
        <div className="daisy-info">
          <img 
            src={getEmotionImage()} 
            alt={`Daisy feeling ${currentEmotion}`}
            className="daisy-avatar"
            onError={(e) => {
              e.target.src = '/assets/images/emotions/happy.png'
            }}
          />
          <div className="daisy-details">
            <h1>🐕 Daisy {userName && `& ${userName}`}</h1>
            <p>Your friendly AI companion</p>
            {lastSaved && (
              <small className="checkpoint-status">
                Last saved: {lastSaved.toLocaleTimeString()}
              </small>
            )}
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
          <Link to="/about" className="about-link">
            <FaQuestionCircle /> About
          </Link>
        </div>
      </header>

      {/* Messages Container */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`message ${message.sender}`}
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
                <p>{message.text}</p>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
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
        <button onClick={() => setShowGameMenu(!showGameMenu)} className={showGameMenu ? 'active' : ''}>
          🎮 Play Games {showGameMenu ? '▼' : '▶'}
        </button>
        <button onClick={() => handleQuickMessage('How are you feeling?')}>
          🐾 How are you?
        </button>
      </div>
      
      {/* Games Menu */}
      {showGameMenu && (
        <div className="games-menu">
          <button onClick={() => { handleQuickMessage('Let\'s play fetch'); setShowGameMenu(false); }}>
            🎾 Play Fetch
          </button>
          <button onClick={() => { handleQuickMessage('Let\'s play hide and seek'); setShowGameMenu(false); }}>
            👁️ Hide & Seek
          </button>
          <button onClick={() => { handleQuickMessage('Let\'s play tug of war'); setShowGameMenu(false); }}>
            🪢 Tug of War
          </button>
          <button onClick={() => { handleQuickMessage('Let\'s play a guessing game'); setShowGameMenu(false); }}>
            🔢 Guessing Game
          </button>
        </div>
      )}

      {/* Game Sub-buttons */}
      {gameState === 'fetch' && (
        <div className="game-actions">
          <button onClick={() => handleQuickMessage('Throw the ball')}>🎾 Throw ball</button>
          <button onClick={() => handleQuickMessage('Good catch!')}>👏 Good catch</button>
          <button onClick={() => handleQuickMessage('Stop playing')}>🛑 Stop</button>
        </div>
      )}
      
      {gameState === 'hide_and_seek' && (
        <div className="game-actions">
          <button onClick={() => handleQuickMessage('I\'m ready!')}>✅ Ready</button>
          <button onClick={() => handleQuickMessage('You found me!')}>👋 Found me</button>
          <button onClick={() => handleQuickMessage('Stop playing')}>🛑 Stop</button>
        </div>
      )}
      
      {gameState === 'tug_of_war' && (
        <div className="game-actions">
          <button onClick={() => handleQuickMessage('Pull harder!')}>💪 Pull harder</button>
          <button onClick={() => handleQuickMessage('I give up!')}>🏳️ Give up</button>
          <button onClick={() => handleQuickMessage('Stop playing')}>🛑 Stop</button>
        </div>
      )}
      
      {gameState === 'guessing_game' && (
        <div className="game-actions">
          <button onClick={() => handleQuickMessage('1')}>1️⃣</button>
          <button onClick={() => handleQuickMessage('5')}>5️⃣</button>
          <button onClick={() => handleQuickMessage('10')}>🔟</button>
          <button onClick={() => handleQuickMessage('Stop playing')}>🛑 Stop</button>
        </div>
      )}

      {/* Checkpoint Controls */}
      <div className="checkpoint-controls">
        <button onClick={resetState} className="reset-button">
          🔄 Reset Chat
        </button>
      </div>
    </div>
  )
}

export default ChatPage
