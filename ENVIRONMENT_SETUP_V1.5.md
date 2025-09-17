# 🔧 Environment Setup for DaisyDog v1.5.0

## 📋 Required Environment Variables

### **Local Development (.env.local)**
Create a `.env.local` file in your project root:

```bash
# AI API Keys (Optional but recommended for enhanced responses)
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

### **Production Environment**
For production deployment, set these environment variables:

```bash
# AI API Keys (Production)
VITE_ANTHROPIC_API_KEY=your_production_anthropic_key
VITE_OPENAI_API_KEY=your_production_openai_key

# Safety Configuration
VITE_DEBUG_MODE=false
VITE_LOG_API_STATUS=false
VITE_SAFETY_LEVEL=strict

# Production Settings
VITE_ENVIRONMENT=production
VITE_VERSION=1.5.0
VITE_BASE_URL=https://yourdomain.com
```

## 🔑 API Key Setup

### **Anthropic Claude API**
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to your environment variables

**Pricing:** Pay-per-use, typically $0.01-0.03 per 1K tokens

### **OpenAI API (for Content Moderation)**
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new secret key
5. Copy the key to your environment variables

**Pricing:** Moderation API is free for most use cases

## 🛡️ GitHub Secrets Configuration

For automated deployment, configure these secrets in your GitHub repository:

**Repository Settings → Secrets and Variables → Actions**

### **Required Secrets:**
```bash
VITE_ANTHROPIC_API_KEY=your_production_anthropic_key
VITE_OPENAI_API_KEY=your_production_openai_key
```

### **Optional Secrets:**
```bash
VITE_DEBUG_MODE=false
VITE_LOG_API_STATUS=false
VITE_SAFETY_LEVEL=strict
```

## ⚙️ Quick Setup Commands

### **Automated Setup**
```bash
# Run the setup script
npm run setup:apis

# This will:
# 1. Create .env.local from template
# 2. Guide you through API key setup
# 3. Validate configuration
# 4. Test API connections
```

### **Manual Setup**
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit the file with your API keys
nano .env.local

# Install dependencies
npm install

# Test the setup
npm run dev
```

## 🧪 Testing Your Setup

### **Verify Environment Variables**
```bash
# Check if variables are loaded
npm run version

# Should output: "Daisy Dog v1.5.0 - Interactive Games & Enhanced UI"
```

### **Test API Integration**
```bash
# Run safety tests
npm run test:safety

# Run local response tests
npm run test:local

# Start development server
npm run dev
```

### **Manual Testing Checklist**
- [ ] **Landing page loads** without errors
- [ ] **Chat interface** accepts messages
- [ ] **Quick actions** work immediately
- [ ] **Interactive games** start with sub-buttons
- [ ] **API status** shows in console (if debug mode enabled)
- [ ] **Safety systems** active (try inappropriate content)

## 🚀 Deployment Environments

### **GitHub Pages**
```bash
# Environment variables are set via GitHub Secrets
# Build process automatically uses production settings
# No additional configuration needed
```

### **Netlify**
```bash
# Set environment variables in Netlify dashboard:
# Site Settings → Environment Variables
VITE_ANTHROPIC_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
VITE_DEBUG_MODE=false
VITE_SAFETY_LEVEL=strict
```

### **Vercel**
```bash
# Set environment variables in Vercel dashboard:
# Project Settings → Environment Variables
VITE_ANTHROPIC_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
VITE_DEBUG_MODE=false
VITE_SAFETY_LEVEL=strict
```

## 🔒 Security Best Practices

### **API Key Security**
- ✅ **Never commit API keys** to version control
- ✅ **Use different keys** for development and production
- ✅ **Rotate keys regularly** (quarterly recommended)
- ✅ **Monitor API usage** for unusual patterns
- ✅ **Set usage limits** on API provider dashboards

### **Environment File Security**
```bash
# Add to .gitignore (already included)
.env.local
.env.production
.env.development

# Verify files are ignored
git status
# Should not show .env.local as untracked
```

### **Production Checklist**
- [ ] **API keys** are production-ready
- [ ] **Debug mode** is disabled
- [ ] **Safety level** is set to strict
- [ ] **Base URL** matches your domain
- [ ] **HTTPS** is enforced
- [ ] **Content Security Policy** is configured

## 🛠️ Troubleshooting

### **Common Issues**

**Issue: "API key not found"**
```bash
# Solution: Check environment variable names
echo $VITE_ANTHROPIC_API_KEY
# Should output your key, not empty
```

**Issue: "Build fails with environment errors"**
```bash
# Solution: Ensure all required variables are set
npm run build
# Check build output for missing variables
```

**Issue: "API calls failing in production"**
```bash
# Solution: Verify production API keys are valid
# Check API provider dashboards for usage/errors
```

**Issue: "Safety systems not working"**
```bash
# Solution: Verify OpenAI API key is set
# Check console for moderation API errors
```

### **Debug Mode**
Enable debug mode for detailed logging:
```bash
# In .env.local
VITE_DEBUG_MODE=true
VITE_LOG_API_STATUS=true

# Restart development server
npm run dev

# Check browser console for detailed logs
```

## 📊 Environment Validation

### **Validation Script**
```javascript
// Add to your app for environment validation
const requiredEnvVars = [
  'VITE_VERSION',
  'VITE_ENVIRONMENT'
];

const optionalEnvVars = [
  'VITE_ANTHROPIC_API_KEY',
  'VITE_OPENAI_API_KEY'
];

// Check required variables
const missingRequired = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingRequired.length > 0) {
  console.error('Missing required environment variables:', missingRequired);
}

// Check optional variables
const missingOptional = optionalEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingOptional.length > 0) {
  console.warn('Missing optional environment variables (AI features limited):', missingOptional);
}
```

## 🎯 Success Indicators

### **Setup Complete When:**
- ✅ **Development server** starts without errors
- ✅ **All quick actions** work immediately
- ✅ **Interactive games** show sub-buttons
- ✅ **API status** logs appear (if debug enabled)
- ✅ **Safety systems** are active
- ✅ **Build process** completes successfully
- ✅ **Production deployment** works without issues

---

**🔧 Your DaisyDog v1.5.0 environment is now ready for development and deployment! 🐕✨**
