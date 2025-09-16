# DaisyDog Deployment Guide

## Prerequisites Setup

### 1. Install Node.js
```bash
# Download and install Node.js from https://nodejs.org/
# Or use winget (requires approval):
winget install OpenJS.NodeJS
```

### 2. Install Git
```bash
# Download and install Git from https://git-scm.com/
# Or use winget (requires approval):
winget install Git.Git
```

### 3. Restart your terminal/command prompt after installations

## Local Development Setup

### 1. Install Dependencies
```bash
cd C:\Users\brian\CascadeProjects\daisydog
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Netlify Deployment Options

### Option 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Build the Project**
```bash
npm run build
```

4. **Deploy to Netlify**
```bash
# For first deployment
netlify deploy --prod --dir=dist

# Or initialize and deploy
netlify init
netlify deploy --prod
```

### Option 2: GitHub + Netlify Auto-Deploy

1. **Initialize Git Repository**
```bash
git init
git add .
git commit -m "Initial commit: DaisyDog React frontend"
```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create repository named "daisydog"
   - Don't initialize with README (we already have files)

3. **Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/daisydog.git
git branch -M main
git push -u origin main
```

4. **Connect to Netlify**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

5. **Configure Environment Variables in Netlify**
   - Go to Site settings > Environment variables
   - Add the following variables:
     ```
     VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
     VITE_API_BASE_URL_PROD=https://daisydog-api.herokuapp.com
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

### Option 3: Manual Netlify Deploy

1. **Build the project locally**
```bash
npm run build
```

2. **Go to Netlify Dashboard**
   - Visit https://netlify.com
   - Drag and drop the `dist` folder to deploy

## Environment Variables Configuration

The following environment variables are configured:

- `VITE_ANTHROPIC_API_KEY`: Your Anthropic API key for Claude integration
- `VITE_API_BASE_URL`: Backend API URL for development
- `VITE_API_BASE_URL_PROD`: Backend API URL for production
- `VITE_SUPABASE_URL`: Supabase project URL (if using Supabase)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (if using Supabase)

## Verification Steps

After deployment:

1. **Check API Key Access**
   - Open browser developer tools
   - Go to the chat page
   - Verify `import.meta.env.VITE_ANTHROPIC_API_KEY` is accessible
   - Test chat functionality

2. **Test All Pages**
   - Landing page: Check animations and navigation
   - Chat page: Test Daisy interactions and feeding
   - About page: Verify content and styling

3. **Mobile Responsiveness**
   - Test on different screen sizes
   - Verify touch interactions work properly

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript/ESLint errors: `npm run lint`
- Verify environment variables are set correctly

### API Key Issues
- Ensure the API key starts with `sk-ant-api03-`
- Verify it's set as `VITE_ANTHROPIC_API_KEY` (with VITE_ prefix)
- Check Netlify environment variables are configured

### Deployment Issues
- Verify build command is `npm run build`
- Ensure publish directory is set to `dist`
- Check build logs for specific errors

## Production Checklist

- [ ] All environment variables configured
- [ ] API key working in production
- [ ] All pages loading correctly
- [ ] Chat functionality working
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Security headers configured (via netlify.toml)
- [ ] Custom domain configured (optional)

## Custom Domain Setup (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add custom domain: `daisydog.netlify.app` or your own domain
3. Configure DNS settings as instructed
4. Enable HTTPS (automatic with Netlify)

## Support

If you encounter issues:
1. Check the build logs in Netlify dashboard
2. Verify all environment variables are set
3. Test locally first with `npm run dev`
4. Check browser console for JavaScript errors
