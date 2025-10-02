import React, { createContext, useContext, useState, useEffect } from 'react';

const GameThemeContext = createContext();

export const THEME_TYPES = {
  COLORFUL: 'colorful',
  MODERN: 'modern'
};

export const THEME_CONFIG = {
  colorful: {
    name: 'Colorful & Playful',
    colors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#4ECDC4',
      success: '#95E1D3',
      warning: '#FFD93D',
      danger: '#FF6B6B',
      background: '#FFF8E7',
      boardBg: '#FFFFFF',
      text: '#2C3E50',
      textLight: '#7F8C8D',
      player1: '#FF6B35',
      player2: '#4ECDC4',
      neutral: '#BDC3C7'
    },
    fonts: {
      primary: "'Comic Neue', 'Comic Sans MS', cursive",
      display: "'Fredoka One', cursive"
    },
    borderRadius: '20px',
    shadows: {
      small: '0 4px 6px rgba(0, 0, 0, 0.1)',
      medium: '0 8px 16px rgba(0, 0, 0, 0.15)',
      large: '0 12px 24px rgba(0, 0, 0, 0.2)'
    },
    animations: {
      duration: '0.3s',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  modern: {
    name: 'Modern & Clean',
    colors: {
      primary: '#2196F3',
      secondary: '#00BCD4',
      accent: '#673AB7',
      success: '#4CAF50',
      warning: '#FF9800',
      danger: '#F44336',
      background: '#FAFAFA',
      boardBg: '#FFFFFF',
      text: '#212121',
      textLight: '#757575',
      player1: '#2196F3',
      player2: '#E91E63',
      neutral: '#9E9E9E'
    },
    fonts: {
      primary: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      display: "'Poppins', sans-serif"
    },
    borderRadius: '8px',
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.08)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
      large: '0 8px 16px rgba(0, 0, 0, 0.16)'
    },
    animations: {
      duration: '0.2s',
      bounce: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

export const GameThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return THEME_TYPES.MODERN;
    const saved = localStorage.getItem('daisydog-game-theme');
    return saved || THEME_TYPES.MODERN;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('daisydog-game-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => 
      prev === THEME_TYPES.COLORFUL ? THEME_TYPES.MODERN : THEME_TYPES.COLORFUL
    );
  };

  const currentThemeConfig = THEME_CONFIG[theme];

  const value = {
    theme,
    themeConfig: currentThemeConfig,
    toggleTheme,
    isColorful: theme === THEME_TYPES.COLORFUL,
    isModern: theme === THEME_TYPES.MODERN
  };

  return (
    <GameThemeContext.Provider value={value}>
      {children}
    </GameThemeContext.Provider>
  );
};

export const useGameTheme = () => {
  const context = useContext(GameThemeContext);
  if (!context) {
    throw new Error('useGameTheme must be used within GameThemeProvider');
  }
  return context;
};

export default GameThemeContext;
