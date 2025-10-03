import React, { useState, useEffect, useRef } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryMatchGame } from '../../services/boardgames/MemoryMatchGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import DaisyAIOpponent from '../../services/boardgames/DaisyAIOpponent.js';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import GameVoiceInstructions from '../../services/GameVoiceInstructions.js';
import './MemoryMatch.css';

const MemoryMatchAIBoard = ({ G, ctx, moves, playerID, onGameEvent }) => {
  const processingRef = useRef(false);

  useEffect(() => {
    if (!G || !G.flipped || !G.cards || !G.matched || !ctx || !moves) return;
    
    const isMyTurn = ctx.currentPlayer === playerID;
    const needsToStartTurn = isMyTurn && G.flipped.length === 0;
    
    if (needsToStartTurn && !ctx.gameover && !processingRef.current) {
      processingRef.current = true;
      
      const makeAITurn = async () => {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const availableCards = G.cards
          .map((_, index) => index)
          .filter(index => 
            !G.matched.includes(index) && 
            !G.flipped.includes(index)
          );
        
        if (availableCards.length >= 2 && moves.flipCard) {
          const firstMove = await DaisyAIOpponent.makeMove(
            G,
            availableCards.map(cardIndex => ({ cardIndex })),
            'MEMORY_MATCH'
          );
          
          if (firstMove && firstMove.cardIndex !== undefined) {
            moves.flipCard(firstMove.cardIndex);
            onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
            
            await new Promise(resolve => setTimeout(resolve, 1800));
            
            const remainingCards = availableCards.filter(
              index => index !== firstMove.cardIndex
            );
            
            if (remainingCards.length > 0) {
              const secondMove = await DaisyAIOpponent.makeMove(
                G,
                remainingCards.map(cardIndex => ({ cardIndex })),
                'MEMORY_MATCH'
              );
              
              if (secondMove && secondMove.cardIndex !== undefined) {
                moves.flipCard(secondMove.cardIndex);
                onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
                
                await new Promise(resolve => setTimeout(resolve, 3500));
                
                if (moves.endPlayerTurn) {
                  moves.endPlayerTurn();
                }
              }
            }
          }
        }
        
        processingRef.current = false;
      };
      
      makeAITurn();
    }
  }, [ctx?.currentPlayer, ctx?.gameover, ctx?.turn, G?.flipped?.length, G?.matched?.length]);

  return null;
};

const MemoryMatchBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig }) => {
  useEffect(() => {
    if (!G || !G.flipped || !G.cards || !G.score) return;
    
    if (G.flipped.length === 2) {
      const [first, second] = G.flipped.slice();
      
      setTimeout(() => {
        if (first !== undefined && second !== undefined) {
          const matched = G.cards[first].pairId === G.cards[second].pairId;
          
          if (matched && onGameEvent) {
            onGameEvent(GAME_EVENT_TYPE.MATCH_FOUND, {
              score: G.score[playerID]
            });
          }
        }
      }, 600);
    }
  }, [G?.flipped?.length]);

  useEffect(() => {
    if (!ctx) return;
    
    if (ctx.gameover) {
      if (onGameEvent) {
        if (ctx.gameover.winner === playerID) {
          onGameEvent(GAME_EVENT_TYPE.WIN);
        } else if (ctx.gameover.winner) {
          onGameEvent(GAME_EVENT_TYPE.LOSE);
        } else if (ctx.gameover.draw) {
          onGameEvent(GAME_EVENT_TYPE.DRAW);
        }
      }
    }
  }, [ctx?.gameover]);

  const handleCardClick = (cardIndex) => {
    if (!G || !ctx || !moves) return;
    if (ctx.currentPlayer !== playerID) return;
    if (G.flipped.length >= 2) return;
    if (G.matched.includes(cardIndex)) return;
    if (G.flipped.includes(cardIndex)) return;
    
    moves.flipCard(cardIndex);
    
    if (onGameEvent) {
      onGameEvent(GAME_EVENT_TYPE.MOVE_MADE, { cardIndex });
    }
    
    if (G.flipped.length === 1) {
      setTimeout(() => {
        if (moves.endPlayerTurn) {
          moves.endPlayerTurn();
        }
      }, 2000);
    }
  };

  const isCardFlipped = (index) => {
    if (!G || !G.flipped || !G.matched) return false;
    return G.flipped.includes(index) || G.matched.includes(index);
  };

  const isCardMatched = (index) => {
    if (!G || !G.matched) return false;
    return G.matched.includes(index);
  };

  if (!G || !G.score || !G.cards || !ctx) {
    return <div className="memory-match-board">Loading...</div>;
  }

  return (
    <div className="memory-match-board">
      <div className="game-info">
        <div className="scores">
          <div className={`player-score ${playerID === '0' ? 'active' : ''}`}>
            <span className="player-label">You</span>
            <span className="score">{G.score['0']}</span>
          </div>
          <div className={`player-score ${playerID === '1' ? 'active' : ''}`}>
            <span className="player-label">Daisy 🐕</span>
            <span className="score">{G.score['1']}</span>
          </div>
        </div>
        <div className="turn-indicator">
          {ctx.currentPlayer === playerID ? "Your Turn!" : "Daisy's Turn!"}
        </div>
      </div>

      <div className="cards-grid">
        {G.cards.map((card, index) => (
          <motion.div
            key={index}
            className={`card-wrapper ${isCardMatched(index) ? 'matched' : ''}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
          >
            <motion.div
              className={`memory-card ${isCardFlipped(index) ? 'flipped' : ''}`}
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: isCardFlipped(index) ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                cursor: isCardFlipped(index) || ctx.currentPlayer !== playerID ? 'default' : 'pointer'
              }}
            >
              <div className="card-back" style={{ 
                backgroundColor: themeConfig.colors.primary 
              }}>
                <span className="card-back-icon">🎴</span>
              </div>
              <div className="card-front" style={{ 
                backgroundColor: isCardMatched(index) ? themeConfig.colors.success : 'white'
              }}>
                <span className="card-emoji">{card.emoji}</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {ctx.gameover && (
        <motion.div
          className="game-over-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="game-over-content">
            {ctx.gameover.winner === playerID ? (
              <h2>🎉 You Won! 🎉</h2>
            ) : ctx.gameover.draw ? (
              <h2>🤝 It's a Tie! 🤝</h2>
            ) : (
              <h2>🐕 Daisy Won! 🐕</h2>
            )}
            <p>Final Score: You {G.score['0']} - {G.score['1']} Daisy</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const MemoryMatch = ({ onExit, onGameEnd }) => {
  const { themeConfig } = useGameTheme();
  const [gameEvents, setGameEvents] = useState([]);

  const handleGameEvent = (eventType, data) => {
    setGameEvents(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
  };

  const BoardWrapper = (props) => {
    if (props.playerID === '1') {
      return <MemoryMatchAIBoard {...props} onGameEvent={handleGameEvent} />;
    }
    
    return (
      <MemoryMatchBoard 
        {...props} 
        onGameEvent={handleGameEvent}
        themeConfig={themeConfig}
      />
    );
  };

  const MemoryMatchClient = Client({
    game: MemoryMatchGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 2,
    debug: false
  });

  return (
    <>
      <MemoryMatchClient playerID="0" matchID="local" />
      <div style={{ display: 'none' }}>
        <MemoryMatchClient playerID="1" matchID="local" />
      </div>
    </>
  );
};

export default MemoryMatch;
