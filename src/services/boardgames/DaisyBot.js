import { MCTSBot } from 'boardgame.io/ai';
import DaisyAIOpponent from './DaisyAIOpponent.js';

export class DaisyBot extends MCTSBot {
  constructor({ enumerate, seed}) {
    super({ enumerate, seed, iterations: 100, playoutDepth: 10 });
  }
}
