import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaw, FaBone, FaHome, FaQuestionCircle, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { daisyResponses } from '../data/daisyResponses'
import './ChatPage.css'

const ChatPage = () => {
  // Core state
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [daisyEmotion, setDaisyEmotion] = useState('happy')
  const [hungerLevel, setHungerLevel] = useState(3)
  const [gameState, setGameState] = useState(null)
  const [hasGreetedUser, setHasGreetedUser] = useState(false)
  const [userName, setUserName] = useState('')
  
  // Refs
  const messagesEndRef = useRef(null)
  
  // Helper functions
  const getRandomResponse = (responses) => {
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return "Woof! I'm having trouble finding my words right now! 🐕"
    }
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  const addDaisyMessage = (text, type = 'chat') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'daisy',
      timestamp: new Date(),
      type,
      emotion: daisyEmotion
    }
    setMessages(prev => [...prev, newMessage])
  }
  
  const handleQuickAction = (actionType) => {
    let response
    
    switch (actionType) {
      case 'story':
        response = getRandomResponse(daisyResponses.stories)
        setDaisyEmotion('thinking')
        break
      case 'joke':
        response = getRandomResponse(daisyResponses.jokes)
        setDaisyEmotion('happy')
        break
      case 'trick':
        response = getRandomResponse(daisyResponses.tricks)
        setDaisyEmotion('crouchingdown')
        break
      case 'dance':
        response = getRandomResponse(daisyResponses.dances)
        setDaisyEmotion('dancing')
        break
      case 'game':
        response = "*bounces excitedly* Let's play! What game would you like to play? 🎾"
        setDaisyEmotion('playfetch')
        break
      case 'feelings':
        response = getRandomResponse(daisyResponses.feelings)
        setDaisyEmotion('happy')
        break
      case 'dreams':
        response = getRandomResponse(daisyResponses.dreams)
        setDaisyEmotion('thinking')
        break
      default:
        response = getRandomResponse(daisyResponses.general)
        setDaisyEmotion('happy')
    }
    
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
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
    
    // Generate Daisy response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      let response = "*wags tail happily* That's interesting! Tell me more! 🐾"
      
      const lowerMessage = messageToSend.toLowerCase()
      if (lowerMessage.includes('story')) {
        response = getRandomResponse(daisyResponses.stories)
      } else if (lowerMessage.includes('joke')) {
        response = getRandomResponse(daisyResponses.jokes)
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = getRandomResponse(daisyResponses.greetings)
      }
      
      addDaisyMessage(response)
    }, 1000 + Math.random() * 1000)
  }
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Initial greeting
  useEffect(() => {
    if (!hasGreetedUser && messages.length === 0) {
      setTimeout(() => {
        addDaisyMessage(getRandomResponse(daisyResponses.greetings))
        setHasGreetedUser(true)
      }, 1000)
    }
  }, [hasGreetedUser, messages.length])
  
  const getEmotionImage = () => {
    return `/assets/images/emotions/${daisyEmotion}.png`
  }

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
            alt={`Daisy feeling ${daisyEmotion}`}
            className="daisy-avatar"
            onError={(e) => {
              e.target.src = '/assets/images/emotions/happy.png'
            }}
          />
          <div className="daisy-details">
            <h1>🐕 Daisy</h1>
            <p>Your friendly AI companion</p>
          </div>
        </div>
        <Link to="/about" className="about-link">
          <FaQuestionCircle /> About
        </Link>
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
                  src={getEmotionImage()} 
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
      <form onSubmit={handleSendMessage} className="input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message to Daisy..."
          className="message-input"
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !inputMessage.trim()}>
          <FaPaw />
        </button>
      </form>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => handleQuickAction('story')}>
          📚 Tell me a story
        </button>
        <button onClick={() => handleQuickAction('joke')}>
          😄 Tell a joke
        </button>
        <button onClick={() => handleQuickAction('trick')}>
          🦴 Do a trick
        </button>
        <button onClick={() => handleQuickAction('dance')}>
          💃 Dance
        </button>
        <button onClick={() => handleQuickAction('game')}>
          🎾 Play game
        </button>
        <button onClick={() => handleQuickAction('feelings')}>
          🐾 How are you?
        </button>
        <button onClick={() => handleQuickAction('dreams')}>
          ✨ Tell me your dreams
        </button>
      </div>
    </div>
  )
}

export default ChatPage
