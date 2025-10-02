const GRID_SIZE = 3;
const PUZZLE_PIECES = [
  { id: 0, correctPos: 0, emoji: '🌸', color: '#FF6B9D' },
  { id: 1, correctPos: 1, emoji: '🌼', color: '#FFD93D' },
  { id: 2, correctPos: 2, emoji: '🌺', color: '#F95959' },
  { id: 3, correctPos: 3, emoji: '🌻', color: '#FFA500' },
  { id: 4, correctPos: 4, emoji: '🌷', color: '#FF69B4' },
  { id: 5, correctPos: 5, emoji: '🌹', color: '#DC143C' },
  { id: 6, correctPos: 6, emoji: '💐', color: '#9370DB' },
  { id: 7, correctPos: 7, emoji: '🏵️', color: '#FF1493' },
  { id: 8, correctPos: 8, emoji: '🌿', color: '#32CD32' }
];

function shuffleArray(array, random) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

    return {
      board,
      selectedPiece: null,
      moveCount: 0,
      correctPieces: 0
    };
  },

  turn: {
    minMoves: 1,
    maxMoves: 1
  },

  moves: {
    placePiece: (G, ctx, fromPos, toPos) => {
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

  endIf: (G) => {
    if (checkWin(G.board)) {
      return { winner: '0' };
    }
  },

  ai: {
    enumerate: () => []
  }
};

export { GRID_SIZE, PUZZLE_PIECES };
