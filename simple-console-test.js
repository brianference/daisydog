// SIMPLER CONSOLE TEST - No import.meta required
// Copy and paste this into browser console:

console.log('🔍 DAISYDOG GEMINI DEBUG TEST')
console.log('=================================')

// Test 1: Check if we're in the right environment
console.log('Current URL:', window.location.href)
console.log('Protocol:', window.location.protocol)
console.log('Host:', window.location.host)

// Test 2: Try to access the app's global functions
console.log('Checking for DaisyDog functions...')
console.log('testGemini available:', typeof window.testGemini === 'function')
console.log('checkGeminiStatus available:', typeof window.checkGeminiStatus === 'function')

// Test 3: Try the global functions if available
if (typeof window.testGemini === 'function') {
  console.log('🧪 Testing Gemini function...')
  window.testGemini('Hello from console!')
} else {
  console.log('❌ testGemini function not found')
}

// Test 4: Check localStorage for any saved settings
console.log('LocalStorage check...')
try {
  const savedVolume = localStorage.getItem('daisyDog_volume')
  console.log('Saved volume:', savedVolume)
} catch (error) {
  console.log('LocalStorage error:', error.message)
}

console.log('=================================')
console.log('DEBUG COMPLETE - Check results above!')
