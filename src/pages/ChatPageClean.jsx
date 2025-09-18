import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPaw, FaBone, FaHome, FaQuestionCircle, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { daisyResponses } from '../data/daisyResponses'
import './ChatPage.css'

const ChatPage = () => {
  // Core state
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to DaisyDog! 🐕 What would you like to do today?', sender: 'daisy', timestamp: new Date() }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [daisyEmotion, setDaisyEmotion] = useState('happy')
  const [hungerLevel, setHungerLevel] = useState(3)
  const [gameState, setGameState] = useState(null)
  const [userName, setUserName] = useState('')
  const [hasGreetedUser, setHasGreetedUser] = useState(false)

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

  // Enhanced response system
  const getResponseForMessage = (message) => {
    const lowerMessage = message.toLowerCase()

    // Dog education keyword detection
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

    const hasDogKeyword = dogKeywords.some(keyword => lowerMessage.includes(keyword))
    if (hasDogKeyword) {
      return getRandomResponse(daisyResponses.dog_education)
    }

    // Other keyword categories
    for (const [category, keywords] of Object.entries(daisyResponses.keywords)) {
      if (category === 'dog_education') continue
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        if (daisyResponses[category]) {
          return getRandomResponse(daisyResponses[category])
        }
      }
    }

    return getRandomResponse(daisyResponses.general)
  }

  // Feed Daisy function
  const feedDaisy = () => {
    const newHungerLevel = Math.min(5, hungerLevel + 1)
    setHungerLevel(newHungerLevel)
    setDaisyEmotion('happy')

    const feedResponses = [
      "*munches happily* Mmm! Thank you so much! *wags tail* That was delicious! 🦴✨",
      "*crunches treat* Oh boy oh boy! *spins in circle* You're the best! I feel so much better! 🐕💕",
      "*gobbles up treat* Woof! *happy panting* My tummy is happy now! Thank you for taking care of me! 🍖😊"
    ]

    setTimeout(() => {
      addDaisyMessage(getRandomResponse(feedResponses))
    }, 500)
  }

  // Hunger system
  useEffect(() => {
    const hungerTimer = setInterval(() => {
      setHungerLevel(prev => {
        const newLevel = Math.max(0, prev - 0.05)
        if (newLevel <= 1 && prev > 1) {
          setTimeout(() => {
            const hungerPrompts = [
              "*stomach rumbles* Woof... I'm getting pretty hungry! *looks hopefully* Do you have any treats? 🦴🥺",
              "*sad puppy eyes* My tummy is making funny noises... *gentle whimper* Could I maybe have a little snack? 🍖💔"
            ]
            addDaisyMessage(getRandomResponse(hungerPrompts))
          }, 2000)
        }
        return newLevel
      })
    }, 60000)

    return () => clearInterval(hungerTimer)
  }, [])

  // Handle send message
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

    // Generate Daisy response
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse = getResponseForMessage(messageToSend)
      addDaisyMessage(aiResponse)
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial greeting
  useEffect(() => {
    if (!hasGreetedUser && messages.length === 0) {
      setHasGreetedUser(true)
      setTimeout(() => {
        addDaisyMessage(getRandomResponse(daisyResponses.greetings))
        setTimeout(() => {
          const namePrompts = [
            "*tilts head curiously* I'd love to know your name! *wags tail* What should I call you, friend? 🐕💕",
            "*sits politely* What's your name? *excited tail wagging* I want to remember it so we can be proper friends! 🎾✨"
          ]
          addDaisyMessage(getRandomResponse(namePrompts))
        }, 3000)
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
            <h1>Daisy Dog</h1>
            <p>Your friendly AI companion</p>
            <div className="hunger-bar">
              <span>Hunger:</span>
              <div className="hunger-level">
                {[1, 2, 3, 4, 5].map(level => {
                  let boneClass = 'hunger-bone'
                  if (hungerLevel >= level) {
                    boneClass += ' filled'
                    if (hungerLevel >= 4 && level >= 4) {
                      boneClass += ' hungry'
                    }
                    if (hungerLevel >= 5 && level === 5) {
                      boneClass += ' starving'
                    }
                  } else {
                    boneClass += ' empty'
                  }
                  return (
                    <span key={level} className={boneClass}>
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

      {/* Hunger Bar */}
      <div className="hunger-bar">
        <span>Hunger:</span>
        <div className="hunger-level">
          {[1, 2, 3, 4, 5].map(level => {
            let boneClass = 'hunger-bone'
            if (hungerLevel >= level) {
              boneClass += ' filled'
              if (hungerLevel >= 4 && level >= 4) {
                boneClass += ' hungry'
              }
              if (hungerLevel >= 5 && level === 5) {
                boneClass += ' starving'
              }
            } else {
              boneClass += ' empty'
            }
            return (
              <span key={level} className={boneClass}>
                🦴
              </span>
            )
          })}
        </div>
        <button onClick={feedDaisy} className="feed-button">
          <FaBone /> Feed
        </button>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => addDaisyMessage(getRandomResponse(daisyResponses.stories))}>
          📖 Tell Story
        </button>
        <button onClick={() => addDaisyMessage(getRandomResponse(daisyResponses.jokes))}>
          😄 Tell Joke
        </button>
        <button onClick={() => addDaisyMessage(getRandomResponse(daisyResponses.tricks))}>
          🦴 Do Trick
        </button>
        <button onClick={() => addDaisyMessage(getRandomResponse(daisyResponses.dances))}>
          💃 Dance
        </button>
        <button onClick={() => setGameState({ type: 'selection' })}>
          🎾 Play Game
        </button>
        <button onClick={() => addDaisyMessage(getRandomResponse(daisyResponses.feelings))}>
          🐾 Feelings
        </button>
        <button onClick={() => addDaisyMessage(getRandomResponse(daisyResponses.dreams))}>
          ✨ Dreams
        </button>
      </div>

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
                  <button key={num} onClick={() => handleGameGuess(num)}>
                    {num}
                  </button>
                ))}
                <button onClick={() => {
                  const hint = gameState.number % 2 === 0 ? 'even' : 'odd'
                  addDaisyMessage(`*thinks hard* Hmm... my number is ${hint}! *helpful tail wag* Does that help? 🤔💭`)
                }}>
                  🔢 Even or Odd?
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
