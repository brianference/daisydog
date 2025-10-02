const BOARD_SIZE = 8;

function createInitialBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: '1', king: false };
      }
    }
  }
  
  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: '0', king: false };
      }
    }
  }
  
  return board;
}

function getValidMoves(board, player) {
  const moves = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) continue;
      
      const pieceMoves = getMovesForPiece(board, row, col, piece);
      moves.push(...pieceMoves);
    }
  }
  
  const captureMoves = moves.filter(move => move.captures && move.captures.length > 0);
  return captureMoves.length > 0 ? captureMoves : moves;
}

function getMovesForPiece(board, row, col, piece) {
  const moves = [];
  const directions = piece.king
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : piece.player === '0'
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) continue;
    
    if (!board[newRow][newCol]) {
      moves.push({
        from: { row, col },
        to: { row: newRow, col: newCol },
        captures: []
      });
    } else if (board[newRow][newCol].player !== piece.player) {
      const jumpRow = newRow + dr;
      const jumpCol = newCol + dc;
      
      if (
        jumpRow >= 0 && jumpRow < BOARD_SIZE &&
        jumpCol >= 0 && jumpCol < BOARD_SIZE &&
        !board[jumpRow][jumpCol]
      ) {
        moves.push({
          from: { row, col },
          to: { row: jumpRow, col: jumpCol },
          captures: [{ row: newRow, col: newCol }]
        });
      }
    }
  }
  
  return moves;
}

function checkWinner(board) {
  let player0Pieces = 0;
  let player1Pieces = 0;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.player === '0') player0Pieces++;
        else if (piece.player === '1') player1Pieces++;
      }
    }
  }
  
  if (player0Pieces === 0) return { winner: '1' };
  if (player1Pieces === 0) return { winner: '0' };
  
  return null;
}

export const CheckersGame = {
  name: 'checkers',

  setup: () => ({
    board: createInitialBoard(),
    selectedPiece: null,
    lastMove: null
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1
  },

  moves: {
    movePiece: (G, ctx, from, to, captures) => {
      const piece = G.board[from.row][from.col];
      if (!piece || piece.player !== ctx.currentPlayer) return;
      
      G.board[to.row][to.col] = { ...piece };
      G.board[from.row][from.col] = null;
      
      if (captures && captures.length > 0) {
        captures.forEach(cap => {
          G.board[cap.row][cap.col] = null;
        });
      }
      
      if (
        (piece.player === '0' && to.row === 0) ||
        (piece.player === '1' && to.row === BOARD_SIZE - 1)
      ) {
        G.board[to.row][to.col].king = true;
      }
      
      G.lastMove = { from, to };
    }
  },

  endIf: (G, ctx) => {
    const pieceResult = checkWinner(G.board);
    if (pieceResult) return pieceResult;
    
    const nextPlayer = ctx.currentPlayer === '0' ? '1' : '0';
    const nextPlayerMoves = getValidMoves(G.board, nextPlayer);
    if (nextPlayerMoves.length === 0) {
      return { winner: ctx.currentPlayer };
    }
    
    return null;
  },

  ai: {
    enumerate: (G, ctx) => {
      const validMoves = getValidMoves(G.board, ctx.currentPlayer);
      return validMoves.map(move => ({
        move: 'movePiece',
        args: [move.from, move.to, move.captures]
      }));
    }
  }
};

export { BOARD_SIZE, getValidMoves };
