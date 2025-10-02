import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import DaisyCheerleader from '../../services/boardgames/DaisyCheerleader.js';
import { GAME_EVENT_TYPE, GAME_STATUS } from '../../types/boardGameTypes.js';
import { useSoundSystem } from '../../hooks/useSoundSystem.js';
import MusicService from '../../services/MusicService.js';
import ElevenLabsService from '../../services/ElevenLabsService.js';
import GameVoiceInstructions from '../../services/GameVoiceInstructions.js';
import GameInstructions from './GameInstructions.jsx';
import confetti from 'canvas-confetti';
import './GameContainer.css';

const GameContainer = ({
  children,
  gameType,
  gameStatus,
  currentPlayer,
  score,
  onExit,
  onRestart,
  showDaisyMessages = true,
  className = '',
  gameName = '',
  instructions = null
}) => {
  const { themeConfig } = useGameTheme();
  const { playSound } = useSoundSystem();
  const [daisyMessage, setDaisyMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const showDaisyCheer = (eventType, context = {}) => {
    if (!showDaisyMessages) return;

    const message = DaisyCheerleader.getMessage(eventType, context);
    setDaisyMessage(message);
    setShowMessage(true);

    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const triggerConfetti = (intensity = 'medium') => {
    const configs = {
      small: {
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      },
      medium: {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      },
      large: {
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        scalar: 1.2
      }
    };

    const config = configs[intensity] || configs.medium;
    confetti(config);
  };

  const handleGameEvent = (eventType, data = {}) => {
    showDaisyCheer(eventType, data);

    if (eventType === GAME_EVENT_TYPE.WIN) {
      triggerConfetti('large');
      playSound('games', 'victory');
      playSound('dog', 'victoryBark');
    } else if (eventType === GAME_EVENT_TYPE.LOSE) {
      playSound('dog', 'sadWhimper');
    } else if (eventType === GAME_EVENT_TYPE.MATCH_FOUND || eventType === GAME_EVENT_TYPE.GOOD_MOVE) {
      triggerConfetti('small');
      playSound('ui', 'success');
    } else if (eventType === GAME_EVENT_TYPE.MOVE_MADE) {
      playSound('ui', 'buttonClick');
    } else if (eventType === GAME_EVENT_TYPE.GAME_START) {
      playSound('ui', 'gameStart');
      playSound('dog', 'excitedBark');
    }
  };

  useEffect(() => {
    if (gameStatus === GAME_STATUS.PLAYING) {
      handleGameEvent(GAME_EVENT_TYPE.GAME_START);
    }
  }, [gameStatus]);

  useEffect(() => {
    let musicTimeout = null;
    
    const initAudio = async () => {
      if (gameType) {
        await GameVoiceInstructions.playInstructions(gameType);
        
        // 5-second delay after voice instructions before music starts
        musicTimeout = setTimeout(() => {
          MusicService.play();
        }, 5000);
      }
    };
    
    initAudio();
    
    return () => {
      if (musicTimeout) {
        clearTimeout(musicTimeout);
      }
      GameVoiceInstructions.stop();
      MusicService.stop();
    };
  }, [gameType]);

  const handleMuteToggle = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      MusicService.mute();
      ElevenLabsService.mute();
    } else {
      MusicService.unmute();
      ElevenLabsService.unmute();
    }
  };

  const containerStyle = {
    '--theme-primary': themeConfig.colors.primary,
    '--theme-secondary': themeConfig.colors.secondary,
    '--theme-accent': themeConfig.colors.accent,
    '--theme-background': themeConfig.colors.background,
    '--theme-board-bg': themeConfig.colors.boardBg,
    '--theme-text': themeConfig.colors.text,
    '--theme-border-radius': themeConfig.borderRadius,
    '--theme-shadow': themeConfig.shadows.medium,
    '--theme-font': themeConfig.fonts.primary
  };

  return (
    <div className={`game-container ${className}`} style={containerStyle}>
      <div className="game-header">
        <div className="game-controls">
          {instructions && <GameInstructions gameName={gameName} instructions={instructions} />}
          <motion.button
            className="game-btn game-btn-icon"
            onClick={handleMuteToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? '🔇' : '🔊'}
          </motion.button>
          <motion.button
            className="game-btn game-btn-secondary"
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Restart
          </motion.button>
          <motion.button
            className="game-btn game-btn-danger"
            onClick={onExit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ❌ Exit
          </motion.button>
        </div>
        
        {(score !== undefined && score !== null) && (
          <div className="game-score">
            <span className="score-label">Score:</span>
            <span className="score-value">{score}</span>
          </div>
        )}
      </div>

      <div className="game-board-wrapper">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onGameEvent: handleGameEvent,
              themeConfig
            });
          }
          return child;
        })}
      </div>

      <AnimatePresence>
        {showMessage && daisyMessage && (
          <motion.div
            className="daisy-cheer-message"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ 
              type: 'spring', 
              stiffness: 500, 
              damping: 25 
            }}
          >
            <div className={`cheer-content mood-${daisyMessage.mood}`}>
              <span className="daisy-avatar">🐕</span>
              <span className="cheer-text">{daisyMessage.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameContainer;
