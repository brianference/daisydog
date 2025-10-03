import React, { useEffect, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { WordScrambleGame } from '../../services/boardgames/WordScrambleGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import GameVoiceInstructions from '../../services/GameVoiceInstructions.js';
import './WordScramble.css';

const WordScrambleBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig }) => {
  const [showCorrectMessage, setShowCorrectMessage] = useState(false);

  useEffect(() => {
    console.log('🔤 Word Scramble Board State Update:', {
      targetWord: G.targetWord,
      wordsCompleted: G.wordsCompleted,
      scrambledLetters: G.scrambledLetters,
      hint: G.hint
    });
  }, [G.targetWord, G.wordsCompleted]);

  useEffect(() => {
    if (ctx.gameover && ctx.gameover.winner === playerID) {
      onGameEvent?.(GAME_EVENT_TYPE.WIN);
    }
  }, [ctx.gameover]);

  useEffect(() => {
    if (G.lastWordCorrect === true) {
      setShowCorrectMessage(true);
      onGameEvent?.(GAME_EVENT_TYPE.GOOD_MOVE, { score: G.score });
      
      setTimeout(() => {
        setShowCorrectMessage(false);
      }, 2000);
    } else if (G.lastWordCorrect === false) {
      onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
    }
  }, [G.lastWordCorrect]);

  const handleLetterClick = (index) => {
    if (ctx.gameover) return;
    
    moves.selectLetter(index);
  };

  const handleClear = () => {
    if (ctx.gameover) return;
    moves.clearWord();
  };

  const isLetterSelected = (index) => {
    return G.selectedLetters.some(item => item.index === index);
  };

  return (
    <div className="wordscramble-board">
      <AnimatePresence>
        {showCorrectMessage && (
          <motion.div
            className="correct-message"
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px 40px',
              borderRadius: '20px',
              fontSize: '28px',
              fontWeight: 'bold',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}
          >
            ✨ Correct! ✨
          </motion.div>
        )}
      </AnimatePresence>

      <div className="game-status">
        {ctx.gameover ? (
          <motion.div
            className="status-message game-over"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🎉 Word Master! 🎉
          </motion.div>
        ) : (
          <div className="status-message">
            <span>🔤 Unscramble the Word!</span>
          </div>
        )}
      </div>

      <div className="word-stats">
        <div className="stat">
          <span className="stat-label">Words:</span>
          <span className="stat-value">{G.wordsCompleted}/5</span>
        </div>
        <div className="stat">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{G.score}</span>
        </div>
      </div>

      <div className="hint-box">
        <div className="hint-label">Hint:</div>
        <div className="hint-text">{G.hint}</div>
      </div>

      <div className="answer-area">
        <div className="answer-label">Your Answer:</div>
        <div className="answer-letters">
          <AnimatePresence>
            {G.selectedLetters.map((item, index) => (
              <motion.div
                key={`selected-${item.index}`}
                className="answer-letter"
                initial={{ scale: 0, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 50 }}
                style={{ backgroundColor: themeConfig.colors.primary }}
              >
                {item.letter}
              </motion.div>
            ))}
          </AnimatePresence>
          {G.selectedLetters.length === 0 && (
            <div className="answer-placeholder">Click letters below...</div>
          )}
        </div>
      </div>

      <div className="scrambled-letters">
        {G.scrambledLetters.map((letter, index) => (
          <motion.button
            key={`${G.wordsCompleted}-${letter}-${index}`}
            className={`scrambled-letter ${isLetterSelected(index) ? 'selected' : ''}`}
            onClick={() => handleLetterClick(index)}
            disabled={isLetterSelected(index) || ctx.gameover}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: isLetterSelected(index) ? 0.8 : 1, 
              rotate: 0,
              opacity: isLetterSelected(index) ? 0.3 : 1
            }}
            whileHover={{ scale: isLetterSelected(index) ? 0.8 : 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ delay: index * 0.1 }}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {G.selectedLetters.length > 0 && !ctx.gameover && (
        <motion.button
          className="clear-button"
          onClick={handleClear}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ backgroundColor: themeConfig.colors.accent }}
        >
          Clear 🔄
        </motion.button>
      )}
    </div>
  );
};

const WordScramble = ({ onExit, onGameEnd, gameKey }) => {
  const { themeConfig } = useGameTheme();
  const [gameEvents, setGameEvents] = useState([]);

  const handleGameEvent = (eventType, data) => {
    setGameEvents(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
  };

  const BoardWrapper = (props) => (
    <WordScrambleBoard 
      {...props} 
      onGameEvent={handleGameEvent}
      themeConfig={themeConfig}
    />
  );

  const WordScrambleClient = Client({
    game: WordScrambleGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 1
  });

  return <WordScrambleClient key={gameKey} playerID="0" />;
};

export default WordScramble;
