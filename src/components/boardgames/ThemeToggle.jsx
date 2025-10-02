import React from 'react';
import { motion } from 'framer-motion';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
  const { isColorful, toggleTheme, themeConfig } = useGameTheme();

  return (
    <motion.button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle game theme"
      title={`Switch to ${isColorful ? 'Modern' : 'Colorful'} theme`}
    >
      <motion.div
        className="toggle-track"
        style={{
          backgroundColor: isColorful ? '#FFD93D' : '#2196F3'
        }}
      >
        <motion.div
          className="toggle-thumb"
          animate={{
            x: isColorful ? 0 : 32
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isColorful ? '🎨' : '✨'}
        </motion.div>
      </motion.div>
      <span className="toggle-label">
        {isColorful ? 'Colorful' : 'Modern'}
      </span>
    </motion.button>
  );
};

export default ThemeToggle;
