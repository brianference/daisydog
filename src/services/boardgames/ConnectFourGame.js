const ROWS = 6;
const COLS = 7;
const WIN_COUNT = 4;

function createEmptyBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
}

function checkWinner(cells) {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 }
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const player = cells[row][col];
      if (!player) continue;

      for (const { dr, dc } of directions) {
        let count = 1;
        const line = [{ row, col }];

        for (let i = 1; i < WIN_COUNT; i++) {
          const newRow = row + dr * i;
          const newCol = col + dc * i;

          if (
            newRow < 0 || newRow >= ROWS ||
            newCol < 0 || newCol >= COLS ||
            cells[newRow][newCol] !== player
          ) {
            break;
          }

          count++;
          line.push({ row: newRow, col: newCol });
        }

        if (count >= WIN_COUNT) {
          return { winner: player, line };
        }
      }
    }
  }

  const isFull = cells.every(row => row.every(cell => cell !== null));
  if (isFull) {
    return { draw: true };
  }

  return null;
}

function getLowestEmptyRow(cells, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (cells[row][col] === null) {
      return row;
    }
  }
  return -1;
}

export const ConnectFourGame = {
  name: 'connect-four',

  setup: () => ({
    cells: createEmptyBoard(),
    winningLine: null,
    lastMove: null
  }),

  turn: {
    order: {
      first: () => 0,
      next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers
    }
  },

  moves: {
    dropToken: ({ G, ctx, events }, col) => {
      const row = getLowestEmptyRow(G.cells, col);
      if (row === -1) return;

      G.cells[row][col] = ctx.currentPlayer;
      G.lastMove = { row, col };

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
      for (let col = 0; col < COLS; col++) {
        if (getLowestEmptyRow(G.cells, col) !== -1) {
          moves.push({ move: 'dropToken', args: [col] });
        }
      }
      return moves;
    }
  }
};

export { ROWS, COLS };
