# 🚀 DaisyDog v1.5.0 Deployment Guide

## 📋 Pre-Deployment Checklist

### **Environment Requirements**
- **Node.js:** v18.0.0 or higher
- **npm:** v8.0.0 or higher
- **Git:** Latest version for repository management
- **Modern Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### **Repository Setup**
- **GitHub Repository:** Configured with proper permissions
- **Branch Protection:** Main branch protected with required reviews
- **Secrets Management:** Environment variables configured in GitHub Secrets
- **Actions Enabled:** GitHub Actions workflow permissions set

## 🔧 Environment Variables Configuration

### **Required Environment Variables**

#### **For Local Development (.env.local)**
```bash
# AI API Keys (Optional but recommended)
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
VITE_OPENAI_API_KEY=your_openai_key_here

# Safety Configuration
VITE_DEBUG_MODE=true
VITE_LOG_API_STATUS=true
VITE_SAFETY_LEVEL=strict

# Development Settings
VITE_ENVIRONMENT=development
VITE_VERSION=1.5.0
```

#### **For Production Deployment**
```bash
# AI API Keys (Production)
VITE_ANTHROPIC_API_KEY=prod_anthropic_key
VITE_OPENAI_API_KEY=prod_openai_key

# Safety Configuration
VITE_DEBUG_MODE=false
VITE_LOG_API_STATUS=false
VITE_SAFETY_LEVEL=strict

# Production Settings
VITE_ENVIRONMENT=production
VITE_VERSION=1.5.0
VITE_BASE_URL=https://yourdomain.com
```

### **GitHub Secrets Configuration**

Navigate to **Repository Settings → Secrets and Variables → Actions** and add:

```bash
# Required Secrets
VITE_ANTHROPIC_API_KEY=your_production_anthropic_key
VITE_OPENAI_API_KEY=your_production_openai_key

# Optional Secrets
VITE_DEBUG_MODE=false
VITE_LOG_API_STATUS=false
VITE_SAFETY_LEVEL=strict
```

## 🏗️ Build Configuration

### **GitHub Actions Workflow (.github/workflows/deploy.yml)**
```yaml
name: Deploy DaisyDog v1.5.0

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run test:safety
      
    - name: Build application
      run: npm run build
      env:
        VITE_ANTHROPIC_API_KEY: ${{ secrets.VITE_ANTHROPIC_API_KEY }}
        VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
        VITE_DEBUG_MODE: false
        VITE_LOG_API_STATUS: false
        VITE_SAFETY_LEVEL: strict
        VITE_VERSION: 1.5.0
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### **Vite Configuration (vite.config.js)**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/daisydog/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          icons: ['react-icons']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})
```

## 🌐 Deployment Platforms

### **GitHub Pages (Recommended)**

#### **Setup Steps:**
1. **Enable GitHub Pages:**
   - Go to Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

2. **Configure Custom Domain (Optional):**
   ```bash
   # Add CNAME file to public folder
   echo "yourdomain.com" > public/CNAME
   ```

3. **Update Base URL:**
   ```javascript
   // vite.config.js
   base: '/daisydog/' // For GitHub Pages
   // OR
   base: '/' // For custom domain
   ```

### **Netlify Deployment**

#### **netlify.toml Configuration:**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  VITE_VERSION = "1.5.0"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_DEBUG_MODE = "false"
  VITE_LOG_API_STATUS = "false"
  VITE_SAFETY_LEVEL = "strict"
```

#### **Environment Variables in Netlify:**
1. Go to Site Settings → Environment Variables
2. Add all required VITE_ prefixed variables
3. Deploy from GitHub repository

### **Vercel Deployment**

#### **vercel.json Configuration:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_VERSION": "1.5.0"
  }
}
```

## 🔒 Security Considerations

### **API Key Management**
- **Never commit API keys** to repository
- **Use GitHub Secrets** for production keys
- **Rotate keys regularly** (quarterly recommended)
- **Monitor API usage** for unusual patterns

### **Content Security Policy**
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.anthropic.com https://api.openai.com;
  font-src 'self';
">
```

### **Environment Validation**
```javascript
// Add to main.jsx
const requiredEnvVars = ['VITE_VERSION'];
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.warn('Missing environment variables:', missingVars);
}
```

## 📊 Monitoring & Analytics

### **Performance Monitoring**
```javascript
// Add to App.jsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### **Error Tracking**
```javascript
// Add error boundary and logging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to error tracking service
});
```

## 🧪 Testing Before Deployment

### **Pre-Deployment Tests**
```bash
# Install dependencies
npm ci

# Run safety tests
npm run test:safety

# Run local response tests
npm run test:local

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Manual Testing Checklist**
- [ ] **Landing Page:** All animations and navigation working
- [ ] **Chat Interface:** Messages sending and receiving
- [ ] **Quick Actions:** All buttons triggering correct responses
- [ ] **Interactive Games:** All game types with sub-buttons
- [ ] **Mobile Responsiveness:** All screen sizes working
- [ ] **API Integration:** Both with and without API keys
- [ ] **Safety Systems:** Content filtering active
- [ ] **Performance:** Page load times <3 seconds

## 🚀 Deployment Commands

### **GitHub Pages Deployment**
```bash
# Build and deploy to GitHub Pages
npm run build
git add dist -f
git commit -m "Deploy v1.5.0"
git subtree push --prefix dist origin gh-pages
```

### **Manual Deployment**
```bash
# Build for production
npm run build

# Upload dist folder to your hosting provider
# Ensure all environment variables are configured
```

## 📈 Post-Deployment Verification

### **Functionality Tests**
1. **Visit deployed URL**
2. **Test all quick actions**
3. **Start and play each game type**
4. **Verify mobile responsiveness**
5. **Check console for errors**
6. **Test API integration (if configured)**

### **Performance Checks**
- **Lighthouse Score:** Aim for 90+ in all categories
- **Page Load Speed:** <3 seconds on 3G
- **Interactive Elements:** All buttons responsive
- **Memory Usage:** No memory leaks during extended use

## 🎉 Success Metrics

### **Deployment Success Indicators**
- ✅ **Build completes** without errors
- ✅ **All tests pass** in CI/CD pipeline
- ✅ **Site loads** at deployed URL
- ✅ **Interactive games** work with sub-buttons
- ✅ **Quick actions** provide immediate responses
- ✅ **Mobile experience** fully functional
- ✅ **No console errors** in production

---

**🚀 DaisyDog v1.5.0 is ready for deployment with enhanced interactive features and robust safety systems! 🐕✨**
