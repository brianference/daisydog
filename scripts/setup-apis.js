#!/usr/bin/env node

/**
 * DaisyDog API Setup Script
 * Helps developers set up API keys for local development
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

console.log('🐕 DaisyDog API Setup Script')
console.log('================================\n')

// Check if .env.local exists
const envLocalPath = path.join(projectRoot, '.env.local')
const envExamplePath = path.join(projectRoot, '.env.local.example')

if (!fs.existsSync(envLocalPath)) {
  console.log('📋 Creating .env.local file...')
  
  if (fs.existsSync(envExamplePath)) {
    // Copy example file
    const exampleContent = fs.readFileSync(envExamplePath, 'utf8')
    fs.writeFileSync(envLocalPath, exampleContent)
    console.log('✅ Created .env.local from template\n')
  } else {
    // Create basic .env.local
    const basicEnv = `# DaisyDog Local Development Environment
# Add your API keys below (uncomment and replace with actual keys)

# Anthropic Claude API (Primary AI)
# VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# OpenAI API (Content Moderation)
# VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Safety Configuration
VITE_CHILD_SAFETY_MODE=true
VITE_DEFAULT_USER_AGE=12
VITE_ENABLE_SAFETY_METRICS=true

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_API_STATUS=true
`
    fs.writeFileSync(envLocalPath, basicEnv)
    console.log('✅ Created basic .env.local file\n')
  }
} else {
  console.log('📋 .env.local file already exists\n')
}

// Check current API key status
console.log('🔍 Checking API Key Status:')
console.log('============================')

try {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  
  const hasAnthropicKey = envContent.includes('VITE_ANTHROPIC_API_KEY=sk-ant-') && 
                         !envContent.includes('# VITE_ANTHROPIC_API_KEY=')
  const hasOpenAIKey = envContent.includes('VITE_OPENAI_API_KEY=sk-') && 
                      !envContent.includes('# VITE_OPENAI_API_KEY=')
  
  console.log(`Anthropic Claude: ${hasAnthropicKey ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`OpenAI Moderation: ${hasOpenAIKey ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`Local Responses: ✅ Always available\n`)
  
  if (!hasAnthropicKey && !hasOpenAIKey) {
    console.log('⚠️  No API keys configured - app will use local responses only')
    console.log('   This is perfectly fine for development and testing!\n')
  }
  
} catch (error) {
  console.log('❌ Error reading .env.local file:', error.message)
}

// Provide setup instructions
console.log('📚 Setup Instructions:')
console.log('======================')
console.log('1. Edit .env.local file in your project root')
console.log('2. Uncomment and add your API keys:')
console.log('   - Anthropic: https://console.anthropic.com/')
console.log('   - OpenAI: https://platform.openai.com/api-keys')
console.log('3. Restart your development server: npm run dev')
console.log('4. Check browser console for API status logs\n')

console.log('💡 Tips:')
console.log('========')
console.log('• The app works fully without API keys using local responses')
console.log('• API keys enable enhanced AI responses and content moderation')
console.log('• All API responses go through additional safety validation')
console.log('• Check safety metrics in the chat interface')
console.log('• Enable debug mode to see API call logs in console\n')

console.log('🔒 Security Reminders:')
console.log('======================')
console.log('• Never commit .env.local to version control')
console.log('• Keep your API keys secure and private')
console.log('• Monitor your API usage and costs')
console.log('• The .env.local file is already in .gitignore\n')

console.log('🎉 Setup complete! Happy coding with DaisyDog! 🐕✨')
