import React, { useEffect, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { PatternBuilderGame, SHAPES } from '../../services/boardgames/PatternBuilderGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import './PatternBuilder.css';

const PatternBuilderBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig }) => {
  const [showingPatternTimeout, setShowingPatternTimeout] = useState(null);

  useEffect(() => {
    if (G.showingPattern) {
      const timeout = setTimeout(() => {
        moves.startBuilding();
      }, 3000 + G.targetPattern.length * 500);
      setShowingPatternTimeout(timeout);
      
      return () => clearTimeout(timeout);
    }
  }, [G.showingPattern, G.targetPattern, G.level]);

  useEffect(() => {
    if (ctx.gameover && ctx.gameover.winner === playerID) {
      onGameEvent?.(GAME_EVENT_TYPE.WIN);
    }
  }, [ctx.gameover]);

  const handleShapeClick = (shape) => {
    if (G.showingPattern || ctx.gameover) return;
    
    moves.placeShape({ shape });
    onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
  };

  const handleClear = () => {
    if (G.showingPattern || ctx.gameover) return;
    moves.clearPattern();
  };

  return (
    <div className="patternbuilder-board">
      <div className="game-status">
        {ctx.gameover ? (
          <motion.div
            className="status-message game-over"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🎉 Pattern Master! 🎉
          </motion.div>
        ) : (
          <div className="status-message">
            {G.showingPattern ? (
              <span>👀 Memorize the Pattern!</span>
            ) : (
              <span>🎨 Build the Pattern!</span>
            )}
          </div>
        )}
      </div>

      <div className="pattern-stats">
        <div className="stat">
          <span className="stat-label">Level:</span>
          <span className="stat-value">{G.level}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{G.score}</span>
        </div>
      </div>

      {G.showingPattern && (
        <motion.div
          className="target-pattern"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="pattern-label">Target Pattern:</div>
          <div className="pattern-sequence">
            <AnimatePresence>
              {G.targetPattern.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="pattern-item"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {item.shape}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {!G.showingPattern && (
        <>
          <div className="player-pattern">
            <div className="pattern-label">Your Pattern:</div>
            <div className="pattern-sequence">
              <AnimatePresence>
                {G.playerPattern.map((item, index) => (
                  <motion.div
                    key={index}
                    className="pattern-item"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    {item.shape}
                  </motion.div>
                ))}
              </AnimatePresence>
              {G.playerPattern.length === 0 && (
                <div className="pattern-placeholder">Click shapes below...</div>
              )}
            </div>
          </div>

          <div className="shape-palette">
            {SHAPES.map(shape => (
              <motion.button
                key={shape}
                className="shape-button"
                onClick={() => handleShapeClick(shape)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={ctx.gameover}
              >
                {shape}
              </motion.button>
            ))}
          </div>

          <motion.button
            className="clear-button"
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ backgroundColor: themeConfig.colors.accent }}
          >
            Clear 🔄
          </motion.button>
        </>
      )}
    </div>
  );
};

const PatternBuilder = ({ onExit, onGameEnd }) => {
  const { themeConfig } = useGameTheme();
  const [gameEvents, setGameEvents] = useState([]);

  const handleGameEvent = (eventType, data) => {
    setGameEvents(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
  };

  const BoardWrapper = (props) => (
    <PatternBuilderBoard 
      {...props} 
      onGameEvent={handleGameEvent}
      themeConfig={themeConfig}
    />
  );

  const PatternBuilderClient = Client({
    game: PatternBuilderGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 1
  });

  return <PatternBuilderClient playerID="0" />;
};

export default PatternBuilder;
