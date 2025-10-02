// Manual game testing script - run in browser console
console.log('🎮 BOARD GAMES MANUAL TEST SCRIPT');
console.log('================================');

const games = [
  'MEMORY_MATCH',
  'TIC_TAC_TOE',
  'CONNECT_FOUR',
  'CHECKERS',
  'GO_FISH',
  'SIMPLE_PUZZLE',
  'COLOR_MATCHING',
  'PATTERN_BUILDER',
  'WORD_SCRAMBLE'
];

window.testBoardGames = async () => {
  console.log('\n📊 Testing all 9 board games...\n');
  
  const results = [];
  
  for (const game of games) {
    console.log(`Testing ${game}...`);
    
    // Check if game component exists
    try {
      const gameExists = document.querySelector(`.${game.toLowerCase()}-board`) ||
                         document.querySelector(`.${game.toLowerCase()}-container`) ||
                         document.querySelector(`.game-container`);
      
      results.push({
        game,
        status: gameExists ? '✅ PASS' : '⚠️ NOT LOADED',
        component: gameExists ? 'Found' : 'Missing'
      });
    } catch (e) {
      results.push({
        game,
        status: '❌ FAIL',
        error: e.message
      });
    }
  }
  
  console.table(results);
  return results;
};

console.log('\n✅ Test script loaded!');
console.log('📋 Run: window.testBoardGames()');
