const CARD_VALUES = ['1', '2', '3', '4', '5', '6'];
const CARDS_PER_VALUE = 4;
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
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealInitialHands(deck) {
  const player0Hand = deck.slice(0, INITIAL_HAND_SIZE);
  const player1Hand = deck.slice(INITIAL_HAND_SIZE, INITIAL_HAND_SIZE * 2);
  const remainingDeck = deck.slice(INITIAL_HAND_SIZE * 2);
  
  return { player0Hand, player1Hand, remainingDeck };
}

function checkForBooks(hand) {
  const counts = {};
  hand.forEach(card => {
    counts[card.value] = (counts[card.value] || 0) + 1;
  });
  
  const books = [];
  const remainingCards = [];
  
  for (const card of hand) {
    if (counts[card.value] === CARDS_PER_VALUE && !books.includes(card.value)) {
      books.push(card.value);
    } else if (counts[card.value] !== CARDS_PER_VALUE) {
      remainingCards.push(card);
    }
  }
  
  return { books, remainingCards };
}

export const GoFishGame = {
  name: 'go-fish',

  setup: ({ random }) => {
    const deck = shuffleDeck(createDeck(), random);
    const { player0Hand, player1Hand, remainingDeck } = dealInitialHands(deck);
    
    return {
      hands: {
        '0': player0Hand,
        '1': player1Hand
      },
      deck: remainingDeck,
      books: {
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
    askForCard: (G, ctx, requestedValue) => {
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
      
      const { books, remainingCards } = checkForBooks(G.hands[currentPlayer]);
      if (books.length > 0) {
        G.hands[currentPlayer] = remainingCards;
        G.books[currentPlayer] = [...G.books[currentPlayer], ...books];
        G.lastAction = { ...G.lastAction, madeBook: books[books.length - 1] };
      }
    },
    
    drawCard: (G, ctx) => {
      if (G.deck.length > 0) {
        const drawnCard = G.deck.pop();
        G.hands[ctx.currentPlayer].push(drawnCard);
        G.lastAction = { type: 'DRAW', drawnCard };
        
        const { books, remainingCards } = checkForBooks(G.hands[ctx.currentPlayer]);
        if (books.length > 0) {
          G.hands[ctx.currentPlayer] = remainingCards;
          G.books[ctx.currentPlayer] = [...G.books[ctx.currentPlayer], ...books];
          G.lastAction = { ...G.lastAction, madeBook: books[books.length - 1] };
        }
      }
    },
    
    passTurn: (G, ctx) => {
      G.lastAction = { type: 'PASS' };
    }
  },

  endIf: (G) => {
    const totalBooks = G.books['0'].length + G.books['1'].length;
    const allCardsInBooks = totalBooks === CARD_VALUES.length;
    const noCardsLeft = G.hands['0'].length === 0 && G.hands['1'].length === 0 && G.deck.length === 0;
    
    if (allCardsInBooks || noCardsLeft) {
      if (G.books['0'].length > G.books['1'].length) {
        return { winner: '0' };
      } else if (G.books['1'].length > G.books['0'].length) {
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
