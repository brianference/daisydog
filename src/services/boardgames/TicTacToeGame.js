function checkWinner(cells) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (const [a, b, c] of lines) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line: [a, b, c] };
    }
  }

  if (cells.every(cell => cell !== null)) {
    return { draw: true };
  }

  return null;
}

export const TicTacToeGame = {
  name: 'tic-tac-toe',

  setup: () => ({
    cells: Array(9).fill(null),
    winningLine: null
  }),

  turn: {
    order: {
      first: () => 0,
      next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers
    }
  },

  moves: {
    clickCell: ({ G, ctx, events }, cellIndex) => {
      if (G.cells[cellIndex] !== null) return;
      
      G.cells[cellIndex] = ctx.currentPlayer;
      
      const result = checkWinner(G.cells);
      if (result && result.line) {
        G.winningLine = result.line;
      }
      
      events.endTurn();
    }
  },

  endIf: ({ G, ctx }) => {
    if (!G || !G.cells) return;
    
    const result = checkWinner(G.cells);
    
    if (result) {
      if (result.winner) {
        return { winner: result.winner };
      }
      if (result.draw) {
        return { draw: true };
      }
    }
  },

  ai: {
    enumerate: (G, ctx) => {
      const moves = [];
      for (let i = 0; i < 9; i++) {
        if (G.cells[i] === null) {
          moves.push({ move: 'clickCell', args: [i] });
        }
      }
      return moves;
    }
  }
};
