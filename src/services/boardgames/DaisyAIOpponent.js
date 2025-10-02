import { GAME_DIFFICULTY, PLAYER_TYPE } from '../../types/boardGameTypes.js';

class DaisyAIOpponent {
  constructor() {
    this.difficulty = GAME_DIFFICULTY.MEDIUM;
    this.moveHistory = [];
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  makeMove(gameState, validMoves, gameType) {
    if (!validMoves || validMoves.length === 0) {
      return null;
    }

    const delay = this.difficulty === GAME_DIFFICULTY.EASY ? 800 : 
                   this.difficulty === GAME_DIFFICULTY.MEDIUM ? 600 : 400;

    return new Promise((resolve) => {
      setTimeout(() => {
        const move = this.selectMove(gameState, validMoves, gameType);
        this.moveHistory.push({ gameType, move, timestamp: Date.now() });
        resolve(move);
      }, delay);
    });
  }

  selectMove(gameState, validMoves, gameType) {
    switch (this.difficulty) {
      case GAME_DIFFICULTY.EASY:
        return this.selectRandomMove(validMoves);
      case GAME_DIFFICULTY.MEDIUM:
        return this.selectSmartMove(gameState, validMoves, gameType);
      case GAME_DIFFICULTY.HARD:
        return this.selectOptimalMove(gameState, validMoves, gameType);
      default:
        return this.selectRandomMove(validMoves);
    }
  }

  selectRandomMove(validMoves) {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }

  selectSmartMove(gameState, validMoves, gameType) {
    if (Math.random() < 0.3) {
      return this.selectRandomMove(validMoves);
    }
    return this.selectOptimalMove(gameState, validMoves, gameType);
  }

  selectOptimalMove(gameState, validMoves, gameType) {
    switch (gameType) {
      case 'TIC_TAC_TOE':
        return this.ticTacToeStrategy(gameState, validMoves);
      case 'CONNECT_FOUR':
        return this.connectFourStrategy(gameState, validMoves);
      case 'CHECKERS':
        return this.checkersStrategy(gameState, validMoves);
      default:
        return this.selectRandomMove(validMoves);
    }
  }

  /**
   * Expected validMoves shapes per game:
   * 
   * TIC_TAC_TOE: [{ row: number, col: number }, ...]
   * CONNECT_FOUR: [{ col: number }, ...]
   * CHECKERS: [{ from: {row, col}, to: {row, col}, captures: [{row, col}] }, ...]
   * MEMORY_MATCH: [{ cardIndex: number }, ...]
   * GO_FISH: [{ rank: string, action: 'ask'|'gofish' }, ...]
   * COLOR_MATCHING: [{ colorIndex: number }, ...]
   * PATTERN_BUILDER: [{ patternIndex: number, action: 'place'|'rotate' }, ...]
   * SIMPLE_PUZZLE: [{ pieceId: number, position: {x, y} }, ...]
   * WORD_SCRAMBLE: [{ word: string }, ...]
   */

  ticTacToeStrategy(gameState, validMoves) {
    return this.selectRandomMove(validMoves);
  }

  connectFourStrategy(gameState, validMoves) {
    const centerCol = Math.floor(validMoves.length / 2);
    const centerMoves = validMoves.filter(move => 
      Math.abs(move.col - centerCol) <= 1
    );
    
    if (centerMoves.length > 0 && Math.random() < 0.6) {
      return this.selectRandomMove(centerMoves);
    }
    
    return this.selectRandomMove(validMoves);
  }

  checkersStrategy(gameState, validMoves) {
    const captureMoves = validMoves.filter(move => move.captures && move.captures.length > 0);
    
    if (captureMoves.length > 0) {
      return this.selectRandomMove(captureMoves);
    }
    
    return this.selectRandomMove(validMoves);
  }

  reset() {
    this.moveHistory = [];
  }

  getMoveHistory() {
    return [...this.moveHistory];
  }

  getStats() {
    return {
      difficulty: this.difficulty,
      totalMoves: this.moveHistory.length,
      playerType: PLAYER_TYPE.DAISY_AI
    };
  }
}

export default new DaisyAIOpponent();
