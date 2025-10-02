/**
 * GameVoiceInstructions - Manages Daisy's voice instructions for all games
 * Uses OpenAI TTS (via VoiceService) to speak instructions when games load
 * Includes caching to avoid regenerating audio for the same instructions
 */

import VoiceService from './VoiceService';

const GAME_INSTRUCTIONS = {
  MEMORY_MATCH: {
    text: "Hi friend! Let's play Memory Match together! Flip the cards to find matching pairs. I'll help you along the way. Ready? Let's go!",
    emotion: 'HAPPY',
    mode: 'play'
  },
  TIC_TAC_TOE: {
    text: "Woof woof! Time for Tic Tac Toe! Get three in a row to win. You're X and I'm O. Let's see who wins!",
    emotion: 'HAPPY',
    mode: 'play'
  },
  CONNECT_FOUR: {
    text: "Hey there! Ready for Connect Four? Drop your pieces and try to get four in a row. I'll do my best to beat you! Good luck!",
    emotion: 'HAPPY',
    mode: 'play'
  },
  CHECKERS: {
    text: "Let's play Checkers! Move your pieces diagonally and jump over mine to capture them. Try to get to my side to become a king! This will be fun!",
    emotion: 'HAPPY',
    mode: 'play'
  },
  GO_FISH: {
    text: "Time to play Go Fish! Ask me for cards to make pairs. If I don't have the card you need, go fish! Let's see who collects the most pairs!",
    emotion: 'HAPPY',
    mode: 'play'
  },
  SIMPLE_PUZZLE: {
    text: "Puzzle time! Move the tiles around to complete the picture. Take your time and think about where each piece goes. You've got this!",
    emotion: 'HAPPY',
    mode: 'play'
  },
  COLOR_MATCHING: {
    text: "Let's match some colors! Find the colors that go together. I'll cheer you on as you find each match. Ready to show me your color skills?",
    emotion: 'HAPPY',
    mode: 'play'
  },
  PATTERN_BUILDER: {
    text: "Hi! Let's build patterns together! Follow the sequence and create your own patterns. This is a great way to practice your memory. Let's start!",
    emotion: 'HAPPY',
    mode: 'play'
  },
  WORD_SCRAMBLE: {
    text: "Word Scramble time! Unscramble the letters to spell the correct word. Take your time and think about what the word could be. You're doing great!",
    emotion: 'HAPPY',
    mode: 'play'
  }
};

class GameVoiceInstructions {
  constructor() {
    this.voiceService = VoiceService;
    this.audioCache = new Map();
    this.currentAudio = null;
    this.isMuted = false;
  }

  /**
   * Play instructions for a specific game
   * @param {string} gameType - Game type constant (e.g., 'MEMORY_MATCH')
   * @returns {Promise<void>}
   */
  async playInstructions(gameType) {
    try {
      if (this.isMuted) {
        console.log('🔇 Voice instructions muted');
        return;
      }

      if (!GAME_INSTRUCTIONS[gameType]) {
        console.warn(`No instructions found for game: ${gameType}`);
        return;
      }

      // Stop any currently playing audio
      this.stop();

      const instructions = GAME_INSTRUCTIONS[gameType];
      
      // Check cache first
      let audioBlob = this.audioCache.get(gameType);
      
      if (!audioBlob) {
        console.log(`🗣️ Generating voice instructions for ${gameType}...`);
        
        // Generate new audio using VoiceService
        audioBlob = await this.voiceService.generateSpeech(
          instructions.text,
          instructions.emotion,
          instructions.mode
        );
        
        // Cache the audio blob
        this.audioCache.set(gameType, audioBlob);
        console.log(`✅ Cached voice instructions for ${gameType}`);
      } else {
        console.log(`🔊 Using cached voice instructions for ${gameType}`);
      }

      // Create and play audio
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      
      // Cleanup after playing
      this.currentAudio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      });

      // Play the audio
      await this.currentAudio.play();
      console.log(`🎤 Playing voice instructions for ${gameType}`);
      
    } catch (error) {
      console.error('Failed to play voice instructions:', error);
      // Fail silently - don't block game from loading
    }
  }

  /**
   * Stop currently playing instructions
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Mute/unmute voice instructions
   * @param {boolean} muted - Whether to mute voice instructions
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.currentAudio) {
      this.stop();
    }
    console.log(`🔇 Voice instructions ${muted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Clear cached audio
   */
  clearCache() {
    this.audioCache.forEach((blob, key) => {
      // Revoke object URLs if any exist
      console.log(`🗑️ Clearing cache for ${key}`);
    });
    this.audioCache.clear();
    console.log('✅ Voice instructions cache cleared');
  }

  /**
   * Get instruction text for a game (for display/testing)
   * @param {string} gameType - Game type constant
   * @returns {string} Instruction text
   */
  getInstructionText(gameType) {
    return GAME_INSTRUCTIONS[gameType]?.text || '';
  }
}

// Export singleton instance
export default new GameVoiceInstructions();
