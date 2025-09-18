// DaisyDog v2.0 - Comprehensive Regression Test Suite
// Run this to verify all features are working correctly

console.log('🧪 DAISYDOG V2.0 REGRESSION TEST SUITE STARTING...')

// Test 1: Avatar Size Verification
function testAvatarSizes() {
  console.log('📏 Testing Avatar Sizes...')

  const headerAvatar = document.querySelector('.daisy-avatar')
  const messageAvatars = document.querySelectorAll('.message-avatar')

  const headerSize = headerAvatar ? {
    width: parseInt(getComputedStyle(headerAvatar).width),
    height: parseInt(getComputedStyle(headerAvatar).height)
  } : null

  const messageSizes = Array.from(messageAvatars).map(avatar => ({
    width: parseInt(getComputedStyle(avatar).width),
    height: parseInt(getComputedStyle(avatar).height)
  }))

  console.log('Header avatar size:', headerSize)
  console.log('Message avatar sizes:', messageSizes)

  const headerTest = headerSize && headerSize.width === 120 && headerSize.height === 120
  const messageTest = messageSizes.every(size => size.width === 80 && size.height === 80)

  console.log('✅ Avatar sizes test:', headerTest && messageTest ? 'PASS' : 'FAIL')
  return headerTest && messageTest
}

// Test 2: Hunger System Logic
function testHungerSystem() {
  console.log('🦴 Testing Hunger System Logic...')

  // This test requires manual verification since we can't directly access state
  // But we can check if the hunger bones are rendered correctly
  const hungerBones = document.querySelectorAll('.hunger-bone')
  console.log('Found', hungerBones.length, 'hunger bones')

  const filledBones = document.querySelectorAll('.hunger-bone.filled')
  const hungryBones = document.querySelectorAll('.hunger-bone.hungry')
  const starvingBones = document.querySelectorAll('.hunger-bone.starving')

  console.log('Filled bones:', filledBones.length)
  console.log('Hungry bones:', hungryBones.length)
  console.log('Starving bones:', starvingBones.length)

  // Basic structure test
  const structureTest = hungerBones.length === 5
  console.log('✅ Hunger structure test:', structureTest ? 'PASS' : 'FAIL')
  return structureTest
}

// Test 3: Sound System Initialization
function testSoundSystem() {
  console.log('🔊 Testing Sound System...')

  const volumeButton = document.querySelector('.volume-button')
  const soundSystemLoaded = volumeButton !== null

  console.log('Volume button found:', soundSystemLoaded)

  if (soundSystemLoaded) {
    console.log('Volume button classes:', volumeButton.className)
    console.log('Volume button visible:', getComputedStyle(volumeButton).display !== 'none')
  }

  console.log('✅ Sound system test:', soundSystemLoaded ? 'PASS' : 'FAIL')
  return soundSystemLoaded
}

// Test 4: Mobile Responsiveness
function testMobileResponsiveness() {
  console.log('📱 Testing Mobile Responsiveness...')

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  console.log('Current viewport:', viewport)

  // Test if mobile styles are applied
  const testElement = document.createElement('div')
  testElement.className = 'test-mobile'
  document.body.appendChild(testElement)

  // Force mobile viewport simulation
  const originalViewport = document.querySelector('meta[name="viewport"]')
  console.log('Viewport meta tag:', originalViewport ? originalViewport.content : 'Not found')

  // Check for mobile-specific CSS rules
  const mobileRules = Array.from(document.styleSheets)
    .flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || [])
      } catch (e) {
        return []
      }
    })
    .filter(rule => rule.type === CSSRule.MEDIA_RULE)
    .filter(rule => rule.conditionText.includes('max-width'))

  console.log('Mobile media queries found:', mobileRules.length)

  document.body.removeChild(testElement)

  const responsiveTest = mobileRules.length > 0
  console.log('✅ Mobile responsiveness test:', responsiveTest ? 'PASS' : 'FAIL')
  return responsiveTest
}

// Test 5: Touch Target Sizes
function testTouchTargets() {
  console.log('👆 Testing Touch Target Sizes...')

  const buttons = document.querySelectorAll('button, .home-link, .about-link, .volume-button')
  console.log('Found', buttons.length, 'interactive elements')

  const smallTargets = []
  buttons.forEach((button, index) => {
    const rect = button.getBoundingClientRect()
    const minSize = Math.min(rect.width, rect.height)

    if (minSize < 44) {
      smallTargets.push({
        index,
        element: button.className || button.tagName,
        size: { width: rect.width, height: rect.height }
      })
    }
  })

  console.log('Small touch targets found:', smallTargets.length)
  if (smallTargets.length > 0) {
    console.log('Problematic elements:', smallTargets)
  }

  const touchTest = smallTargets.length === 0
  console.log('✅ Touch target test:', touchTest ? 'PASS' : 'FAIL')
  return touchTest
}

// Test 6: Game System Functionality
function testGameSystem() {
  console.log('🎮 Testing Game System...')

  const gameButtons = document.querySelectorAll('.game-buttons button')
  const gameControls = document.querySelector('.game-controls')

  console.log('Game selection buttons found:', gameButtons.length)
  console.log('Game controls visible:', gameControls ? !gameControls.classList.contains('hidden') : 'Not found')

  // Test if games can be selected
  const gameTest = gameButtons.length >= 5 // Should have at least 5 games
  console.log('✅ Game system test:', gameTest ? 'PASS' : 'FAIL')
  return gameTest
}

// Test 7: Dog Facts System
function testDogFacts() {
  console.log('🐕 Testing Dog Facts System...')

  // This is harder to test programmatically, but we can check if the system is initialized
  const inputField = document.querySelector('.message-input')
  const sendButton = document.querySelector('.input-form button[type="submit"]')

  console.log('Input field found:', !!inputField)
  console.log('Send button found:', !!sendButton)

  const factsTest = !!(inputField && sendButton)
  console.log('✅ Dog facts input test:', factsTest ? 'PASS' : 'FAIL')
  return factsTest
}

// Test 8: Quick Actions
function testQuickActions() {
  console.log('⚡ Testing Quick Actions...')

  const quickActionButtons = document.querySelectorAll('.quick-actions button')
  console.log('Quick action buttons found:', quickActionButtons.length)

  const quickTest = quickActionButtons.length >= 8 // Should have at least 8 quick actions
  console.log('✅ Quick actions test:', quickTest ? 'PASS' : 'FAIL')
  return quickTest
}

// Main Test Runner
function runRegressionTests() {
  console.log('🚀 RUNNING DAISYDOG V2.0 REGRESSION TESTS...\n')

  const results = {
    avatarSizes: testAvatarSizes(),
    hungerSystem: testHungerSystem(),
    soundSystem: testSoundSystem(),
    mobileResponsive: testMobileResponsiveness(),
    touchTargets: testTouchTargets(),
    gameSystem: testGameSystem(),
    dogFacts: testDogFacts(),
    quickActions: testQuickActions()
  }

  console.log('\n📊 REGRESSION TEST RESULTS:')
  console.table(results)

  const passedTests = Object.values(results).filter(result => result).length
  const totalTests = Object.keys(results).length

  console.log(`\n🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`)

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! DaisyDog v2.0 is working correctly!')
  } else {
    console.log('⚠️ Some tests failed. Check the results above for details.')
  }

  return results
}

// Auto-run tests when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runRegressionTests)
} else {
  // Page already loaded
  setTimeout(runRegressionTests, 2000) // Wait for React to load
}

// Export for manual testing
window.runDaisyRegressionTests = runRegressionTests

console.log('🧪 Regression test suite loaded. Run runDaisyRegressionTests() to test manually.')
