// Quick Gemini Test - Run in browser console
// Test the new vanilla JS Gemini integration

async function testGeminiIntegration() {
  console.log('🧠 Testing Gemini Integration...')

  // Test 1: Check if service is available
  const { askDaisyDog, isGeminiReady, getChatHistory } = await import('./services/geminiVanilla.js')
  console.log('✅ Gemini service imported')

  // Test 2: Check API key
  const hasApiKey = isGeminiReady()
  console.log('API Key Status:', hasApiKey ? '✅ Present' : '❌ Missing')

  if (!hasApiKey) {
    console.log('❌ No API key found. Add VITE_GEMINI_API_KEY to .env.local')
    return
  }

  // Test 3: Test actual API call
  try {
    console.log('🧠 Testing API call...')
    const response = await askDaisyDog('Hello Daisy! Tell me about dogs.')
    console.log('✅ API Response:', response)

    // Test 4: Check chat history
    const history = getChatHistory()
    console.log('📚 Chat History:', history)

    console.log('🎉 Gemini integration test PASSED!')

  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

// Make it available globally
window.testGeminiIntegration = testGeminiIntegration

console.log('🧠 Run testGeminiIntegration() to test the Gemini integration')
