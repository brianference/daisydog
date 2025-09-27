# DaisyDog Comprehensive Testing & Regression Plan

**Version:** 5.1.0+  
**Last Updated:** September 22, 2025  
**Test Coverage:** Complete Catholic curriculum, debug system, Bible verse fixes, and dance music integration  

## 🎯 Critical Testing Requirements

### **SINGLE-CLICK REQUIREMENT**
**ALL BUTTONS MUST WORK WITH SINGLE CLICK - NO DOUBLE CLICKS ALLOWED**

## 📋 Test Categories

### **NEW IN VERSION 5.1:**
### 1. **📖 Bible Verse Detection Tests (FIXED)**
### 2. **🎵 Dance Music Integration Tests (FIXED)**
### 3. **🎮 Game System Restoration Tests (FIXED)**
### 4. **🔄 Random Verse Variety Tests (FIXED)**

### **FROM VERSION 5.0:**
### 5. **📚 Catholic Curriculum System Tests**
### 6. **🔧 Debug Control Center Tests**
### 7. **📖 Bible Integration Tests**
### 8. **🔢 Basic Question Handler Tests**
### 9. **👤 Name System Tests (COPPA Compliant)**

### **EXISTING SYSTEMS:**
### 10. **🎮 Game Mechanics Tests**
### 11. **🍖 Feeding System Tests**
### 12. **🎭 Emotion System Tests**
### 13. **🛡️ Safety System Tests**
### 14. **📱 Mobile Layout Tests**

---

## 📖 1. BIBLE VERSE DETECTION TESTS (FIXED IN V5.1)

### **Test 1.1: Specific Verse Detection**
**Location:** Chat input
**Requirement:** Specific verses must work properly (FIXED)

#### Test Cases:
- [ ] **"Tell me about Matthew 19:14"** → Specific verse response about Jesus loving children (FIXED)
- [ ] **"Tell me about John 3:16"** → Specific verse response about God's love (FIXED)
- [ ] **"Tell me about Psalm 23:1"** → Specific verse response about the Lord as shepherd
- [ ] **"Tell me about Philippians 4:13"** → Specific verse response about strength through Christ

### **Test 1.2: Bible Passage vs Character Priority**
**Requirement:** Proper detection order (FIXED)

#### Test Cases:
- [ ] **"Tell me about the Ten Commandments"** → Ten Commandments topic (NOT Moses)
- [ ] **"Tell me about Moses"** → Moses character response
- [ ] **Detection order working** → Specific verses → Bible passages → Bible topics → Bible characters

---

## 🎵 2. DANCE MUSIC INTEGRATION TESTS (FIXED IN V5.1)

### **Test 2.1: Dance Music Playback**
**Location:** Chat input or quick action button
**Requirement:** dance-sound.mp3 must play (FIXED)

#### Test Cases:
- [ ] **"dance"** → Plays dance-sound.mp3 from public/sounds/dog/ (FIXED)
- [ ] **"Dance for me"** → Plays dance music correctly (FIXED)
- [ ] **💃 Dance button** → Triggers dance with music (FIXED)
- [ ] **Sound integration** → Uses playUISound('dance') correctly (FIXED)

### **Test 2.2: Dance Emotion Flow**
**Requirement:** Complete dance experience

#### Test Cases:
- [ ] **Dance emotion** → Sets to 'dancing' for 3 seconds
- [ ] **Auto-reset** → Returns to 'happy' emotion after 3 seconds
- [ ] **Music timing** → 300ms delay for smooth experience
- [ ] **Console logging** → Shows "🎵 Playing dance music (dance-sound.mp3)"

---

## 🎮 3. GAME SYSTEM RESTORATION TESTS (FIXED IN V5.1)

### **Test 3.1: Game Handler Functions**
**Requirement:** All game functions must work without errors (FIXED)

#### Test Cases:
- [ ] **"play fetch"** → handleFetchGame works without "function is not defined" (FIXED)
- [ ] **"hide and seek"** → handleHideSeekGame works properly (FIXED)
- [ ] **"tug of war"** → handleTugWarGame with intensity levels (FIXED)
- [ ] **"guessing game"** → handleGuessingGame with 1-10 numbers (FIXED)
- [ ] **"ball catch"** → handleBallCatchGame with different heights (FIXED)

### **Test 3.2: Game State Integration**
**Requirement:** Games properly integrated in generateDaisyResponse (FIXED)

#### Test Cases:
- [ ] **Game state handling** → All games respond to user input correctly
- [ ] **Game termination** → "stop" command ends games properly
- [ ] **State transitions** → Games start and end with proper state management
- [ ] **No console errors** → All game functions work without JavaScript errors

---

## 🔄 4. RANDOM VERSE VARIETY TESTS (FIXED IN V5.1)

### **Test 4.1: Random Verse Button**
**Location:** Bible menu
**Requirement:** Shows variety of verses, not just John 3:16 (FIXED)

#### Test Cases:
- [ ] **"Get Random Verse" button** → Shows different verses each time (FIXED)
- [ ] **8 verse variety** → John 3:16, Psalm 23:1, Matthew 19:14, Psalm 139:14, Jeremiah 29:11, Philippians 4:13, Proverbs 3:5, 1 John 4:19
- [ ] **No repetition** → Multiple clicks show different verses
- [ ] **Fallback system** → Works even when Bible API unavailable

---

## 🚨 CRITICAL REGRESSION TESTS (UPDATED FOR V5.1)

### **Must Pass All:**
1. **"what day is it?"** → Must show current date (NOT generic response)
2. **"what is 2+2?"** → Must show "4" with math response (NOT generic)
3. **"tell me the full 10 commandments"** → Must show full NAB text
4. **"Kindergarten lesson 1"** → Must show full lesson content
5. **Bible menu navigation** → Menus must stay open after responses
6. **⚙️ Debug gear button** → Must open control center without errors
7. **Name system** → Must work for 13+ only, COPPA compliant
8. **"Tell me about Matthew 19:14"** → Must show specific verse (FIXED in v5.1)
9. **"dance"** → Must play dance-sound.mp3 (FIXED in v5.1)
10. **Random verse variety** → Must show 8 different verses (FIXED in v5.1)
11. **Game system** → Must work without errors (FIXED in v5.1)

### **Common Failure Patterns (FIXED IN V5.1):**
- ✅ **Bible verses working** - No more generic responses for Matthew 19:14, John 3:16
- ✅ **Dance music playing** - dance-sound.mp3 now plays correctly
- ✅ **Game functions restored** - No more "function is not defined" errors
- ✅ **Random verse variety** - No longer always shows John 3:16
- ❌ **Generic responses** for basic questions (still watch for)
- ❌ **Moses appearing** for Ten Commandments requests (still watch for)

---

## 🔍 DETECTION ORDER (UPDATED FOR V5.1)

**Must follow this exact order:**
1. **Safety Filter** (with Bible content bypass)
2. **Name Questions**
3. **Game State Handling** (FIXED - now properly integrated)
4. **Date/Time Questions**
5. **Math Questions**
6. **Dance Requests** (FIXED - now plays music)
7. **Stories**
8. **Catholic Curriculum**
9. **Lessons**
10. **Dog Facts**
11. **Specific Bible Verses** (NEW - Matthew 19:14, John 3:16, etc.)
12. **Bible Passages** (NEW - general passage detection)
13. **Bible Topics** (Ten Commandments)
14. **Bible Characters** (Moses, etc.)
15. **Basic Interactions**
16. **Game Initialization** (FIXED - all games work)
17. **General Responses**

---

## ✅ SUCCESS CRITERIA (UPDATED FOR V5.1)

### **Version 5.1 Must Pass:**
1. **All curriculum grades and lessons work** (from v5.0)
2. **Ten Commandments shows full NAB text** (from v5.0)
3. **Basic questions (date, time, math) work properly** (from v5.0)
4. **Debug control center functions completely** (from v5.0)
5. **Bible menus stay open after responses** (from v5.0)
6. **Name system is COPPA compliant** (from v5.0)
7. **Specific Bible verses work properly** (NEW in v5.1)
8. **Dance music plays dance-sound.mp3** (NEW in v5.1)
9. **Random verse shows 8 different verses** (NEW in v5.1)
10. **All game functions work without errors** (NEW in v5.1)

---

## 📊 Test Results Template (UPDATED)

```
Date: ___________
Tester: ___________
Version: 5.1.0+
Browser: ___________
Device: ___________

Catholic Curriculum: ✅/❌
Debug Control Center: ✅/❌
Bible Integration: ✅/❌
Basic Questions: ✅/❌
Name System (COPPA): ✅/❌
Ten Commandments: ✅/❌
Menu Navigation: ✅/❌
Bible Verse Detection (v5.1): ✅/❌
Dance Music (v5.1): ✅/❌
Random Verse Variety (v5.1): ✅/❌
Game System (v5.1): ✅/❌
No Console Errors: ✅/❌

Notes: ___________
```

---

**Remember: Version 5.1 fixes critical bugs in Bible verse detection, dance music, game system, and random verse variety. All fixes must work flawlessly alongside existing v5.0 functionality!**
