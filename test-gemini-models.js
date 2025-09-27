// Test script to check available Gemini models
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'your_api_key_here';

async function testModels() {
  console.log('🧪 Testing Gemini Models...');
  
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error('❌ No API key provided');
    return;
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Test different model names
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n🔍 Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Hello');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} - WORKS! Response: ${text.substring(0, 50)}...`);
    } catch (error) {
      console.log(`❌ ${modelName} - FAILED: ${error.message}`);
    }
  }
}

testModels().catch(console.error);
