import React, { useEffect, useRef, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckersGame, BOARD_SIZE, getValidMoves } from '../../services/boardgames/CheckersGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import DaisyAIOpponent from '../../services/boardgames/DaisyAIOpponent.js';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import './Checkers.css';

const CheckersBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig }) => {
  const processingRef = useRef(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  useEffect(() => {
    const isAITurn = ctx.currentPlayer === '1';
    
    if (isAITurn && !ctx.gameover && !processingRef.current) {
      processingRef.current = true;
      
      const makeAIMove = async () => {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const validMoves = getValidMoves(G.board, ctx.currentPlayer);
        
        if (validMoves.length > 0) {
          const move = await DaisyAIOpponent.makeMove(G, validMoves, 'CHECKERS');
          
          processingRef.current = false;
          
          if (move && move.from && move.to) {
            moves.movePiece(move.from, move.to, move.captures || []);
            onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
            
            if (move.captures && move.captures.length > 0) {
              onGameEvent?.(GAME_EVENT_TYPE.GOOD_MOVE);
            }
          }
        } else {
          processingRef.current = false;
        }
      };
      
      makeAIMove();
    }
  }, [ctx.currentPlayer, ctx.gameover]);

  useEffect(() => {
    if (ctx.gameover) {
      if (ctx.gameover.winner === playerID) {
        onGameEvent?.(GAME_EVENT_TYPE.WIN);
      } else if (ctx.gameover.winner) {
        onGameEvent?.(GAME_EVENT_TYPE.LOSE);
      }
    }
  }, [ctx.gameover]);

  useEffect(() => {
    if (selectedPiece && ctx.currentPlayer === playerID) {
      const moves = getValidMoves(G.board, playerID);
      const pieceMoves = moves.filter(
        m => m.from.row === selectedPiece.row && m.from.col === selectedPiece.col
      );
      setValidMoves(pieceMoves);
    } else {
      setValidMoves([]);
    }
  }, [selectedPiece, G.board]);

  const handleCellClick = (row, col) => {
    if (ctx.currentPlayer !== playerID || ctx.gameover || processingRef.current) return;
    
    const piece = G.board[row][col];
    
    if (selectedPiece) {
      const moveToTarget = validMoves.find(m => m.to.row === row && m.to.col === col);
      
      if (moveToTarget) {
        moves.movePiece(moveToTarget.from, moveToTarget.to, moveToTarget.captures || []);
        setSelectedPiece(null);
        setValidMoves([]);
        onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
        
        if (moveToTarget.captures && moveToTarget.captures.length > 0) {
          onGameEvent?.(GAME_EVENT_TYPE.GOOD_MOVE);
        }
      } else if (piece && piece.player === playerID) {
        setSelectedPiece({ row, col });
      } else {
        setSelectedPiece(null);
      }
    } else if (piece && piece.player === playerID) {
      setSelectedPiece({ row, col });
    }
  };

  const isValidMoveTarget = (row, col) => {
    return validMoves.some(m => m.to.row === row && m.to.col === col);
  };

  const renderCell = (row, col) => {
    const isDark = (row + col) % 2 === 1;
    const piece = G.board[row][col];
    const isSelected = selectedPiece && selectedPiece.row === row && selectedPiece.col === col;
    const isValidTarget = isValidMoveTarget(row, col);
    const isLastMove = G.lastMove && 
      ((G.lastMove.from.row === row && G.lastMove.from.col === col) ||
       (G.lastMove.to.row === row && G.lastMove.to.col === col));
    
    return (
      <div
        key={`${row}-${col}`}
        className={`checker-cell ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isLastMove ? 'last-move' : ''}`}
        onClick={() => handleCellClick(row, col)}
      >
        {isValidTarget && (
          <motion.div
            className="move-indicator"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        )}
        
        <AnimatePresence>
          {piece && (
            <motion.div
              className={`checker-piece player-${piece.player} ${piece.king ? 'king' : ''}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: piece.player === playerID ? 1.1 : 1 }}
              style={{
                backgroundColor: piece.player === '0' ? themeConfig.colors.player1 : themeConfig.colors.player2
              }}
            >
              {piece.king && <span className="king-crown">👑</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="checkers-board">
      <div className="game-status">
        {ctx.gameover ? (
          <div className="status-message game-over">
            {ctx.gameover.winner === playerID && "🎉 You Won! 🎉"}
            {ctx.gameover.winner === '1' && "🐕 Daisy Won! 🐕"}
          </div>
        ) : (
          <div className="status-message">
            {ctx.currentPlayer === playerID ? (
              <span>Your Turn! Select a piece to move!</span>
            ) : (
              <span>Daisy's Turn! 🐕</span>
            )}
          </div>
        )}
      </div>

      <div className="checkers-grid">
        {Array.from({ length: BOARD_SIZE }, (_, row) => (
          <div key={row} className="checker-row">
            {Array.from({ length: BOARD_SIZE }, (_, col) => renderCell(row, col))}
          </div>
        ))}
      </div>

      {selectedPiece && validMoves.length > 0 && (
        <div className="move-hint">
          <span>{validMoves.length} move{validMoves.length > 1 ? 's' : ''} available</span>
        </div>
      )}
    </div>
  );
};

const Checkers = ({ onExit, onGameEnd }) => {
  const { themeConfig } = useGameTheme();
  const [gameEvents, setGameEvents] = useState([]);

  const handleGameEvent = (eventType, data) => {
    setGameEvents(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
  };

  const BoardWrapper = (props) => (
    <CheckersBoard 
      {...props} 
      onGameEvent={handleGameEvent}
      themeConfig={themeConfig}
    />
  );

  const CheckersClient = Client({
    game: CheckersGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 2
  });

  return <CheckersClient playerID="0" />;
};

export default Checkers;
