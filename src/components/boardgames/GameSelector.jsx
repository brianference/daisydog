import React from 'react';
import { motion } from 'framer-motion';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import { BOARD_GAME_TYPES, BOARD_GAME_INFO } from '../../types/boardGameTypes.js';
import ThemeToggle from './ThemeToggle.jsx';
import './GameSelector.css';

const GameSelector = ({ onSelectGame, onClose, className = '' }) => {
  const { themeConfig } = useGameTheme();

  const games = Object.values(BOARD_GAME_TYPES).map(gameType => ({
    type: gameType,
    ...BOARD_GAME_INFO[gameType]
  }));

  const handleGameClick = (gameType) => {
    if (onSelectGame) {
      onSelectGame(gameType);
    }
  };

  const containerStyle = {
    '--theme-primary': themeConfig.colors.primary,
    '--theme-background': themeConfig.colors.background,
    '--theme-board-bg': themeConfig.colors.boardBg,
    '--theme-text': themeConfig.colors.text,
    '--theme-border-radius': themeConfig.borderRadius,
    '--theme-shadow': themeConfig.shadows.medium,
    '--theme-font': themeConfig.fonts.primary
  };

  return (
    <motion.div
      className={`game-selector ${className}`}
      style={containerStyle}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="selector-header">
        <h2 className="selector-title">🎮 Choose a Game to Play!</h2>
        <div className="selector-controls">
          <ThemeToggle />
          {onClose && (
            <motion.button
              className="close-btn"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close game selector"
            >
              ❌
            </motion.button>
          )}
        </div>
      </div>

      <div className="games-grid">
        {games.map((game, index) => (
          <motion.div
            key={game.type}
            className="game-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' 
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGameClick(game.type)}
          >
            <div className="game-emoji">{game.emoji}</div>
            <h3 className="game-title">{game.title}</h3>
            <p className="game-description">{game.description}</p>
            <div className="game-meta">
              <span className="game-age">Ages {game.minAge}-{game.maxAge}</span>
              <span className="game-time">{game.estimatedTime}</span>
            </div>
            <div className={`game-difficulty difficulty-${game.difficulty}`}>
              {game.difficulty.toUpperCase()}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="selector-footer">
        <p className="daisy-hint">🐕 Pick a game and I'll play with you!</p>
      </div>
    </motion.div>
  );
};

export default GameSelector;
