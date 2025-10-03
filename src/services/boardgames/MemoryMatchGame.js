const CARD_PAIRS = [
  { id: 1, emoji: '🐕', name: 'Dog' },
  { id: 2, emoji: '🐱', name: 'Cat' },
  { id: 3, emoji: '🐰', name: 'Rabbit' },
  { id: 4, emoji: '🦊', name: 'Fox' },
  { id: 5, emoji: '🐼', name: 'Panda' },
  { id: 6, emoji: '🦁', name: 'Lion' },
  { id: 7, emoji: '🐯', name: 'Tiger' },
  { id: 8, emoji: '🐨', name: 'Koala' }
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createDeck(pairs = 8) {
  const selectedPairs = CARD_PAIRS.slice(0, pairs);
  const deck = [];
  
  selectedPairs.forEach((pair, index) => {
    deck.push({ ...pair, cardId: index * 2, pairId: pair.id });
    deck.push({ ...pair, cardId: index * 2 + 1, pairId: pair.id });
  });
  
  return shuffleArray(deck);
}

export const MemoryMatchGame = {
  name: 'memory-match',
  
  setup: ({ ctx }) => ({
    cards: createDeck(8),
    flipped: [],
    matched: [],
    score: { '0': 0, '1': 0 },
    attempts: 0,
    currentTurn: '0'
  }),

  turn: {
    onEnd: ({ G, ctx }) => {
      if (G.flipped.length === 2) {
        const [first, second] = G.flipped;
        const firstCard = G.cards[first];
        const secondCard = G.cards[second];
        
        if (firstCard.pairId === secondCard.pairId) {
          G.matched.push(first, second);
          G.score[ctx.currentPlayer]++;
        }
        
        G.flipped = [];
        G.attempts++;
      }
    },
    order: {
      first: () => 0,
      next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers
    }
  },

  moves: {
    flipCard: ({ G, ctx, events }, cardIndex) => {
      if (G.flipped.length >= 2) return;
      if (G.flipped.includes(cardIndex)) return;
      if (G.matched.includes(cardIndex)) return;
      
      G.flipped.push(cardIndex);
    },
    
    endPlayerTurn: ({ G, events }) => {
      events.endTurn();
    }
  },

  endIf: ({ G, ctx }) => {
    if (!G || !G.matched || !G.cards || !G.score) return;
    
    if (G.matched.length === G.cards.length) {
      const player0Score = G.score['0'];
      const player1Score = G.score['1'];
      
      if (player0Score > player1Score) {
        return { winner: '0' };
      } else if (player1Score > player0Score) {
        return { winner: '1' };
      } else {
        return { draw: true };
      }
    }
  },

  playerView: ({ G, ctx, playerID }) => {
    return G;
  }
};
