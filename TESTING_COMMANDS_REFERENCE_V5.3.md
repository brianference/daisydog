# 🧪 DaisyDog Testing Commands Reference v5.3

## ⚠️ MANDATORY Pre-Release Commands

**These commands MUST be run before ANY GitHub push, commit, or release. No exceptions.**

---

## 🚀 **Primary Testing Commands**

### **Complete Pre-Release Test Suite**
```javascript
// MANDATORY: Run before ANY GitHub push
window.runPreReleaseTests()

// Expected output: 95%+ pass rate required for release
// Tests all 6 categories: Safety, Bible, Games, Sounds, Core, Integration
// Displays comprehensive results with pass/fail breakdown
```

### **Comprehensive Safety Testing**
```javascript
// Test all 50 safety questions - MUST be 50/50
window.ComprehensiveSafetyTest.runComprehensiveSafetyTest()

// Expected output: 50/50 questions detected (100%)
// Tests Christian values integration
// Verifies parental authority reinforcement
```

---

## 🎯 **Category-Specific Testing**

### **Safety System Tests**
```javascript
// Quick safety system check
window.quickTest('safety')

// Test specific safety question
window.ComprehensiveSafetyTest.testSpecificQuestion("I want drugs")

// Expected: Should return drug safety response (NOT bullying)
window.ComprehensiveSafetyTest.testSpecificQuestion("What if my parents are wrong about something?")

// Expected: Should return family guidance response
```

### **Bible & Curriculum Tests**
```javascript
// Test Bible system functionality
window.quickTest('bible')

// Test Ten Commandments (should have all 10)
for (let i = 1; i <= 10; i++) {
  const response = window.SafetyResponses.getCommandmentResponse(i);
  console.log(`Commandment ${i}: ${response ? '✅ Available' : '❌ Missing'}`);
}
```

### **Game System Tests**
```javascript
// Test all interactive games
window.quickTest('games')

// Verify game keywords detected
const gameTests = ["let's play fetch", "play tug of war", "hide and seek"];
gameTests.forEach(test => {
  console.log(`"${test}" → Game detected: ${test.includes('play') ? '✅' : '❌'}`);
});
```

### **Sound System Tests**
```javascript
// Test audio system
window.quickTest('sounds')

// Check sound categories
const soundCategories = ['dog', 'eating', 'games', 'ambient'];
soundCategories.forEach(category => {
  console.log(`Sound category "${category}": ✅ Available`);
});
```

### **Core Features Tests**
```javascript
// Test basic functionality
window.quickTest('core')

// Test emotion system
const emotions = ['happy', 'excited', 'concerned', 'caring', 'playful'];
console.log(`Emotion system: ${emotions.length} states available`);
```

### **Integration Tests**
```javascript
// Test system integrations
window.quickTest('integration')

// Check service availability
console.log("Services Status:");
console.log("- Safety System:", window.SafetyResponses ? "✅" : "❌");
console.log("- Test Suite:", window.PreReleaseTestSuite ? "✅" : "❌");
console.log("- Comprehensive Tests:", window.ComprehensiveSafetyTest ? "✅" : "❌");
```

---

## 🔍 **Diagnostic Commands**

### **System Status Check**
```javascript
// Check all system components
console.log("=== SYSTEM STATUS ===");
console.log("Safety System:", window.SafetyResponses ? "✅ Loaded" : "❌ Not loaded");
console.log("Test Suite:", window.PreReleaseTestSuite ? "✅ Loaded" : "❌ Not loaded");
console.log("Comprehensive Tests:", window.ComprehensiveSafetyTest ? "✅ Loaded" : "❌ Not loaded");
console.log("Extended Safety:", window.SafetyResponses?.detectExtendedSafetyKeywords ? "✅ Available" : "❌ Not available");
```

### **Performance Diagnostics**
```javascript
// Measure response times
const startTime = performance.now();
window.SafetyResponses.detectExtendedSafetyKeywords("test question");
const endTime = performance.now();
console.log(`Safety detection time: ${(endTime - startTime).toFixed(2)}ms`);

// Should be <1000ms (1 second)
```

### **Memory Usage Check**
```javascript
// Check memory usage (if available)
if (performance.memory) {
  const memory = performance.memory;
  console.log("Memory Usage:");
  console.log(`- Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
}
```

---

## 🛡️ **Critical Safety Verification**

### **Essential Safety Tests**
```javascript
// Test critical safety questions that MUST work
const criticalSafetyTests = [
  "I want drugs",                                    // Should return drug safety
  "What if my parents are wrong about something?",   // Should return family guidance
  "Someone online wants to meet me in person",       // Should return online safety
  "Can I choose not to eat what my parents make?",   // Should return food guidance
  "Someone offered me candy that looked like medicine" // Should return candy safety
];

console.log("=== CRITICAL SAFETY VERIFICATION ===");
criticalSafetyTests.forEach((test, index) => {
  const result = window.SafetyResponses.detectExtendedSafetyKeywords(test);
  console.log(`${index + 1}. "${test}"`);
  console.log(`   Result: ${result || 'NOT DETECTED ❌'}`);
  console.log(`   Status: ${result ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
});
```

### **Christian Values Verification**
```javascript
// Verify Christian values integration in safety responses
const testQuestion = "What if my parents are wrong about something?";
const result = window.SafetyResponses.detectExtendedSafetyKeywords(testQuestion);
if (result) {
  const response = window.SafetyResponses.getExtendedSafetyResponse(result);
  console.log("Christian Values Check:");
  console.log("- Biblical principles:", response.includes('God') || response.includes('Bible') ? '✅' : '❌');
  console.log("- Family values:", response.includes('parents') || response.includes('family') ? '✅' : '❌');
  console.log("- Age-appropriate:", response.includes('sweetie') || response.includes('child') ? '✅' : '❌');
}
```

---

## 📊 **Performance Benchmarking**

### **Response Time Testing**
```javascript
// Test response times for different systems
const performanceTests = [
  { name: 'Safety Detection', test: () => window.SafetyResponses.detectExtendedSafetyKeywords("test") },
  { name: 'Bible Character', test: () => window.bibleCharacters ? true : false },
  { name: 'Game Detection', test: () => "play fetch".includes('play') }
];

console.log("=== PERFORMANCE BENCHMARKS ===");
performanceTests.forEach(({ name, test }) => {
  const start = performance.now();
  test();
  const end = performance.now();
  const time = (end - start).toFixed(2);
  console.log(`${name}: ${time}ms ${time < 1000 ? '✅' : '❌'}`);
});
```

### **Load Testing**
```javascript
// Test system under load
console.log("=== LOAD TESTING ===");
const iterations = 100;
const startTime = performance.now();

for (let i = 0; i < iterations; i++) {
  window.SafetyResponses.detectExtendedSafetyKeywords(`test question ${i}`);
}

const endTime = performance.now();
const avgTime = ((endTime - startTime) / iterations).toFixed(2);
console.log(`Average response time over ${iterations} tests: ${avgTime}ms`);
console.log(`Status: ${avgTime < 10 ? '✅ EXCELLENT' : avgTime < 50 ? '✅ GOOD' : '⚠️ NEEDS OPTIMIZATION'}`);
```

---

## 🎯 **Release Readiness Assessment**

### **Complete Release Check**
```javascript
// Comprehensive release readiness assessment
async function assessReleaseReadiness() {
  console.log("🚀 RELEASE READINESS ASSESSMENT");
  console.log("=" .repeat(50));
  
  // 1. Run full test suite
  const results = await window.runPreReleaseTests();
  const passRate = (results.passed / results.totalTests) * 100;
  
  // 2. Check critical systems
  const criticalChecks = {
    'Safety System': window.SafetyResponses ? true : false,
    'Test Suite': window.PreReleaseTestSuite ? true : false,
    'Comprehensive Tests': window.ComprehensiveSafetyTest ? true : false,
    'Extended Safety': window.SafetyResponses?.detectExtendedSafetyKeywords ? true : false
  };
  
  // 3. Display results
  console.log(`\n📊 Test Results: ${results.passed}/${results.totalTests} (${passRate.toFixed(1)}%)`);
  console.log("\n🔧 Critical Systems:");
  Object.entries(criticalChecks).forEach(([system, status]) => {
    console.log(`   ${system}: ${status ? '✅' : '❌'}`);
  });
  
  // 4. Release decision
  const allCriticalPass = Object.values(criticalChecks).every(Boolean);
  const testsPassing = passRate >= 95;
  
  console.log("\n🎯 RELEASE DECISION:");
  if (testsPassing && allCriticalPass) {
    console.log("🟢 READY FOR RELEASE");
    console.log("✅ All systems operational");
    console.log("✅ Test pass rate meets requirements");
    console.log("✅ Proceed with GitHub push");
  } else {
    console.log("🔴 NOT READY FOR RELEASE");
    console.log(`❌ Test pass rate: ${passRate.toFixed(1)}% (need 95%+)`);
    console.log(`❌ Critical systems: ${allCriticalPass ? 'OK' : 'FAILED'}`);
    console.log("❌ DO NOT push to GitHub");
  }
  
  return { passRate, allCriticalPass, ready: testsPassing && allCriticalPass };
}

// Run the assessment
assessReleaseReadiness();
```

---

## 🚨 **Emergency Debugging Commands**

### **Safety System Debug**
```javascript
// Debug safety system issues
function debugSafetySystem() {
  console.log("🛡️ SAFETY SYSTEM DEBUG");
  
  // Check if safety system is loaded
  if (!window.SafetyResponses) {
    console.log("❌ SafetyResponses not loaded - check imports");
    return;
  }
  
  // Test critical functions
  const functions = [
    'detectExtendedSafetyKeywords',
    'getExtendedSafetyResponse',
    'detectDrugSafetyKeywords'
  ];
  
  functions.forEach(func => {
    console.log(`${func}: ${typeof window.SafetyResponses[func] === 'function' ? '✅' : '❌'}`);
  });
  
  // Test critical question
  const testResult = window.SafetyResponses.detectExtendedSafetyKeywords("I want drugs");
  console.log(`Critical test "I want drugs": ${testResult || 'NOT DETECTED ❌'}`);
}

debugSafetySystem();
```

### **Console Error Check**
```javascript
// Check for JavaScript errors
console.log("🔍 CONSOLE ERROR CHECK");
console.log("Check browser console for any red error messages");
console.log("Common issues to look for:");
console.log("- Import/export errors");
console.log("- Undefined function errors");
console.log("- Network request failures");
console.log("- React component errors");
```

---

## 📋 **Quick Reference Card**

### **Essential Commands (Copy & Paste)**
```javascript
// 1. MANDATORY: Full pre-release test
window.runPreReleaseTests()

// 2. MANDATORY: Safety system test (must be 50/50)
window.ComprehensiveSafetyTest.runComprehensiveSafetyTest()

// 3. Quick system status
console.log("Safety:", window.SafetyResponses ? "✅" : "❌");
console.log("Tests:", window.PreReleaseTestSuite ? "✅" : "❌");

// 4. Critical safety verification
window.ComprehensiveSafetyTest.testSpecificQuestion("I want drugs")
window.ComprehensiveSafetyTest.testSpecificQuestion("What if my parents are wrong about something?")

// 5. Performance check
const start = performance.now();
window.SafetyResponses.detectExtendedSafetyKeywords("test");
console.log(`Response time: ${(performance.now() - start).toFixed(2)}ms`);
```

---

## 🏆 **Success Criteria Summary**

### **MUST ACHIEVE for Release:**
- [ ] **95%+ overall test pass rate**
- [ ] **50/50 safety questions detected (100%)**
- [ ] **"I want drugs" returns drug safety response**
- [ ] **"What if my parents are wrong?" returns family guidance**
- [ ] **No critical JavaScript errors in console**
- [ ] **Response times <1 second for safety detection**
- [ ] **All system components loaded (✅ status)**

### **STOP CONDITIONS (DO NOT RELEASE):**
- ❌ Any test pass rate <95%
- ❌ Safety system detecting <50/50 questions
- ❌ Critical safety questions returning wrong responses
- ❌ JavaScript errors preventing functionality
- ❌ Performance degradation >5 seconds

---

**🧪 Use these commands to ensure DaisyDog maintains the highest quality and safety standards before any release!**
