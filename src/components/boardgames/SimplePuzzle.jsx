import React, { useEffect, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { SimplePuzzleGame, GRID_SIZE } from '../../services/boardgames/SimplePuzzleGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import GameVoiceInstructions from '../../services/GameVoiceInstructions.js';
import './SimplePuzzle.css';

const SimplePuzzleBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig }) => {
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  useEffect(() => {
    if (ctx.gameover) {
      if (ctx.gameover.winner === playerID) {
        onGameEvent?.(GAME_EVENT_TYPE.WIN);
      }
    }
  }, [ctx.gameover]);

  const handleDragStart = (index) => {
    if (ctx.gameover) return;
    
    setDraggedPiece(G.board[index]);
    setDraggedFrom(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (toIndex) => {
    if (draggedFrom === null || draggedFrom === toIndex) {
      setDraggedPiece(null);
      setDraggedFrom(null);
      return;
    }

    moves.placePiece(draggedFrom, toIndex);
    onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
    
    setDraggedPiece(null);
    setDraggedFrom(null);
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    setDraggedFrom(null);
  };

  const handleTouchStart = (index) => {
    if (ctx.gameover) return;
    setDraggedFrom(index);
    setDraggedPiece(G.board[index]);
  };

  const handleTouchEnd = (toIndex) => {
    if (draggedFrom === null || draggedFrom === toIndex || ctx.gameover) {
      setDraggedPiece(null);
      setDraggedFrom(null);
      return;
    }

    moves.placePiece(draggedFrom, toIndex);
    onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
    
    setDraggedPiece(null);
    setDraggedFrom(null);
  };

  const renderPuzzlePiece = (piece, index) => {
    if (!piece) {
      return (
        <div
          key={`empty-${index}`}
          className="puzzle-slot empty"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
        />
      );
    }

    const isCorrectPosition = piece.correctPos === index;
    const isDragging = draggedFrom === index;
    
    const pieceSize = 100;
    const backgroundPositionX = -(piece.col * pieceSize);
    const backgroundPositionY = -(piece.row * pieceSize);

    return (
      <motion.div
        key={piece.id}
        className={`puzzle-piece ${isCorrectPosition ? 'correct' : ''} ${isDragging ? 'dragging' : ''}`}
        draggable={!ctx.gameover}
        onDragStart={() => handleDragStart(index)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(index)}
        onTouchStart={() => handleTouchStart(index)}
        onTouchEnd={() => handleTouchEnd(index)}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: isDragging ? 0.9 : 1, 
          rotate: 0,
          opacity: isDragging ? 0.5 : 1
        }}
        whileHover={{ scale: ctx.gameover ? 1 : 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
        style={{ 
          backgroundImage: `url(${G.imageUrl})`,
          backgroundSize: '300px 300px',
          backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`,
          backgroundRepeat: 'no-repeat',
          border: '2px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          touchAction: 'none'
        }}
      >
        {isCorrectPosition && (
          <motion.div
            className="check-mark"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            ✓
          </motion.div>
        )}
      </motion.div>
    );
  };

  const progressPercentage = Math.round((G.correctPieces / (GRID_SIZE * GRID_SIZE)) * 100);

  return (
    <div className="simplepuzzle-board">
      <div className="game-status">
        {ctx.gameover ? (
          <motion.div
            className="status-message game-over"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            🎉 Puzzle Complete! 🎉
          </motion.div>
        ) : (
          <div className="status-message">
            <span>Drag pieces to the correct spots! 🧩</span>
          </div>
        )}
      </div>

      <div className="puzzle-stats">
        <div className="stat">
          <span className="stat-label">Moves:</span>
          <span className="stat-value">{G.moveCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Progress:</span>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: 'spring' }}
              style={{ backgroundColor: themeConfig.colors.success }}
            >
              {progressPercentage}%
            </motion.div>
          </div>
        </div>
      </div>

      <div className="puzzle-grid">
        {G.board.map((piece, index) => (
          <div key={index} className="puzzle-slot">
            {renderPuzzlePiece(piece, index)}
          </div>
        ))}
      </div>

      {!ctx.gameover && (
        <div className="puzzle-hint">
          <span>💡 Tip: Drag pieces to rebuild the picture!</span>
        </div>
      )}
    </div>
  );
};

const SimplePuzzle = ({ onExit, onGameEnd, gameKey = 0 }) => {
  const { themeConfig } = useGameTheme();
  const [gameEvents, setGameEvents] = useState([]);

  const handleGameEvent = (eventType, data) => {
    setGameEvents(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
  };

  const BoardWrapper = (props) => (
    <SimplePuzzleBoard 
      {...props} 
      onGameEvent={handleGameEvent}
      themeConfig={themeConfig}
    />
  );

  const SimplePuzzleClient = Client({
    game: SimplePuzzleGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 1
  });

  return <SimplePuzzleClient key={`puzzle-${gameKey}`} playerID="0" matchID={`local-${gameKey}`} />;
};

export default SimplePuzzle;
