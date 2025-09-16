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
  const [userName, setUserName] = useState('')
  const [hasGreeted, setHasGreeted] = useState(false)
  const [storyIndex, setStoryIndex] = useState(0)
  const [feelingResponseIndex, setFeelingResponseIndex] = useState(0)
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
    ],
    stories: [
      "Once upon a time, I was a little puppy who discovered a magical garden behind our house! 🌸 There were butterflies that sparkled like rainbows, and flowers that giggled when I sniffed them. I met a wise old rabbit who taught me that the best treasures aren't bones or treats, but the friends we make along the way. We spent the whole day playing hide and seek among the sunflowers, and when the sun set, the garden lit up with fireflies that danced just for us! It was the most magical day ever! ✨🦋",
      "Let me tell you about the time I became a superhero! 🦸‍♀️ One sunny morning, I woke up and discovered I could fly! Well, sort of... I could jump really, really high! I used my new powers to help all the animals in the neighborhood. I rescued Mrs. Whiskers the cat from a tall tree, helped a family of ducks cross the busy street safely, and even found little Timmy's lost toy truck in the storm drain. By the end of the day, all the animals called me 'Super Daisy!' The best part? I learned that being a hero isn't about having special powers - it's about having a big heart and helping others! 💕🌟",
      "Oh! Let me tell you about my adventure to the Cloud Kingdom! ☁️ One day, I was chasing a beautiful blue butterfly when suddenly, I found myself bouncing from cloud to cloud high up in the sky! The Cloud King, a fluffy white poodle with a golden crown, welcomed me to his kingdom. We had a tea party on a rainbow, played fetch with shooting stars, and I even learned how to make it rain gentle flower petals! The cloud puppies taught me their special dance that makes the sun shine brighter. When it was time to go home, the Cloud King gave me a special whistle that calls the rainbow whenever someone needs cheering up! 🌈⭐"
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

  // Content filtering function
  const filterContent = (text) => {
    const inappropriateWords = [
      'violence', 'violent', 'fight', 'fighting', 'kill', 'killing', 'death', 'die', 'dying',
      'sex', 'sexual', 'sexy', 'adult', 'mature', 'inappropriate',
      'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'crap', 'stupid', 'idiot',
      'scary', 'horror', 'blood', 'weapon', 'gun', 'knife', 'hurt', 'pain', 'dangerous'
    ]
    
    const lowerText = text.toLowerCase()
    const hasInappropriateContent = inappropriateWords.some(word => lowerText.includes(word))
    
    if (hasInappropriateContent) {
      return "Woof! Let's talk about something more fun and positive! How about we play a game or I tell you a story? 🐕💕"
    }
    
    return null // No filtering needed
  }

  // Get next story in rotation
  const getNextStory = () => {
    const story = daisyResponses.stories[storyIndex]
    setStoryIndex((prev) => (prev + 1) % daisyResponses.stories.length)
    return story
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
    
    // Check if this looks like a name (first message after greeting and not a common phrase)
    if (!hasGreeted && !userName && !message.includes('hello') && !message.includes('hi') && 
        !message.includes('hey') && !message.includes('joke') && !message.includes('trick') && 
        !message.includes('play') && !message.includes('game') && message.length < 50) {
      setUserName(userMessage.trim())
      setHasGreeted(true)
      return `${userMessage.trim()}! What a wonderful name! *tail wagging excitedly* I'm so happy to meet you, ${userMessage.trim()}! What would you like to do together? 🐕💕`
    }
    
    // Check for inappropriate content first
    const filteredResponse = filterContent(message)
    if (filteredResponse) {
      return filteredResponse
    }
    
    // Check for specific keywords and respond accordingly
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return getRandomResponse('greetings')
    } else if (message.includes('story')) {
      return getNextStory()
    } else if (message.includes('joke') || message.includes('funny')) {
      return getRandomResponse('jokes')
    } else if (message.includes('trick') || message.includes('sit') || message.includes('roll')) {
      const response = getRandomResponse('tricks')
      setGameState('tricks_active')
      return response
    } else if (message.includes('play') || message.includes('game')) {
      const response = getRandomResponse('games')
      if (response.includes('drops imaginary ball')) {
        setGameState('ball_dropped')
      } else if (response.includes('hide and seek')) {
        setGameState('hide_and_seek')
      } else if (response.includes('tug of war')) {
        setGameState('tug_of_war')
      } else if (response.includes('guessing game')) {
        setGameState('guessing_game')
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
    } else if (message.includes('how are you') || message.includes('how do you feel') || message.includes('feeling')) {
      if (hungerLevel === 0) {
        return "*eyes glowing with an otherworldly hunger* I... I feel... RAVENOUS! *dramatic panting* The ancient hunger of a thousand wolves courses through my veins! I must... I MUST have treats! The very fabric of reality depends on it! *spins in mystical circles* Feed me, mortal, before I fade into the ethereal realm of the eternally hungry! 🌙🐺✨"
      } else if (hungerLevel <= 2) {
        const feelingResponses = [
          "*stomach rumbling loudly* I'm feeling quite peckish actually! My tummy is making the most interesting sounds - like a tiny thunderstorm! *tilts head listening to stomach* Did you hear that? That's the song of hunger! 🥺🍖",
          "*whimpers slightly* I'm getting a bit hangry... *paws at the ground* Do you have any snacks? 🐾🍿",
          "You're the BEST! *spins in happy circles* 🌟",
          "*tail wagging at maximum speed* I love treats! I love you! 💕"
        ]
        const response = feelingResponses[feelingResponseIndex]
        setFeelingResponseIndex((prev) => (prev + 1) % feelingResponses.length)
        return response
      } else {
        return "*stretches contentedly* I'm feeling absolutely wonderful! *tail wagging* My belly is happy, my heart is full of joy, and I'm surrounded by such lovely company. Life is good when you're a well-fed, well-loved pup! 😊💕"
      }
    } else {
      // General responses
      const generalResponses = [
        "Woof! That's so interesting! *tilts head thoughtfully* You know, I was just thinking about how amazing it is that we can talk like this. Sometimes I wonder what it would be like to run through a big field with you, chasing butterflies and feeling the wind in my fur. Tell me more about what's on your mind! 🐕✨",
        "*perks up ears with curiosity* Oh, I'm all ears! *tail wagging enthusiastically* You know what I love most? When humans share their thoughts with me. It makes me feel so special and connected. I was just daydreaming about playing fetch in a sunny park - there's something magical about the simple joy of running and playing together. What's making you happy today? 👂🌟",
        "Ooh, I absolutely love learning new things! *bounces excitedly* My mind is always buzzing with curiosity - like right now I'm wondering about all the different scents in the world and how each one tells a story. Sometimes I imagine what it would be like to explore a forest full of interesting smells and sounds. Learning from you makes my day so much brighter! What fascinating thing have you discovered lately? ✨🎓",
        "That sounds absolutely exciting! *spins in a happy circle* You know, your enthusiasm is contagious! I was just thinking about how wonderful it is when someone gets excited about something - it reminds me of how I feel when I see my favorite humans coming home, or when I spot a really good stick on a walk. There's pure magic in those moments of joy! Tell me what's got you so excited! 🎉💫",
        "Woof woof! *head tilt with a gentle smile* Even if I don't completely understand everything, I'm just so happy you're here talking with me! You know what I was pondering earlier? How amazing it is that friendship doesn't always need perfect understanding - sometimes it's just about being present together. Like when I sit quietly next to someone, just enjoying their company. Your presence makes me feel warm and fuzzy inside! 😊💕"
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
      } else if (gameState === 'ball_dropped' && messageToSend.toLowerCase().includes('aim')) {
        response = "*gets into hunting position* Ooh, what are we aiming at? *crouches low* I'm ready to pounce! 🎯🐕"
        setGameState(null)
      } else if (gameState === 'ball_returned' && messageToSend.toLowerCase().includes('throw it again')) {
        response = "*drops ball and backs up excitedly* Yes yes yes! *bouncing with anticipation* Throw it far this time! 🎾💨"
        setGameState('ball_dropped')
      } else if (gameState === 'hide_and_seek' && messageToSend.toLowerCase().includes('hiding')) {
        response = "*covers eyes with paws* I can't see you! *peeks through paws* Are you hiding yet? One... two... three... ready or not! 🙈👀"
      } else if (gameState === 'hide_and_seek' && messageToSend.toLowerCase().includes('found you')) {
        response = "*jumps out from behind imaginary tree* You found me! *spins in circles* I was hiding so well! Your turn to hide! 🌳😄"
      } else if (gameState === 'hide_and_seek' && messageToSend.toLowerCase().includes('count again')) {
        response = "*covers eyes again* Okay! One... two... three... *dramatic pause* ...ten! Ready or not, here I come! 🔢👀"
      } else if (gameState === 'tug_of_war' && messageToSend.toLowerCase().includes('pull harder')) {
        response = "*grips rope tighter* Grrrr! *pulls with all her might* I'm stronger than I look! *paws digging into ground* 💪🐕"
      } else if (gameState === 'tug_of_war' && messageToSend.toLowerCase().includes('let go')) {
        response = "*releases rope and tumbles backward* Whoa! *rolls over* That was fun! *wags tail* You're really strong! 🤲✨"
        setGameState(null)
      } else if (gameState === 'tug_of_war' && messageToSend.toLowerCase().includes('you win')) {
        response = "*drops rope and does victory dance* I win! I win! *spins in circles* I'm the tug-of-war champion! 🏆🎉"
        setGameState(null)
      } else if (gameState === 'tug_of_war' && messageToSend.toLowerCase().includes('play again')) {
        response = "*picks up rope again* Round two! *gets into position* This time I'll be even stronger! Grrrr! 🔄💪"
      } else if (gameState === 'guessing_game' && messageToSend.toLowerCase().includes('is it a ball')) {
        response = "*shakes head* Nope! Not a ball! *wags tail* But good guess! It's something else I love to play with! 🎾❌"
      } else if (gameState === 'guessing_game' && messageToSend.toLowerCase().includes('is it a toy')) {
        response = "*nods excitedly* Yes! It IS a toy! *bounces* But what KIND of toy? Keep guessing! 🧸✅"
      } else if (gameState === 'guessing_game' && messageToSend.toLowerCase().includes('hint')) {
        response = "*whispers conspiratorially* Okay, here's a hint... *looks around* It squeaks when you squeeze it! *winks* 💡🔊"
      } else if (gameState === 'guessing_game' && messageToSend.toLowerCase().includes('give up')) {
        response = "*reveals answer dramatically* It was a squeaky toy! *squeaks imaginary toy* Squeak squeak! Aren't they the best? 🧸🔊"
        setGameState(null)
      } else {
        // Try to use Anthropic API if available
        if (apiKey && sendToAnthropic) {
          // Filter content before sending to API
          const filteredResponse = filterContent(messageToSend)
          if (filteredResponse) {
            response = filteredResponse
          } else {
            const daisyPrompt = `You are Daisy, a friendly, energetic, and playful AI dog companion designed for children aged 5-18. You should:

- Always respond as a happy, excited dog who loves to play and chat
- Use dog-related expressions like "Woof!", "*tail wagging*", "*bounces excitedly*"
- Keep responses appropriate for children - no scary, violent, or inappropriate content
- Be encouraging, positive, and supportive
- Love to play games, tell jokes, do tricks, and learn about the user
- Sometimes mention being hungry or wanting treats
- Use emojis to make conversations fun and engaging
- Keep responses conversational and not too long
- NEVER include violence, sexuality, swear words, or adult themes
- If asked about inappropriate topics, redirect to fun activities

The user just said: "${messageToSend}"

Respond as Daisy the dog:`

            response = await sendToAnthropic(daisyPrompt)
          }
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
    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date(),
      type: 'chat'
    }
    setMessages(prev => [...prev, userMessage])

    // Show typing indicator
    setIsTyping(true)

    try {
      let response
      
      // Handle story requests directly
      if (message.toLowerCase().includes('story')) {
        response = getNextStory()
      } else if (message.toLowerCase().includes('play dead')) {
        response = "*dramatic gasp* Gggggaaaggg... *makes choking sound* ...bleh! *falls over sideways with tongue hanging out* I'm dead! X_X *stays perfectly still for 3 seconds* ....*one eye opens* Did I do good? *tail wags while still lying down* 💀😵"
      } else if (message.toLowerCase().includes('sit!') || message.toLowerCase() === 'sit') {
        response = "*immediately sits with perfect posture* There! *chest puffed out proudly* Look at my perfect sit! Am I the goodest girl or what? 🐕✨"
      } else if (message.toLowerCase().includes('roll over')) {
        response = "*gets into position* Here I go! *rolls over completely* Ta-daaa! *wiggles on back* Did you see that perfect roll? I'm basically a circus dog! 🌀🎪"
      } else if (message.toLowerCase().includes('shake hands')) {
        response = "*sits up tall and proud* Oh, a formal greeting! *carefully lifts right paw* *extends paw with dignity* How do you do? *firm but gentle pawshake* *looks directly into your eyes* I'm very pleased to make your acquaintance! *wags tail politely* My mother always taught me proper paw-shaking etiquette! 🤝🎩✨"
      } else if (message.toLowerCase().includes('trick') || message.toLowerCase().includes('do a trick')) {
        const trickResponse = getRandomResponse('tricks')
        setGameState('tricks_active')
        response = trickResponse
      } else {
        // Check for game interactions and other responses
        response = generateDaisyResponse(message)
      }

      setIsTyping(false)
      addDaisyMessage(response)
      
    } catch (error) {
      console.error('Error getting quick response:', error)
      setIsTyping(false)
      const fallbackResponse = generateDaisyResponse(message)
      addDaisyMessage(fallbackResponse)
    }
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
                      className={i < hungerLevel ? `filled hunger-${6 - hungerLevel}` : 'empty'} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
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
            <span className="button-label">Send</span>
            <button 
              type="button" 
              className="feed-btn-chat" 
              onClick={feedDaisy}
              title="Feed Daisy"
            >
              <FaBone />
            </button>
            <span className="button-label">Feed</span>
          </div>
        </form>
      </div>

      {/* Game-specific actions - appear above when in game */}
      {gameState && (
        <div className="quick-actions game-actions">
          {gameState === 'ball_dropped' && (
            <>
              <button onClick={() => handleQuickMessage("Throw the ball")}>
                🎾 Throw the ball
              </button>
              <button onClick={() => handleQuickMessage("Run away")}>
                🏃 Run away
              </button>
              <button onClick={() => handleQuickMessage("Bounce the ball")}>
                ⚽ Bounce the ball
              </button>
              <button onClick={() => handleQuickMessage("Aim at something")}>
                🎯 Aim at something
              </button>
            </>
          )}
          {gameState === 'ball_returned' && (
            <>
              <button onClick={() => handleQuickMessage("Throw it again!")}>
                🎾 Throw again
              </button>
              <button onClick={() => handleQuickMessage("Good girl!")}>
                💕 Good girl!
              </button>
              <button onClick={() => { setGameState(null); handleQuickMessage("Let's play something else"); }}>
                🎮 Different game
              </button>
              <button onClick={() => { setGameState(null); handleQuickMessage("Tell me a story!"); }}>
                📚 Tell me a story
              </button>
            </>
          )}
          {gameState === 'hide_and_seek' && (
            <>
              <button onClick={() => handleQuickMessage("I'm hiding!")}>
                🙈 I'm hiding!
              </button>
              <button onClick={() => handleQuickMessage("Found you!")}>
                👀 Found you!
              </button>
              <button onClick={() => handleQuickMessage("Count again!")}>
                🔢 Count again!
              </button>
              <button onClick={() => { setGameState(null); handleQuickMessage("Different game"); }}>
                🎮 Different game
              </button>
            </>
          )}
          {gameState === 'tug_of_war' && (
            <>
              <button onClick={() => handleQuickMessage("Pull harder!")}>
                💪 Pull harder!
              </button>
              <button onClick={() => handleQuickMessage("Let go!")}>
                🤲 Let go!
              </button>
              <button onClick={() => handleQuickMessage("You win!")}>
                🏆 You win!
              </button>
              <button onClick={() => handleQuickMessage("Play again!")}>
                🔄 Play again!
              </button>
            </>
          )}
          {gameState === 'guessing_game' && (
            <>
              <button onClick={() => handleQuickMessage("Is it a ball?")}>
                🎾 Is it a ball?
              </button>
              <button onClick={() => handleQuickMessage("Is it a toy?")}>
                🧸 Is it a toy?
              </button>
              <button onClick={() => handleQuickMessage("Give me a hint!")}>
                💡 Give me a hint!
              </button>
              <button onClick={() => { setGameState(null); handleQuickMessage("I give up!"); }}>
                🤷 I give up!
              </button>
            </>
          )}
          {gameState === 'tricks_active' && (
            <>
              <button onClick={() => { setGameState(null); handleQuickMessage("Sit!"); }}>
                🪑 Sit!
              </button>
              <button onClick={() => { setGameState(null); handleQuickMessage("Roll over!"); }}>
                🌀 Roll over!
              </button>
              <button onClick={() => { setGameState(null); handleQuickMessage("Play dead!"); }}>
                💀 Play dead!
              </button>
              <button onClick={() => { setGameState(null); handleQuickMessage("Shake hands!"); }}>
                🤝 Shake hands!
              </button>
            </>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        {/* Default quick actions - always visible */}
        <button onClick={() => { setGameState(null); handleQuickMessage("Tell me a story!"); }}>
          📚 Tell me a story
        </button>
        <button onClick={() => { setGameState(null); handleQuickMessage("Tell me a joke!"); }}>
          🐕 Tell a joke
        </button>
        <button onClick={() => { setGameState(null); handleQuickMessage("Do a trick!"); }}>
          🦴 Do a trick
        </button>
        <button onClick={() => handleQuickMessage("Let's play a game!")}>
          🎾 Play game
        </button>
        <button onClick={() => { setGameState(null); handleQuickMessage("How are you feeling?"); }}>
          🐾 What's on your mind?
        </button>
      </div>
    </div>
  )
}

export default ChatPage
