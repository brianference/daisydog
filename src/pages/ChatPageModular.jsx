/**
 * ChatPageModular - Refactored chat page using modular architecture
 * Implements best practices for maintainable, scalable code
 */

import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaHome, FaQuestionCircle, FaPaw, FaBone, FaBrain } from 'react-icons/fa'

// Custom hooks
import useChatState from '../hooks/useChatState.js'
import useGameState from '../hooks/useGameState.js'

// UI Components
import HungerProgressBar from '../components/ui/HungerProgressBar.jsx'
import MessageBubble from '../components/ui/MessageBubble.jsx'
import QuickActions from '../components/ui/QuickActions.jsx'
import GameSubButtons from '../components/game/GameSubButtons.jsx'

// Services
import ResponseEngine from '../services/ResponseEngine.js'
import EmotionService from '../services/EmotionService.js'
import GeminiService from '../services/GeminiService.js'

// Constants and types
import { TIMING } from '../constants/index.js'
import { EMOTIONS } from '../types/index.js'

// Styles
import './ChatPage.css'
import '../components/ui/ModularUI.css'

const ChatPageModular = () => {
  // Custom hooks for state management
  const {
    messages,
    isTyping,
    currentEmotion,
    hungerLevel,
    hasGreeted,
    userName,
    lastSaved,
    addUserMessage,
    addDaisyMessage,
    updateEmotion,
    feedDaisy,
    setTypingWithTimeout,
    resetState,
    getChatContext,
    setHasGreeted,
    setUserName
  } = useChatState()

  // Gemini AI status
  const [geminiStatus, setGeminiStatus] = React.useState(GeminiService.isAvailable())
  
  // Game selection state
  const [showGameSelection, setShowGameSelection] = React.useState(false)

  const {
    currentGame,
    startGame,
    processGameInput,
    endGame,
    getAvailableActions,
    isGameActive,
    detectGameFromMessage,
    getSerializableState: getGameState,
    restoreState: restoreGameState
  } = useGameState()

  // Refs
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  /**
   * Handle user message submission
   * @param {string} message - User's message
   */
  const handleUserMessage = async (message) => {
    if (!message.trim()) return

    // Add user message
    addUserMessage(message)

    // Show typing indicator
    setTypingWithTimeout(true, TIMING.TYPING_DELAY_MIN + Math.random() * TIMING.TYPING_DELAY_MAX)

    try {
      // Generate response using ResponseEngine
      const context = {
        userMessage: message,
        chatState: getChatContext(),
        gameState: getGameState()
      }

      const response = await ResponseEngine.generateResponse(context)

      // Process response
      setTimeout(() => {
        setTypingWithTimeout(false)
        
        // Update emotion
        if (response.emotion) {
          updateEmotion(response.emotion)
        }

        // Add Daisy's response
        addDaisyMessage(response.message, response.emotion)

        // Handle state changes
        if (response.stateChanges) {
          if (response.stateChanges.userName) {
            setUserName(response.stateChanges.userName)
          }
          if (response.stateChanges.hasGreeted !== undefined) {
            setHasGreeted(response.stateChanges.hasGreeted)
          }
          if (response.stateChanges.currentGame) {
            if (response.stateChanges.currentGame === 'GAME_SELECTION') {
              // Set game selection mode without starting a specific game
              setShowGameSelection(true)
            } else {
              setShowGameSelection(false)
              startGame(response.stateChanges.currentGame)
            }
          }
        }
      }, TIMING.TYPING_DELAY_MIN + Math.random() * TIMING.TYPING_DELAY_MAX)

    } catch (error) {
      console.error('Error generating response:', error)
      setTypingWithTimeout(false)
      addDaisyMessage(
        "Woof! I'm having trouble thinking right now. Can you try again? 🐕",
        EMOTIONS.NERVOUS
      )
    }
  }

  /**
   * Handle quick action clicks
   * @param {string} message - Quick action message
   * @param {Object} action - Action object
   */
  const handleQuickAction = (message, action) => {
    handleUserMessage(message)
  }

  /**
   * Handle game action clicks
   * @param {string} message - Game action message
   * @param {Object} action - Action object
   */
  const handleGameAction = (message, action) => {
    handleUserMessage(message)
  }

  /**
   * Handle form submission
   * @param {Event} e - Form event
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const message = formData.get('message')
    
    if (message) {
      handleUserMessage(message)
      e.target.reset()
    }
  }

  /**
   * Handle feed button click
   */
  const handleFeedClick = () => {
    feedDaisy()
  }

  /**
   * Handle reset button click
   */
  const handleResetClick = () => {
    if (confirm('Are you sure you want to reset the chat? This will clear all messages and progress.')) {
      resetState()
    }
  }

  /**
   * Auto-scroll to bottom when messages change
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    })
  }, [messages, isTyping])

  // Monitor Gemini status changes
  useEffect(() => {
    const checkGeminiStatus = () => {
      const currentStatus = GeminiService.isAvailable()
      if (currentStatus !== geminiStatus) {
        setGeminiStatus(currentStatus)
      }
    }

    // Check status every 30 seconds
    const statusInterval = setInterval(checkGeminiStatus, 30000)
    
    return () => clearInterval(statusInterval)
  }, [geminiStatus])

  /**
   * Initial greeting
   */
  useEffect(() => {
    if (!hasGreeted && messages.length === 0) {
      setTimeout(() => {
        addDaisyMessage(
          "*wags tail excitedly* Woof! Hi there! I'm Daisy, your friendly AI companion! What's your name? 🐕✨",
          EMOTIONS.EXCITED
        )
        setHasGreeted(true)
      }, 1000)
    }
  }, [hasGreeted, messages.length, addDaisyMessage, setHasGreeted])

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <Link to="/" className="home-link">
          <FaHome /> Home
        </Link>
        
        <div className="daisy-info">
          <img 
            src={EmotionService.getEmotionImage(currentEmotion)} 
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
          <HungerProgressBar 
            hungerLevel={hungerLevel}
            showLabel={true}
          />
          
          {/* Gemini AI Status Indicator */}
          <div 
            className={`gemini-status ${geminiStatus ? 'active' : 'inactive'}`}
            title={geminiStatus ? 'AI Enhanced Responses Active' : 'AI Enhanced Responses Unavailable'}
          >
            <FaBrain style={{ color: geminiStatus ? '#e91e63' : '#ccc' }} />
          </div>
          
          <Link to="/about" className="about-link">
            <FaQuestionCircle /> About
          </Link>
        </div>
      </header>

      {/* Messages Container */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showAvatar={true}
              showTimestamp={true}
            />
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && (
          <MessageBubble
            message={{ sender: 'daisy', emotion: currentEmotion }}
            isTyping={true}
            showAvatar={true}
            showTimestamp={false}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            ref={inputRef}
            name="message"
            type="text"
            placeholder="Type a message to Daisy..."
            className="message-input"
            disabled={isTyping}
            autoComplete="off"
          />
          <div className="button-group">
            <button 
              type="submit" 
              disabled={isTyping} 
              className="send-button"
              aria-label="Send message"
            >
              <FaPaw />
            </button>
            <button 
              type="button" 
              onClick={handleFeedClick} 
              className="feed-button" 
              disabled={isTyping}
              aria-label="Feed Daisy"
            >
              <FaBone />
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <QuickActions
        onActionClick={handleQuickAction}
        disabled={isTyping}
        layout="grid"
        size="medium"
        showIcons={true}
      />

      {/* Game Sub-buttons */}
      <GameSubButtons
        currentGame={showGameSelection ? 'GAME_SELECTION' : currentGame}
        gameState={getGameState()}
        onActionClick={handleGameAction}
        disabled={isTyping}
      />

      {/* Checkpoint Controls */}
      <div className="checkpoint-controls">
        <button 
          onClick={handleResetClick} 
          className="reset-button"
          disabled={isTyping}
        >
          🔄 Reset Chat
        </button>
      </div>
    </div>
  )
}

export default ChatPageModular
