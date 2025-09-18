// Paste this entire block into your browser console:

// Test 1: Check if API key exists
console.log('🔑 API Key Check:')
console.log('Key exists:', !!import.meta.env.VITE_GEMINI_API_KEY)
console.log('Key value:', import.meta.env.VITE_GEMINI_API_KEY || 'undefined')
console.log('Is placeholder:', import.meta.env.VITE_GEMINI_API_KEY === 'your_actual_gemini_api_key_here')

// Test 2: Try to import and test Gemini service
import('./src/services/GeminiService.js').then(async (module) => {
  const { isGeminiAvailable, generateGeminiResponse } = module

  console.log('🧠 Gemini Service Test:')
  console.log('Service available:', isGeminiAvailable())

  if (isGeminiAvailable()) {
    console.log('Testing API call...')
    try {
      const response = await generateGeminiResponse('Hello Daisy!')
      console.log('✅ Success! Response:', response)
    } catch (error) {
      console.log('❌ API call failed:', error.message)
    }
  } else {
    console.log('❌ Gemini not available - check API key setup')
  }
}).catch(error => {
  console.log('❌ Failed to load Gemini service:', error.message)
})
