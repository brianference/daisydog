# Quick Restore Guide - DaisyDog v3.7.0
## Enhanced Dance Sound Integration

**Version:** 3.7.0  
**Date:** September 19, 2025  
**Status:** Production Ready ✅

---

## 🚀 **One-Command Restore**

```bash
# Quick restore to v3.7.0 (when available)
git reset --hard v3.7.0
git clean -fd
npm install
npm run dev
```

---

## 📋 **Step-by-Step Restoration**

### **1. Clone Repository**
```bash
git clone https://github.com/brianference/daisydog.git
cd daisydog
```

### **2. Checkout Version 3.7.0**
```bash
git checkout v3.7.0
# or if restoring from main branch
git pull origin main
```

### **3. Install Dependencies**
```bash
npm install
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Verify Functionality**
- Open browser to displayed localhost URL
- Click the 💃 Dance button
- Verify custom dance music plays (not barking)
- Test other core features (games, feeding, chat)

---

## ✅ **Version 3.7.0 Features Verification**

### **Core Functionality Checklist**
- [ ] **Chat System**: Natural conversation with Daisy
- [ ] **AI Integration**: Gemini API with local fallback
- [ ] **Game System**: All 5 games working (Fetch, Tug, Hide & Seek, Ball Catch, Guessing)
- [ ] **Feeding System**: Hunger mechanics and treat rewards
- [ ] **Sound System**: All audio feedback working
- [ ] **Dance Feature**: Custom dance music plays on dance button ⭐ NEW
- [ ] **Emotion System**: Dynamic images and personality
- [ ] **Mobile Support**: Responsive design on mobile devices

### **New in v3.7.0 - Dance Sound Integration**
- [ ] **Custom Dance Music**: `dance-sound.mp3` plays when dancing
- [ ] **Enhanced Detection**: Detects "dance", "spin", "ta-da" keywords
- [ ] **Emotion Mapping**: Dancing emotion triggers custom music
- [ ] **No Barking**: Dance button no longer plays dog barking sounds

---

## 🔧 **Technical Verification**

### **File Structure Check**
```bash
# Verify key files exist
ls -la public/sounds/dog/dance-sound.mp3  # Should be ~98KB
ls -la src/services/SoundService.js
ls -la src/hooks/useSoundManagerModular.js
ls -la VERSION_3.7_RELEASE_NOTES.md
```

### **Package Version Check**
```bash
# Verify version in package.json
grep '"version"' package.json
# Should show: "version": "3.7.0"
```

### **Console Verification**
Open browser console and test:
```javascript
// Check sound service status
window.console.log('Testing dance sound integration...')

// Verify sound files loaded
// Look for successful audio loading messages
// No error messages about missing dance-sound.mp3
```

---

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### **Dance Sound Not Playing**
```bash
# Check if file exists
ls -la public/sounds/dog/dance-sound.mp3

# Verify browser audio permissions
# Check browser console for audio errors
# Test with volume unmuted
```

#### **Dependencies Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### **Git Issues**
```bash
# Force clean restore
git reset --hard HEAD
git clean -fd
git pull origin main
```

#### **Port Conflicts**
```bash
# If port 5173 is busy, Vite will auto-select next available port
# Check terminal output for actual port number
```

---

## 🌐 **Environment Setup**

### **Required Environment Variables**
```bash
# Optional - for AI functionality
VITE_GEMINI_API_KEY=your_api_key_here

# Development settings
VITE_DEBUG_MODE=true
```

### **Browser Requirements**
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

---

## 📱 **Mobile Testing**

### **iOS Testing**
1. Open Safari on iPhone/iPad
2. Navigate to development URL
3. Test dance button functionality
4. Verify audio plays after user interaction

### **Android Testing**
1. Open Chrome on Android device
2. Navigate to development URL
3. Test dance button functionality
4. Verify audio permissions granted

---

## 🔄 **Rollback Options**

### **Rollback to v3.6.1 (Previous Stable)**
```bash
git reset --hard d5fe9e7  # v3.6.1 commit hash
git clean -fd
npm install
npm run dev
```

### **Rollback to v3.5.0 (AI Integration)**
```bash
# See QUICK_RESTORE_V3.5.md for complete instructions
git checkout v3.5.0
npm install
npm run dev
```

---

## 📊 **Performance Expectations**

### **Load Times**
- **Initial Load**: < 3 seconds on broadband
- **Audio Loading**: < 1 second for dance sound
- **Game Startup**: < 500ms
- **AI Response**: < 2 seconds (when available)

### **Memory Usage**
- **Base App**: ~15MB RAM
- **With Audio**: ~20MB RAM
- **All Features**: ~25MB RAM

---

## 🆘 **Emergency Restore**

### **If Everything Breaks**
```bash
# Nuclear option - completely fresh start
rm -rf daisydog
git clone https://github.com/brianference/daisydog.git
cd daisydog
npm install
npm run dev
```

### **Contact Information**
- **Repository**: https://github.com/brianference/daisydog
- **Issues**: https://github.com/brianference/daisydog/issues
- **Documentation**: See VERSION_3.7_RELEASE_NOTES.md

---

## 🎯 **Success Criteria**

**Version 3.7.0 is successfully restored when:**
- ✅ App loads without errors
- ✅ Dance button plays custom music (not barking)
- ✅ All games function properly
- ✅ AI chat works (with or without API key)
- ✅ Sound system responds to all interactions
- ✅ Mobile layout displays correctly
- ✅ No console errors related to audio loading

---

## 📝 **Version History**

- **v3.7.0**: Enhanced Dance Sound Integration
- **v3.6.1**: Stable Working Restore
- **v3.6.0**: Enhanced Audio Experience
- **v3.5.0**: Complete Gemini AI Integration
- **v3.2.x**: AI Integration Development

---

*This guide ensures reliable restoration of DaisyDog v3.7.0 with full dance sound integration functionality.*

**Created:** September 19, 2025  
**Author:** Brian Ference  
**Status:** Production Ready
