import { DAISY_MOOD, GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';

const CHEERLEADING_MESSAGES = {
  [GAME_EVENT_TYPE.GAME_START]: [
    { text: "Woof! Let's play! This is going to be so much fun! 🐕", mood: DAISY_MOOD.EXCITED },
    { text: "I'm so excited to play with you! Let's do this! 🎮", mood: DAISY_MOOD.PLAYFUL },
    { text: "Ready when you are! I love this game! 🌟", mood: DAISY_MOOD.EXCITED }
  ],
  
  [GAME_EVENT_TYPE.TURN_START]: [
    { text: "Your turn! Take your time and think it through! 💭", mood: DAISY_MOOD.PATIENT },
    { text: "What's your next move going to be? 🤔", mood: DAISY_MOOD.THINKING },
    { text: "I wonder what you'll do next! 🐾", mood: DAISY_MOOD.PLAYFUL }
  ],
  
  [GAME_EVENT_TYPE.GOOD_MOVE]: [
    { text: "Wow! Great move! You're really good at this! 🌟", mood: DAISY_MOOD.CELEBRATING },
    { text: "That was clever! I didn't see that coming! 🤓", mood: DAISY_MOOD.EXCITED },
    { text: "Amazing! You're playing so well! 🎉", mood: DAISY_MOOD.CELEBRATING }
  ],
  
  [GAME_EVENT_TYPE.MATCH_FOUND]: [
    { text: "You found a match! Way to go! 🎊", mood: DAISY_MOOD.CELEBRATING },
    { text: "Perfect! Your memory is incredible! 🧠", mood: DAISY_MOOD.EXCITED },
    { text: "Yay! Another match! You're on fire! 🔥", mood: DAISY_MOOD.CELEBRATING }
  ],
  
  [GAME_EVENT_TYPE.MISTAKE]: [
    { text: "That's okay! Everyone makes mistakes! Keep trying! 💪", mood: DAISY_MOOD.ENCOURAGING },
    { text: "No worries! You'll get it next time! 🐕", mood: DAISY_MOOD.SYMPATHETIC },
    { text: "Don't give up! I believe in you! ⭐", mood: DAISY_MOOD.ENCOURAGING }
  ],
  
  [GAME_EVENT_TYPE.WIN]: [
    { text: "YOU WON! That was AMAZING! I'm so proud of you! 🏆", mood: DAISY_MOOD.CELEBRATING },
    { text: "Incredible! You beat me! Great job! 🎉🎉🎉", mood: DAISY_MOOD.CELEBRATING },
    { text: "WOW! You're the champion! That was so fun! 👑", mood: DAISY_MOOD.CELEBRATING }
  ],
  
  [GAME_EVENT_TYPE.LOSE]: [
    { text: "Good game! You played really well! Want a rematch? 🐾", mood: DAISY_MOOD.SYMPATHETIC },
    { text: "That was close! You almost had me! Try again? 💙", mood: DAISY_MOOD.ENCOURAGING },
    { text: "You're getting better! Let's play again! 🌟", mood: DAISY_MOOD.ENCOURAGING }
  ],
  
  [GAME_EVENT_TYPE.DRAW]: [
    { text: "It's a tie! We're both winners! Great game! 🤝", mood: DAISY_MOOD.CELEBRATING },
    { text: "Wow! We're equally matched! That was fun! 🎮", mood: DAISY_MOOD.EXCITED },
    { text: "A draw! We both played amazingly! 🌟", mood: DAISY_MOOD.CELEBRATING }
  ],
  
  [GAME_EVENT_TYPE.MOVE_MADE]: [
    { text: "Hmm, interesting move! Let me think... 🤔", mood: DAISY_MOOD.THINKING },
    { text: "Okay, my turn now! Watch this! 🐕", mood: DAISY_MOOD.PLAYFUL },
    { text: "Nice! Now let me make my move! 🎯", mood: DAISY_MOOD.EXCITED }
  ]
};

class DaisyCheerleader {
  constructor() {
    this.recentMessages = new Set();
    this.maxRecentMessages = 5;
  }

  getMessage(eventType, context = {}) {
    const messages = CHEERLEADING_MESSAGES[eventType];
    
    if (!messages || messages.length === 0) {
      return this.getDefaultMessage(context);
    }

    const availableMessages = messages.filter(
      msg => !this.recentMessages.has(msg.text)
    );

    const messagePool = availableMessages.length > 0 ? availableMessages : messages;
    const randomIndex = Math.floor(Math.random() * messagePool.length);
    const selectedMessage = messagePool[randomIndex];

    this.addToRecent(selectedMessage.text);

    return {
      ...selectedMessage,
      context,
      timestamp: Date.now()
    };
  }

  getDefaultMessage(context = {}) {
    return {
      text: "Woof! Keep going, you're doing great! 🐕",
      mood: DAISY_MOOD.ENCOURAGING,
      context,
      timestamp: Date.now()
    };
  }

  addToRecent(message) {
    this.recentMessages.add(message);
    
    if (this.recentMessages.size > this.maxRecentMessages) {
      const firstMessage = this.recentMessages.values().next().value;
      this.recentMessages.delete(firstMessage);
    }
  }

  getCustomMessage(text, mood = DAISY_MOOD.PLAYFUL, context = {}) {
    return {
      text,
      mood,
      context,
      timestamp: Date.now()
    };
  }

  reset() {
    this.recentMessages.clear();
  }
}

export default new DaisyCheerleader();
