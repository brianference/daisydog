import React, { useState, useRef, useEffect } from 'react'
import './ChatPage.css'

// ADD SOUND SYSTEM IMPORTS
import { useSoundSystem, useSoundTriggers, createVolumeControls } from '../hooks/useSoundSystem'
import VolumeControls from '../components/VolumeControls'

// ADD GEMINI AI IMPORTS
import { generateGeminiResponse, isGeminiAvailable, getGeminiStatus, debugGeminiStatus } from '../services/geminiService'

const ChatPage = () => {
  // ADD BACK BASIC STATE
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to DaisyDog! 🐕', sender: 'daisy' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // ADD HUNGER SYSTEM STATE
  const [hungerLevel, setHungerLevel] = useState(3) // Start at 3/5

  // ADD SOUND SYSTEM STATE
  const { volumes, isMuted, isLoaded, playSound, setVolume, setMasterVolume, toggleMute, saveSettings } = useSoundSystem()
  const { triggerHappyBark, triggerExcitedBark, triggerBallBounce, triggerCrunchyTreats, triggerButtonClick } = useSoundTriggers(playSound)
  const [showVolumeControls, setShowVolumeControls] = useState(false)

  // ADD GEMINI AI STATE
  const [geminiAvailable, setGeminiAvailable] = useState(false)

  // ADD BACK BASIC HOOKS
  const messagesEndRef = useRef(null)

  // ADD HUNGER SYSTEM TIMER - CORRECTED: Timer INCREASES hunger (becomes more hungry)
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => Math.min(5, prev + 0.02)) // CORRECTED: Timer increases hunger
    }, 120000) // Every 2 minutes

    return () => clearInterval(hungerTimer)
  }, [])

  // ADD GEMINI AVAILABILITY CHECK
  useEffect(() => {
    const checkGemini = () => {
      const available = isGeminiAvailable()
      setGeminiAvailable(available)
      console.log('🧠 Gemini Status:', available ? 'Ready for smart responses!' : 'Using local responses')
      if (available) {
        console.log('✅ Gemini API key detected - enhanced AI responses active')
      } else {
        console.log('📝 Using local response system - add VITE_GEMINI_API_KEY to .env.local for AI responses')
      }
    }

    checkGemini()
  }, [])

  // ADD FEED FUNCTION - CORRECTED: Feeding DECREASES hunger (makes less hungry)
  const feedDaisy = () => {
    setHungerLevel(prev => Math.max(0, prev - 1)) // CORRECTED: Feeding decreases hunger

    // ADD SOUND: Play eating sound
    triggerCrunchyTreats()

    const feedResponses = [
      "*munches happily* Mmm! Thank you so much! *wags tail* That was delicious! 🦴✨",
      "*crunches treat* Oh boy oh boy! *spins in circle* You're the best! I feel so much better! 🐕💕",
      "*gobbles up treat* Woof! *happy panting* My tummy is happy now! Thank you for taking care of me! 🍖😊"
    ]

    const randomResponse = feedResponses[Math.floor(Math.random() * feedResponses.length)]
    addDaisyMessage(randomResponse)

    // ADD SOUND: Play happy bark after eating
    setTimeout(() => {
      triggerHappyBark()
    }, 500)
  }

  // ADD HELPER FUNCTION
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

  // ADD BACK BASIC FUNCTIONS
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // ADD SOUND: Button click sound
      triggerButtonClick()

      setIsTyping(true)

      // ADD GEMINI AI RESPONSE LOGIC
      const processResponse = async () => {
        const userMessage = {
          id: Date.now(),
          text: inputMessage,
          sender: 'user'
        }

        let aiResponseText = "That's interesting! Tell me more! 🐕"

        // Try Gemini AI first if available
        if (geminiAvailable) {
          try {
            console.log('🧠 Using Gemini AI for response...')
            const context = {
              userName: 'friend', // Could be enhanced later
              emotion: 'happy',
              gameState: null,
              hungerLevel
            }
            aiResponseText = await generateGeminiResponse(inputMessage, context)
            console.log('✅ Gemini response generated successfully')
          } catch (error) {
            console.warn('⚠️ Gemini failed, falling back to local system:', error)
            aiResponseText = "That's interesting! Tell me more! 🐕"
          }
        } else {
          console.log('📝 Using local response system')
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

        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }

      // Delay for realistic typing effect
      setTimeout(processResponse, 1000)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* ADD HUNGER BAR DISPLAY */}
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
            {/* ADD VOLUME BUTTON */}
            <button
              onClick={() => setShowVolumeControls(true)}
              className="volume-button"
              title="Sound Settings"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            {/* ADD GEMINI STATUS INDICATOR */}
            <div className={`ai-status ${geminiAvailable ? 'available' : 'offline'}`} title={geminiAvailable ? 'Gemini AI Active - Smart Responses' : 'Local Mode - Basic Responses'}>
              {geminiAvailable ? '🧠' : '📝'}
            </div>
          </div>
        </div>

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

      {/* ADD VOLUME CONTROLS MODAL */}
      {showVolumeControls && (
        <div className="volume-controls-overlay" onClick={() => setShowVolumeControls(false)}>
          <div className="volume-controls-panel" onClick={(e) => e.stopPropagation()}>
            <div className="volume-controls-header">
              <h3>🔊 Sound Settings</h3>
              <button onClick={() => setShowVolumeControls(false)} className="close-button">✕</button>
            </div>

            <div className="volume-controls-content">
              {/* Master Volume */}
              <div className="volume-control-group">
                <label className="volume-label">
                  🔊 Master Volume
                </label>
                <div className="volume-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes.master}
                    onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="volume-value">{Math.round(volumes.master * 100)}%</span>
                </div>
              </div>

              {/* Mute Button */}
              <div className="volume-control-group mute-group">
                <button
                  onClick={toggleMute}
                  className={`mute-button ${isMuted ? 'muted' : ''}`}
                >
                  {isMuted ? '🔇' : '🔊'} {isMuted ? 'Unmute' : 'Mute All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage
