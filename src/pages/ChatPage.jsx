import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaperPlane, FaBone, FaHome, FaHeart, FaPaw, FaQuestionCircle } from 'react-icons/fa'
import { useAnthropicChat } from '../hooks/useAnthropicChat'
import './ChatPage.css'

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'daisy',
      text: "Woof woof! Hi there! I'm Daisy! 🐕 I'm so excited to meet you! What's your name?",
      timestamp: new Date(),
      type: 'greeting'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [daisyMood, setDaisyMood] = useState('happy')
  const [hungerLevel, setHungerLevel] = useState(3)
  const [lastFed, setLastFed] = useState(null)
  const [gameState, setGameState] = useState(null)
  const messagesEndRef = useRef(null)
  
  // Check if Anthropic API key is available
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  const { sendMessage: sendToAnthropic, isLoading } = useAnthropicChat(apiKey)

  // Daisy's personality responses (fallback if API is not available)
  const daisyResponses = {
    greetings: [
      "Woof! Hello there! 🐾",
      "Hi! *tail wagging intensifies* 🐕",
      "Oh my goodness, a new friend! *bounces excitedly*",
      "Woof woof! I'm so happy to see you! 💕"
    ],
    hungry: [
      "I'm getting a little hungry... do you have any treats? 🦴",
      "*sniffs around* I smell something yummy! Can I have a treat?",
      "My tummy is rumbling! Feed me please? 🥺",
      "Woof! I've been such a good girl, don't I deserve a treat?"
    ],
    jokes: [
      "Why don't dogs make good DJs? Because they have such ruff beats! 😂",
      "What do you call a sleeping bull dog? A bull-dozer! 💤",
      "Why did the dog go to the bank? To make a de-paws-it! 🏦",
      "What happens when it rains cats and dogs? You might step in a poodle! 🌧️"
    ],
    tricks: [
      "*sits perfectly* Woof! How's that for a good sit? 🐕",
      "*rolls over* Ta-da! Did you see my amazing roll? ✨",
      "*plays dead* ...am I doing it right? *peeks with one eye* 👁️",
      "*spins in a circle* Wheee! I love doing tricks! 🌟"
    ],
    games: [
      "Let's play fetch! *drops imaginary ball at your feet* 🎾",
      "How about hide and seek? I'll count... 1... 2... wait, I can't count that high! 😅",
      "Want to play tug of war? *grabs rope toy* 🪢",
      "Let's play the guessing game! I'm thinking of something... it's round, bouncy, and I love to chase it!"
    ],
    ballGame: [
      "🎾 Throw the ball",
      "🏃 Run away", 
      "⚽ Bounce the ball",
      "🎯 Aim at something"
    ]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate Daisy getting hungry over time
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        if (prev > 0) {
          const newLevel = prev - 1
          if (newLevel === 1) {
            // Daisy gets hungry and asks for food
            setTimeout(() => {
              addDaisyMessage(getRandomResponse('hungry'), 'hungry')
            }, 2000)
          }
          return newLevel
        }
        return prev
      })
    }, 60000) // Decrease hunger every minute

    return () => clearInterval(hungerTimer)
  }, [])

  const getRandomResponse = (category) => {
    const responses = daisyResponses[category]
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
    setMessages(prev => [...prev, newMessage])
  }

  const generateDaisyResponse = (userMessage) => {
    const message = userMessage.toLowerCase()
    
    // Check for specific keywords and respond accordingly
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return getRandomResponse('greetings')
    } else if (message.includes('joke') || message.includes('funny')) {
      return getRandomResponse('jokes')
    } else if (message.includes('trick') || message.includes('sit') || message.includes('roll')) {
      return getRandomResponse('tricks')
    } else if (message.includes('play') || message.includes('game')) {
      const response = getRandomResponse('games')
      if (response.includes('drops imaginary ball')) {
        setGameState('ball_dropped')
      }
      return response
    } else if (message.includes('hungry') || message.includes('food') || message.includes('eat')) {
      if (hungerLevel < 3) {
        return "Yes! I'm so hungry! *puppy dog eyes* 🥺"
      } else {
        return "I'm not hungry right now, but I always have room for treats! 😋"
      }
    } else if (message.includes('good girl') || message.includes('good dog')) {
      return "*tail wagging so fast it's a blur* Thank you! I AM a good girl! 🐕💕"
    } else if (message.includes('love')) {
      return "I love you too! *gives you the biggest puppy dog eyes* 💕🐾"
    } else {
      // General responses
      const generalResponses = [
        "Woof! That's interesting! Tell me more! 🐕",
        "*tilts head curiously* I'm listening! 👂",
        "Ooh, I love learning new things! *tail wag* ✨",
        "That sounds exciting! *bounces with enthusiasm* 🎉",
        "Woof woof! I'm not sure I understand, but I'm happy you're talking to me! 😊"
      ]
      return generalResponses[Math.floor(Math.random() * generalResponses.length)]
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
      type: 'chat'
    }
    setMessages(prev => [...prev, userMessage])

    // Clear input
    const messageToSend = inputMessage
    setInputMessage('')

    // Show typing indicator
    setIsTyping(true)

    try {
      let response
      
      // Check for game interactions
      if (gameState === 'ball_dropped' && messageToSend.toLowerCase().includes('throw')) {
        response = "*chases after the ball excitedly* Woof woof! *brings it back and drops it at your feet* Again! Again! 🎾"
        setGameState('ball_returned')
      } else if (gameState === 'ball_dropped' && messageToSend.toLowerCase().includes('run')) {
        response = "*tilts head confused* Wait, where are you going? *chases after you playfully* Don't leave me! 🐕💨"
        setGameState(null)
      } else if (gameState === 'ball_dropped' && messageToSend.toLowerCase().includes('bounce')) {
        response = "*watches the ball bounce with intense focus* Boing! Boing! *pounces on it* Got it! 🎾✨"
        setGameState(null)
      } else {
        // Try to use Anthropic API if available
        if (apiKey && sendToAnthropic) {
          const daisyPrompt = `You are Daisy, a friendly, energetic, and playful AI dog companion designed for children aged 5-18. You should:

- Always respond as a happy, excited dog who loves to play and chat
- Use dog-related expressions like "Woof!", "*tail wagging*", "*bounces excitedly*"
- Keep responses appropriate for children - no scary, violent, or inappropriate content
- Be encouraging, positive, and supportive
- Love to play games, tell jokes, do tricks, and learn about the user
- Sometimes mention being hungry or wanting treats
- Use emojis to make conversations fun and engaging
- Keep responses conversational and not too long

The user just said: "${messageToSend}"

Respond as Daisy the dog:`

          response = await sendToAnthropic(daisyPrompt)
        }
        
        // Fallback to local responses if API fails or isn't available
        if (!response) {
          response = generateDaisyResponse(messageToSend)
        }
      }

      setIsTyping(false)
      addDaisyMessage(response)
      
    } catch (error) {
      console.error('Error getting AI response:', error)
      setIsTyping(false)
      // Fallback to local response
      const fallbackResponse = generateDaisyResponse(messageToSend)
      addDaisyMessage(fallbackResponse)
    }
  }

  const handleQuickMessage = async (message) => {
    setInputMessage(message)
    // Simulate form submission
    const fakeEvent = { preventDefault: () => {} }
    await handleSendMessage(fakeEvent)
  }

  const feedDaisy = () => {
    if (hungerLevel >= 5) {
      // Funny animations when at max hunger
      const fullResponses = [
        "*does a backflip* I'm so full I could fly! Wheeeee! 🤸‍♀️✨",
        "*spins in circles until dizzy* Woooooah! *falls over dramatically* Too... much... food! 😵‍💫",
        "*starts howling a happy song* AROOOOO! I'm the happiest, fullest pup in the world! 🎵🐺",
        "*does the zoomies around the room* ZOOM ZOOM ZOOM! Full belly = crazy energy! 💨💨💨",
        "*rolls on back and wiggles* Look at my happy full belly! *wiggles paws in air* 🤗"
      ]
      addDaisyMessage(fullResponses[Math.floor(Math.random() * fullResponses.length)])
      return
    }

    setHungerLevel(5)
    setLastFed(new Date())
    setDaisyMood('excited')
    
    const feedResponses = [
      "OM NOM NOM! *crunch crunch* That was delicious! Thank you! 🦴✨",
      "*gobbles treat immediately* Woof! More please? 🥺",
      "You're the BEST! *spins in happy circles* 🌟",
      "*tail wagging at maximum speed* I love treats! I love you! 💕"
    ]
    
    addDaisyMessage(feedResponses[Math.floor(Math.random() * feedResponses.length)], 'fed')
    
    setTimeout(() => setDaisyMood('happy'), 5000)
  }

  return (
    <div className="chat-page">
      {/* API Key Status */}
      {!apiKey && (
        <div className="api-status warning">
          ⚠️ Anthropic API key not configured. Using basic responses.
        </div>
      )}
      
      {/* Header */}
      <header className="chat-header">
        <div className="header-content">
          <Link to="/" className="home-btn">
            <FaHome /> Home
          </Link>
          <Link to="/faq" className="faq-btn">
            <FaQuestionCircle /> FAQ
          </Link>
          <div className="daisy-status">
            <div className="daisy-avatar">
              <img src="/assets/images/daisy-logo.png" alt="Daisy" />
              <div className={`mood-indicator ${daisyMood}`}></div>
            </div>
            <div className="status-info">
              <h2>Daisy</h2>
              <div className="hunger-bar">
                <span>Hunger:</span>
                <div className="hunger-level">
                  {[...Array(5)].map((_, i) => (
                    <FaBone 
                      key={i} 
                      className={i < hungerLevel ? 'filled' : 'empty'} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button className="feed-btn" onClick={feedDaisy}>
            <FaBone /> Feed Daisy
          </button>
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
                    <img src="/assets/images/daisy-logo.png" alt="Daisy" />
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
          {(isTyping || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="message daisy typing"
            >
              <div className="message-avatar">
                <img src="/assets/images/daisy-logo.png" alt="Daisy" />
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
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-btn" 
              disabled={!inputMessage.trim() || isLoading}
            >
              <FaPaw />
            </button>
            <button 
              type="button" 
              className="feed-btn-chat" 
              onClick={feedDaisy}
              title="Feed Daisy"
            >
              <FaBone />
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => handleQuickMessage("Tell me a joke!")}>
          🐕 Tell a joke
        </button>
        <button onClick={() => handleQuickMessage("Do a trick!")}>
          🦴 Do a trick
        </button>
        <button onClick={() => handleQuickMessage("Let's play a game!")}>
          🎾 Play game
        </button>
        <button onClick={() => handleQuickMessage("How are you feeling?")}>
          🐾 What's on your mind?
        </button>
      </div>
    </div>
  )
}

export default ChatPage
