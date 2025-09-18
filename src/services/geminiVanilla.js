// DaisyDog Gemini Integration - Ultra-Concise Vanilla JS
// Child-safe, dog-themed AI responses for Netlify deployment

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Chat history for context (maintains conversation)
let chatHistory = []

// Safety filter - block medium+ harm content
const isSafeContent = (text) => {
  const unsafePatterns = [
    /\b(hate|kill|hurt|die|dead|blood|weapon|drugs?|alcohol|sex|naked|nude)\b/i,
    /violence|fight|attack|bomb|gun|knife/i,
    /swear|curse|damn|hell|asshole|fuck|shit|bitch/i
  ]
  return !unsafePatterns.some(pattern => pattern.test(text))
}

// Generate DaisyDog response using Gemini API
export const askDaisyDog = async (userMessage) => {
  if (!GEMINI_API_KEY) {
    console.log('❌ No Gemini API key found')
    return "Woof! I'm using my basic responses right now! 🐕"
  }

  // Safety check user input
  if (!isSafeContent(userMessage)) {
    console.log('🛡️ Filtered unsafe content:', userMessage)
    return "Woof! Let's keep things fun and friendly! 🐕💕"
  }

  try {
    console.log('🚀 Starting Gemini API call for:', userMessage)

    // Add user message to history
    chatHistory.push({ role: 'user', content: userMessage })

    // Keep only last 5 messages for context
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10)
    }

    // Build context from history
    const context = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')

    const systemPrompt = "You are DaisyDog, fun puppy AI for kids. Keep replies positive, short (<100 words), G-rated—no scary/adult stuff. End with a question."

    const payload = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nChat history:\n${context}\n\nRespond to: ${userMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    }

    console.log('📡 Making API request to Gemini...')
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    console.log('📡 API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API error:', response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📦 API response data:', data)

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text.trim()
      console.log('✅ Raw AI response:', aiResponse)

      // Safety check AI response
      if (!isSafeContent(aiResponse)) {
        console.log('🛡️ Filtered unsafe AI response')
        return "Woof! Let's keep things fun and friendly! 🐕💕"
      }

      // Add AI response to history
      chatHistory.push({ role: 'assistant', content: aiResponse })

      console.log('🎉 Final response:', aiResponse)
      return aiResponse
    } else {
      console.error('❌ No response content in API response:', data)
      throw new Error('No response generated')
    }

  } catch (error) {
    console.error('💥 Gemini API error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      apiKeyPresent: !!GEMINI_API_KEY,
      apiKeyLength: GEMINI_API_KEY?.length
    })
    return "Woof! Try again, little buddy! 🐕"
  }
}

// Check if Gemini is available
export const isGeminiReady = () => {
  return !!GEMINI_API_KEY
}

// Reset chat history
export const resetChatHistory = () => {
  chatHistory = []
}

// Get chat history for debugging
export const getChatHistory = () => {
  return [...chatHistory]
}
