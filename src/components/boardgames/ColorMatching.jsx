import React, { useEffect, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { ColorMatchingGame, COLORS } from '../../services/boardgames/ColorMatchingGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import GameVoiceInstructions from '../../services/GameVoiceInstructions.js';
import './ColorMatching.css';

const ColorMatchingBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig }) => {
  const [activeColor, setActiveColor] = useState(null);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    if (G.showingSequence && G.sequence.length > 0) {
      let index = 0;
      const showSequence = () => {
        if (index < G.sequence.length) {
          setActiveColor(G.sequence[index]);
          setTimeout(() => {
            setActiveColor(null);
            setTimeout(() => {
              index++;
              showSequence();
            }, 300);
          }, 600);
        } else {
          setTimeout(() => {
            moves.startPlaying();
          }, 500);
        }
      };
      showSequence();
    }
  }, [G.showingSequence, G.sequence, G.level]);

  useEffect(() => {
    if (ctx.gameover && ctx.gameover.winner === playerID) {
      onGameEvent?.(GAME_EVENT_TYPE.WIN);
    }
  }, [ctx.gameover]);

  const handleColorClick = (colorId) => {
    if (G.showingSequence || ctx.gameover) return;
    
    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 300);
    
    moves.selectColor(colorId);
    onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
  };

  return (
    <div className="colormatching-board">
      <div className="game-status">
        {ctx.gameover ? (
          <motion.div
            className="status-message game-over"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🎉 You Won! Perfect Memory! 🎉
          </motion.div>
        ) : (
          <div className="status-message">
            {G.showingSequence ? (
              <span>👀 Watch the Pattern!</span>
            ) : (
              <span>🎯 Your Turn - Repeat It!</span>
            )}
          </div>
        )}
      </div>

      <div className="color-stats">
        <div className="stat">
          <span className="stat-label">Level:</span>
          <span className="stat-value">{G.level}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{G.score}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Sequence:</span>
          <span className="stat-value">{G.sequence.length}</span>
        </div>
      </div>

      <div className="color-grid">
        {COLORS.map(color => (
          <motion.button
            key={color.id}
            className={`color-button ${activeColor === color.id ? 'active' : ''}`}
            style={{
              backgroundColor: color.value,
              opacity: activeColor === color.id ? 1 : 0.6
            }}
            onClick={() => handleColorClick(color.id)}
            disabled={G.showingSequence || ctx.gameover}
            whileHover={{ scale: G.showingSequence ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: activeColor === color.id ? 1.1 : 1,
              boxShadow: activeColor === color.id 
                ? '0 0 30px rgba(255, 255, 255, 0.8)'
                : '0 4px 8px rgba(0, 0, 0, 0.2)'
            }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="color-name">{color.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="progress-indicator">
        {G.playerSequence.map((colorId, index) => {
          const color = COLORS.find(c => c.id === colorId);
          return (
            <motion.div
              key={index}
              className="progress-dot"
              style={{ backgroundColor: color.value }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            />
          );
        })}
      </div>
    </div>
  );
};

const ColorMatching = ({ onExit, onGameEnd }) => {
  const { themeConfig } = useGameTheme();
  const [gameEvents, setGameEvents] = useState([]);

  useEffect(() => {
    GameVoiceInstructions.playInstructions('COLOR_MATCHING');
    
    return () => {
      GameVoiceInstructions.stop();
    };
  }, []);

  const handleGameEvent = (eventType, data) => {
    setGameEvents(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
  };

  const BoardWrapper = (props) => (
    <ColorMatchingBoard 
      {...props} 
      onGameEvent={handleGameEvent}
      themeConfig={themeConfig}
    />
  );

  const ColorMatchingClient = Client({
    game: ColorMatchingGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 1
  });

  return <ColorMatchingClient playerID="0" />;
};

export default ColorMatching;
