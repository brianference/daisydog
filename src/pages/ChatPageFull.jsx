import React, { useState, useRef, useEffect } from 'react'
import './ChatPage.css'

// ADD GEMINI AI IMPORTS
import { generateGeminiResponse, isGeminiAvailable, getGeminiStatus, debugGeminiStatus } from '../services/geminiService'

const ChatPage = () => {
  // BASIC STATE
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to DaisyDog! 🐕', sender: 'daisy' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // HUNGER SYSTEM STATE
  const [hungerLevel, setHungerLevel] = useState(3) // Start at 3/5

  // GEMINI AI STATE
  const [geminiAvailable, setGeminiAvailable] = useState(false)

  // NAME DETECTION STATE
  const [userName, setUserName] = useState('friend')

  // SOUND SYSTEM STATE (COMMENTED OUT FOR NOW)
  // const [showVolumeControls, setShowVolumeControls] = useState(false)

  // BASIC HOOKS
  const messagesEndRef = useRef(null)

  // HUNGER SYSTEM TIMER
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => Math.min(5, prev + 0.02)) // Gradual increase
    }, 120000) // Every 2 minutes

    return () => clearInterval(hungerTimer)
  }, [])

  // GEMINI AVAILABILITY CHECK
  useEffect(() => {
    const checkGemini = () => {
      const available = isGeminiAvailable()
      setGeminiAvailable(available)
      console.log('🧠 Gemini Status:', available ? 'Ready for smart responses!' : 'Using local responses')
    }

    checkGemini()
  }, [])

  // NAME DETECTION FUNCTION
  const detectUserName = (message) => {
    const lowerMessage = message.toLowerCase()

    // Simple patterns
    if (lowerMessage.includes('my name is')) {
      const parts = message.split('my name is')
      if (parts.length > 1) {
        const name = parts[1].trim().split(' ')[0]
        if (name && name.length >= 2) {
          return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        }
      }
    }

    if (lowerMessage.includes("i'm")) {
      const parts = message.split("i'm")
      if (parts.length > 1) {
        const name = parts[1].trim().split(' ')[0]
        if (name && name.length >= 2) {
          return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        }
      }
    }

    return null
  }

  // FEED FUNCTION
  const feedDaisy = () => {
    setHungerLevel(prev => Math.max(0, prev - 1)) // Decrease hunger
    const feedMessage = {
      id: Date.now(),
      text: "*munches happily* Mmm! Thank you so much! *wags tail* That was delicious! 🦴✨",
      sender: 'daisy'
    }
    setMessages(prev => [...prev, feedMessage])

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // HELPER FUNCTION
  const addDaisyMessage = (text) => {
    const message = {
      id: Date.now(),
      text,
      sender: 'daisy'
    }
    setMessages(prev => [...prev, message])

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // MAIN MESSAGE HANDLING
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setIsTyping(true)

      // NAME DETECTION
      const detectedName = detectUserName(inputMessage)
      if (detectedName && detectedName !== userName) {
        setUserName(detectedName)
        console.log('👤 Detected user name:', detectedName)
      }

      const userMessage = {
        id: Date.now(),
        text: inputMessage,
        sender: 'user'
      }

      // GEMINI AI RESPONSE
      let aiResponseText = "That's interesting! Tell me more! 🐕"

      if (geminiAvailable) {
        try {
          console.log('🧠 Using Gemini AI for response...')
          const context = {
            userName: userName,
            emotion: 'happy',
            gameState: null,
            hungerLevel
          }

          // Simulate async call for now
          setTimeout(async () => {
            try {
              aiResponseText = await generateGeminiResponse(inputMessage, context)
              console.log('✅ Gemini response generated')
            } catch (error) {
              console.warn('⚠️ Gemini failed:', error)
              aiResponseText = "That's interesting! Tell me more! 🐕"
            }

            const aiMessage = {
              id: Date.now() + 1,
              text: aiResponseText,
              sender: 'daisy'
            }

            setMessages(prev => [...prev, userMessage, aiMessage])
            setInputMessage('')
            setIsTyping(false)

            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
          }, 1000)

        } catch (error) {
          console.warn('⚠️ Gemini setup error:', error)
          // Fallback to basic response
          setTimeout(() => {
            const aiMessage = {
              id: Date.now() + 1,
              text: aiResponseText,
              sender: 'daisy'
            }

            setMessages(prev => [...prev, userMessage, aiMessage])
            setInputMessage('')
            setIsTyping(false)

            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
          }, 1000)
        }
      } else {
        // No Gemini - use basic response
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            text: aiResponseText,
            sender: 'daisy'
          }

          setMessages(prev => [...prev, userMessage, aiMessage])
          setInputMessage('')
          setIsTyping(false)

          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }, 1000)
      }
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* HUNGER BAR DISPLAY */}
        <div className="hunger-bar">
          <span>Hunger:</span>
          <div className="hunger-level">
            <div className="hunger-progress-container">
              <div
                className={`hunger-progress-bar ${hungerLevel >= 3 ? 'low' : ''} ${hungerLevel >= 4 ? 'critical' : ''}`}
                style={{ width: `${(hungerLevel / 5) * 100}%` }}
              ></div>
            </div>
            <span className="hunger-text">{hungerLevel}/5</span>
            <button onClick={feedDaisy} className="feed-button">🦴 Feed</button>

            {/* GEMINI STATUS INDICATOR */}
            <div className={`ai-status ${geminiAvailable ? 'available' : 'offline'}`} title={geminiAvailable ? 'Gemini AI Active - Smart Responses' : 'Local Mode - Basic Responses'}>
              {geminiAvailable ? '🧠' : '📝'}
            </div>

            {/* DEBUG BUTTON */}
            <button
              onClick={() => {
                console.log('🔧 DEBUG INFO:')
                console.log('Gemini Available:', geminiAvailable)
                console.log('API Key Present:', !!import.meta.env.VITE_GEMINI_API_KEY)
                console.log('Current User Name:', userName)
                console.log('Hunger Level:', hungerLevel)
                console.log('Gemini Status Details:', getGeminiStatus())

                if (geminiAvailable) {
                  console.log('🧠 Testing Gemini API...')
                  generateGeminiResponse('Test message: What day is it?').then(response => {
                    console.log('🎉 Gemini test response:', response)
                  }).catch(error => {
                    console.error('❌ Gemini test failed:', error)
                  })
                }
              }}
              className="debug-button"
              title="Debug Gemini Status"
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
              🐛
            </button>
          </div>
        </div>

        {/* MESSAGES CONTAINER */}
        <div className="messages-container">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                {message.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message daisy">
              <div className="message-content typing">
                🐕 Daisy is typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT CONTAINER */}
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
