import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GameInstructions.css';

const GameInstructions = ({ gameName, instructions }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <>
      <motion.button
        className="instructions-btn"
        onClick={() => setShowInstructions(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="How to Play"
      >
        ℹ️
      </motion.button>

      <AnimatePresence>
        {showInstructions && (
          <>
            <motion.div
              className="instructions-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstructions(false)}
            />
            <motion.div
              className="instructions-modal"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="instructions-header">
                <h3>How to Play {gameName}</h3>
                <button
                  className="instructions-close"
                  onClick={() => setShowInstructions(false)}
                >
                  ✕
                </button>
              </div>
              <div className="instructions-content">
                {instructions}
              </div>
              <button
                className="instructions-got-it"
                onClick={() => setShowInstructions(false)}
              >
                Got it! 🐕
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameInstructions;
