import React, { useEffect, useRef, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { motion, AnimatePresence } from 'framer-motion';
import { GoFishGame } from '../../services/boardgames/GoFishGame.js';
import { useGameTheme } from '../../contexts/GameThemeContext.jsx';
import DaisyAIOpponent from '../../services/boardgames/DaisyAIOpponent.js';
import { GAME_EVENT_TYPE } from '../../types/boardGameTypes.js';
import GameVoiceInstructions from '../../services/GameVoiceInstructions.js';
import './GoFish.css';

const GoFishBoard = ({ G, ctx, moves, playerID, onGameEvent, themeConfig, aiMoves }) => {
  const processingRef = useRef(false);
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    const isAITurn = ctx.currentPlayer === '1';
    
    if (isAITurn && !ctx.gameover && !processingRef.current) {
      processingRef.current = true;
      
      const makeAIMove = async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const aiHand = G.hands['1'];
        
        if (aiHand.length === 0) {
          processingRef.current = false;
          
          if (G.deck.length > 0 && aiMoves && aiMoves.drawCard) {
            aiMoves.drawCard();
            onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
          } else if (aiMoves && aiMoves.passTurn) {
            aiMoves.passTurn();
            onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
          }
          return;
        }
        
        const uniqueValues = [...new Set(aiHand.map(card => card.value))];
        const validMoves = uniqueValues.map(value => ({ value }));
        
        if (validMoves.length > 0) {
          const move = await DaisyAIOpponent.makeMove(G, validMoves, 'GO_FISH');
          
          processingRef.current = false;
          
          if (move && move.value && aiMoves && aiMoves.askForCard) {
            aiMoves.askForCard(move.value);
            onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
          }
        } else {
          processingRef.current = false;
        }
      };
      
      makeAIMove();
    }
  }, [ctx.currentPlayer, ctx.gameover, ctx.turn]);

  useEffect(() => {
    if (ctx.gameover) {
      if (ctx.gameover.winner === playerID) {
        onGameEvent?.(GAME_EVENT_TYPE.WIN);
      } else if (ctx.gameover.winner) {
        onGameEvent?.(GAME_EVENT_TYPE.LOSE);
      } else if (ctx.gameover.draw) {
        onGameEvent?.(GAME_EVENT_TYPE.DRAW);
      }
    }
  }, [ctx.gameover]);

  const handleAskForCard = (value) => {
    if (ctx.currentPlayer !== playerID || ctx.gameover || processingRef.current) return;
    
    moves.askForCard(value);
    setSelectedValue(null);
    onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
  };

  const playerHand = G.hands[playerID] || [];
  const uniqueValues = [...new Set(playerHand.map(card => card.value))];
  const opponentCardCount = G.hands[ctx.currentPlayer === '0' ? '1' : '0']?.length || 0;

  const cardEmojis = {
    '1': '🐟',
    '2': '🐠', 
    '3': '🐡',
    '4': '🦈',
    '5': '🐙',
    '6': '🦑'
  };

  const renderCard = (card, index) => (
    <motion.div
      key={card.id}
      className="gofish-card"
      initial={{ scale: 0, rotate: -180, y: -100 }}
      animate={{ scale: 1, rotate: 0, y: 0 }}
      exit={{ scale: 0, rotate: 180, y: 100 }}
      transition={{ delay: index * 0.05 }}
      style={{
        backgroundColor: themeConfig.colors.player1,
        borderColor: selectedValue === card.value ? themeConfig.colors.success : '#2C3E50'
      }}
    >
      <div className="card-value">{card.value}</div>
      <div className="card-suit" style={{ fontSize: '2rem' }}>{cardEmojis[card.value] || '🐟'}</div>
    </motion.div>
  );

  const renderPair = (value, index) => (
    <motion.div
      key={`${value}-${index}`}
      className="gofish-pair"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', delay: index * 0.1 }}
      style={{ backgroundColor: themeConfig.colors.success }}
    >
      <div className="pair-value">{value}</div>
      <div className="pair-label">Pair!</div>
    </motion.div>
  );

  return (
    <div className="gofish-board">
      <div className="game-status">
        {ctx.gameover ? (
          <div className="status-message game-over">
            {ctx.gameover.winner === playerID && "🎉 You Won! 🎉"}
            {ctx.gameover.winner === '1' && "🐕 Daisy Won! 🐕"}
            {ctx.gameover.draw && "🤝 It's a Draw! 🤝"}
          </div>
        ) : (
          <div className="status-message">
            {ctx.currentPlayer === playerID ? (
              <span>Ask Daisy for a card! 🎣</span>
            ) : (
              <span>Daisy's Turn! 🐕</span>
            )}
          </div>
        )}
      </div>

      <div className="gofish-game-area">
        <div className="opponent-area">
          <div className="opponent-info">
            <span>Daisy's Cards: {opponentCardCount}</span>
            <span>Pairs: {G.pairs['1'].length}</span>
          </div>
          <div className="opponent-pairs">
            {G.pairs['1'].map((value, index) => renderPair(value, index))}
          </div>
        </div>

        <div className="deck-area">
          <div className="deck">
            {G.deck.length > 0 && (
              <div className="deck-card">
                <div className="deck-count">{G.deck.length}</div>
              </div>
            )}
          </div>
          {G.lastAction && (
            <motion.div
              className="action-message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {G.lastAction.type === 'GOT_CARDS' && `Got ${G.lastAction.count} cards!`}
              {G.lastAction.type === 'GO_FISH' && 'Go Fish! 🎣'}
              {G.lastAction.madePair && ` Made a pair of ${G.lastAction.madePair}s! 🎯`}
            </motion.div>
          )}
        </div>

        <div className="player-area">
          <div className="player-pairs">
            {G.pairs['0'].map((value, index) => renderPair(value, index))}
          </div>
          
          <div className="player-hand">
            <AnimatePresence>
              {playerHand.map((card, index) => renderCard(card, index))}
            </AnimatePresence>
          </div>

          {ctx.currentPlayer === playerID && !ctx.gameover && (
            <div className="ask-buttons">
              {uniqueValues.length > 0 ? (
                <>
                  <div className="ask-label">Ask for:</div>
                  {uniqueValues.map(value => (
                    <motion.button
                      key={value}
                      className="ask-button"
                      onClick={() => handleAskForCard(value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        backgroundColor: themeConfig.colors.primary,
                        color: '#fff'
                      }}
                    >
                      {value}
                    </motion.button>
                  ))}
                </>
              ) : G.deck.length > 0 ? (
                <motion.button
                  className="ask-button draw-button"
                  onClick={() => {
                    moves.drawCard();
                    onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: themeConfig.colors.accent,
                    color: '#fff'
                  }}
                >
                  Draw Card 🎣
                </motion.button>
              ) : (
                <motion.button
                  className="ask-button pass-button"
                  onClick={() => {
                    moves.passTurn();
                    onGameEvent?.(GAME_EVENT_TYPE.MOVE_MADE);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: '#95A5A6',
                    color: '#fff'
                  }}
                >
                  Pass (No Cards)
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GoFish = ({ onExit, onGameEnd }) => {
  const { themeConfig } = useGameTheme();
  const [gameEvents, setGameEvents] = useState([]);
  const aiMovesRef = useRef(null);

  const handleGameEvent = (eventType, data) => {
    setGameEvents(prev => [...prev, { eventType, data, timestamp: Date.now() }]);
  };

  const BoardWrapper = (props) => {
    if (props.playerID === '1') {
      aiMovesRef.current = props.moves;
      return null;
    }
    
    return (
      <GoFishBoard 
        {...props} 
        onGameEvent={handleGameEvent}
        themeConfig={themeConfig}
        aiMoves={aiMovesRef.current}
      />
    );
  };

  const GoFishClient = Client({
    game: GoFishGame,
    board: BoardWrapper,
    multiplayer: Local(),
    numPlayers: 2,
    debug: false
  });

  return (
    <>
      <GoFishClient playerID="0" matchID="local" />
      <div style={{ display: 'none' }}>
        <GoFishClient playerID="1" matchID="local" />
      </div>
    </>
  );
};

export default GoFish;
