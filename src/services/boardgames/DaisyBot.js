import { Bot } from 'boardgame.io/ai';
import DaisyAIOpponent from './DaisyAIOpponent.js';

export class DaisyBot extends Bot {
  async play(state, playerID) {
    const { G, ctx } = state;
    
    // Get valid moves using the game's enumerate function
    const enumerate = this.game.ai?.enumerate || (() => []);
    const validMoves = enumerate(G, ctx);
    
    if (validMoves.length === 0) {
      return;
    }
    
    // Use DaisyAIOpponent logic to select best move
    const gameType = 'TIC_TAC_TOE'; // TODO: Make this dynamic
    const mappedMoves = validMoves.map(m => ({
      cellIndex: m.args[0],
      row: Math.floor(m.args[0] / 3),
      col: m.args[0] % 3
    }));
    
    const selectedMove = await DaisyAIOpponent.makeMove(G, mappedMoves, gameType);
    
    // Execute the move
    if (selectedMove && selectedMove.cellIndex !== undefined) {
      return { move: 'clickCell', args: [selectedMove.cellIndex] };
    }
    
    // Fallback to random move
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    return randomMove;
  }
}
