const WORDS = [
  { word: 'DOG', hint: '🐕 Daisy is one!' },
  { word: 'CAT', hint: '🐱 Meow!' },
  { word: 'SUN', hint: '☀️ Bright in the sky!' },
  { word: 'STAR', hint: '⭐ Twinkles at night!' },
  { word: 'TREE', hint: '🌲 Grows tall!' },
  { word: 'FISH', hint: '🐟 Swims in water!' },
  { word: 'BIRD', hint: '🐦 Flies in the sky!' },
  { word: 'MOON', hint: '🌙 Shines at night!' },
  { word: 'RAIN', hint: '🌧️ Water from clouds!' },
  { word: 'BOOK', hint: '📚 You read it!' }
];

function shuffleWord(word, random) {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(random.Number() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  
  if (letters.join('') === word && word.length > 2) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  
  return letters;
}

export const WordScrambleGame = {
  name: 'word-scramble',

  setup: ({ random }) => {
    const wordIndex = Math.floor(random.Number() * WORDS.length);
    const currentWord = WORDS[wordIndex];
    
    return {
      targetWord: currentWord.word,
      hint: currentWord.hint,
      scrambledLetters: shuffleWord(currentWord.word, random),
      selectedLetters: [],
      score: 0,
      wordsCompleted: 0,
      usedWords: [wordIndex],
      lastWordCorrect: null
    };
  },

  moves: {
    selectLetter: ({ G, ctx, random, events }, index) => {
      if (G.selectedLetters.some(item => item.index === index)) return;
      
      G.selectedLetters.push({
        letter: G.scrambledLetters[index],
        index
      });
      
      if (G.selectedLetters.length === G.targetWord.length) {
        const playerWord = G.selectedLetters.map(item => item.letter).join('');
        
        console.log('🔤 Word Scramble - Checking word:', playerWord, 'vs', G.targetWord);
        
        if (playerWord === G.targetWord) {
          console.log('✅ Word Scramble - Correct! Words completed:', G.wordsCompleted, '→', G.wordsCompleted + 1);
          
          G.lastWordCorrect = true;
          G.score += G.targetWord.length * 10;
          G.wordsCompleted++;
          
          const availableWords = WORDS.filter((_, idx) => !G.usedWords.includes(idx));
          console.log('🔤 Word Scramble - Available words:', availableWords.length);
          
          if (availableWords.length > 0) {
            const randomIndex = Math.floor(random.Number() * availableWords.length);
            const nextWordIndex = WORDS.findIndex((w, idx) => 
              !G.usedWords.includes(idx) && w.word === availableWords[randomIndex].word
            );
            
            G.usedWords.push(nextWordIndex);
            G.targetWord = WORDS[nextWordIndex].word;
            G.hint = WORDS[nextWordIndex].hint;
            G.scrambledLetters = shuffleWord(WORDS[nextWordIndex].word, random);
            
            console.log('🔤 Word Scramble - Next word:', G.targetWord, 'Hint:', G.hint);
            console.log('🔤 Word Scramble - Scrambled:', G.scrambledLetters);
          }
        } else {
          console.log('❌ Word Scramble - Wrong word!');
          G.lastWordCorrect = false;
        }
        
        G.selectedLetters = [];
      }
    },
    
    clearWord: ({ G }) => {
      G.selectedLetters = [];
      G.lastWordCorrect = null;
    }
  },

  endIf: ({ G }) => {
    if (G.wordsCompleted >= 5) {
      return { winner: '0' };
    }
  },

  ai: {
    enumerate: () => []
  }
};

export { WORDS };
