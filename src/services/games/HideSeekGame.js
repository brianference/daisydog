/**
 * HideSeekGame - Enhanced Hide and Seek with Dual-Mode Gameplay
 * Forest Adventure Explorer with hiding mechanics and search tools
 */

import { EMOTIONS } from '../../types/index.js'
import { GAME_CONFIG } from '../../constants/index.js'

class HideSeekGame {
  constructor() {
    this.name = 'hide_and_seek'
    this.config = GAME_CONFIG.HIDE_AND_SEEK
    
    // Hiding spots with different difficulty levels
    this.hidingSpots = [
      {
        id: 'tree',
        name: 'Behind Tree',
        visibility: 40,
        difficulty: 'Easy',
        emoji: '🌳',
        description: 'Quick to hide, but easy to spot'
      },
      {
        id: 'bush',
        name: 'Inside Bush',
        visibility: 25,
        difficulty: 'Medium',
        emoji: '🌿',
        description: 'Good cover, moderate difficulty'
      },
      {
        id: 'log',
        name: 'Hollow Log',
        visibility: 15,
        difficulty: 'Hard',
        emoji: '🪵',
        description: 'Great hiding spot, harder to find'
      },
      {
        id: 'leaves',
        name: 'Leaf Pile',
        visibility: 10,
        difficulty: 'Expert',
        emoji: '🍂',
        description: 'Excellent camouflage!'
      }
    ]
  }

  /**
   * Start the hide and seek game with mode selection
   * @param {Object} gameState - Current game state
   * @returns {Object} Game start response
   */
  start(gameState) {
    return {
      message: "*tail wagging excitedly* Yay! Hide and Seek! Do you want to hide while I seek, or do you want to find me? 🌳",
      emotion: EMOTIONS.EXCITED,
      stateChanges: {
        gamePhase: 'mode_selection',
        gameMode: null,
        hideSpotId: null,
        searchAttempts: 0,
        daisyPosition: null,
        cluesGiven: 0
      },
      gameStarted: true
    }
  }

  /**
   * Process user input for hide and seek game
   * @param {string} userInput - User's message
   * @param {Object} gameState - Current game state
   * @returns {Object} Game response
   */
  processInput(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()

    // Stop game
    if (lowerInput.includes('stop') || lowerInput.includes('done') || lowerInput.includes('quit')) {
      return this.end(gameState)
    }

    // Handle based on game phase
    const phase = gameState.gamePhase || 'mode_selection'

    switch (phase) {
      case 'mode_selection':
        return this.handleModeSelection(userInput, gameState)
      
      case 'spot_selection':
        return this.handleSpotSelection(userInput, gameState)
      
      case 'player_hiding':
        return this.handlePlayerHiding(userInput, gameState)
      
      case 'player_seeking':
        return this.handlePlayerSeeking(userInput, gameState)
      
      case 'daisy_counting':
        return this.handleDaisyCounting(userInput, gameState)
      
      default:
        return this.start(gameState)
    }
  }

  /**
   * Handle mode selection (hide or seek)
   */
  handleModeSelection(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()

    // Player wants to seek (Daisy hides) - CHECK THIS FIRST
    if (lowerInput.includes('you hide') || lowerInput.includes('seek') || lowerInput.includes('find you')) {
      return {
        message: "*runs off excitedly* Hehe! I'm going to find the BEST hiding spot! Count to 10 and come find me! Ready... set... GO! 🏃",
        emotion: EMOTIONS.PLAYFETCH,
        stateChanges: {
          gameMode: 'daisy_hides',
          gamePhase: 'daisy_counting',
          daisyPosition: this.getRandomHidingSpot().id,
          searchAttempts: 0,
          cluesGiven: 0
        }
      }
    }

    // Player wants to hide (Daisy seeks) - CHECK THIS SECOND
    if (lowerInput.includes('i hide') || lowerInput.includes('me hide') || lowerInput.includes('i\'ll hide')) {
      return {
        message: "*covers eyes with paws* Okay! I'll count to 10 while you hide! Pick your hiding spot wisely! 🙈",
        emotion: EMOTIONS.EAGER,
        stateChanges: {
          gameMode: 'player_hides',
          gamePhase: 'spot_selection',
          searchAttempts: 0
        }
      }
    }

    // Default: ask again
    return {
      message: "*tilts head* Should I hide, or should you hide? Just say 'I'll hide' or 'You hide'! 🤔",
      emotion: EMOTIONS.THINKING,
      stateChanges: {}
    }
  }

  /**
   * Handle hiding spot selection
   */
  handleSpotSelection(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()

    // Check if user selected a spot
    for (const spot of this.hidingSpots) {
      if (lowerInput.includes(spot.id) || lowerInput.includes(spot.name.toLowerCase())) {
        return {
          message: `*counting with paws over eyes* ...8... 9... 10! Ready or not, here I come! *starts sniffing around* 👃`,
          emotion: EMOTIONS.LOOKINGBEHIND,
          stateChanges: {
            hideSpotId: spot.id,
            gamePhase: 'player_hiding',
            searchAttempts: 0,
            foundPlayer: false
          }
        }
      }
    }

    // No valid spot selected - show options
    const spotsList = this.hidingSpots.map(s => `${s.emoji} ${s.name} (${s.difficulty})`).join(', ')
    return {
      message: `*still counting with eyes covered* Pick where to hide! Choose: ${spotsList}`,
      emotion: EMOTIONS.PATIENT,
      stateChanges: {}
    }
  }

  /**
   * Handle player hiding phase (Daisy seeks)
   */
  handlePlayerHiding(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()
    const attempts = gameState.searchAttempts || 0
    const spot = this.hidingSpots.find(s => s.id === gameState.hideSpotId)

    // Safety check: if no spot selected, restart phase
    if (!spot) {
      return {
        message: "*still searching* Hmm, where did you go? Let's start again! 🔍",
        emotion: EMOTIONS.THINKING,
        stateChanges: {
          gamePhase: 'spot_selection'
        }
      }
    }

    // Player stays quiet
    if (lowerInput.includes('stay') || lowerInput.includes('quiet') || lowerInput.includes('shh')) {
      const newAttempts = attempts + 1
      
      // Daisy's search becomes more targeted
      if (newAttempts >= 3) {
        // Found based on spot visibility
        const foundChance = spot.visibility
        const found = Math.random() * 100 < foundChance

        if (found) {
          return {
            message: `*sniffs near ${spot.name}* Found you! ${spot.emoji} You were in the ${spot.name}! That was fun! Want to play again? 🎉`,
            emotion: EMOTIONS.EXCITED,
            stateChanges: {
              foundPlayer: true,
              searchAttempts: 0
            },
            gameEnded: true
          }
        }
      }

      // Continue searching
      const searchMessages = [
        "*sniffs the ground* Hmm, where could you be? I smell something... 👃",
        "*looks behind trees* Are you over here? *tail wagging* 🌳",
        "*checks behind bushes* Getting warmer... or colder? 🔍",
        "*tilts head* I'm getting close, I can feel it! Where are you hiding? 🤔"
      ]

      return {
        message: searchMessages[Math.min(newAttempts, searchMessages.length - 1)],
        emotion: EMOTIONS.LOOKINGBEHIND,
        stateChanges: {
          searchAttempts: newAttempts
        }
      }
    }

    // Player makes noise (gives away position)
    if (lowerInput.includes('here') || lowerInput.includes('found') || lowerInput.includes('give up')) {
      return {
        message: `*runs over excitedly* Found you! You were hiding in the ${spot.name}! ${spot.emoji} Great game! Want to play again? 🎊`,
        emotion: EMOTIONS.EXCITED,
        stateChanges: {
          foundPlayer: true,
          searchAttempts: 0
        },
        gameEnded: true
      }
    }

    // Default response
    return {
      message: "*searching around* Stay quiet and I might not find you! Or say 'here' if you want me to find you! 🔍",
      emotion: EMOTIONS.LOOKINGBEHIND,
      stateChanges: {}
    }
  }

  /**
   * Handle player seeking phase (player looks for Daisy)
   */
  handlePlayerSeeking(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()
    const attempts = gameState.searchAttempts || 0
    const daisySpot = this.hidingSpots.find(s => s.id === gameState.daisyPosition)
    const cluesGiven = gameState.cluesGiven || 0

    // Safety check: if Daisy's spot is invalid, restart
    if (!daisySpot) {
      return {
        message: "*giggles* Oops! Let's start over! I'll hide again! 🙈",
        emotion: EMOTIONS.THINKING,
        stateChanges: {
          gamePhase: 'daisy_counting',
          daisyPosition: this.getRandomHidingSpot().id,
          searchAttempts: 0,
          cluesGiven: 0
        }
      }
    }

    // Player asks for hint
    if (lowerInput.includes('hint') || lowerInput.includes('clue') || lowerInput.includes('help')) {
      if (cluesGiven >= 2) {
        return {
          message: "*giggles from hiding spot* No more hints! You have to find me! 🙈",
          emotion: EMOTIONS.HAPPY,
          stateChanges: {}
        }
      }

      const hints = [
        `*whispers* I'm hiding somewhere with ${daisySpot.difficulty.toLowerCase()} difficulty! 🤫`,
        `*giggles* My hiding spot starts with ${daisySpot.name[0]}! Can you guess? 😄`
      ]

      return {
        message: hints[cluesGiven],
        emotion: EMOTIONS.THINKING,
        stateChanges: {
          cluesGiven: cluesGiven + 1
        }
      }
    }

    // Check if player searched specific location
    for (const spot of this.hidingSpots) {
      if (lowerInput.includes(spot.id) || lowerInput.includes(spot.name.toLowerCase())) {
        const newAttempts = attempts + 1

        // Correct spot!
        if (spot.id === gameState.daisyPosition) {
          return {
            message: `*jumps out from ${spot.name}* You found me! ${spot.emoji} Great job! That was so much fun! Want to play again? 🎉`,
            emotion: EMOTIONS.EXCITED,
            stateChanges: {
              searchAttempts: newAttempts
            },
            gameEnded: true
          }
        }

        // Wrong spot - give hot/cold clue
        const correctSpotIndex = this.hidingSpots.findIndex(s => s.id === gameState.daisyPosition)
        const guessedSpotIndex = this.hidingSpots.findIndex(s => s.id === spot.id)
        const distance = Math.abs(correctSpotIndex - guessedSpotIndex)

        const clueMessages = [
          "*giggles* You're getting VERY warm! Almost there! 🔥",
          "*whispers* You're warm! Keep looking! 🌡️",
          "*calls out* You're cold! Try somewhere else! ❄️"
        ]

        // Map distance to message index (distance 1 = very warm, 2 = warm, 3 = cold)
        const messageIndex = Math.min(distance - 1, 2)

        return {
          message: clueMessages[messageIndex],
          emotion: EMOTIONS.HAPPY,
          stateChanges: {
            searchAttempts: newAttempts
          }
        }
      }
    }

    // Player calls out general search
    if (lowerInput.includes('where') || lowerInput.includes('find') || lowerInput.includes('looking')) {
      const newAttempts = attempts + 1
      return {
        message: "*giggles from hiding spot* You have to search specific places! Try the tree, bush, log, or leaves! 🌳🌿🪵🍂",
        emotion: EMOTIONS.HAPPY,
        stateChanges: {
          searchAttempts: newAttempts
        }
      }
    }

    // Default
    return {
      message: "*stays hidden quietly* Come find me! Search the tree, bush, log, or leaves! Or ask for a hint! 🙊",
      emotion: EMOTIONS.THINKING,
      stateChanges: {}
    }
  }

  /**
   * Handle counting phase when Daisy is hiding
   */
  handleDaisyCounting(userInput, gameState) {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes('ready') || lowerInput.includes('coming') || lowerInput.includes('seek')) {
      return {
        message: "*hidden somewhere* Come find me! I'm hiding really well! Search the tree, bush, log, or leaves! 🙈",
        emotion: EMOTIONS.THINKING,
        stateChanges: {
          gamePhase: 'player_seeking',
          searchAttempts: 0
        }
      }
    }

    return {
      message: "*hiding* Count to 10 first! Then say 'ready' when you're coming to find me! 1... 2... 3... ⏰",
      emotion: EMOTIONS.PATIENT,
      stateChanges: {}
    }
  }

  /**
   * Get random hiding spot for Daisy
   */
  getRandomHidingSpot() {
    return this.hidingSpots[Math.floor(Math.random() * this.hidingSpots.length)]
  }

  /**
   * End the hide and seek game
   * @param {Object} gameState - Current game state
   * @returns {Object} Game end response
   */
  end(gameState) {
    return {
      message: "*stops playing* Okay! That was fun! What should we do next? 🐾",
      emotion: EMOTIONS.PATIENT,
      stateChanges: {
        gamePhase: null,
        gameMode: null,
        hideSpotId: null,
        searchAttempts: 0,
        daisyPosition: null,
        cluesGiven: 0,
        foundPlayer: false
      },
      gameEnded: true
    }
  }

  /**
   * Get available actions for hide and seek game
   * @param {Object} gameState - Current game state
   * @returns {Array} Available actions
   */
  getAvailableActions(gameState) {
    const phase = gameState.gamePhase || 'mode_selection'

    switch (phase) {
      case 'mode_selection':
        return [
          { id: 'player_hide', label: '🙈 I\'ll Hide', message: 'I\'ll hide' },
          { id: 'daisy_hide', label: '🔍 You Hide', message: 'You hide' },
          { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
        ]

      case 'spot_selection':
        return this.hidingSpots.map(spot => ({
          id: spot.id,
          label: `${spot.emoji} ${spot.name}`,
          message: `Hide in ${spot.name}`
        })).concat([
          { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
        ])

      case 'player_hiding':
        return [
          { id: 'quiet', label: '🤫 Stay Quiet', message: 'Stay quiet' },
          { id: 'found', label: '👋 Found Me!', message: 'You found me!' },
          { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
        ]

      case 'daisy_counting':
        return [
          { id: 'ready', label: '✅ Ready', message: 'Ready or not, here I come!' },
          { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
        ]

      case 'player_seeking':
        const searchActions = this.hidingSpots.map(spot => ({
          id: `search_${spot.id}`,
          label: `${spot.emoji} ${spot.name}`,
          message: `Search ${spot.name}`
        }))
        
        return [
          ...searchActions,
          { id: 'hint', label: '💡 Hint', message: 'Give me a hint!' },
          { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
        ]

      default:
        return [
          { id: 'stop', label: '🛑 Stop', message: 'Stop playing' }
        ]
    }
  }

  /**
   * Get current game status
   * @param {Object} gameState - Current game state
   * @returns {Object} Game status
   */
  getStatus(gameState) {
    return {
      phase: gameState.gamePhase || 'mode_selection',
      mode: gameState.gameMode,
      hideSpot: gameState.hideSpotId,
      attempts: gameState.searchAttempts || 0,
      cluesGiven: gameState.cluesGiven || 0
    }
  }

  /**
   * Get game rules and instructions
   * @returns {Object} Game information
   */
  getGameInfo() {
    return {
      name: 'Hide and Seek - Forest Adventure',
      description: 'Play hide and seek with Daisy! Choose to hide or seek in different hiding spots.',
      instructions: [
        '🙈 Choose: You hide or Daisy hides',
        '🌳 Pick hiding spots: Tree, Bush, Log, or Leaves',
        '🔍 When seeking: Search spots or ask for hints',
        '🔥 Get hot/cold clues when searching',
        '🏆 Find each other to win!'
      ],
      emoji: '🌳'
    }
  }

  /**
   * Validate game state
   * @param {Object} gameState - Game state to validate
   * @returns {boolean} Whether state is valid
   */
  validateState(gameState) {
    if (!gameState.gamePhase) return true
    
    const validPhases = ['mode_selection', 'spot_selection', 'player_hiding', 'player_seeking', 'daisy_counting']
    return validPhases.includes(gameState.gamePhase)
  }
}

export default HideSeekGame
