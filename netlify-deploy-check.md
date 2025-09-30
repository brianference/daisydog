# Netlify Production Deployment Checklist

## Environment Variables Required in Netlify Dashboard:

### Essential Variables:
1. `OPENAI_API_KEY` - Your OpenAI API key for voice features
2. `VOICE_FUNCTION_SECRET` - Secret for HMAC token generation
3. `VITE_SUPABASE_URL` - Your Supabase project URL
4. `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
5. `VITE_GEMINI_API_KEY` - Your Gemini API key

### How to Add in Netlify:
1. Go to your Netlify site dashboard
2. Click "Site settings" → "Environment variables"
3. Add each variable with its value
4. Redeploy your site

## Functions Deployment:
- Functions directory: `netlify/functions`
- Node bundler: `esbuild`
- Functions will be available at: `/.netlify/functions/{function-name}`

## After Setting Variables:
1. Trigger a new deployment
2. Check function logs in Netlify dashboard
3. Test voice features in production
