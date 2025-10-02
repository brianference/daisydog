export const BOARD_GAME_TYPES = {
  MEMORY_MATCH: 'MEMORY_MATCH',
  TIC_TAC_TOE: 'TIC_TAC_TOE',
  CONNECT_FOUR: 'CONNECT_FOUR',
  CHECKERS: 'CHECKERS',
  GO_FISH: 'GO_FISH',
  SIMPLE_PUZZLE: 'SIMPLE_PUZZLE',
  COLOR_MATCHING: 'COLOR_MATCHING',
  PATTERN_BUILDER: 'PATTERN_BUILDER',
  WORD_SCRAMBLE: 'WORD_SCRAMBLE'
};

export const GAME_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const PLAYER_TYPE = {
  HUMAN: 'human',
  DAISY_AI: 'daisy_ai'
};

export const GAME_STATUS = {
  SETUP: 'setup',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
  ABANDONED: 'abandoned'
};

export const DAISY_MOOD = {
  EXCITED: 'excited',
  ENCOURAGING: 'encouraging',
  CELEBRATING: 'celebrating',
  SYMPATHETIC: 'sympathetic',
  PATIENT: 'patient',
  PLAYFUL: 'playful',
  THINKING: 'thinking'
};

export const GAME_EVENT_TYPE = {
  MOVE_MADE: 'move_made',
  TURN_START: 'turn_start',
  TURN_END: 'turn_end',
  GAME_START: 'game_start',
  GAME_END: 'game_end',
  MATCH_FOUND: 'match_found',
  GOOD_MOVE: 'good_move',
  MISTAKE: 'mistake',
  WIN: 'win',
  LOSE: 'lose',
  DRAW: 'draw'
};

export const BOARD_GAME_INFO = {
  [BOARD_GAME_TYPES.MEMORY_MATCH]: {
    title: 'Memory Match',
    emoji: '🎴',
    description: 'Flip cards to find matching pairs!',
    minAge: 4,
    maxAge: 8,
    difficulty: GAME_DIFFICULTY.EASY,
    playerCount: [1, 2],
    estimatedTime: '5-10 minutes'
  },
  [BOARD_GAME_TYPES.TIC_TAC_TOE]: {
    title: 'Tic-Tac-Toe',
    emoji: '⭕',
    description: 'Get three in a row to win!',
    minAge: 3,
    maxAge: 7,
    difficulty: GAME_DIFFICULTY.EASY,
    playerCount: [2],
    estimatedTime: '2-5 minutes'
  },
  [BOARD_GAME_TYPES.CONNECT_FOUR]: {
    title: 'Connect Four',
    emoji: '🔴',
    description: 'Drop tokens and connect four!',
    minAge: 5,
    maxAge: 10,
    difficulty: GAME_DIFFICULTY.MEDIUM,
    playerCount: [2],
    estimatedTime: '5-10 minutes'
  },
  [BOARD_GAME_TYPES.CHECKERS]: {
    title: 'Checkers',
    emoji: '👑',
    description: 'Jump and capture all pieces!',
    minAge: 6,
    maxAge: 12,
    difficulty: GAME_DIFFICULTY.HARD,
    playerCount: [2],
    estimatedTime: '10-20 minutes'
  },
  [BOARD_GAME_TYPES.GO_FISH]: {
    title: 'Go Fish',
    emoji: '🐟',
    description: 'Collect pairs of matching cards!',
    minAge: 5,
    maxAge: 9,
    difficulty: GAME_DIFFICULTY.EASY,
    playerCount: [2],
    estimatedTime: '5-10 minutes'
  },
  [BOARD_GAME_TYPES.SIMPLE_PUZZLE]: {
    title: 'Puzzle Builder',
    emoji: '🧩',
    description: 'Drag pieces to complete the picture!',
    minAge: 4,
    maxAge: 8,
    difficulty: GAME_DIFFICULTY.EASY,
    playerCount: [1],
    estimatedTime: '3-8 minutes'
  },
  [BOARD_GAME_TYPES.COLOR_MATCHING]: {
    title: 'Color Match',
    emoji: '🎨',
    description: 'Match colors as fast as you can!',
    minAge: 4,
    maxAge: 7,
    difficulty: GAME_DIFFICULTY.EASY,
    playerCount: [1, 2],
    estimatedTime: '3-5 minutes'
  },
  [BOARD_GAME_TYPES.PATTERN_BUILDER]: {
    title: 'Pattern Builder',
    emoji: '🔷',
    description: 'Copy and create fun patterns!',
    minAge: 5,
    maxAge: 9,
    difficulty: GAME_DIFFICULTY.MEDIUM,
    playerCount: [1],
    estimatedTime: '5-10 minutes'
  },
  [BOARD_GAME_TYPES.WORD_SCRAMBLE]: {
    title: 'Word Scramble',
    emoji: '🔤',
    description: 'Unscramble letters to make words!',
    minAge: 7,
    maxAge: 12,
    difficulty: GAME_DIFFICULTY.MEDIUM,
    playerCount: [1],
    estimatedTime: '5-10 minutes'
  }
};
