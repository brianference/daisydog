# DaisyDog Gemini API Setup Guide

## Complete Google Gemini Integration

DaisyDog now uses **Google Gemini exclusively** for all AI features including:
- Enhanced conversational responses
- Content moderation and safety
- Child-appropriate content filtering

### 1. Create Local Environment File
Create a `.env.local` file in your project root:

```bash
# .env.local
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Optional safety configuration
VITE_DEBUG_MODE=true
VITE_CHILD_SAFETY_MODE=true
VITE_DEFAULT_USER_AGE=12
```

### 2. Install Google Generative AI SDK
```bash
npm install @google/generative-ai
```

### 3. Features Powered by Gemini

**SafeAI System Integration:**
- Dual-model approach: One for conversations, one for content moderation
- Built-in safety settings with child-appropriate thresholds
- Real-time content filtering and validation
- Automatic fallback to local responses if API unavailable

**Enhanced Safety Features:**
- Multi-layer content moderation using Gemini's safety features
- Age-appropriate response filtering
- Personal information detection and blocking
- Harmful content redirection to positive topics

### 4. Technical Implementation

The integration uses two Gemini models:
- **Main Model**: `gemini-1.5-flash` for conversations (temperature: 0.7)
- **Moderation Model**: `gemini-1.5-flash` for safety checks (temperature: 0.1)

Both models include comprehensive safety settings:
```javascript
safetySettings: [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
]
```

## API Key Security Notes

- ✅ **Local Development**: Use `.env.local` (not committed to git)
- ✅ **Production**: Use Netlify environment variables
- ✅ **Security**: Never commit API keys to version control
- ✅ **Fallback**: App works without API key (local responses)

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env.local` file
4. The same key works for both local development and Netlify deployment
