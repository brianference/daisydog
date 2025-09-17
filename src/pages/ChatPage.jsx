import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaw, FaBone, FaHome, FaQuestionCircle, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { SafeAISystem } from '../components/SafeAISystem'
import { daisyResponses } from '../data/daisyResponses'
import useSound from 'use-sound'
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
  const [conversationLagTimer, setConversationLagTimer] = useState(null)
  const [lagPromptCycle, setLagPromptCycle] = useState(0)
  
  // Sound system
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(0.5)
  
  // Sound effects
  const [playHappyBark] = useSound('/sounds/dog/happy-bark.mp3', { volume: volume * 0.7 })
  const [playExcitedBark] = useSound('/sounds/dog/excited-bark.mp3', { volume: volume * 0.7 })
  const [playBallBounce] = useSound('/sounds/games/ball-bounce.mp3', { volume: volume * 0.8 })
  const [playCrunchyTreats] = useSound('/sounds/eating/crunchy-treats.mp3', { volume: volume * 0.6 })
  const [playButtonClick] = useSound('/sounds/ui/button-click.mp3', { volume: volume * 0.4 })
  
  // Refs
  const messagesEndRef = useRef(null)
  const safeAISystem = useRef(new SafeAISystem(daisyResponses))
  
  // Checkpoint system
  const [checkpointSaved, setCheckpointSaved] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation checkpoint
  useEffect(() => {
    const savedConversation = localStorage.getItem('daisydog-conversation')
    const savedState = localStorage.getItem('daisydog-state')
    
    if (savedConversation && savedState) {
      try {
        const conversation = JSON.parse(savedConversation)
        const state = JSON.parse(savedState)
        
        setMessages(conversation)
        setDaisyEmotion(state.emotion || 'happy')
        setHungerLevel(state.hungerLevel || 3)
        setGameState(state.gameState || null)
        setHasGreetedUser(state.hasGreetedUser || false)
        setUserName(state.userName || '')
        setCheckpointSaved(true)
        
        console.log('📚 Conversation checkpoint loaded')
      } catch (error) {
        console.error('Error loading checkpoint:', error)
        initializeConversation()
      }
    } else {
      initializeConversation()
    }
  }, [])

  const initializeConversation = () => {
    const initialMessage = {
      id: 1,
      sender: 'daisy',
      text: "Woof woof! Hi there! I'm Daisy! 🐕 I'm so excited to meet you! What's your name?",
      timestamp: new Date(),
      type: 'greeting'
    }
    setMessages([initialMessage])
    setDaisyEmotion('excited')
  }

  // Save conversation checkpoint
  const saveCheckpoint = (newMessages, newState) => {
    try {
      localStorage.setItem('daisydog-conversation', JSON.stringify(newMessages))
      localStorage.setItem('daisydog-state', JSON.stringify(newState))
      setCheckpointSaved(true)
      setTimeout(() => setCheckpointSaved(false), 2000)
    } catch (error) {
      console.error('Error saving checkpoint:', error)
    }
  }

  // Reset conversation
  const resetConversation = () => {
    localStorage.removeItem('daisydog-conversation')
    localStorage.removeItem('daisydog-state')
    setMessages([])
    setDaisyEmotion('happy')
    setHungerLevel(3)
    setGameState(null)
    setHasGreetedUser(false)
    setUserName('')
    clearTimeout(conversationLagTimer)
    initializeConversation()
  }

  // Hunger system
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        if (prev > 0) {
          const newLevel = prev - 1
          if (newLevel === 1) {
            setTimeout(() => {
              addDaisyMessage(getRandomResponse(daisyResponses.general), 'hungry')
            }, 2000)
          }
          return newLevel
        }
        return prev
      })
    }, 60000)

    return () => clearInterval(hungerTimer)
  }, [])

  // Conversation lag detection
  useEffect(() => {
    if (hasGreetedUser && messages.length > 1) {
      const timer = setTimeout(() => {
        // Alternate between dog questions and hunger prompts
        if (lagPromptCycle % 2 === 0) {
          // Dog question prompts
          const dogQuestionPrompts = [
            "*perks up ears and tilts head* Hey! I'm curious about something... do you have any questions about dogs? I know lots of fun facts! 🐕📚",
            "*bounces excitedly* Ooh! Ooh! Ask me something about dogs! I love sharing what I know! *wags tail* 🐾✨",
            "*sits attentively* You know what would be fun? If you asked me a question about dogs! I have so many interesting things to share! 🤔💭",
            "*nudges with nose* Psst... want to know a secret about dogs? Ask me anything and I'll tell you something amazing! 🤫🐕",
            "*does a little play bow* I'm feeling chatty about dog stuff! Got any questions for me? *tail wagging hopefully* 🎾❓"
          ]
          const randomPrompt = dogQuestionPrompts[Math.floor(Math.random() * dogQuestionPrompts.length)]
          addDaisyMessage(randomPrompt, 'prompt')
          setDaisyEmotion('eager')
        } else {
          // Hunger prompts
          const hungerPrompts = [
            "*sniffs around hopefully* I'm getting a little hungry... do you have any treats? *puppy dog eyes* 🦴🥺",
            "*stomach rumbles softly* I smell something yummy! Can I have a snack? *sits like a good girl* 🍖😋",
            "*gentle whimper* My tummy is rumbling! Feed me please? *does puppy eyes* 🥺💕",
            "*sits perfectly* I've been such a good girl, don't I deserve a treat? *hopeful tail wag* 🐕🏆"
          ]
          const randomPrompt = hungerPrompts[Math.floor(Math.random() * hungerPrompts.length)]
          addDaisyMessage(randomPrompt, 'prompt')
          setDaisyEmotion('hungry')
        }
        setLagPromptCycle(prev => prev + 1)
      }, 30000)

      setConversationLagTimer(timer)
      return () => clearTimeout(timer)
    }
  }, [messages, hasGreetedUser, lagPromptCycle])

  const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const addDaisyMessage = (text, type = 'chat') => {
    const newMessage = {
      id: Date.now(),
      sender: 'daisy',
      text,
      timestamp: new Date(),
      type
    }
    
    setMessages(prev => {
      const updated = [...prev, newMessage]
      // Save checkpoint with new message
      saveCheckpoint(updated, {
        emotion: daisyEmotion,
        hungerLevel,
        gameState,
        hasGreetedUser,
        userName
      })
      return updated
    })
    
    // Play appropriate sound
    if (soundEnabled) {
      if (type === 'fed') {
        playCrunchyTreats?.()
      } else if (daisyEmotion === 'excited') {
        playExcitedBark?.()
      } else {
        playHappyBark?.()
      }
    }
  }

  // Game interaction handler
  const handleGameInteraction = (message) => {
    if (!gameState) return null

    const lowerMessage = message.toLowerCase()

    switch (gameState.type) {
      case 'fetch':
        if (lowerMessage.includes('throw') || lowerMessage.includes('ball')) {
          if (gameState.phase === 'waiting') {
            setGameState({ type: 'fetch', phase: 'returned', ballLocation: 'returned' })
            setDaisyEmotion('excited')
            return "*chases after ball at full speed* Woof woof! *catches ball mid-air* Got it! *runs back proudly* Here you go! *drops ball* Want to throw it again? 🐕💨"
          } else if (gameState.phase === 'returned') {
            setGameState({ type: 'fetch', phase: 'waiting', ballLocation: 'dropped' })
            setDaisyEmotion('playfetch')
            return "*tail wagging intensely* Yes! Again! *picks up ball and drops it* I could play fetch all day! Throw it! Throw it! 🎾✨"
          }
        }
        break

      case 'hideseek':
        if (lowerMessage.includes('found') || lowerMessage.includes('here')) {
          setGameState(null)
          setDaisyEmotion('excited')
          return "*jumps up and down* Found you! Found you! *spins in circles* That was so much fun! You're really good at hiding! Want to play again? 🎉"
        }
        break

      case 'tugwar':
        if (lowerMessage.includes('pull')) {
          const newIntensity = Math.min(3, gameState.intensity + 1)
          setGameState({ ...gameState, intensity: newIntensity, rounds: gameState.rounds + 1 })
          
          const responses = [
            "*pulls gently* Grr! *tail wagging* You're strong! 💪",
            "*pulls harder* GRRR! *digs paws in* This is fun! 🐕",
            "*pulls with all might* GRRRRRR! *dramatic tug* You're really good at this! 💥"
          ]
          return responses[newIntensity - 1]
        }
        break

      case 'guessing':
        const correctAnswer = gameState.secret
        if (lowerMessage.includes(correctAnswer)) {
          setGameState(null)
          setDaisyEmotion('excited')
          return `*jumps up excitedly* YES! You got it! It was a ${correctAnswer}! *spins in circles* You're so smart! Want to play again? 🎉✨`
        } else {
          const newAttempts = gameState.attempts + 1
          setGameState({ ...gameState, attempts: newAttempts })
          
          if (newAttempts >= 3) {
            return "*gives hint* Hmm, let me help! It's round and bouncy! 🎾 One more guess! 💡"
          } else {
            return "*tilts head* Not quite! Keep trying! 🤔 Try again! 🐕"
          }
        }
        break
    }

    // Check for game termination
    if (lowerMessage.includes('stop') || lowerMessage.includes('quit') || lowerMessage.includes('done')) {
      setGameState(null)
      setDaisyEmotion('happy')
      return "*pants happily* That was so much fun! *wags tail* Thanks for playing with me! What should we do next? 🐕💕"
    }

    return null
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Play button click sound
    if (soundEnabled) {
      playButtonClick?.()
    }

    const messageToSend = inputMessage.trim()

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageToSend,
      timestamp: new Date(),
      type: 'chat'
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Reset conversation lag timer
    clearTimeout(conversationLagTimer)

    // Check for name in first message
    if (!hasGreetedUser && !userName) {
      const nameMatch = messageToSend.match(/\b([A-Z][a-z]+)\b/)
      if (nameMatch) {
        const detectedName = nameMatch[1]
        setUserName(detectedName)
        setHasGreetedUser(true)
        
        setTimeout(() => {
          setIsTyping(false)
          const nameResponse = `${detectedName}! What a wonderful name! *tail wagging excitedly* I'm so happy to meet you, ${detectedName}! What would you like to do together? 🐕💕`
          addDaisyMessage(nameResponse, 'greeting')
          setDaisyEmotion('excited')
        }, 1500)
        
        setIsTyping(true)
        return
      }
    }

    // Mark as greeted after first interaction
    if (!hasGreetedUser) {
      setHasGreetedUser(true)
    }

    // Show typing indicator
    setIsTyping(true)

    // Check for game interactions first
    const gameResponse = handleGameInteraction(messageToSend)
    if (gameResponse) {
      setTimeout(() => {
        setIsTyping(false)
        addDaisyMessage(gameResponse, 'game')
      }, 1000 + Math.random() * 1000)
      return
    }

    // Generate response using SafeAI system
    try {
      const response = await safeAISystem.current.generateSafeResponse(messageToSend, 12)
      
      setTimeout(() => {
        setIsTyping(false)
        addDaisyMessage(response)
        
        // Update emotion based on message content
        updateEmotionBasedOnMessage(messageToSend)
      }, 1000 + Math.random() * 2000)
      
    } catch (error) {
      console.error('Error generating response:', error)
      setTimeout(() => {
        setIsTyping(false)
        addDaisyMessage("Woof! Something went wrong, but I'm still here! 🐕")
      }, 1000)
    }
  }

  const updateEmotionBasedOnMessage = (message) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('dance')) {
      setDaisyEmotion('dancing')
    } else if (lowerMessage.includes('trick') || lowerMessage.includes('sit') || lowerMessage.includes('roll')) {
      setDaisyEmotion('crouchingdown')
    } else if (lowerMessage.includes('play') || lowerMessage.includes('game') || lowerMessage.includes('fetch')) {
      setDaisyEmotion('playfetch')
    } else if (lowerMessage.includes('story')) {
      setDaisyEmotion('thinking')
    } else if (lowerMessage.includes('joke')) {
      setDaisyEmotion('happy')
    } else if (lowerMessage.includes('dream') || lowerMessage.includes('wish')) {
      setDaisyEmotion('thinking')
    } else if (lowerMessage.includes('love')) {
      setDaisyEmotion('stylish')
    } else if (lowerMessage.includes('food') || lowerMessage.includes('hungry') || lowerMessage.includes('treat')) {
      setDaisyEmotion('eager')
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      setDaisyEmotion('excited')
    }
  }

  const handleQuickAction = (actionType) => {
    if (soundEnabled) {
      playButtonClick?.()
    }

    // Clear conversation lag timer
    clearTimeout(conversationLagTimer)

    let response, emotion

    switch (actionType) {
      case 'story':
        response = getRandomResponse(daisyResponses.stories)
        emotion = 'thinking'
        break
      case 'joke':
        response = getRandomResponse(daisyResponses.jokes)
        emotion = 'happy'
        break
      case 'trick':
        response = getRandomResponse(daisyResponses.tricks)
        emotion = 'crouchingdown'
        break
      case 'dance':
        response = getRandomResponse(daisyResponses.dances)
        emotion = 'dancing'
        break
      case 'game':
        // Start a random interactive game
        const games = [
          {
            type: 'fetch',
            response: "*bounces excitedly* Fetch! My favorite! *drops ball at your feet* Here's the ball! Throw it and I'll bring it back! 🎾",
            state: { type: 'fetch', phase: 'waiting', ballLocation: 'dropped' }
          },
          {
            type: 'hideseek',
            response: "*covers eyes with paws* Hide and seek! I love this game! *counts* One... two... three... *peeks* Ready or not, here I come! *starts searching* 🙈",
            state: { type: 'hideseek', phase: 'seeking', attempts: 0 }
          },
          {
            type: 'tugwar',
            response: "*grabs rope toy* Tug of war! *growls playfully* Grrrr! *pulls with medium intensity* Try to pull it away from me! 🪢",
            state: { type: 'tugwar', intensity: 1, rounds: 0 }
          },
          {
            type: 'guessing',
            response: "*sits mysteriously* I'm thinking of something I love to play with... *wags tail* It starts with 'B'! Can you guess what it is? 🤔",
            state: { type: 'guessing', secret: 'ball', attempts: 0 }
          }
        ]
        
        const selectedGame = games[Math.floor(Math.random() * games.length)]
        setGameState(selectedGame.state)
        response = selectedGame.response
        emotion = 'playfetch'
        
        if (soundEnabled) {
          playBallBounce?.()
        }
        break
      case 'feelings':
        if (hungerLevel <= 2) {
          response = "*stomach rumbles* I'm feeling pretty hungry actually! *puppy dog eyes* Could really go for a treat right about now! 🦴🥺"
          emotion = 'hungry'
        } else {
          response = "*wags tail happily* I'm feeling fantastic! *bounces* Full of energy and ready for anything! How are you feeling? 🐕💕"
          emotion = 'happy'
        }
        break
      case 'dreams':
        response = getRandomResponse(daisyResponses.dreams)
        emotion = 'thinking'
        break
      default:
        response = getRandomResponse(daisyResponses.general)
        emotion = 'happy'
    }

    // Add Daisy's response directly
    setTimeout(() => {
      addDaisyMessage(response, actionType)
      setDaisyEmotion(emotion)
    }, 500)
  }

  const feedDaisy = () => {
    if (soundEnabled) {
      playButtonClick?.()
      setTimeout(() => playCrunchyTreats?.(), 300)
    }

    // Clear conversation lag timer
    clearTimeout(conversationLagTimer)

    if (hungerLevel >= 5) {
      const fullResponses = [
        "*does a backflip* I'm so full I could fly! Wheeeee! *spins in air* Thanks for all the treats! 🤸‍♀️✨",
        "*rolls around happily* I'm stuffed! *giggles* My tummy is so round! *pats belly* No more room for treats! 🤰🐕",
        "*bounces like a rubber ball* I'm so full of energy from all those treats! *zooms around* I could run a marathon! 🏃‍♀️💨"
      ]
      addDaisyMessage(getRandomResponse(fullResponses), 'fed')
      setDaisyEmotion('excited')
      return
    }

    setHungerLevel(5)
    setDaisyEmotion('excited')
    
    const feedResponses = [
      "OM NOM NOM! *crunch crunch* That was delicious! Thank you! 🦴✨",
      "*gobbles treat immediately* Woof! More please? *hopeful eyes* 🥺",
      "You're the BEST! *spins in happy circles* I love treats! 🌟",
      "*tail wagging at maximum speed* I love treats! I love you! 💕"
    ]
    
    addDaisyMessage(getRandomResponse(feedResponses), 'fed')
    
    setTimeout(() => setDaisyEmotion('happy'), 5000)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    if (soundEnabled) {
      playButtonClick?.()
    }
  }

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value))
  }

  // Get current emotion image
  const getEmotionImage = () => {
    return `/assets/images/emotions/${daisyEmotion}.png`
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <div className="header-content">
          <Link to="/" className="home-btn">
            <FaHome /> Home
          </Link>
          
          <div className="daisy-status">
            <div className="daisy-avatar">
              <img src={getEmotionImage()} alt="Daisy" />
              <div className={`mood-indicator ${daisyEmotion}`}></div>
            </div>
            <div className="status-info">
              <h2>Daisy</h2>
              <div className="hunger-bar">
                <span>Hunger:</span>
                <div className="hunger-level">
                  {[...Array(5)].map((_, i) => (
                    <FaBone 
                      key={i} 
                      className={i < hungerLevel ? `filled hunger-${hungerLevel}` : 'empty'} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="checkpoint-status">
            {checkpointSaved && (
              <div className="checkpoint-indicator" title="Conversation saved">
                💾 Saved
              </div>
            )}
            <button className="reset-btn" onClick={resetConversation} title="Reset conversation">
              🔄 Reset
            </button>
          </div>

          <button className="feed-btn" onClick={feedDaisy}>
            <FaBone /> Feed Daisy
          </button>

          <Link to="/faq" className="faq-btn">
            <FaQuestionCircle /> FAQ
          </Link>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="chat-container">
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
                  <div className="message-avatar">
                    <img src={getEmotionImage()} alt="Daisy" />
                  </div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.text}</p>
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="message daisy typing"
            >
              <div className="message-avatar">
                <img src={getEmotionImage()} alt="Daisy" />
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Game Actions (appear when game is active) */}
        {gameState && (
          <motion.div 
            className="quick-actions game-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {gameState.type === 'fetch' && (
              <>
                {gameState.phase === 'waiting' && (
                  <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'throw ball' } })}>
                    🎾 Throw ball
                  </button>
                )}
                {gameState.phase === 'returned' && (
                  <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'throw again' } })}>
                    🎾 Throw again
                  </button>
                )}
              </>
            )}
            
            {gameState.type === 'hideseek' && (
              <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'found me' } })}>
                🙋 Found me!
              </button>
            )}
            
            {gameState.type === 'tugwar' && (
              <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'pull harder' } })}>
                💪 Pull harder
              </button>
            )}
            
            {gameState.type === 'guessing' && (
              <>
                <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'ball' } })}>
                  🎾 Ball
                </button>
                <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'bone' } })}>
                  🦴 Bone
                </button>
                <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'treat' } })}>
                  🍖 Treat
                </button>
                <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'toy' } })}>
                  🧸 Toy
                </button>
                <button onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'stick' } })}>
                  🌿 Stick
                </button>
              </>
            )}
            
            <button 
              className="end-game-btn"
              onClick={() => handleSendMessage({ preventDefault: () => {}, target: { value: 'stop game' } })}
            >
              🛑 Stop game
            </button>
          </motion.div>
        )}

        {/* Input Form */}
        <form className="message-form" onSubmit={handleSendMessage}>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message to Daisy..."
              className="message-input"
              maxLength={500}
            />
            <button type="submit" className="send-btn paw-btn" disabled={!inputMessage.trim()}>
              <FaPaw />
            </button>
            <span className="button-label">Send</span>
            <button type="button" className="feed-btn-chat" onClick={feedDaisy}>
              <FaBone />
            </button>
            <span className="button-label">Feed</span>
          </div>
        </form>
      </div>

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

      {/* Sound Controls */}
      <div className="sound-controls">
        <button 
          className={`sound-toggle ${soundEnabled ? 'enabled' : 'disabled'}`}
          onClick={toggleSound}
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          title="Volume"
        />
      </div>
    </div>
  )
}

export default ChatPage