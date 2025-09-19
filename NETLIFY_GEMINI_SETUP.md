# 🚀 Netlify Gemini API Setup Guide

## The Problem
Your DaisyDog app shows "Local Mode" with a greyed out brain icon on the live Netlify site, even though it works locally. This is because the Gemini API key is not configured for production deployment.

## The Solution

### Step 1: Configure Environment Variables in Netlify
1. **Go to your Netlify dashboard**: https://app.netlify.com/
2. **Select your DaisyDog site**
3. **Navigate to**: Site settings → Environment variables
4. **Add a new environment variable**:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key (the same one from your .env.local)
5. **Click "Save"**

### Step 2: Redeploy Your Site
After adding the environment variable:
1. **Go to**: Deploys tab in Netlify
2. **Click**: "Trigger deploy" → "Deploy site"
3. **Wait**: For the build to complete (2-3 minutes)

### Step 3: Test the Fix
1. **Visit**: https://daisydog.netlify.app/chat
2. **Check**: The brain icon should now be green 🧠
3. **Test**: Ask Daisy "What's your favorite color?" 
4. **Verify**: You get a creative AI response (not a fallback)

## Troubleshooting

### If Still Not Working:

#### Check API Key Restrictions
1. **Go to**: https://aistudio.google.com/app/apikey
2. **Find your API key**
3. **Check**: If there are any domain restrictions
4. **Add**: `daisydog.netlify.app` to allowed domains (if restricted)

#### Check Google Cloud Billing
1. **Go to**: https://console.cloud.google.com/
2. **Navigate to**: Billing
3. **Verify**: Billing account is linked and active
4. **Check**: Generative Language API is enabled

#### Debug in Production
1. **Open browser console** on the live site
2. **Run**: `GeminiService.debugStatus()`
3. **Check**: For specific error messages
4. **Look for**: Quota, billing, or authentication errors

### Common Issues:

**"API_KEY_INVALID"**
- API key not properly set in Netlify environment variables
- API key has domain restrictions

**"Quota Exceeded"** 
- Free tier limit reached
- Need to enable billing in Google Cloud

**"Billing Required"**
- Google Cloud billing account not linked
- Payment method needs verification

## Expected Results

### Before Fix:
- ❌ Grey brain icon 📝 (Local Mode)
- ❌ Basic fallback responses only
- ❌ Console shows "Using local response system"

### After Fix:
- ✅ Green brain icon 🧠 (AI Active)
- ✅ Natural, creative AI responses
- ✅ Console shows "Gemini AI initialized successfully"

## Verification Commands

Run these in the browser console on your live site:

```javascript
// Check if API key is configured
console.log('API Key configured:', !!import.meta.env.VITE_GEMINI_API_KEY)

// Test Gemini service
GeminiService.forceRetry()

// Get detailed status
GeminiService.debugStatus()
```

---

**The key issue is that environment variables need to be configured in Netlify's dashboard, not just in your local .env.local file!**