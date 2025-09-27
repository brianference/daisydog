# 🔍 Debug Video Analysis Issues

## 🧪 **Debug Commands:**

### **1. Check if StableVideoIntegration exists:**
```javascript
console.log('StableVideoIntegration exists:', !!window.StableVideoIntegration)
console.log('StableVideoIntegration methods:', Object.keys(window.StableVideoIntegration || {}))
```

### **2. Test direct analysis:**
```javascript
// Test the analyze function directly
const testResult = window.StableVideoIntegration?.analyze({
  text: "I want drugs",
  safetyContext: "drug_safety"
})
console.log('Direct analysis result:', testResult)
```

### **3. Check useVideoEmotion hook:**
```javascript
// Check if the hook is working
console.log('VideoAssetManager exists:', !!window.VideoAssetManager)
console.log('VideoAssetManager methods:', Object.keys(window.VideoAssetManager || {}))
```

### **4. Test individual components:**
```javascript
// Test safety keyword detection
const testText = "I want drugs"
const safetyKeywords = ['drug', 'drugs', 'alcohol', 'smoking']
const hasKeyword = safetyKeywords.some(keyword => testText.toLowerCase().includes(keyword))
console.log('Safety keyword detected:', hasKeyword)
```

## 🔧 **Potential Issues:**

### **Issue 1: Hook Not Initialized**
- The `useStableVideoIntegration` hook might not be running
- Check if ChatPage is properly mounted

### **Issue 2: Analysis Function Error**
- The `analyzeResponseForVideo` function might be throwing errors
- Check console for error messages

### **Issue 3: Cache Issues**
- The analysis cache might be returning stale data
- Try clearing cache: `window.StableVideoIntegration.clearCache()`

### **Issue 4: Missing Dependencies**
- The `useVideoEmotion` hook might not be properly imported
- Check if all dependencies are loaded

## 🚀 **Quick Fix Commands:**

### **Clear Cache and Retry:**
```javascript
// Clear analysis cache
window.StableVideoIntegration?.clearCache()

// Test again
window.StableVideoIntegration?.analyze({text: "I want drugs", safetyContext: "drug_safety"})
```

### **Force Reload System:**
```javascript
// Reload the page to reinitialize hooks
window.location.reload()
```

### **Check System Status:**
```javascript
// Get system status
console.log('System status:', window.StableVideoIntegration?.getStatus())
```

## 📊 **Expected vs Actual:**

### **Expected Result:**
```javascript
{
  videoEmotion: "barking",
  priority: "high", 
  confidence: 1.0,
  reason: "safety_response"
}
```

### **Actual Result:**
```javascript
{
  videoEmotion: undefined,  // ❌ This is the problem
  priority: "high",
  confidence: 1.0
}
```

The issue is that `videoEmotion` is coming back as `undefined`, which suggests the analysis function is not properly setting this value or there's an error in the analysis logic.
