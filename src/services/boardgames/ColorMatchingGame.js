const COLORS = [
  { id: 'red', name: 'Red', value: '#FF6B6B' },
  { id: 'blue', name: 'Blue', value: '#4ECDC4' },
  { id: 'yellow', name: 'Yellow', value: '#FFE66D' },
  { id: 'green', name: 'Green', value: '#95E1D3' }
];

function generateSequence(length, random) {
  const sequence = [];
  for (let i = 0; i < length; i++) {
    const colorIndex = Math.floor(random() * COLORS.length);
    sequence.push(COLORS[colorIndex].id);
  }
  return sequence;
}

export const ColorMatchingGame = {
  name: 'color-matching',

  setup: ({ random }) => ({
    sequence: generateSequence(4, random),
    playerSequence: [],
    level: 1,
    showingSequence: true,
    score: 0
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1
  },

  moves: {
    selectColor: (G, ctx, colorId) => {
      G.playerSequence.push(colorId);
      
      const currentIndex = G.playerSequence.length - 1;
      
      if (G.playerSequence[currentIndex] !== G.sequence[currentIndex]) {
        G.playerSequence = [];
        G.showingSequence = true;
      } else if (G.playerSequence.length === G.sequence.length) {
        G.score += G.level * 10;
        G.level++;
        G.sequence = generateSequence(3 + G.level, ctx.random);
        G.playerSequence = [];
        G.showingSequence = true;
      }
    },
    
    startPlaying: (G) => {
      G.showingSequence = false;
    }
  },

  endIf: (G) => {
    if (G.level > 10) {
      return { winner: '0' };
    }
  },

  ai: {
    enumerate: () => []
  }
};

export { COLORS };
