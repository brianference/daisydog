import React, { useState, useRef, useEffect } from 'react'
import './ChatPage.css'

// ADD SOUND SYSTEM IMPORTS
import { useSoundSystem, useSoundTriggers, createVolumeControls } from '../hooks/useSoundSystem'
import VolumeControls from '../components/VolumeControls'

// ADD GEMINI AI IMPORTS
import { generateGeminiResponse, isGeminiAvailable, getGeminiStatus, debugGeminiStatus } from '../services/geminiService'

const ChatPage = () => {
  // BASIC STATE
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to DaisyDog! 🐕 What would you like to do today?', sender: 'daisy' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // HUNGER SYSTEM STATE
  const [hungerLevel, setHungerLevel] = useState(3) // Start at 3/5
  const [hungerBarVisible, setHungerBarVisible] = useState(true)

  // GEMINI AI STATE
  const [geminiAvailable, setGeminiAvailable] = useState(false)

  // NAME DETECTION STATE
  const [userName, setUserName] = useState('friend')
  const [hasGreeted, setHasGreeted] = useState(false)

  // SOUND SYSTEM STATE
  const { volumes, isMuted, isLoaded, playSound, setVolume, setMasterVolume, toggleMute, saveSettings } = useSoundSystem()
  const { triggerHappyBark, triggerExcitedBark, triggerBallBounce, triggerCrunchyTreats, triggerButtonClick } = useSoundTriggers(playSound)
  const [showVolumeControls, setShowVolumeControls] = useState(false)

  // GAME STATE
  const [gameState, setGameState] = useState(null) // null, 'fetch', 'hideSeek', 'tugOfWar', 'guessing'
  const [ballPosition, setBallPosition] = useState(0)
  const [hideSeekCount, setHideSeekCount] = useState(0)
  const [tugStrength, setTugStrength] = useState(5)
  const [guessTarget, setGuessTarget] = useState(null)

  // UI STATE
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [currentEmotion, setCurrentEmotion] = useState('happy')

  // BASIC HOOKS
  const messagesEndRef = useRef(null)

  // HUNGER SYSTEM TIMER
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        const newLevel = Math.min(5, prev + 0.02)
        // Trigger warning sound when hunger gets high
        if (newLevel >= 4 && prev < 4) {
          triggerExcitedBark() // Warning bark
        }
        return newLevel
      })
    }, 120000) // Every 2 minutes

    return () => clearInterval(hungerTimer)
  }, [])

  // GEMINI AVAILABILITY CHECK
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

    if (lowerMessage.includes('i am')) {
      const parts = message.split('i am')
      if (parts.length > 1) {
        const name = parts[1].trim().split(' ')[0]
        if (name && name.length >= 2) {
          return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        }
      }
    }

    return null
  }

  // EMOTION MAPPING
  const getEmotionImage = (emotion) => {
    const emotionMap = {
      happy: '😊',
      excited: '🤩',
      sad: '😢',
      angry: '😠',
      surprised: '😲',
      tired: '😴',
      hungry: '🤤',
      playful: '😄',
      curious: '🤔',
      loving: '😍',
      scared: '😨',
      bored: '😑',
      proud: '😎',
      confused: '😕',
      sleepy: '😪'
    }
    return emotionMap[emotion] || '🐕'
  }

  // FEED FUNCTION
  const feedDaisy = () => {
    triggerButtonClick()
    setHungerLevel(prev => Math.max(0, prev - 1))
    setCurrentEmotion('happy')

    const feedResponses = [
      "*munches happily* Mmm! Thank you so much! *wags tail* That was delicious! 🦴✨",
      "*crunches treat* Oh boy oh boy! *spins in circle* You're the best! I feel so much better! 🐕💕",
      "*gobbles up treat* Woof! *happy panting* My tummy is happy now! Thank you for taking care of me! 🍖😊"
    ]

    const randomResponse = feedResponses[Math.floor(Math.random() * feedResponses.length)]
    addDaisyMessage(randomResponse)

    setTimeout(() => {
      triggerHappyBark()
    }, 500)
  }

  // QUICK ACTION BUTTONS
  const quickActions = [
    { id: 'story', label: '📖 Tell Story', action: () => sendQuickAction('Tell me a story!') },
    { id: 'joke', label: '😄 Tell Joke', action: () => sendQuickAction('Tell me a joke!') },
    { id: 'dance', label: '💃 Dance', action: () => sendQuickAction('Dance for me!') },
    { id: 'trick', label: '🎩 Do Trick', action: () => sendQuickAction('Do a trick!') },
    { id: 'fetch', label: '🏈 Play Fetch', action: () => startGame('fetch') },
    { id: 'hide', label: '🔍 Hide & Seek', action: () => startGame('hideSeek') },
    { id: 'tug', label: '🪢 Tug of War', action: () => startGame('tugOfWar') },
    { id: 'guess', label: '🎯 Guessing Game', action: () => startGame('guessing') }
  ]

  const sendQuickAction = (message) => {
    triggerButtonClick()
    setInputMessage(message)
    setTimeout(() => handleSendMessage(), 100)
  }

  // GAME FUNCTIONS
  const startGame = (gameType) => {
    triggerButtonClick()
    setGameState(gameType)
    setCurrentEmotion('excited')

    const gameStarters = {
      fetch: "*bounces excitedly* Yay! Let's play fetch! 🏈 I'll go get the ball! Where should I throw it next?",
      hideSeek: "*wiggles* Ready or not, here I come! 🔍 Where should I hide?",
      tugOfWar: "*growls playfully* Grrr! Let's tug! 🪢 Pull as hard as you can!",
      guessing: "*thinks hard* 🤔 I'm thinking of something... can you guess what it is?"
    }

    addDaisyMessage(gameStarters[gameType])
    triggerExcitedBark()
  }

  // HELPER FUNCTION
  const addDaisyMessage = (text) => {
    const message = {
      id: Date.now(),
      text,
      sender: 'daisy',
      emotion: currentEmotion
    }
    setMessages(prev => [...prev, message])

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // MAIN MESSAGE HANDLING
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      triggerButtonClick()
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
            emotion: currentEmotion,
            gameState: gameState,
            hungerLevel: hungerLevel
          }

          // Simulate async call
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
              sender: 'daisy',
              emotion: currentEmotion
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
              sender: 'daisy',
              emotion: currentEmotion
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
            sender: 'daisy',
            emotion: currentEmotion
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
        {hungerBarVisible && (
          <div className="hunger-bar">
            <span>Hunger:</span>
            <div className="hunger-level">
              <div className="hunger-progress-container">
                <div
                  className={`hunger-progress-bar ${hungerLevel >= 3 ? 'low' : ''} ${hungerLevel >= 4 ? 'critical' : ''}`}
                  style={{ width: `${(hungerLevel / 5) * 100}%` }}
                ></div>
              </div>
              <span className="hunger-text">{hungerLevel.toFixed(1)}/5</span>
              <button onClick={feedDaisy} className="feed-button">🦴 Feed</button>

              {/* VOLUME BUTTON */}
              <button
                onClick={() => setShowVolumeControls(true)}
                className="volume-button"
                title="Sound Settings"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>

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
                  console.log('Current Game:', gameState)
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
              >
                🐛
              </button>
            </div>
          </div>
        )}

        {/* QUICK ACTION BUTTONS */}
        {showQuickActions && (
          <div className="quick-actions">
            <h3>What would you like to do?</h3>
            <div className="quick-buttons">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="quick-action-btn"
                  title={action.label}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES CONTAINER */}
        <div className="messages-container">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'daisy' ? getEmotionImage(message.emotion || currentEmotion) : '👤'}
              </div>
              <div className="message-content">
                {message.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message daisy">
              <div className="message-avatar">{getEmotionImage(currentEmotion)}</div>
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
            placeholder="Type a message to Daisy..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} className="send-button">Send</button>
        </div>
      </div>

      {/* VOLUME CONTROLS MODAL */}
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
