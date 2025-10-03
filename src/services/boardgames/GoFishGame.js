const CARD_VALUES = ['1', '2', '3', '4', '5', '6'];
const CARDS_PER_VALUE = 4;
const CARDS_FOR_PAIR = 2; // Pairs are 2 of a kind, not 4
const INITIAL_HAND_SIZE = 5;

function createDeck() {
  const deck = [];
  for (const value of CARD_VALUES) {
    for (let i = 0; i < CARDS_PER_VALUE; i++) {
      deck.push({ value, id: `${value}-${i}` });
    }
  }
  return deck;
}

function shuffleDeck(deck, random) {
  return random.Shuffle(deck);
}

function dealInitialHands(deck) {
  const player0Hand = deck.slice(0, INITIAL_HAND_SIZE);
  const player1Hand = deck.slice(INITIAL_HAND_SIZE, INITIAL_HAND_SIZE * 2);
  const remainingDeck = deck.slice(INITIAL_HAND_SIZE * 2);
  
  return { player0Hand, player1Hand, remainingDeck };
}

function checkForPairs(hand) {
  const counts = {};
  hand.forEach(card => {
    counts[card.value] = (counts[card.value] || 0) + 1;
  });
  
  const pairs = [];
  const remainingCards = [];
  
  // Check each unique value for pairs
  const processedValues = new Set();
  
  for (const card of hand) {
    if (processedValues.has(card.value)) {
      // Already processed this value
      continue;
    }
    
    if (counts[card.value] >= CARDS_FOR_PAIR) {
      // Found a pair (or more)
      const numPairs = Math.floor(counts[card.value] / CARDS_FOR_PAIR);
      for (let i = 0; i < numPairs; i++) {
        pairs.push(card.value);
      }
      
      // Add remaining cards after removing pairs
      const cardsToRemove = numPairs * CARDS_FOR_PAIR;
      const cardsToKeep = counts[card.value] - cardsToRemove;
      
      let addedCount = 0;
      for (const c of hand) {
        if (c.value === card.value && addedCount < cardsToKeep) {
          remainingCards.push(c);
          addedCount++;
        }
      }
      
      processedValues.add(card.value);
    } else {
      // No pair for this value, keep all cards
      if (!processedValues.has(card.value)) {
        for (const c of hand) {
          if (c.value === card.value) {
            remainingCards.push(c);
          }
        }
        processedValues.add(card.value);
      }
    }
  }
  
  return { pairs, remainingCards };
}

export const GoFishGame = {
  name: 'go-fish',

  setup: ({ random }) => {
    const deck = shuffleDeck(createDeck(), random);
    let deckCopy = [...deck];
    
    // Deal initial hands - 5 cards each
    const player0Hand = deckCopy.splice(0, INITIAL_HAND_SIZE);
    const player1Hand = deckCopy.splice(0, INITIAL_HAND_SIZE);
    
    // Start with 0 pairs - pairs are collected DURING gameplay, not at setup
    return {
      hands: {
        '0': player0Hand,
        '1': player1Hand
      },
      deck: deckCopy,
      pairs: {
        '0': [],
        '1': []
      },
      lastAction: null
    };
  },

  turn: {
    minMoves: 1,
    maxMoves: 1
  },

  moves: {
    askForCard: ({ G, ctx, events }, requestedValue) => {
      const currentPlayer = ctx.currentPlayer;
      const opponent = currentPlayer === '0' ? '1' : '0';
      
      const opponentCards = G.hands[opponent].filter(card => card.value === requestedValue);
      
      if (opponentCards.length > 0) {
        G.hands[opponent] = G.hands[opponent].filter(card => card.value !== requestedValue);
        G.hands[currentPlayer] = [...G.hands[currentPlayer], ...opponentCards];
        G.lastAction = { type: 'GOT_CARDS', value: requestedValue, count: opponentCards.length };
      } else {
        if (G.deck.length > 0) {
          const drawnCard = G.deck.pop();
          G.hands[currentPlayer].push(drawnCard);
          G.lastAction = { type: 'GO_FISH', drawnCard };
        } else {
          G.lastAction = { type: 'GO_FISH', drawnCard: null };
        }
      }
      
      const { pairs, remainingCards } = checkForPairs(G.hands[currentPlayer]);
      if (pairs.length > 0) {
        G.hands[currentPlayer] = remainingCards;
        G.pairs[currentPlayer] = [...G.pairs[currentPlayer], ...pairs];
        G.lastAction = { ...G.lastAction, madePair: pairs[pairs.length - 1] };
      }
      
      // Refill hand if empty or low (Go Fish rule: draw back to 5 if hand is empty)
      while (G.hands[currentPlayer].length < INITIAL_HAND_SIZE && G.deck.length > 0) {
        const drawnCard = G.deck.pop();
        G.hands[currentPlayer].push(drawnCard);
        
        // Check if new card forms a pair
        const refillCheck = checkForPairs(G.hands[currentPlayer]);
        if (refillCheck.pairs.length > 0) {
          G.hands[currentPlayer] = refillCheck.remainingCards;
          G.pairs[currentPlayer] = [...G.pairs[currentPlayer], ...refillCheck.pairs];
        }
      }
      
      events.endTurn();
    },
    
    drawCard: ({ G, ctx, events }) => {
      if (G.deck.length > 0) {
        const drawnCard = G.deck.pop();
        G.hands[ctx.currentPlayer].push(drawnCard);
        G.lastAction = { type: 'DRAW', drawnCard };
        
        const { pairs, remainingCards } = checkForPairs(G.hands[ctx.currentPlayer]);
        if (pairs.length > 0) {
          G.hands[ctx.currentPlayer] = remainingCards;
          G.pairs[ctx.currentPlayer] = [...G.pairs[ctx.currentPlayer], ...pairs];
          G.lastAction = { ...G.lastAction, madePair: pairs[pairs.length - 1] };
        }
        
        // Refill hand if empty or low
        while (G.hands[ctx.currentPlayer].length < INITIAL_HAND_SIZE && G.deck.length > 0) {
          const refillCard = G.deck.pop();
          G.hands[ctx.currentPlayer].push(refillCard);
          
          const refillCheck = checkForPairs(G.hands[ctx.currentPlayer]);
          if (refillCheck.pairs.length > 0) {
            G.hands[ctx.currentPlayer] = refillCheck.remainingCards;
            G.pairs[ctx.currentPlayer] = [...G.pairs[ctx.currentPlayer], ...refillCheck.pairs];
          }
        }
      }
      events.endTurn();
    },
    
    passTurn: ({ G, ctx, events }) => {
      G.lastAction = { type: 'PASS' };
      events.endTurn();
    }
  },

  endIf: ({ G }) => {
    const totalPairs = G.pairs['0'].length + G.pairs['1'].length;
    const maxPossiblePairs = CARD_VALUES.length * (CARDS_PER_VALUE / CARDS_FOR_PAIR); // 6 values * 2 pairs each = 12 pairs
    const allCardsInPairs = totalPairs === maxPossiblePairs;
    const noCardsLeft = G.hands['0'].length === 0 && G.hands['1'].length === 0 && G.deck.length === 0;
    
    if (allCardsInPairs || noCardsLeft) {
      if (G.pairs['0'].length > G.pairs['1'].length) {
        return { winner: '0' };
      } else if (G.pairs['1'].length > G.pairs['0'].length) {
        return { winner: '1' };
      } else {
        return { draw: true };
      }
    }
  },

  ai: {
    enumerate: (G, ctx) => {
      const hand = G.hands[ctx.currentPlayer];
      
      if (hand.length === 0) {
        if (G.deck.length > 0) {
          return [{ move: 'drawCard', args: [] }];
        } else {
          return [{ move: 'passTurn', args: [] }];
        }
      }
      
      const uniqueValues = [...new Set(hand.map(card => card.value))];
      return uniqueValues.map(value => ({
        move: 'askForCard',
        args: [value]
      }));
    }
  }
};
