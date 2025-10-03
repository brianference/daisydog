const GRID_SIZE = 3;

const PUZZLE_IMAGES = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces'
];

const PUZZLE_PIECES = [
  { id: 0, correctPos: 0, row: 0, col: 0 },
  { id: 1, correctPos: 1, row: 0, col: 1 },
  { id: 2, correctPos: 2, row: 0, col: 2 },
  { id: 3, correctPos: 3, row: 1, col: 0 },
  { id: 4, correctPos: 4, row: 1, col: 1 },
  { id: 5, correctPos: 5, row: 1, col: 2 },
  { id: 6, correctPos: 6, row: 2, col: 0 },
  { id: 7, correctPos: 7, row: 2, col: 1 },
  { id: 8, correctPos: 8, row: 2, col: 2 }
];

function shuffleArray(array, random) {
  return random.Shuffle(array);
}

function checkWin(board) {
  return board.every((piece, index) => piece && piece.correctPos === index);
}

export const SimplePuzzleGame = {
  name: 'simple-puzzle',

  setup: ({ random }) => {
    const shuffledPieces = shuffleArray(PUZZLE_PIECES, random);
    const board = new Array(GRID_SIZE * GRID_SIZE).fill(null);
    
    shuffledPieces.forEach((piece, index) => {
      board[index] = piece;
    });

    const timestampSeed = Date.now() % PUZZLE_IMAGES.length;
    const randomOffset = Math.floor(random.Number() * PUZZLE_IMAGES.length);
    const imageIndex = (timestampSeed + randomOffset) % PUZZLE_IMAGES.length;

    return {
      board,
      selectedPiece: null,
      moveCount: 0,
      correctPieces: 0,
      imageUrl: PUZZLE_IMAGES[imageIndex]
    };
  },

  turn: {
    minMoves: 1,
    maxMoves: 1
  },

  moves: {
    placePiece: ({ G, ctx }, fromPos, toPos) => {
      if (G.board[fromPos] === null) return;
      
      const temp = G.board[toPos];
      G.board[toPos] = G.board[fromPos];
      G.board[fromPos] = temp;
      
      G.moveCount++;
      
      G.correctPieces = G.board.filter((piece, index) => 
        piece && piece.correctPos === index
      ).length;
    }
  },

  endIf: ({ G }) => {
    if (checkWin(G.board)) {
      return { winner: '0' };
    }
  },

  ai: {
    enumerate: () => []
  }
};

export { GRID_SIZE, PUZZLE_PIECES };
