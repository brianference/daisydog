import React, { useEffect, useState, useRef } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { TicTacToeGame } from '../../services/boardgames/TicTacToeGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import DaisyAIOpponent from '../../services/boardgames/DaisyAIOpponent.js';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import GameVoiceInstructions from '../../services/GameVoiceInstructions.js';
import './TicTacToe.css';

const TicTacToeBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig, aiMoves }) => {
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (ctx.gameover) {
      if (ctx.gameover.winner === playerID) {
        onGameEvent?.(GAME_EVENT_TYPE.WIN);
      } else if (ctx.gameover.winner) {
        onGameEvent?.(GAME_EVENT_TYPE.LOSE);
      } else if (ctx.gameover.draw) {
        onGameEvent?.(GAME_EVENT_TYPE.DRAW);
      }
    }
  }, [ctx.gameover]);

  useEffect(() => {
    if (ctx.currentPlayer === '1' && !ctx.gameover && !thinking) {
      setThinking(true);
      
      const makeAIMove = async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const validMoves = G.cells
          .map((cell, index) => cell === null ? { row: Math.floor(index / 3), col: index % 3, cellIndex: index } : null)
          .filter(move => move !== null);
        
        if (validMoves.length > 0) {
          const move = await DaisyAIOpponent.makeMove(G, validMoves, 'TIC_TAC_TOE');
          
          if (move && move.cellIndex !== undefined && G.cells[move.cellIndex] === null) {
            if (aiMoves && aiMoves.clickCell) {
              aiMoves.clickCell(move.cellIndex);
              onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
            }
          }
        }
        
        setThinking(false);
      };
      
      makeAIMove();
    }
  }, [ctx.currentPlayer, ctx.gameover, ctx.turn]);

  const handleCellClick = (cellIndex) => {
    if (ctx.currentPlayer !== playerID) return;
    if (G.cells[cellIndex] !== null) return;
    if (ctx.gameover) return;
    if (thinking) return;
    
    moves.clickCell(cellIndex);
    onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
  };

  const isWinningCell = (index) => {
    return G.winningLine && G.winningLine.includes(index);
  };

  const renderCell = (index) => {
    const value = G.cells[index];
    const isWinner = isWinningCell(index);
    
    return (
      <motion.div
        key={index}
        className={`ttt-cell ${isWinner ? 'winning' : ''}`}
        onClick={() => handleCellClick(index)}
        whileHover={{ 
          scale: value === null && ctx.currentPlayer === playerID && !ctx.gameover ? 1.05 : 1 
        }}
        whileTap={{ scale: 0.95 }}
        style={{
          cursor: value === null && ctx.currentPlayer === playerID && !ctx.gameover ? 'pointer' : 'default',
          backgroundColor: isWinner ? themeConfig.colors.success : 'white'
        }}
      >
        <AnimatePresence>
          {value && (
            <motion.div
              className={`cell-value ${value === '0' ? 'player-x' : 'player-o'}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              style={{
                color: value === '0' ? themeConfig.colors.player1 : themeConfig.colors.player2
              }}
            >
              {value === '0' ? '✕' : '○'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="tictactoe-board">
      <div className="game-status">
        {ctx.gameover ? (
          <div className="status-message game-over">
            {ctx.gameover.winner === playerID && "🎉 You Won! 🎉"}
            {ctx.gameover.winner === '1' && "🐕 Daisy Won! 🐕"}
            {ctx.gameover.draw && "🤝 It's a Draw! 🤝"}
          </div>
        ) : (
          <div className="status-message">
            {ctx.currentPlayer === playerID ? (
              <span>Your Turn! <span style={{ color: themeConfig.colors.player1 }}>✕</span></span>
            ) : (
              <span>Daisy's Turn! <span style={{ color: themeConfig.colors.player2 }}>○</span></span>
            )}
          </div>
        )}
      </div>

      <div className="player-legend">
        <div className="legend-item">
          <span className="legend-symbol" style={{ color: themeConfig.colors.player1 }}>✕</span>
          <span className="legend-label">You</span>
        </div>
        <div className="legend-divider">vs</div>
        <div className="legend-item">
          <span className="legend-symbol" style={{ color: themeConfig.colors.player2 }}>○</span>
          <span className="legend-paw">🐾</span>
          <span className="legend-label">Daisy</span>
        </div>
      </div>

      <div className="ttt-grid">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderCell)}
      </div>

      {thinking && (
        <div className="thinking-indicator">
          <span className="daisy-icon">🐕</span>
          <span className="thinking-text">Daisy is thinking...</span>
        </div>
      )}
    </div>
  );
};

const TicTacToe = ({ onExit, onGameEnd }) => {
  const { themeConfig } = useGameTheme();
  const [gameEvents, setGameEvents] = useState([]);
  const aiMovesRef = useRef(null);

  const handleGameEvent = (eventType, data) => {
    setGameEvents(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
  };

  const BoardWrapper = (props) => {
    if (props.playerID === '1') {
      aiMovesRef.current = props.moves;
      return null;
    }
    
    return (
      <TicTacToeBoard 
        {...props} 
        onGameEvent={handleGameEvent}
        themeConfig={themeConfig}
        aiMoves={aiMovesRef.current}
      />
    );
  };

  const TicTacToeClient = Client({
    game: TicTacToeGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 2,
    debug: false
  });

  return (
    <>
      <TicTacToeClient playerID="0" matchID="local" />
      <div style={{ display: 'none' }}>
        <TicTacToeClient playerID="1" matchID="local" />
      </div>
    </>
  );
};

export default TicTacToe;
