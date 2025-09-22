# DaisyDog Comprehensive Testing & Regression Plan

**Version:** 5.0.0+  
**Last Updated:** September 22, 2025  
**Test Coverage:** Complete Catholic curriculum, debug system, and all core functionality  

## 🎯 Critical Testing Requirements

### **SINGLE-CLICK REQUIREMENT**
**ALL BUTTONS MUST WORK WITH SINGLE CLICK - NO DOUBLE CLICKS ALLOWED**

## 📋 Test Categories

### **NEW IN VERSION 5.0:**
### 1. **📚 Catholic Curriculum System Tests**
### 2. **🔧 Debug Control Center Tests**
### 3. **📖 Bible Integration Tests**
### 4. **🔢 Basic Question Handler Tests**
### 5. **👤 Name System Tests (COPPA Compliant)**

### **EXISTING SYSTEMS:**
### 6. **🎮 Game Mechanics Tests**
### 7. **🍖 Feeding System Tests**
### 8. **🎭 Emotion System Tests**
### 9. **🛡️ Safety System Tests**
### 10. **📱 Mobile Layout Tests**

---

## 📚 1. CATHOLIC CURRICULUM SYSTEM TESTS

### **Test 1.1: Curriculum Overview Detection**
**Location:** Chat input or Bible menu
**Requirement:** Single click/message only

#### Test Cases:
- [ ] **"Teach me Kindergarten faith"** → Grade overview with "Jesus Loves Me!" theme
- [ ] **"Teach me Grade 1 faith"** → "We Belong to God's Family" overview
- [ ] **"Teach me Grade 2 faith"** → "Jesus Gives Us the Sacraments" overview
- [ ] **"Teach me Grade 3 faith"** → "Following Jesus" overview
- [ ] **"Teach me Grade 4 faith"** → "Scripture Stories" overview

### **Test 1.2: Lesson Detection System**
**Requirement:** Proper grade context detection

#### Test Cases:
- [ ] **"Kindergarten lesson 1"** → "God Made Everything" full lesson
- [ ] **"Grade 1 lesson 1"** → "We Belong to God's Family" full lesson
- [ ] **"Grade 2 lesson 1"** → "Baptism - Welcome to God's Family" lesson
- [ ] **"what is the first lesson?"** → Defaults to Kindergarten lesson 1
- [ ] **"Grade 1 lesson 2"** → "The Church is Our Home" lesson
- [ ] **"Grade 2 lesson 3"** → "Eucharist - Jesus Comes to Us" lesson

### **Test 1.3: Bible Menu Navigation**
**Location:** Bible > Teach Me the Bible
**Requirement:** Menus stay open after responses

#### Test Cases:
- [ ] **Bible > Teach Me > Kindergarten** → Shows 5 lesson buttons (menu persists)
- [ ] **Bible > Teach Me > Grade 1** → Shows 5 lesson buttons (menu persists)
- [ ] **Bible > Teach Me > Grade 2** → Shows 5 lesson buttons (menu persists)
- [ ] **Bible > Teach Me > Grade 3** → Shows 5 lesson buttons (menu persists)
- [ ] **Bible > Teach Me > Grade 4** → Shows 5 lesson buttons (menu persists)
- [ ] **Lesson button click** → Shows full lesson content, menu stays open

---

## 🔧 2. DEBUG CONTROL CENTER TESTS

### **Test 2.1: Debug Gear Button**
**Location:** Top-right corner ⚙️ button
**Requirement:** Single click opens comprehensive menu

#### Test Cases:
- [ ] **⚙️ Gear button click** → Opens debug control center
- [ ] **Debug menu displays** → Shows all test panels and controls
- [ ] **Console logging** → Shows comprehensive debug status report

### **Test 2.2: Test Panel Controls**
**Location:** Inside debug control center
**Requirement:** Toggle functionality works

#### Test Cases:
- [ ] **"Show Sound Test" button** → Toggles sound test panel
- [ ] **"Show Bible Test" button** → Toggles Bible test panel  
- [ ] **"Show Lesson Test" button** → Toggles lesson test panel
- [ ] **Multiple panels** → Can have multiple panels open simultaneously

### **Test 2.3: Quick Test Buttons**
**Location:** Debug control center quick tests
**Requirement:** One-click testing

#### Test Cases:
- [ ] **"Test Ten Commandments"** → Sends "tell me the full 10 commandments"
- [ ] **"Test Grade 1 Lesson 1"** → Sends "Grade 1 lesson 1"
- [ ] **"Test Name Recall"** → Sends "what is my name"
- [ ] **"Test Our Father Prayer"** → Sends "what is the our father"

### **Test 2.4: Comprehensive System Test**
**Location:** Debug control center
**Requirement:** Tests all detection systems

#### Test Cases:
- [ ] **"Run Comprehensive Test"** → Tests all detection systems in console
- [ ] **Console output** → Shows detection results for all test messages
- [ ] **System coverage** → Tests Bible topics, lessons, curriculum, characters, etc.

---

## 📖 3. BIBLE INTEGRATION TESTS

### **Test 3.1: Ten Commandments Detection**
**Requirement:** Full NAB Exodus 20:1-17 text display

#### Test Cases:
- [ ] **"tell me the full 10 commandments"** → Full NAB text with formatting
- [ ] **"what are the 10 commandments?"** → Full NAB text
- [ ] **"show me the ten commandments"** → Full NAB text
- [ ] **Bible > Search > Ten Commandments** → Ten Commandments (NOT Moses)

### **Test 3.2: Prayer Detection**
**Requirement:** Complete prayer text display

#### Test Cases:
- [ ] **"what is the our father?"** → Complete Our Father prayer text
- [ ] **"tell me the lords prayer"** → Complete Our Father prayer text
- [ ] **"lords prayer"** → Complete Our Father prayer text

### **Test 3.3: Bible Character vs Topics Priority**
**Requirement:** Proper detection order

#### Test Cases:
- [ ] **"Tell me about the Ten Commandments"** → Ten Commandments (NOT Moses)
- [ ] **"Tell me about Moses"** → Moses character response
- [ ] **"commandments"** → Ten Commandments topic response

### **Test 3.4: Random Verse System**
**Location:** Bible menu
**Requirement:** No function errors

#### Test Cases:
- [ ] **"Get a Random Verse" button** → Shows random child-friendly verse
- [ ] **No console errors** → handleVerseOfDay function works properly
- [ ] **Fallback system** → Works even if Bible API fails

---

## 🔢 4. BASIC QUESTION HANDLER TESTS

### **Test 4.1: Date and Time Questions**
**Requirement:** Current date/time responses

#### Test Cases:
- [ ] **"what day is it?"** → Shows current day and full date
- [ ] **"what is today?"** → Shows current day and full date
- [ ] **"what time is it?"** → Shows current time in 12-hour format
- [ ] **"what is the time?"** → Shows current time

### **Test 4.2: Math Questions**
**Requirement:** Correct mathematical responses

#### Test Cases:
- [ ] **"what is 2+2?"** → "*counts on paws* 2 plus 2 equals 4! Math is fun! 🐕🔢"
- [ ] **"what is 5 plus 3?"** → Correct addition result
- [ ] **"what is 10-4?"** → Correct subtraction result
- [ ] **"what is 7 minus 2?"** → Correct subtraction result

### **Test 4.3: Personal Questions**
**Requirement:** Engaging personality responses

#### Test Cases:
- [ ] **"how old are you?"** → Age response about being a young pup
- [ ] **"what is your favorite color?"** → Rainbow colors response
- [ ] **"what do you eat?"** → Dog treats and bacon response
- [ ] **"what's the weather?"** → Weather check suggestion

### **Test 4.4: Basic Interactions**
**Requirement:** Proper response categories

#### Test Cases:
- [ ] **"hello"** → Greeting from daisyResponses.greetings
- [ ] **"how are you?"** → "I'm feeling fantastic!" response
- [ ] **"tell me a joke"** → Joke from daisyResponses.jokes
- [ ] **"do a trick"** → Trick response from daisyResponses.tricks

---

## 👤 5. NAME SYSTEM TESTS (COPPA COMPLIANT)

### **Test 5.1: Age Verification System**
**Requirement:** Mandatory age verification before name collection

#### Test Cases:
- [ ] **Age verification modal** → Blocks access until age entered
- [ ] **13+ users** → Can proceed to name collection
- [ ] **Under 13 users** → Requires parental consent workflow
- [ ] **24-hour expiry** → Verification expires after 24 hours

### **Test 5.2: Name Collection (13+ Only)**
**Requirement:** Names only collected from verified 13+ users

#### Test Cases:
- [ ] **13+ user says "John"** → "Nice to meet you, John! I'm Daisy!"
- [ ] **"what is my name?" (13+)** → "Your name is John!"
- [ ] **Under 13 name attempt** → "I don't collect names from children under 13"
- [ ] **Name persistence** → Names remembered across sessions for 13+ users

### **Test 5.3: COPPA Compliance**
**Requirement:** Full legal compliance

#### Test Cases:
- [ ] **No data collection under 13** → No personal information stored
- [ ] **Local storage only** → No server-side data collection
- [ ] **Parental consent workflow** → Proper consent process for under 13
- [ ] **Privacy notices** → Clear explanations of data practices

---

## 🚨 CRITICAL REGRESSION TESTS

### **Must Pass All:**
1. **"what day is it?"** → Must show current date (NOT generic response)
2. **"what is 2+2?"** → Must show "4" with math response (NOT generic)
3. **"tell me the full 10 commandments"** → Must show full NAB text
4. **"Kindergarten lesson 1"** → Must show full lesson content
5. **Bible menu navigation** → Menus must stay open after responses
6. **⚙️ Debug gear button** → Must open control center without errors
7. **Name system** → Must work for 13+ only, COPPA compliant

### **Common Failure Patterns:**
- ❌ **Generic responses** for basic questions
- ❌ **"Function is not defined" errors** in console
- ❌ **Moses appearing** for Ten Commandments requests
- ❌ **Menus disappearing** after lesson responses
- ❌ **Safety system blocking** Bible content
- ❌ **Name collection** from under-13 users

---

## 🔍 DETECTION ORDER (CRITICAL)

**Must follow this exact order:**
1. **Safety Filter** (with Bible content bypass)
2. **Name Questions**
3. **Date/Time Questions**
4. **Math Questions**
5. **Dance Requests**
6. **Stories**
7. **Catholic Curriculum**
8. **Lessons**
9. **Dog Facts**
10. **Bible Topics** (Ten Commandments)
11. **Bible Characters** (Moses, etc.)
12. **Basic Interactions**
13. **General Responses**

---

## ✅ SUCCESS CRITERIA

### **Version 5.0 Must Pass:**
1. **All curriculum grades and lessons work**
2. **Ten Commandments shows full NAB text**
3. **Basic questions (date, time, math) work properly**
4. **Debug control center functions completely**
5. **Bible menus stay open after responses**
6. **Name system is COPPA compliant**
7. **No "function is not defined" errors**
8. **Safety system doesn't block Bible content**

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Version: 5.0.0+
Browser: ___________
Device: ___________

Catholic Curriculum: ✅/❌
Debug Control Center: ✅/❌
Bible Integration: ✅/❌
Basic Questions: ✅/❌
Name System (COPPA): ✅/❌
Ten Commandments: ✅/❌
Menu Navigation: ✅/❌
No Console Errors: ✅/❌

Notes: ___________
```

---

**Remember: Version 5.0 introduces comprehensive Catholic curriculum and debug systems. All new features must work flawlessly alongside existing functionality!**
