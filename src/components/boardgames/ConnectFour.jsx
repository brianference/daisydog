import React, { useEffect, useRef, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectFourGame, ROWS, COLS } from '../../services/boardgames/ConnectFourGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import DaisyAIOpponent from '../../services/boardgames/DaisyAIOpponent.js';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import './ConnectFour.css';

const ConnectFourBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig, aiMoves }) => {
  const processingRef = useRef(false);
  const [dropAnimation, setDropAnimation] = useState(null);

  useEffect(() => {
    const isAITurn = ctx.currentPlayer === '1';
    
    if (isAITurn && !ctx.gameover && !processingRef.current) {
      processingRef.current = true;
      
      const makeAIMove = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const validMoves = [];
        for (let col = 0; col < COLS; col++) {
          let hasSpace = false;
          for (let row = ROWS - 1; row >= 0; row--) {
            if (G.cells[row][col] === null) {
              hasSpace = true;
              break;
            }
          }
          if (hasSpace) {
            validMoves.push({ col });
          }
        }
        
        if (validMoves.length > 0) {
          const move = await DaisyAIOpponent.makeMove(G, validMoves, 'CONNECT_FOUR');
          
          processingRef.current = false;
          
          if (move && move.col !== undefined && aiMoves && aiMoves.dropToken) {
            aiMoves.dropToken(move.col);
            onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
          }
        } else {
          processingRef.current = false;
        }
      };
      
      makeAIMove();
    }
  }, [ctx.currentPlayer, ctx.gameover, ctx.turn, G.cells]);

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

  const handleColumnClick = (col) => {
    if (ctx.currentPlayer !== playerID) return;
    if (ctx.gameover) return;
    if (processingRef.current) return;
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (G.cells[row][col] === null) {
        moves.dropToken(col);
        onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
        break;
      }
    }
  };

  const isWinningCell = (row, col) => {
    if (!G.winningLine) return false;
    return G.winningLine.some(cell => cell.row === row && cell.col === col);
  };

  const renderCell = (row, col) => {
    const value = G.cells[row][col];
    const isWinner = isWinningCell(row, col);
    const isLastMove = G.lastMove && G.lastMove.row === row && G.lastMove.col === col;
    
    return (
      <div
        key={`${row}-${col}`}
        className={`c4-cell ${isWinner ? 'winning' : ''}`}
        style={{
          backgroundColor: isWinner ? themeConfig.colors.success : '#2C3E50'
        }}
      >
        <AnimatePresence>
          {value !== null && (
            <motion.div
              className={`token player-${value}`}
              initial={{ y: -500, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
                mass: 1
              }}
              style={{
                backgroundColor: value === '0' ? themeConfig.colors.player1 : themeConfig.colors.player2
              }}
            >
              {isLastMove && (
                <motion.div
                  className="last-move-indicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  ⭐
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="connectfour-board">
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
              <span>Your Turn! Drop your token! 🔴</span>
            ) : (
              <span>Daisy's Turn! 🐕</span>
            )}
          </div>
        )}
      </div>

      <div className="c4-grid">
        {Array.from({ length: COLS }, (_, col) => (
          <div
            key={col}
            className="c4-column"
            onClick={() => handleColumnClick(col)}
          >
            <div className="column-indicator">
              {ctx.currentPlayer === playerID && !ctx.gameover && (
                <motion.div
                  className="drop-hint"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  ⬇️
                </motion.div>
              )}
            </div>
            {Array.from({ length: ROWS }, (_, row) => renderCell(row, col))}
          </div>
        ))}
      </div>
    </div>
  );
};

const ConnectFour = ({ onExit, onGameEnd }) => {
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
      <ConnectFourBoard 
        {...props} 
        onGameEvent={handleGameEvent}
        themeConfig={themeConfig}
        aiMoves={aiMovesRef.current}
      />
    );
  };

  const ConnectFourClient = Client({
    game: ConnectFourGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 2,
    debug: false
  });

  return (
    <>
      <ConnectFourClient playerID="0" matchID="local" />
      <div style={{ display: 'none' }}>
        <ConnectFourClient playerID="1" matchID="local" />
      </div>
    </>
  );
};

export default ConnectFour;
