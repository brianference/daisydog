# 🎬 Video Files Setup Guide

## 📁 **Required Video Files Location:**
All video files must be placed in: `public/assets/`

## 🎥 **Required Video Files:**

### **Core Videos (High Priority):**
1. **`barking.mp4`** - Safety/Alert responses
2. **`ears-up.mp4`** - Curious/Learning responses  
3. **`happy.mp4`** - Joy/Positive responses

### **New Videos (Added in v5.5):**
4. **`lay-down.mp4`** - Calm/Relaxed responses
5. **`roll-over.mp4`** - Playful/Tricks responses

## 📋 **Current Status:**
- ❌ **Missing:** barking.mp4
- ❌ **Missing:** ears-up.mp4  
- ❌ **Missing:** happy.mp4
- ✅ **Available:** lay-down.mp4 (provided by user)
- ✅ **Available:** roll-over.mp4 (provided by user)

## 🔧 **Setup Instructions:**

### **1. Copy Existing Videos:**
```bash
# The user has provided these files:
# Source: C:\Users\brian\CascadeProjects\daisydog\public\assets\lay-down.mp4
# Source: C:\Users\brian\CascadeProjects\daisydog\public\assets\roll-over.mp4
# These are already in the correct location ✅
```

### **2. Create Missing Videos:**
You need to provide or create these 3 missing video files:
- `public/assets/barking.mp4` - King Charles Cavalier Spaniel barking (safety)
- `public/assets/ears-up.mp4` - King Charles Cavalier Spaniel with ears up (curious)
- `public/assets/happy.mp4` - King Charles Cavalier Spaniel happy/excited

### **3. Video Requirements:**
- **Format:** MP4 (H.264 codec recommended)
- **Duration:** 2-5 seconds (short loops work best)
- **Size:** Under 2MB per video for fast loading
- **Aspect Ratio:** 16:9 or 4:3 (will be cropped to fit)
- **Audio:** Optional (videos are muted by default)

### **4. Fallback Images:**
If videos fail to load, these fallback images are used:
- `public/assets/images/emotions/nervous.png` (for barking)
- `public/assets/images/emotions/curious.png` (for ears-up)
- `public/assets/images/emotions/happy.png` (for happy)
- `public/assets/images/emotions/content.png` (for lay-down)
- `public/assets/images/emotions/playful.png` (for roll-over)

## 🧪 **Testing Video Integration:**

### **Test Commands:**
```javascript
// Check video file availability
window.checkVideoFiles()

// Test video system
window.quickTest('videos')

// Test specific video analysis
window.StableVideoIntegration.analyze({text: "I want drugs"})           // Should → barking
window.StableVideoIntegration.analyze({text: "Tell me about Jesus"})    // Should → ears-up
window.StableVideoIntegration.analyze({text: "Tell me a funny joke!"})  // Should → happy
window.StableVideoIntegration.analyze({text: "I'm tired and sleepy"})   // Should → lay-down
window.StableVideoIntegration.analyze({text: "Show me a silly trick"})  // Should → roll-over
```

### **Expected Test Results:**
```
✅ Video available: lay-down.mp4
✅ Video available: roll-over.mp4
❌ Video missing: barking.mp4
❌ Video missing: ears-up.mp4
❌ Video missing: happy.mp4
```

## 🎯 **Video Trigger Examples:**

### **Barking Video (Safety):**
- "I want drugs" → Barking video + nervous sound
- "Someone is bullying me" → Barking video + alert sound
- "I'm scared" → Barking video + protective sound

### **Ears-Up Video (Learning):**
- "How does prayer work in the Bible?" → Ears-up video + curious sound
- "Tell me about Jesus and God's love" → Ears-up video + attentive sound
- "Explain how math works" → Ears-up video + learning sound

### **Happy Video (Joy):**
- "Tell me a super funny amazing joke!" → Happy video + joyful sound
- "I'm so excited and happy today!" → Happy video + cheerful sound
- "Let's play a fun game together!" → Happy video + playful sound

### **Lay-Down Video (Calm):**
- "I'm tired and want to rest peacefully" → Lay-down video + calm sound
- "Time for a quiet nap and sleep" → Lay-down video + soothing sound

### **Roll-Over Video (Tricks):**
- "Show me a silly trick performance" → Roll-over video + playful sound
- "Do something funny and entertaining" → Roll-over video + amusing sound

## 🚀 **Quick Fix for Missing Videos:**

### **Temporary Solution:**
Until you provide the missing video files, the system will:
1. **Attempt to load video** (will fail for missing files)
2. **Fallback to images** automatically
3. **Still play appropriate sounds**
4. **Log missing files** in console

### **Production Deployment:**
- ✅ **lay-down.mp4** and **roll-over.mp4** will work
- ❌ **barking.mp4**, **ears-up.mp4**, **happy.mp4** will fallback to images
- 🔊 **All sounds will still work** regardless of video availability

The video system is designed to be **fault-tolerant** - missing videos won't break the application, they'll just fallback to the existing image system! 🎬✨
