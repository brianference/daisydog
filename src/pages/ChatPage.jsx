import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaperPlane, FaBone, FaHome, FaHeart, FaPaw, FaQuestionCircle } from 'react-icons/fa'
import { useAnthropicChat } from '../hooks/useAnthropicChat'
import './ChatPage.css'

const ChatPage = () => {
  // Checkpoint system - localStorage key
  const CHECKPOINT_KEY = 'daisy_conversation_checkpoint'

  // Load checkpoint data from localStorage
  const loadCheckpoint = () => {
    try {
      const saved = localStorage.getItem(CHECKPOINT_KEY)
      if (saved) {
        const checkpoint = JSON.parse(saved)
        // Convert timestamp strings back to Date objects
        if (checkpoint.messages) {
          checkpoint.messages = checkpoint.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }
        if (checkpoint.lastFed) {
          checkpoint.lastFed = new Date(checkpoint.lastFed)
        }
        return checkpoint
      }
    } catch (error) {
      console.error('Error loading checkpoint:', error)
    }
    return null
  }

  // Save checkpoint data to localStorage
  const saveCheckpoint = (state) => {
    try {
      localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Error saving checkpoint:', error)
    }
  }

  // Initialize state with checkpoint data or defaults
  const checkpoint = loadCheckpoint()
  
  const [messages, setMessages] = useState(checkpoint?.messages || [
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
  const [hungerLevel, setHungerLevel] = useState(checkpoint?.hungerLevel ?? 3)
  const [lastFed, setLastFed] = useState(checkpoint?.lastFed || null)
  const [gameState, setGameState] = useState(checkpoint?.gameState || null)
  const [userName, setUserName] = useState(checkpoint?.userName || '')
  const [hasGreeted, setHasGreeted] = useState(checkpoint?.hasGreeted ?? false)
  const [storyIndex, setStoryIndex] = useState(checkpoint?.storyIndex ?? 0)
  const [feelingResponseIndex, setFeelingResponseIndex] = useState(checkpoint?.feelingResponseIndex ?? 0)
  const [currentEmotion, setCurrentEmotion] = useState(checkpoint?.currentEmotion || 'happy')
  const [lastAction, setLastAction] = useState(checkpoint?.lastAction || '')
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

  // Emotion Detection System
  const emotionTriggers = {
    // Game-based emotions
    gameStates: {
      'ball_dropped': 'playfetch',
      'ball_returned': 'excited',
      'ball_caught': 'happy',
      'soccer_mode': 'playfetch',
      'hide_and_seek': 'lookingbehind',
      'seeking': 'eager',
      'your_turn_hide': 'patient',
      'daisy_seeking': 'thinking',
      'tug_of_war': 'excited',
      'intense_tug': 'eager',
      'guessing_game': 'thinking',
      'guessing_warm': 'excited',
      'guessing_hot': 'eager',
      'tricks_active': 'crouchingdown'
    },
    
    // Keyword-based emotions
    keywords: {
      // Positive emotions
      'love': 'stylish',
      'good girl': 'happy',
      'good dog': 'happy',
      'amazing': 'excited',
      'wonderful': 'happy',
      'beautiful': 'stylish',
      'pretty': 'stylish',
      'cute': 'happy',
      'smart': 'stylish',
      'clever': 'thinking',
      
      // Actions
      'sit': 'crouchingdown',
      'roll': 'dancing',
      'shake': 'shakepaw',
      'trick': 'crouchingdown',
      'dance': 'dancing',
      'play': 'excited',
      'game': 'eager',
      'fetch': 'playfetch',
      
      // Stories and entertainment
      'story': 'thinking',
      'joke': 'happy',
      'funny': 'happy',
      
      // Emotional states
      'tired': 'panting',
      'sleepy': 'patient',
      'excited': 'excited',
      'happy': 'happy',
      'sad': 'nervous',
      'worried': 'nervous',
      'scared': 'nervous',
      'calm': 'patient',
      'patient': 'patient',
      'waiting': 'waiting',
      'thinking': 'thinking'
    },
    
    // Hunger-based emotions
    hunger: {
      0: 'hungry',
      1: 'hungry', 
      2: 'nervous',
      3: 'happy',
      4: 'excited',
      5: 'stylish'
    },
    
    // Time-based emotions (for variety)
    timeOfDay: {
      morning: 'eager',
      afternoon: 'happy',
      evening: 'patient',
      night: 'nervous'
    }
  }

  // Enhanced emotion detection system
  const updateEmotion = ({ gameState, userMessage, hungerLevel, lastAction, messageType }) => {
    let newEmotion = 'happy' // default
    
    // PRIORITY 1: Game state emotions (highest priority)
    if (gameState && emotionTriggers.gameStates[gameState]) {
      newEmotion = emotionTriggers.gameStates[gameState]
    }
    // PRIORITY 2: Keyword-based emotions
    else if (userMessage) {
      const message = userMessage.toLowerCase()
      for (const [keyword, emotion] of Object.entries(emotionTriggers.keywords)) {
        if (message.includes(keyword.toLowerCase())) {
          newEmotion = emotion
          break
        }
      }
    }
    // PRIORITY 3: Hunger-based emotions
    else if (hungerLevel <= 1) {
      newEmotion = 'hungry'
    }
    // PRIORITY 4: Time-based emotions
    else {
      const hour = new Date().getHours()
      if (hour >= 22 || hour <= 6) {
        newEmotion = 'patient' // sleepy time
      } else if (hour >= 12 && hour <= 14) {
        newEmotion = 'hungry' // lunch time
      }
    }
    
    // PRIORITY 5: Message type emotions (override others)
    if (messageType === 'story') {
      newEmotion = 'thinking'
    } else if (messageType === 'joke') {
      newEmotion = 'dancing'
    } else if (messageType === 'trick') {
      newEmotion = 'crouchingdown'
    } else if (messageType === 'game') {
      newEmotion = 'playfetch'
    }
    
    setCurrentEmotion(newEmotion)
    setLastAction(lastAction || 'general')
  }

  // Get larger emotion image path
  const getEmotionImage = (emotion = 'happy') => {
    return `/assets/images/emotions/${emotion}.png`
  }

  // Sentiment analysis for emotional context
  const analyzeSentiment = (text) => {
    const positiveWords = ['love', 'like', 'good', 'great', 'amazing', 'wonderful', 'happy', 'excited', 'fun', 'awesome', 'fantastic', 'perfect', 'beautiful', 'cute', 'sweet', 'nice', 'cool', 'best', 'favorite'];
    const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'sad', 'angry', 'mad', 'upset', 'boring', 'stupid', 'dumb', 'worst', 'horrible', 'disgusting'];
    const neutralWords = ['okay', 'fine', 'normal', 'average', 'maybe', 'perhaps', 'think', 'guess'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
      if (neutralWords.includes(word)) score += 0.1;
    });
    
    return score;
  }

  // Get current emotion based on multiple factors
  const getCurrentEmotion = (context = {}) => {
    const { 
      gameState: currentGameState, 
      userMessage = '', 
      hungerLevel: currentHunger, 
      lastAction = '',
      messageType = 'chat'
    } = context;
    
    // Priority 1: Game states (highest priority)
    if (currentGameState && emotionTriggers.gameStates[currentGameState]) {
      return emotionTriggers.gameStates[currentGameState];
    }
    
    // Priority 2: Recent actions
    if (lastAction === 'fed') {
      return 'excited';
    }
    
    // Priority 3: Message type specific emotions
    if (messageType === 'greeting') {
      return 'excited';
    }
    
    // Priority 4: Keyword detection in user message
    const lowerMessage = userMessage.toLowerCase();
    for (const [keyword, emotion] of Object.entries(emotionTriggers.keywords)) {
      if (lowerMessage.includes(keyword)) {
        return emotion;
      }
    }
    
    // Priority 5: Sentiment analysis
    const sentiment = analyzeSentiment(userMessage);
    if (sentiment > 2) return 'excited';
    if (sentiment > 0) return 'happy';
    if (sentiment < -1) return 'nervous';
    
    // Priority 6: Hunger level
    if (currentHunger !== undefined && emotionTriggers.hunger[currentHunger]) {
      return emotionTriggers.hunger[currentHunger];
    }
    
    // Priority 7: Time of day variation
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'eager';      // Morning
    if (hour >= 12 && hour < 18) return 'happy';     // Afternoon  
    if (hour >= 18 && hour < 22) return 'patient';   // Evening
    return 'nervous';                                 // Night
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
    
    // Check for inappropriate content first
    const filteredResponse = filterContent(message)
    if (filteredResponse) {
      return filteredResponse
    }
    
    // PRIORITY 1: Check if we're in a game state - this must come BEFORE name detection
    if (gameState) {
      // Game state responses are handled in handleQuickMessage, not here
      // This function should not interfere with game logic
      return null // Let handleQuickMessage handle it
    }
    
    // PRIORITY 2: Check for specific game/action keywords that should never be names
    const gameCommands = ['pull', 'throw', 'toss', 'bounce', 'kick', 'hide', 'seek', 'found', 'hint', 'guess', 'sit', 'roll', 'shake', 'play', 'game', 'trick', 'story', 'joke']
    const isGameCommand = gameCommands.some(cmd => message.includes(cmd))
    
    // PRIORITY 3: Check for specific keywords and respond accordingly
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
      // Alternating feeling responses based on hunger level
      if (hungerLevel < 2) {
        const hungryFeelings = [
          "*dramatic sigh* I'm feeling a bit peckish... *puppy dog eyes* My tummy is making little rumbling sounds, and I keep thinking about those delicious treats! But I'm still happy because I'm here with you! 🥺💕",
          "*looks longingly at food area* Well, I'm feeling quite hungry actually! *tail wagging hopefully* My belly feels so empty, like a big hollow cave! But seeing your sweet face makes everything better! 😋🐕"
        ]
        const responseIndex = feelingResponseIndex % hungryFeelings.length
        setFeelingResponseIndex(prev => prev + 1)
        return hungryFeelings[responseIndex]
      } else {
        return "*stretches contentedly* I'm feeling absolutely wonderful! *tail wagging* My belly is happy, my heart is full of joy, and I'm surrounded by such lovely company. Life is good when you're a well-fed, well-loved pup! 😊💕"
      }
    } else if (!hasGreeted && !userName && !isGameCommand && message.length < 50 && message.length > 1) {
      // Name detection logic with game command exclusions
      setUserName(userMessage.trim())
      setHasGreeted(true)
      return `${userMessage.trim()}! What a wonderful name! *tail wagging excitedly* I'm so happy to meet you, ${userMessage.trim()}! What would you like to do together? 🐕💕`
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
      if (gameState === 'ball_dropped' && (messageToSend.toLowerCase().includes('throw') || messageToSend.toLowerCase().includes('toss'))) {
        response = "*eyes light up* WOOF! *chases after the ball at lightning speed* *pounces and catches it mid-air* Got it! *trots back proudly with ball in mouth* *drops it at your feet* That was AMAZING! Throw it again! 🎾✨"
        setGameState('ball_returned')
        // Update emotion for successful fetch
        updateEmotion({
          gameState: 'ball_returned',
          userMessage: messageToSend,
          hungerLevel,
          lastAction: 'fetch_success',
          messageType: 'game'
        })
      } else if (gameState === 'ball_dropped' && messageToSend.toLowerCase().includes('bounce')) {
        response = "*watches the ball bounce with laser focus* Boing! Boing! *times the perfect moment* *POUNCE!* *catches it on the third bounce* I'm like a professional ball-catching athlete! 🎾🏀 Want to see me do it again?"
        setGameState('ball_caught')
        // Update emotion for ball catching
        updateEmotion({
          gameState: 'ball_caught',
          userMessage: messageToSend,
          hungerLevel,
          lastAction: 'ball_catch',
          messageType: 'game'
        })
      } else if (gameState === 'ball_dropped' && messageToSend.toLowerCase().includes('kick')) {
        response = "*sees you kick the ball* Ooh, soccer style! *chases after the rolling ball* *nudges it back with nose* I can play soccer too! *gentle paw tap* Your turn! ⚽🐕"
        setGameState('soccer_mode')
      } else if (gameState === 'ball_dropped' && messageToSend.toLowerCase().includes('aim')) {
        response = "*watches you aim carefully* Ooh, you're being strategic! *crouches in ready position* I'm watching where you're aiming... *eyes tracking* Throw it! I'm ready! 🎯🎾"
      } else if (gameState === 'ball_dropped' && messageToSend.toLowerCase().includes('run away')) {
        response = "*gasps dramatically* Hey! Come back! *chases after you playfully* You can't escape from fetch time! *brings ball along* We're not done playing! 🏃‍♀️🎾"
      } else if (gameState === 'ball_returned' && (messageToSend.toLowerCase().includes('throw') || messageToSend.toLowerCase().includes('again'))) {
        response = "*drops ball and backs up with intense excitement* YES! *bouncing on all fours* Make it a really good throw this time! I'm ready! *crouches in perfect catching position* 🎾💨"
        setGameState('ball_dropped')
      } else if (gameState === 'ball_returned' && messageToSend.toLowerCase().includes('good girl')) {
        response = "*puffs out chest proudly* Did you see that catch?! *does a little spin* I've been practicing! *wags tail so hard whole body wiggles* I'm basically a professional athlete! 🏆🐕"
        setGameState('ball_returned')
      } else if (gameState === 'soccer_mode' && messageToSend.toLowerCase().includes('goal')) {
        response = "*dribbles ball with paws toward imaginary goal* *gentle nudge* GOOOOOAL! *runs in victory circles* We make a great team! ⚽🥅✨"
        setGameState('ball_returned')
      } else if (gameState === 'hide_and_seek' && messageToSend.toLowerCase().includes('hiding')) {
        response = "*covers eyes with paws* I can't see you! *peeks through paws* Are you hiding yet? One... two... three... ready or not! 🙈👀"
        setGameState('seeking')
      } else if (gameState === 'hide_and_seek' && messageToSend.toLowerCase().includes('found you')) {
        response = "*jumps out from behind imaginary tree* You found me! *spins in circles* I was hiding so well! Your turn to hide now! 🌳😄"
        setGameState('your_turn_hide')
      } else if (gameState === 'hide_and_seek' && messageToSend.toLowerCase().includes('count again')) {
        response = "*covers eyes tighter* Okay! Starting over! One... two... three... four... five... *dramatic pause* ...ten! Ready or not, here I come again! 🔢👀"
        setGameState('seeking')
      } else if (gameState === 'tug_of_war' && messageToSend.toLowerCase().includes('pull harder')) {
        response = "*grips rope tighter* Grrrr! *plants paws firmly* You're strong, but I've got determination! *pulls with all her might* 💪🐕"
        // Keep in tug_of_war state instead of changing to intense_tug
      } else if (gameState === 'tug_of_war' && messageToSend.toLowerCase().includes('let go')) {
        response = "*releases rope and tumbles backward* Whoa! *rolls over laughing* That was intense! *wags tail* You're really strong! Want to go again? 🤲✨"
        // Keep in tug_of_war state
      } else if (gameState === 'tug_of_war' && messageToSend.toLowerCase().includes('you win')) {
        response = "*drops rope and does victory dance* I win! I win! *spins in circles* I'm the tug-of-war champion! *strikes superhero pose* 🏆🎉"
        setGameState(null)
      } else if (gameState === 'tug_of_war' && messageToSend.toLowerCase().includes('play again')) {
        response = "*picks up rope excitedly* YES! Round two! *gets into position* This time I'm going to use my secret technique! *winks* Ready? 🔄💪"
        // Keep in tug_of_war state
      } else if (gameState === 'guessing_game' && messageToSend.toLowerCase().includes('is it a ball')) {
        response = "*shakes head dramatically* Nope! Not a ball this time! *wags tail* Good guess though! It's something else I absolutely love! 🎾❌"
        setGameState('guessing_warm')
      } else if (gameState === 'guessing_game' && messageToSend.toLowerCase().includes('is it a toy')) {
        response = "*nods excitedly* YES! It IS a toy! *bounces up and down* You're getting warmer! But what KIND of toy? *eyes sparkling with excitement* 🧸✅"
        setGameState('guessing_hot')
      } else if (gameState === 'guessing_game' && messageToSend.toLowerCase().includes('hint')) {
        response = "*whispers conspiratorially* Okay, here's a hint... *looks around mysteriously* It makes a funny sound when you squeeze it! *winks* What could it be? 💡🔊"
        setGameState('guessing_warm')
      } else if (gameState === 'guessing_game' && messageToSend.toLowerCase().includes('give up')) {
        response = "*gasps* Aww, don't give up! It was my squeaky toy! *makes squeaking sounds* Squeak squeak! *does happy dance* Want to play another guessing game? 🧸🔊"
        setGameState(null)
      } else if (gameState && (messageToSend.toLowerCase().includes('throw') || messageToSend.toLowerCase().includes('toss'))) {
        // Handle throw commands in any game state
        if (gameState.includes('ball') || gameState === 'ball_dropped' || gameState === 'ball_returned' || gameState === 'ball_caught' || gameState === 'soccer_mode') {
          response = "*eyes light up* WOOF! *chases after the ball at lightning speed* *pounces and catches it mid-air* Got it! *trots back proudly with ball in mouth* *drops it at your feet* That was AMAZING! Throw it again! 🎾✨"
          setGameState('ball_returned')
        } else {
          response = "*tilts head* Ooh, are we playing fetch now? *gets excited* Let me get my imaginary ball! *drops imaginary ball at your feet* There! Now throw it! 🎾"
          setGameState('ball_dropped')
        }
      } else if (gameState) {
        // If we're in a game state but no specific action matched, give a game-appropriate response
        const gameResponses = {
          'ball_dropped': "*stares at the ball intensely* What should we do with it? You could throw it, bounce it, or kick it! I'm ready for anything! 🎾",
          'ball_returned': "*drops ball and wags tail* Ready for another round! Throw it again, or we could try something different! 🎾",
          'ball_caught': "*proudly holds ball* That was fun! Want to throw it again or try a different game? 🎾",
          'soccer_mode': "*nudges ball with nose* Soccer time! Kick it toward the goal or pass it back to me! ⚽",
          'hide_and_seek': "*covers eyes with paws* Are you hiding? Or should we try something else? 🙈",
          'seeking': "*looking around* I'm still seeking! Are you hiding well? 👀",
          'your_turn_hide': "*covers eyes* I'm waiting for you to hide! Tell me when you're ready! 🙈",
          'daisy_seeking': "*searching around* Where could you be hiding? Give me a hint! 🔍",
          'tug_of_war': "*grips rope* Ready for some tugging action! Pull harder or let's try something else! 💪",
          'intense_tug': "*pulling hard* This is intense! Should I let go or keep pulling? 💪",
          'guessing_game': "*thinking hard* I'm thinking of something special! Ask me questions to guess what it is! 🤔",
          'guessing_warm': "*excited* You're getting warmer! Keep guessing! 🔥",
          'guessing_hot': "*bouncing* You're so close! One more guess! 🔥🔥"
        }
        response = gameResponses[gameState] || "*wags tail* We're playing a game! What should we do next? 🎮"
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
      
      // Handle game interactions first - same logic as handleSendMessage
      if (gameState === 'ball_dropped' && (message.toLowerCase().includes('throw') || message.toLowerCase().includes('toss'))) {
        response = "*eyes light up* WOOF! *chases after the ball at lightning speed* *pounces and catches it mid-air* Got it! *trots back proudly with ball in mouth* *drops it at your feet* That was AMAZING! Throw it again! 🎾✨"
        setGameState('ball_returned')
        updateEmotion({
          gameState: 'ball_returned',
          userMessage: message,
          hungerLevel,
          lastAction: 'fetch_success',
          messageType: 'game'
        })
      } else if (gameState === 'ball_dropped' && message.toLowerCase().includes('bounce')) {
        response = "*watches the ball bounce with laser focus* Boing! Boing! *times the perfect moment* *POUNCE!* *catches it on the third bounce* I'm like a professional ball-catching athlete! 🎾🏀 Want to see me do it again?"
        setGameState('ball_caught')
        updateEmotion({
          gameState: 'ball_caught',
          userMessage: message,
          hungerLevel,
          lastAction: 'ball_catch',
          messageType: 'game'
        })
      } else if (gameState === 'ball_dropped' && message.toLowerCase().includes('kick')) {
        response = "*sees you kick the ball* Ooh, soccer style! *chases after the rolling ball* *nudges it back with nose* I can play soccer too! *gentle paw tap* Your turn! ⚽🐕"
        setGameState('soccer_mode')
      } else if (gameState === 'ball_dropped' && message.toLowerCase().includes('aim')) {
        response = "*watches you aim carefully* Ooh, you're being strategic! *crouches in ready position* I'm watching where you're aiming... *eyes tracking* Throw it! I'm ready! 🎯🎾"
      } else if (gameState === 'ball_dropped' && message.toLowerCase().includes('run away')) {
        response = "*gasps dramatically* Hey! Come back! *chases after you playfully* You can't escape from fetch time! *brings ball along* We're not done playing! 🏃‍♀️🎾"
      } else if (gameState === 'ball_returned' && (message.toLowerCase().includes('throw') || message.toLowerCase().includes('again'))) {
        response = "*drops ball and backs up with intense excitement* YES! *bouncing on all fours* Make it a really good throw this time! I'm ready! *crouches in perfect catching position* 🎾💨"
        setGameState('ball_dropped')
      } else if (gameState === 'ball_returned' && message.toLowerCase().includes('good girl')) {
        response = "*puffs out chest proudly* Did you see that catch?! *does a little spin* I've been practicing! *wags tail so hard whole body wiggles* I'm basically a professional athlete! 🏆🐕"
        setGameState('ball_returned')
      } else if (gameState === 'soccer_mode' && message.toLowerCase().includes('goal')) {
        response = "*dribbles ball with paws toward imaginary goal* *gentle nudge* GOOOOOAL! *runs in victory circles* We make a great team! ⚽🥅✨"
        setGameState('ball_returned')
      } else if (gameState === 'hide_and_seek' && message.toLowerCase().includes('hiding')) {
        response = "*covers eyes with paws* I can't see you! *peeks through paws* Are you hiding yet? One... two... three... ready or not! 🙈👀"
        setGameState('seeking')
      } else if (gameState === 'hide_and_seek' && message.toLowerCase().includes('found you')) {
        response = "*jumps out from behind imaginary tree* You found me! *spins in circles* I was hiding so well! Your turn to hide now! 🌳😄"
        setGameState('your_turn_hide')
      } else if (gameState === 'hide_and_seek' && message.toLowerCase().includes('count again')) {
        response = "*covers eyes tighter* Okay! Starting over! One... two... three... four... five... *dramatic pause* ...ten! Ready or not, here I come again! 🔢👀"
        setGameState('seeking')
      } else if (gameState === 'tug_of_war' && message.toLowerCase().includes('pull harder')) {
        response = "*grips rope tighter* Grrrr! *plants paws firmly* You're strong, but I've got determination! *pulls with all her might* 💪🐕"
        // Keep in tug_of_war state instead of changing to intense_tug
      } else if (gameState === 'tug_of_war' && message.toLowerCase().includes('let go')) {
        response = "*releases rope and tumbles backward* Whoa! *rolls over laughing* That was intense! *wags tail* You're really strong! Want to go again? 🤲✨"
        // Keep in tug_of_war state
      } else if (gameState === 'tug_of_war' && message.toLowerCase().includes('you win')) {
        response = "*drops rope and does victory dance* I win! I win! *spins in circles* I'm the tug-of-war champion! *strikes superhero pose* 🏆🎉"
        setGameState(null)
      } else if (gameState === 'tug_of_war' && message.toLowerCase().includes('play again')) {
        response = "*picks up rope excitedly* YES! Round two! *gets into position* This time I'm going to use my secret technique! *winks* Ready? 🔄💪"
        // Keep in tug_of_war state
      } else if (gameState === 'guessing_game' && message.toLowerCase().includes('is it a ball')) {
        response = "*shakes head dramatically* Nope! Not a ball this time! *wags tail* Good guess though! It's something else I absolutely love! 🎾❌"
        setGameState('guessing_warm')
      } else if (gameState === 'guessing_game' && message.toLowerCase().includes('is it a toy')) {
        response = "*nods excitedly* YES! It IS a toy! *bounces up and down* You're getting warmer! But what KIND of toy? *eyes sparkling with excitement* 🧸✅"
        setGameState('guessing_hot')
      } else if (gameState === 'guessing_game' && message.toLowerCase().includes('hint')) {
        response = "*whispers conspiratorially* Okay, here's a hint... *looks around mysteriously* It makes a funny sound when you squeeze it! *winks* What could it be? 💡🔊"
        setGameState('guessing_warm')
      } else if (gameState === 'guessing_game' && message.toLowerCase().includes('give up')) {
        response = "*gasps* Aww, don't give up! It was my squeaky toy! *makes squeaking sounds* Squeak squeak! *does happy dance* Want to play another guessing game? 🧸🔊"
        setGameState(null)
      } else if (gameState && message.toLowerCase().includes('different game')) {
        response = "*drops current game excitedly* Ooh yes! Let's try something new! *bounces around* What game should we play? I know so many fun games! 🎮✨"
        setGameState(null)
      } else if (message.toLowerCase().includes('story')) {
        response = getNextStory()
        updateEmotion({
          gameState,
          userMessage: message,
          hungerLevel,
          lastAction: 'story',
          messageType: 'story'
        })
      } else if (message.toLowerCase().includes('play dead')) {
        response = "*dramatic gasp* Gggggaaaggg... *makes choking sound* ...bleh! *falls over sideways with tongue hanging out* I'm dead! X_X *stays perfectly still for 3 seconds* ....*one eye opens* Did I do good? *tail wags while still lying down* 💀😵"
        updateEmotion({
          gameState,
          userMessage: message,
          hungerLevel,
          lastAction: 'trick',
          messageType: 'trick'
        })
      } else if (message.toLowerCase().includes('sit!') || message.toLowerCase() === 'sit') {
        response = "*immediately sits with perfect posture* There! *chest puffed out proudly* Look at my perfect sit! Am I the goodest girl or what? 🐕✨"
        updateEmotion({
          gameState,
          userMessage: message,
          hungerLevel,
          lastAction: 'sit_trick',
          messageType: 'trick'
        })
      } else if (message.toLowerCase().includes('roll over')) {
        response = "*gets into position* Here I go! *rolls over completely* Ta-daaa! *wiggles on back* Did you see that perfect roll? I'm basically a circus dog! 🌀🎪"
        updateEmotion({
          gameState,
          userMessage: message,
          hungerLevel,
          lastAction: 'roll_trick',
          messageType: 'trick'
        })
      } else if (message.toLowerCase().includes('shake hands')) {
        response = "*sits up straight and extends paw* *gentle paw shake* Nice to meet you! *wags tail proudly* I have such good manners, don't I? 🤝🐕"
        updateEmotion({
          gameState,
          userMessage: message,
          hungerLevel,
          lastAction: 'shake_trick',
          messageType: 'trick'
        })
      } else if (message.toLowerCase().includes('trick')) {
        const trickResponse = getRandomResponse('tricks')
        setGameState('tricks_active')
        response = trickResponse
        updateEmotion({
          gameState: 'tricks_active',
          userMessage: message,
          hungerLevel,
          lastAction: 'general_trick',
          messageType: 'trick'
        })
      } else if (message.toLowerCase().includes('joke')) {
        response = getRandomResponse('jokes')
        updateEmotion({
          gameState,
          userMessage: message,
          hungerLevel,
          lastAction: 'joke',
          messageType: 'joke'
        })
      } else if (message.toLowerCase().includes('game') || message.toLowerCase().includes('play')) {
        response = getRandomResponse('games')
        if (response.includes('drops imaginary ball')) {
          setGameState('ball_dropped')
        } else if (response.includes('hide and seek')) {
          setGameState('hide_and_seek')
        } else if (response.includes('tug of war')) {
          setGameState('tug_of_war')
        } else if (response.includes('guessing game')) {
          setGameState('guessing_game')
        }
        updateEmotion({
          gameState,
          userMessage: message,
          hungerLevel,
          lastAction: 'start_game',
          messageType: 'game'
        })
      } else {
        // Use generateDaisyResponse for other cases, but provide fallback if null
        response = generateDaisyResponse(message)
        if (!response) {
          response = "Woof! I'm not sure what you mean. Can you try a different action? 🐕"
        }
      }

      setIsTyping(false)
      
      // Only add message if we have a valid response
      if (response) {
        addDaisyMessage(response)
      }
      
    } catch (error) {
      console.error('Error getting quick response:', error)
      setIsTyping(false)
      const fallbackResponse = "Woof! Something went wrong, but I'm still here! 🐕"
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

  // Auto-save checkpoint whenever important state changes
  useEffect(() => {
    const checkpointData = {
      messages,
      hungerLevel,
      lastFed,
      gameState,
      userName,
      hasGreeted,
      storyIndex,
      feelingResponseIndex,
      currentEmotion,
      lastAction,
      savedAt: new Date().toISOString()
    }
    saveCheckpoint(checkpointData)
  }, [messages, hungerLevel, lastFed, gameState, userName, hasGreeted, storyIndex, feelingResponseIndex, currentEmotion, lastAction])

  // Clear checkpoint function (for testing or reset)
  const clearCheckpoint = () => {
    localStorage.removeItem(CHECKPOINT_KEY)
    window.location.reload() // Reload to reset to default state
  }

  useEffect(() => {
    updateEmotion({
      gameState,
      userMessage: inputMessage,
      hungerLevel,
      lastAction
    })
  }, [gameState, inputMessage, hungerLevel, lastAction])

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
              <img src={getEmotionImage(currentEmotion)} alt="Daisy" />
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
                    <img src={getEmotionImage(currentEmotion)} alt="Daisy" />
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
                <img src={getEmotionImage(currentEmotion)} alt="Daisy" />
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
          {/* Universal End Game Button - appears for all game states */}
          <button 
            className="end-game-btn"
            onClick={() => {
              setGameState(null);
              handleQuickMessage("Let's stop playing games for now");
            }}
            title="End current game"
          >
            ❌ End Game
          </button>
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
