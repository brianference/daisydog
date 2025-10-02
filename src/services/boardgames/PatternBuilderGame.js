const GRID_SIZE = 4;
const SHAPES = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];

function generatePattern(level, random) {
  const patternSize = 3 + level;
  const pattern = [];
  
  for (let i = 0; i < patternSize; i++) {
    const shapeIndex = Math.floor(random.Number() * SHAPES.length);
    pattern.push({
      id: i,
      shape: SHAPES[shapeIndex],
      position: i
    });
  }
  
  return pattern;
}

export const PatternBuilderGame = {
  name: 'pattern-builder',

  setup: ({ random }) => {
    const targetPattern = generatePattern(1, random);
    
    return {
      targetPattern,
      playerPattern: [],
      level: 1,
      score: 0,
      showingPattern: true
    };
  },

  turn: {
    minMoves: 1,
    maxMoves: 1
  },

  moves: {
    placeShape: ({ G, ctx, random }, shape) => {
      G.playerPattern.push(shape);
      
      const currentIndex = G.playerPattern.length - 1;
      
      if (G.playerPattern[currentIndex].shape !== G.targetPattern[currentIndex].shape) {
        G.playerPattern = [];
      } else if (G.playerPattern.length === G.targetPattern.length) {
        G.score += G.level * 15;
        G.level++;
        G.targetPattern = generatePattern(G.level, random);
        G.playerPattern = [];
        G.showingPattern = true;
      }
    },
    
    startBuilding: ({ G }) => {
      G.showingPattern = false;
    },
    
    clearPattern: ({ G }) => {
      G.playerPattern = [];
    }
  },

  endIf: ({ G }) => {
    if (G.level > 8) {
      return { winner: '0' };
    }
  },

  ai: {
    enumerate: () => []
  }
};

export { SHAPES };
