/**
 * Game Action Button Test Script
 * Run in browser console: window.testGameActions()
 * 
 * This test verifies that game action buttons appear when games are started
 * and that users can interact with games through button clicks
 */

window.testGameActions = async () => {
  console.log("🎮 Testing Game Action Buttons...");
  console.log("=" .repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Helper to click a button by text content
  const clickButton = (selector, textMatch) => {
    const buttons = Array.from(document.querySelectorAll(selector));
    const button = buttons.find(btn => btn.textContent?.includes(textMatch));
    if (button) {
      button.click();
      return true;
    }
    return false;
  };
  
  // Helper to check if game actions are visible
  const checkGameActionsVisible = () => {
    const gameActions = document.querySelector('.game-actions-active');
    const quickActions = document.querySelector('.quick-actions-compact');
    return gameActions !== null && quickActions === null;
  };
  
  try {
    // Test 1: Tug of War Game
    console.log("\n🪢 TEST 1: Tug of War Game");
    console.log("-".repeat(40));
    
    // Click Games button
    if (!clickButton('.quick-btn', 'Games')) {
      console.log("❌ Could not find Games button");
      results.failed++;
      results.tests.push({ name: "Tug of War", status: "failed", reason: "Games button not found" });
    } else {
      await delay(200);
      
      // Click Tug of War
      if (!clickButton('.submenu-btn', 'Tug')) {
        console.log("❌ Could not find Tug of War button");
        results.failed++;
        results.tests.push({ name: "Tug of War", status: "failed", reason: "Tug button not found" });
      } else {
        await delay(200);
        
        // Click Rope Tug to start game
        if (!clickButton('.submenu-btn', 'Rope')) {
          console.log("❌ Could not find Rope Tug button");
          results.failed++;
          results.tests.push({ name: "Tug of War", status: "failed", reason: "Rope Tug button not found" });
        } else {
          await delay(500);
          
          // Check if game action buttons appeared
          if (checkGameActionsVisible()) {
            const hasPullButton = Array.from(document.querySelectorAll('.game-action-btn'))
              .some(btn => btn.textContent?.includes('Pull'));
            
            if (hasPullButton) {
              console.log("✅ Tug of War: Game action buttons appeared!");
              console.log("   Found: Pull harder button");
              results.passed++;
              results.tests.push({ name: "Tug of War", status: "passed" });
              
              // Test pulling
              clickButton('.game-action-btn', 'Pull');
              await delay(300);
              console.log("   ✅ Pull action executed");
              
              // Stop game
              clickButton('.game-action-btn', 'Stop');
              await delay(300);
            } else {
              console.log("❌ Tug of War: Game actions visible but no Pull button found");
              results.failed++;
              results.tests.push({ name: "Tug of War", status: "failed", reason: "Pull button not found" });
            }
          } else {
            console.log("❌ Tug of War: Game action buttons did NOT appear");
            results.failed++;
            results.tests.push({ name: "Tug of War", status: "failed", reason: "Game actions not visible" });
          }
        }
      }
    }
    
    await delay(500);
    
    // Test 2: Guessing Game
    console.log("\n🔢 TEST 2: Guessing Game");
    console.log("-".repeat(40));
    
    // Click Games button
    if (!clickButton('.quick-btn', 'Games')) {
      console.log("❌ Could not find Games button");
      results.failed++;
      results.tests.push({ name: "Guessing Game", status: "failed", reason: "Games button not found" });
    } else {
      await delay(200);
      
      // Click Guessing Game
      if (!clickButton('.submenu-btn', 'Guessing')) {
        console.log("❌ Could not find Guessing Game button");
        results.failed++;
        results.tests.push({ name: "Guessing Game", status: "failed", reason: "Guessing button not found" });
      } else {
        await delay(200);
        
        // Click Number Guess to start game
        if (!clickButton('.submenu-btn', 'Number')) {
          console.log("❌ Could not find Number Guess button");
          results.failed++;
          results.tests.push({ name: "Guessing Game", status: "failed", reason: "Number Guess button not found" });
        } else {
          await delay(500);
          
          // Check if game action buttons appeared
          if (checkGameActionsVisible()) {
            const hasNumberButton = Array.from(document.querySelectorAll('.game-action-btn'))
              .some(btn => btn.textContent?.match(/[1-9]/));
            
            if (hasNumberButton) {
              console.log("✅ Guessing Game: Game action buttons appeared!");
              console.log("   Found: Number buttons");
              results.passed++;
              results.tests.push({ name: "Guessing Game", status: "passed" });
              
              // Test guessing
              clickButton('.game-action-btn', '5');
              await delay(300);
              console.log("   ✅ Guess action executed");
              
              // Stop game
              clickButton('.game-action-btn', 'Stop');
              await delay(300);
            } else {
              console.log("❌ Guessing Game: Game actions visible but no number buttons found");
              results.failed++;
              results.tests.push({ name: "Guessing Game", status: "failed", reason: "Number buttons not found" });
            }
          } else {
            console.log("❌ Guessing Game: Game action buttons did NOT appear");
            results.failed++;
            results.tests.push({ name: "Guessing Game", status: "failed", reason: "Game actions not visible" });
          }
        }
      }
    }
    
    await delay(500);
    
    // Test 3: Fetch Game
    console.log("\n🎾 TEST 3: Fetch Game");
    console.log("-".repeat(40));
    
    // Click Games button
    if (!clickButton('.quick-btn', 'Games')) {
      console.log("❌ Could not find Games button");
      results.failed++;
      results.tests.push({ name: "Fetch Game", status: "failed", reason: "Games button not found" });
    } else {
      await delay(200);
      
      // Click Fetch
      if (!clickButton('.submenu-btn', 'Fetch')) {
        console.log("❌ Could not find Fetch button");
        results.failed++;
        results.tests.push({ name: "Fetch Game", status: "failed", reason: "Fetch button not found" });
      } else {
        await delay(200);
        
        // Click Ball Fetch to start game
        if (!clickButton('.submenu-btn', 'Ball')) {
          console.log("❌ Could not find Ball Fetch button");
          results.failed++;
          results.tests.push({ name: "Fetch Game", status: "failed", reason: "Ball Fetch button not found" });
        } else {
          await delay(500);
          
          // Check if game action buttons appeared
          if (checkGameActionsVisible()) {
            const hasThrowButton = Array.from(document.querySelectorAll('.game-action-btn'))
              .some(btn => btn.textContent?.includes('Throw'));
            
            if (hasThrowButton) {
              console.log("✅ Fetch Game: Game action buttons appeared!");
              console.log("   Found: Throw ball button");
              results.passed++;
              results.tests.push({ name: "Fetch Game", status: "passed" });
              
              // Test throwing
              clickButton('.game-action-btn', 'Throw');
              await delay(300);
              console.log("   ✅ Throw action executed");
              
              // Stop game
              clickButton('.game-action-btn', 'Stop');
              await delay(300);
            } else {
              console.log("❌ Fetch Game: Game actions visible but no Throw button found");
              results.failed++;
              results.tests.push({ name: "Fetch Game", status: "failed", reason: "Throw button not found" });
            }
          } else {
            console.log("❌ Fetch Game: Game action buttons did NOT appear");
            results.failed++;
            results.tests.push({ name: "Fetch Game", status: "failed", reason: "Game actions not visible" });
          }
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Test error:", error);
    results.failed++;
    results.tests.push({ name: "General", status: "failed", reason: error.message });
  }
  
  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 GAME ACTION BUTTON TEST RESULTS");
  console.log("=".repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total: ${results.passed + results.failed}`);
  
  if (results.failed > 0) {
    console.log("\n❌ FAILED TESTS:");
    results.tests.filter(t => t.status === "failed").forEach(t => {
      console.log(`   - ${t.name}: ${t.reason || 'unknown error'}`);
    });
  }
  
  if (results.passed === results.tests.length && results.tests.length > 0) {
    console.log("\n🎉 ALL TESTS PASSED! Game action buttons are working correctly!");
  }
  
  return results;
};

console.log("✅ Game Action Button Test loaded!");
console.log("📋 Run: window.testGameActions()");
