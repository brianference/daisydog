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
  const [hasAskedName, setHasAskedName] = useState(false) // Whether we've asked for the name
  const [conversationLagTimer, setConversationLagTimer] = useState(null)
  const [lagPromptCycle, setLagPromptCycle] = useState(0)
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now())
  const [proactivePromptType, setProactivePromptType] = useState('dog_fact') // Alternate between 'dog_fact' and 'feed'
  
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
      id: `daisy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender: 'daisy',
      timestamp: new Date(),
      type,
      emotion: daisyEmotion
    }
    setMessages(prev => [...prev, newMessage])
  }

  // Enhanced response system with keyword detection
  const getResponseForMessage = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Enhanced dog education keyword detection - more comprehensive
    const dogKeywords = [
      'dog', 'dogs', 'puppy', 'puppies', 'canine', 'breed', 'breeds', 'alive', 'living',
      'how many', 'what breed', 'breed of dog', 'dog breed', 'dog facts', 'dog fact',
      'tail', 'bark', 'howl', 'nose', 'smell', 'hear', 'hearing', 'teeth', 'tooth',
      'paws', 'paw', 'ears', 'ear', 'eyes', 'eye', 'dream', 'dreams', 'sleep',
      'run', 'runs', 'fast', 'speed', 'jump', 'jumps', 'swim', 'swims', 'climb',
      'smart', 'intelligent', 'intelligence', 'learn', 'training', 'train',
      'old', 'age', 'ages', 'lifespan', 'live', 'lives', 'long', 'oldest',
      'bones', 'bone', 'skeleton', 'heart', 'beat', 'blood', 'water', 'body',
      'space', 'astronaut', 'moon', 'stars', 'universe', 'orbit', 'fly', 'flying',
      'sound', 'hear', 'listen', 'voice', 'vocal', 'communication', 'talk',
      'color', 'colors', 'see', 'vision', 'blind', 'night', 'dark', 'light',
      'touch', 'feel', 'whiskers', 'nose', 'tongue', 'paw pads', 'skin',
      'exercise', 'walk', 'run', 'play', 'energy', 'tired', 'rest', 'nap',
      'food', 'eat', 'diet', 'hungry', 'thirsty', 'water', 'treat', 'treats',
      'health', 'sick', 'vet', 'doctor', 'medicine', 'care', 'grooming',
      'history', 'ancient', 'evolution', 'wolf', 'wolves', 'wild', 'domestic',
      'job', 'work', 'service', 'police', 'guide', 'therapy', 'rescue', 'search',
      'language', 'sign', 'signs', 'commands', 'words', 'vocabulary', 'speak'
    ]
    
    // Check if message contains any dog-related keywords
    const hasDogKeyword = dogKeywords.some(keyword => lowerMessage.includes(keyword))
    
    if (hasDogKeyword) {
      console.log('DOG KEYWORD DETECTED:', { message: lowerMessage, keyword: dogKeywords.find(k => lowerMessage.includes(k)) })
      return getRandomResponse(daisyResponses.dog_education)
    }
    
    // Check other keyword categories
    for (const [category, keywords] of Object.entries(daisyResponses.keywords)) {
      if (category === 'dog_education') continue // Already checked above
      
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        if (daisyResponses[category]) {
          return getRandomResponse(daisyResponses[category])
        }
      }
    }
    
    // Default response
    return getRandomResponse(daisyResponses.general)
  }

  // Feed Daisy function with enhanced responses
  const feedDaisy = () => {
    const newHungerLevel = Math.min(5, hungerLevel + 1)
    setHungerLevel(newHungerLevel)
    setDaisyEmotion('happy')
    
    const feedResponses = [
      "*munches happily* Mmm! Thank you so much! *wags tail* That was delicious! 🦴✨",
      "*crunches treat* Oh boy oh boy! *spins in circle* You're the best! I feel so much better! 🐕💕",
      "*gobbles up treat* Woof! *happy panting* My tummy is happy now! Thank you for taking care of me! 🍖😊",
      "*tail wagging intensely* That hit the spot! *bounces* You always know exactly what I need! 🦴🎾"
    ]
    
    setTimeout(() => {
      addDaisyMessage(getRandomResponse(feedResponses))
      
      // After feeding, offer dog facts 60% of the time
      if (Math.random() < 0.6) {
        setTimeout(() => {
          const postFeedDogFacts = [
            "*content sigh* That was so yummy! *wags tail* Did you know dogs can run up to 45 miles per hour? 🐕💨",
            "*happy belly rub* Thank you! *bounces* Speaking of treats, did you know dogs have 42 teeth? 🦷🐾",
            "*tail wagging* You're the best! *excited* Want to hear an amazing dog fact? Ask me 'dog facts'! 🧠🐕",
            "*satisfied sigh* Perfect! *tilts head* Did you know dogs can smell 1,000 times better than humans? 👃✨"
          ]
          addDaisyMessage(getRandomResponse(postFeedDogFacts))
        }, 3000)
      }
    }, 500)
  }

  // Hunger system effects - FIXED GRADUAL DECREASE
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        // Decrease hunger very gradually (0.05 instead of 0.1)
        const newLevel = Math.max(0, prev - 0.05)

        console.log('HUNGER DEBUG:', { prev, newLevel, time: new Date().toLocaleTimeString() }) // DEBUG

        // Trigger hunger prompts at different levels
        if (newLevel <= 1 && prev > 1) {
          setTimeout(() => {
            const hungerPrompts = [
              "*stomach rumbles* Woof... I'm getting pretty hungry! *looks hopefully* Do you have any treats? 🦴🥺",
              "*sad puppy eyes* My tummy is making funny noises... *gentle whimper* Could I maybe have a little snack? 🍖💔",
              "*sits politely* I don't want to be a bother, but... *hopeful tail wag* I'm feeling quite peckish! 🦴✨"
            ]
            addDaisyMessage(getRandomResponse(hungerPrompts))
          }, 2000)
        } else if (newLevel <= 2 && prev > 2) {
          // Additional prompt at level 2
          setTimeout(() => {
            const mediumHungerPrompts = [
              "*wags tail gently* I'm starting to feel hungry... *hopeful eyes* A treat would be nice! 🦴😊",
              "*tilts head* My tummy is reminding me it's time for a treat! *gentle paw* 🐕🍖"
            ]
            addDaisyMessage(getRandomResponse(mediumHungerPrompts))
          }, 2000)
        } else if (newLevel <= 3 && prev > 3) {
          // Prompt at level 3
          setTimeout(() => {
            const lightHungerPrompts = [
              "*perks up ears* I could go for a treat right about now! *wags tail* 🦴✨"
            ]
            addDaisyMessage(getRandomResponse(lightHungerPrompts))
          }, 2000)
        }

        // MAXIMUM HUNGER EVENT - Silly behavior when hunger reaches 5
        if (newLevel >= 5 && prev < 5) {
          setTimeout(() => {
            const maxHungerEvents = [
              "*starts doing silly zoomies around the room* Whee! *bounces off walls* I'm so hungry I can't sit still! 🌀🐕",
              "*pretends to chase tail super fast* Zoom zoom zoom! *spins in circles* Feed me before I zoom away! 🌪️💨",
              "*stands on hind legs and dances* Look at me! *silly dance moves* I'm dancing for treats! 🕺🍖",
              "*rolls over dramatically* Oh no! *wiggles helplessly* I'm too hungry to get up! Help! 🤸‍♀️😵",
              "*barks at imaginary squirrels* Squirrel! *chases nothing* Wait, I'm just really hungry! 🐿️🐕"
            ]
            addDaisyMessage(getRandomResponse(maxHungerEvents))
            setDaisyEmotion('excited') // Silly excited emotion
          }, 1000)
        }

        return newLevel
      })
    }, 60000) // Decrease every 60 seconds (was 30 seconds - made slower)

    return () => clearInterval(hungerTimer)
  }, [])

  // Enhanced proactive engagement system - FIXED IMMEDIATE ACTIVATION
  useEffect(() => {
    console.log('PROACTIVE DEBUG: Setting up proactive timer') // DEBUG

    const proactiveTimer = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionTime
      const shouldActivate = timeSinceLastInteraction > 30000 && messages.length > 0 // 30 seconds, just 1 message

      console.log('PROACTIVE DEBUG:', {
        timeSinceLastInteraction,
        messagesLength: messages.length,
        shouldActivate,
        proactivePromptType,
        hungerLevel
      }) // DEBUG

      if (shouldActivate) {
        if (proactivePromptType === 'dog_fact') {
          console.log('PROACTIVE DEBUG: Sending dog fact prompt') // DEBUG
          const dogFactPrompts = [
            "*perks up excitedly* Hey! Did you know something really cool about dogs? *wags tail* Ask me 'dog facts' and I'll tell you! 🐕📚",
            "*bounces with excitement* I've been thinking about dog facts! *tilts head* Want to hear an amazing dog fact? 🐾✨",
            "*sits attentively* You know what I love sharing? *wags tail enthusiastically* Dog facts! Ask me about dogs and I'll teach you something new! 🧠🐕"
          ]
          addDaisyMessage(getRandomResponse(dogFactPrompts))
          setProactivePromptType('feed')
        } else {
          console.log('PROACTIVE DEBUG: Sending feed prompt') // DEBUG
          if (hungerLevel <= 3) {
            const feedPrompts = [
              "*stomach rumbles softly* Excuse me... *looks hopeful* I'm getting a little hungry. Do you think you could feed me a treat? 🦴🥺",
              "*wags tail hopefully* I love talking with you, but... *gentle whimper* My tummy is asking for a treat. Could you help? 🍖💕",
              "*sits politely* This has been so much fun! *looks at you with big eyes* But I'm feeling a bit peckish. A treat would be wonderful! 🦴✨"
            ]
            addDaisyMessage(getRandomResponse(feedPrompts))
          } else {
            // If not hungry, still offer dog facts
            const generalDogPrompts = [
              "*bounces excitedly* Speaking of fun things! *wags tail* Did you know dogs can learn over 150 words? Ask me 'dog facts'! 📚🐕",
              "*perks up ears* I just remembered something amazing about dogs! *excited tail wag* Want to hear a dog fact? 🐾✨"
            ]
            addDaisyMessage(getRandomResponse(generalDogPrompts))
          }
          setProactivePromptType('dog_fact')
        }

        // Reset interaction time to prevent immediate follow-up
        setLastInteractionTime(Date.now())
      }
    }, 15000) // Check every 15 seconds for faster activation

    return () => clearInterval(proactiveTimer)
  }, [lastInteractionTime, messages.length, proactivePromptType, hungerLevel])
  
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
        setGameState({ type: 'selection' })
        response = "*bounces excitedly* Yay! Game time! *spins in circle* What would you like to play? 🎾✨"
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
    setLastInteractionTime(Date.now())
    
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: messageToSend,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    
    // Handle name detection with improved logic
    if (!userName) {  // Only check if we don't have a name yet
      // More permissive name detection patterns
      const namePatterns = [
        /my\s+name\s+is\s+([A-Za-z]{2,15})/i,
        /(?:I'm|I am|hi I'm|hello I'm|call me)\s+([A-Za-z]{2,15})/i,
        /^([A-Za-z]{2,15})(?:\s|$)/  // Just a single name
      ]

      let detectedName = null
      for (const pattern of namePatterns) {
        const match = messageToSend.match(pattern)
        if (match && match[1]) {
          detectedName = match[1]
          break
        }
      }

      // Fallback: Check for any capitalized word that looks like a name
      if (!detectedName) {
        const words = messageToSend.split(/\s+/)
        for (const word of words) {
          if (word.length >= 2 && word.length <= 15 &&
              word[0] === word[0].toUpperCase() &&
              word.match(/^[A-Za-z]+$/) &&
              !['Hello', 'Hi', 'Hey', 'Yes', 'No', 'The', 'And', 'But', 'Dog', 'Cat', 'My', 'Name', 'Is', 'I\'m', 'Iam'].includes(word)) {
            detectedName = word
            break
          }
        }
      }

      console.log('DEBUG - Message:', messageToSend, 'Detected name:', detectedName) // DEBUG

      // Validate the detected name
      if (detectedName &&
          detectedName.length >= 2 &&
          detectedName.length <= 15 &&
          detectedName[0] === detectedName[0].toUpperCase() &&
          !['Hello', 'Hi', 'Hey', 'Yes', 'No', 'The', 'And', 'But', 'Dog', 'Cat'].includes(detectedName)) {

        console.log('NAME DETECTED AND VALIDATED:', detectedName) // DEBUG

        setUserName(detectedName)

        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          addDaisyMessage(`*tail wagging excitedly* ${detectedName}! What a wonderful name! *bounces* I'm so happy to meet you, ${detectedName}! I'll remember that! 🐕💕`)
        }, 1000)
        return
      }
    }
    
    // Generate Daisy response using enhanced system
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      let response = getResponseForMessage(messageToSend)
      
      // Add personalization if we know the user's name
      if (userName && Math.random() < 0.3) {
        response = response.replace(/\*([^*]+)\*/, `*$1* ${userName}!`)
      }
      
      addDaisyMessage(response)
      
      // Occasionally offer dog facts - enhanced system
      const shouldOfferDogFacts = Math.random() < 0.35 // Increased from 15% to 35%
      if (shouldOfferDogFacts) {
        setTimeout(() => {
          const factPrompts = [
            "*perks up excitedly* Oh! That reminds me of a fun dog fact! Want to hear it? 🐕📚",
            "*bounces* Speaking of that, did you know something cool about dogs? Ask me for a dog fact! 🎾✨",
            "*tilts head thoughtfully* You know what's interesting about dogs? Ask me 'dog facts' and I'll share! 🐾🧠",
            "*wags tail enthusiastically* I have so many amazing dog facts! Want to hear one? 🧠🐕",
            "*eyes sparkling* Did you know something incredible about dogs? Ask me 'dog facts'! 🐾✨",
            "*sits attentively* I love sharing dog facts! *wags tail* Want to learn something new about dogs? 📚🐕"
          ]
          addDaisyMessage(getRandomResponse(factPrompts))
        }, 2000 + Math.random() * 3000) // Random delay between 2-5 seconds
      }
    }, 1000 + Math.random() * 1000)
  }

  // Game handling functions
  const handleGameAction = (gameType) => {
    setLastInteractionTime(Date.now())
    
    switch (gameType) {
      case 'fetch':
        setGameState({ type: 'fetch', round: 1, score: 0 })
        setDaisyEmotion('playfetch')
        addDaisyMessage("*gets into play position* Woof! *eyes on the ball* Throw it! Throw it! I'm ready to fetch! 🎾🐕")
        break
      case 'tug':
        setGameState({ type: 'tug', strength: 50 })
        setDaisyEmotion('playfetch')
        addDaisyMessage("*grabs rope toy* Grrrr! *playful growl* Let's see who's stronger! Pull as hard as you can! 🪢💪")
        break
      case 'hide':
        setGameState({ type: 'hide', hidden: true, location: Math.floor(Math.random() * 3) + 1 })
        setDaisyEmotion('thinking')
        addDaisyMessage("*runs and hides* Woof! *muffled bark* Try to find me! I'm hiding somewhere... 🙈🔍")
        break
      case 'ball':
        setGameState({ type: 'ball', throws: 0, catches: 0 })
        setDaisyEmotion('playfetch')
        addDaisyMessage("*bounces excitedly* Ball game! *jumps up* Throw me the ball and I'll try to catch it! 🏀🐕")
        break
      case 'guess':
        const number = Math.floor(Math.random() * 10) + 1
        setGameState({ type: 'guess', number, attempts: 0 })
        setDaisyEmotion('thinking')
        addDaisyMessage("*sits thoughtfully* I'm thinking of a number between 1 and 10! *wags tail* Can you guess what it is? 🤔🔢")
        break
      default:
        setGameState(null)
    }
  }

  const handleGameGuess = (guess) => {
    if (gameState?.type === 'guess') {
      const attempts = gameState.attempts + 1
      if (parseInt(guess) === gameState.number) {
        setGameState(null)
        setDaisyEmotion('happy')
        addDaisyMessage(`*jumps with joy* YES! ${gameState.number} was exactly right! *spins in circles* You got it in ${attempts} tries! You're so smart! 🎉🐕`)
      } else {
        const hint = parseInt(guess) < gameState.number ? 'higher' : 'lower'
        setGameState({ ...gameState, attempts })
        addDaisyMessage(`*tilts head* Hmm, not quite! *encouraging tail wag* Try a ${hint} number! You've made ${attempts} guesses so far! 🤔💭`)
      }
    }
  }

  const stopGame = () => {
    setGameState(null)
    setDaisyEmotion('happy')
    addDaisyMessage("*pants happily* That was fun! *wags tail* Thanks for playing with me! Want to do something else? 🐕💕")
  }
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Initial greeting and name asking - FIXED REPETITION
  useEffect(() => {
    if (!hasGreetedUser && messages.length === 0) {
      setHasGreetedUser(true) // Set immediately to prevent double execution
      
      setTimeout(() => {
        addDaisyMessage(getRandomResponse(daisyResponses.greetings))
        
        // Ask for name after greeting - longer delay to prevent overlap
        setTimeout(() => {
          const namePrompts = [
            "*tilts head curiously* I'd love to know your name! *wags tail* What should I call you, friend? 🐕💕",
            "*sits politely* What's your name? *excited tail wagging* I want to remember it so we can be proper friends! 🎾✨",
            "*bounces gently* I'm Daisy! *happy panting* What's your name? I love making new friends! 🐾😊"
          ]
          addDaisyMessage(getRandomResponse(namePrompts))
          setHasAskedName(true)
        }, 3000) // Increased from 2000 to 3000 to prevent overlap
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
            <h1>🐕 Daisy {userName && `& ${userName}`}</h1>
            <p>Your friendly AI companion</p>
            <div className="hunger-bar">
              <span>Hunger:</span>
              <div className="hunger-level">
                {[1, 2, 3, 4, 5].map(level => {
                  let boneClass = 'hunger-bone'
                  
                  if (hungerLevel >= level) {
                    boneClass += ' filled'
                    
                    // Add hunger animation for bones 4 and 5 when hungry
                    if (hungerLevel >= 4 && level >= 4) {
                      boneClass += ' hungry'
                    }
                    
                    // Add starving animation for bone 5 when very hungry
                    if (hungerLevel >= 5 && level === 5) {
                      boneClass += ' starving'
                    }
                  } else {
                    boneClass += ' empty'
                  }
                  
                  console.log(`HUNGER BONE ${level}:`, { hungerLevel, boneClass }) // DEBUG
                  
                  return (
                    <span 
                      key={level} 
                      className={boneClass}
                    >
                      🦴
                    </span>
                  )
                })}
              </div>
            </div>
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
        <button 
          type="button" 
          onClick={feedDaisy}
          className="feed-btn"
          disabled={hungerLevel >= 5}
          title={hungerLevel >= 5 ? "Daisy is full!" : "Feed Daisy a treat"}
        >
          <FaBone />
        </button>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Type a message to Daisy${userName ? `, ${userName}` : ''}...`}
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

      {/* Game Selection Menu */}
      {gameState?.type === 'selection' && (
        <div className="game-selection">
          <h3>🎮 Choose a Game!</h3>
          <div className="game-buttons">
            <button onClick={() => handleGameAction('fetch')}>
              🎾 Fetch Game
            </button>
            <button onClick={() => handleGameAction('tug')}>
              🪢 Tug of War
            </button>
            <button onClick={() => handleGameAction('hide')}>
              🙈 Hide & Seek
            </button>
            <button onClick={() => handleGameAction('ball')}>
              🏀 Ball Catch
            </button>
            <button onClick={() => handleGameAction('guess')}>
              🤔 Guessing Game
            </button>
            <button onClick={stopGame} className="stop-game">
              🛑 Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Active Game Controls */}
      {gameState && gameState.type !== 'selection' && (
        <div className="game-controls">
          {gameState.type === 'fetch' && (
            <div className="fetch-game">
              <h3>🎾 Fetch Game - Round {gameState.round}</h3>
              <p>Score: {gameState.score}</p>
              <div className="game-actions">
                <button onClick={() => {
                  const success = Math.random() > 0.3
                  const newScore = success ? gameState.score + 1 : gameState.score
                  setGameState({ ...gameState, round: gameState.round + 1, score: newScore })
                  addDaisyMessage(success ? 
                    "*catches ball perfectly* Got it! *wags tail proudly* Throw it again! 🎾✨" :
                    "*misses ball* Oops! *chases after it* Almost had it! Try again! 🐕💨"
                  )
                }}>
                  🎾 Throw Ball
                </button>
                <button onClick={() => {
                  const responses = [
                    "*bounces ball back to you* Boing! *excited bouncing* Your turn! 🏀",
                    "*bats ball with paw* Boing boing! *giggles* Let's keep it going! 🎾",
                    "*rolls ball gently* Nice bounce! *wags tail* Throw it back! 🏀"
                  ]
                  addDaisyMessage(getRandomResponse(responses))
                }}>
                  🏀 Bounce Ball
                </button>
                <button onClick={() => {
                  const responses = [
                    "*gets super excited* Wooo! *pretends to chase* That was a good pretend throw! *panting happily* 🎾😄",
                    "*jumps up pretending to catch* Got it! *twirls* You're so fun at pretend fetch! 🎪",
                    "*spins in pretend chase* Zoom zoom! *laughs* That was the best pretend throw ever! 🌀"
                  ]
                  addDaisyMessage(getRandomResponse(responses))
                }}>
                  🎭 Pretend Throw
                </button>
                <button onClick={() => {
                  const success = Math.random() > 0.4
                  const newScore = success ? gameState.score + 2 : gameState.score
                  setGameState({ ...gameState, round: gameState.round + 1, score: newScore })
                  addDaisyMessage(success ? 
                    "*leaps high and catches far throw* Wow! *super excited* That was an amazing throw! You're the best! 🏆✨" :
                    "*runs after far ball* Whew! *pants* That was far! Let me get it! 🏃‍♀️💨"
                  )
                }}>
                  🚀 Throw Far
                </button>
                <button onClick={() => {
                  const success = Math.random() > 0.1 // Easier catch
                  const newScore = success ? gameState.score + 1 : gameState.score
                  setGameState({ ...gameState, round: gameState.round + 1, score: newScore })
                  addDaisyMessage(success ? 
                    "*catches easy throw* That was perfect! *wags tail* Nice and easy! 🎾😊" :
                    "*playfully misses easy one* Oops! *giggles* That was too easy to miss! 😄"
                  )
                }}>
                  🎯 Throw Short
                </button>
                <button onClick={stopGame} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}

          {gameState.type === 'tug' && (
            <div className="tug-game">
              <h3>🪢 Tug of War</h3>
              <p>Strength: {gameState.strength}%</p>
              <div className="game-actions">
                <button onClick={() => {
                  const pull = Math.random() * 20 - 10
                  const newStrength = Math.max(0, Math.min(100, gameState.strength + pull))
                  setGameState({ ...gameState, strength: newStrength })
                  if (newStrength <= 10) {
                    addDaisyMessage("*wins tug of war* Woof! I won! *victory dance* I'm so strong! 💪🐕")
                    setGameState(null)
                  } else if (newStrength >= 90) {
                    addDaisyMessage("*lets go of rope* Wow! You're really strong! *impressed tail wag* You win! 🏆✨")
                    setGameState(null)
                  } else {
                    addDaisyMessage("*tugs harder* Grrr! *playful growl* This is fun! Keep pulling! 🪢💪")
                  }
                }}>
                  💪 Pull!
                </button>
                <button onClick={() => {
                  addDaisyMessage("*drops rope dramatically* Oh no! *pretends to be surprised* I dropped it! *giggles* Let's try again! 🪢😄")
                  setGameState({ ...gameState, strength: 50 }) // Reset strength
                }}>
                  🤲 Drop Rope
                </button>
                <button onClick={() => {
                  const dizzy = Math.random() > 0.5
                  if (dizzy) {
                    addDaisyMessage("*swings rope over head fast* Whee! *gets dizzy* Whoa! *wobbles* That made me dizzy! 🌀😵")
                    setGameState({ ...gameState, strength: Math.max(0, gameState.strength - 15) })
                  } else {
                    addDaisyMessage("*swings rope gracefully* Look at me! *spins with rope* I'm a rope swinging expert! 🎪✨")
                  }
                }}>
                  🌀 Swing Over Head
                </button>
                <button onClick={() => {
                  const responses = [
                    "*throws rope back* Take that! *playful growl* Your turn to tug! 🪢💨",
                    "*flings rope toward you* Here! *laughs* Tug it now! 🎾",
                    "*swings and releases* Whee! *watches rope fly* Catch it! 🪢✨"
                  ]
                  addDaisyMessage(getRandomResponse(responses))
                  setGameState({ ...gameState, strength: 50 }) // Reset for new round
                }}>
                  🚀 Throw Rope
                </button>
                <button onClick={() => {
                  const twist = Math.random() * 10 - 5
                  const newStrength = Math.max(0, Math.min(100, gameState.strength + twist))
                  setGameState({ ...gameState, strength: newStrength })
                  addDaisyMessage("*twists rope skillfully* Hee hee! *playful twisting* That was fun! Let's keep going! 🪢😄")
                }}>
                  🔄 Twist Rope
                </button>
                <button onClick={stopGame} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}

          {gameState.type === 'hide' && (
            <div className="hide-game">
              <h3>🙈 Hide & Seek</h3>
              <p>Where am I hiding?</p>
              <div className="game-actions">
                <button onClick={() => {
                  if (gameState.location === 1) {
                    addDaisyMessage("*jumps out* You found me! *happy barking* I was behind the couch! Great job! 🎉🐕")
                    setGameState(null)
                  } else {
                    addDaisyMessage("*muffled bark* Nope! Not here! Keep looking! 🙈")
                  }
                }}>
                  🛋️ Behind Couch
                </button>
                <button onClick={() => {
                  if (gameState.location === 2) {
                    addDaisyMessage("*pops out* Found me! *tail wagging* I was under the bed! You're good at this! 🎉🐕")
                    setGameState(null)
                  } else {
                    addDaisyMessage("*distant bark* Not here either! Try somewhere else! 🔍")
                  }
                }}>
                  🛏️ Under Bed
                </button>
                <button onClick={() => {
                  if (gameState.location === 3) {
                    addDaisyMessage("*emerges from closet* You got me! *spins happily* I was in the closet! Well done! 🎉🐕")
                    setGameState(null)
                  } else {
                    addDaisyMessage("*echo bark* Nope! Keep searching! 🕵️")
                  }
                }}>
                  🚪 In Closet
                </button>
                <button onClick={() => {
                  addDaisyMessage("*starts counting loudly* 1... 2... 3... *gets distracted* Squirrel! *chases imaginary squirrel* Oh! Where was I? 1... 2... 3... 😄")
                }}>
                  🔢 Count to 20
                </button>
                <button onClick={() => {
                  const hints = [
                    "*muffled hint* I'm somewhere you sit! *giggle* 🤫🪑",
                    "*whisper* I'm near something you sleep on! *sneaky wag* 😴🛏️",
                    "*quiet bark* I'm in something with doors! *mysterious* 🚪🔐"
                  ]
                  addDaisyMessage(getRandomResponse(hints))
                }}>
                  💡 Give Hint
                </button>
                <button onClick={stopGame} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}

          {gameState.type === 'ball' && (
            <div className="ball-game">
              <h3>🏀 Ball Catch Game</h3>
              <p>Throws: {gameState.throws} | Catches: {gameState.catches}</p>
              <div className="game-actions">
                <button onClick={() => {
                  const success = Math.random() > 0.4
                  const newThrows = gameState.throws + 1
                  const newCatches = success ? gameState.catches + 1 : gameState.catches
                  setGameState({ ...gameState, throws: newThrows, catches: newCatches })
                  addDaisyMessage(success ? 
                    "*leaps and catches ball* Got it! *proud panting* Perfect catch! 🏀✨" :
                    "*jumps but misses* Whoops! *chases ball* Almost had it! Try again! 🐕💨"
                  )
                }}>
                  🏀 Throw Ball
                </button>
                <button onClick={() => {
                  const success = Math.random() > 0.6 // Harder to catch high balls
                  const newThrows = gameState.throws + 1
                  const newCatches = success ? gameState.catches + 2 : gameState.catches
                  setGameState({ ...gameState, throws: newThrows, catches: newCatches })
                  addDaisyMessage(success ? 
                    "*leaps super high* Wow! *catches high ball* That was amazing! You're the best! 🏆✨" :
                    "*watches high ball sail by* Whew! *pants* That was high! Let me chase it! 🏃‍♀️💨"
                  )
                }}>
                  ⬆️ Throw High
                </button>
                <button onClick={() => {
                  const success = Math.random() > 0.2 // Easier to catch low balls
                  const newThrows = gameState.throws + 1
                  const newCatches = success ? gameState.catches + 1 : gameState.catches
                  addDaisyMessage(success ? 
                    "*scoops low ball easily* Got it! *wags tail* Nice and easy! 🏀😊" :
                    "*playfully misses low ball* Oops! *giggles* That was too easy to miss! 😄"
                  )
                  setGameState({ ...gameState, throws: newThrows, catches: newCatches })
                }}>
                  ⬇️ Throw Low
                </button>
                <button onClick={() => {
                  const success = Math.random() > 0.5 // Medium difficulty
                  const newThrows = gameState.throws + 1
                  const newCatches = success ? gameState.catches + 1 : gameState.catches
                  setGameState({ ...gameState, throws: newThrows, catches: newCatches })
                  addDaisyMessage(success ? 
                    "*blurs with speed* Got it! *panting* That was fast! You're quick! ⚡✨" :
                    "*tries to catch but ball too fast* Zoom! *watches ball fly by* That was speedy! 🏃‍♀️💨"
                  )
                }}>
                  ⚡ Throw Fast
                </button>
                <button onClick={() => {
                  const success = Math.random() > 0.3 // Easier catch
                  const newThrows = gameState.throws + 1
                  const newCatches = success ? gameState.catches + 1 : gameState.catches
                  setGameState({ ...gameState, throws: newThrows, catches: newCatches })
                  addDaisyMessage(success ? 
                    "*catches slow ball gently* Nice! *careful catch* Perfect timing! 🏀😊" :
                    "*waits too long for slow ball* Oops! *chuckles* I waited too long! 😄"
                  )
                }}>
                  🐌 Throw Slow
                </button>
                <button onClick={stopGame} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}

          {gameState.type === 'guess' && (
            <div className="guess-game">
              <h3>🤔 Guessing Game</h3>
              <p>Guess my number (1-10)! Attempts: {gameState.attempts}</p>
              <div className="game-actions">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <button key={num} data-number={num} onClick={() => handleGameGuess(num)}>
                    {num}
                  </button>
                ))}
                <button onClick={() => {
                  const hint = gameState.number % 2 === 0 ? 'even' : 'odd'
                  addDaisyMessage(`*thinks hard* Hmm... my number is ${hint}! *helpful tail wag* Does that help? 🤔💭`)
                }}>
                  🔢 Even or Odd?
                </button>
                <button onClick={() => {
                  const ranges = ['1-3', '4-6', '7-10']
                  const rangeIndex = Math.floor((gameState.number - 1) / 3)
                  addDaisyMessage(`*concentrates* My number is in the ${ranges[rangeIndex]} range! *wags tail* Getting warmer? 🌡️🔥`)
                }}>
                  📊 Range Hint
                </button>
                <button onClick={() => {
                  const clues = [
                    `*tilts head* My number is greater than ${Math.floor(gameState.number / 2)}! *thinking hard* 🤔`,
                    `*counts on paws* My number is less than ${gameState.number + 3}! *careful counting* 🔢`,
                    `*bounces excitedly* My number is closer to ${gameState.number < 5 ? 'smaller' : 'bigger'} numbers! *helpful hint* 📈`
                  ]
                  addDaisyMessage(getRandomResponse(clues))
                }}>
                  💡 Smart Hint
                </button>
                <button onClick={() => {
                  const encouragement = [
                    "*cheers you on* You've got this! *enthusiastic tail wag* Keep guessing! 💪🐕",
                    "*bounces supportively* Don't give up! *encouraging barks* I believe in you! 🌟",
                    "*tilts head encouragingly* You're doing great! *supportive wag* One more try! 🎯"
                  ]
                  addDaisyMessage(getRandomResponse(encouragement))
                }}>
                  🎉 Encourage Me
                </button>
                <button onClick={stopGame} className="stop-game">
                  🛑 Stop Game
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatPage
