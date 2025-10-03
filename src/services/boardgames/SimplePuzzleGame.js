const GRID_SIZE = 3;

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
