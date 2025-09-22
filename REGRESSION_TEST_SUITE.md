# DaisyDog Regression Test Suite

**Version:** 5.0.0+  
**Last Updated:** September 22, 2025  
**Test Coverage:** Complete Catholic curriculum, debug system, and comprehensive functionality  

## Test Categories

### **NEW IN VERSION 5.0:**
### **1. Catholic Curriculum System Tests**
### **2. Debug Control Center Tests**
### **3. Bible Integration Tests**
### **4. Basic Question Handler Tests**
### **5. Name System Tests (COPPA Compliant)**

### **EXISTING SYSTEMS:**
### **6. Landing Page Tests**
### **7. Basic Conversation Tests**
### **8. Game Mechanics Tests**
### **9. Feeding System Tests**
### **10. Emotion System Tests**
### **11. Mobile Layout Tests**
### **12. Safety System Tests**
### **13. Conversation Lag Tests**
### **14. API Integration Tests**

---

## Catholic Curriculum System Tests

### **Test 1.1: Curriculum Overview Detection**
- **Test:** "Teach me Kindergarten faith"
- **Expected:** Grade overview with "Jesus Loves Me!" theme, core topics, key verses
- **Status:** PASS (NEW in v5.0)
- **Sample Response:** "*wags tail excitedly* Welcome to Kindergarten faith! Our theme is 'Jesus Loves Me!'  We'll learn about God's love, Jesus as our friend, and how to pray..."

- **Test:** "Teach me Grade 1 faith"
- **Expected:** "We Belong to God's Family" overview
- **Status:** PASS (NEW in v5.0)

- **Test:** "Teach me Grade 2 faith"
- **Expected:** "Jesus Gives Us the Sacraments" overview
- **Status:** PASS (NEW in v5.0)

### **Test 1.2: Lesson Detection System**
- **Test:** "Kindergarten lesson 1"
- **Expected:** Full lesson "God Made Everything" with content, verse, activity
- **Status:** PASS (NEW in v5.0)
- **Sample Response:** "*bounces with excitement* Let me tell you about God's amazing creation!  God made everything we see - the sun, moon, stars, trees, animals, and YOU!..."

- **Test:** "Grade 1 lesson 1"
- **Expected:** "We Belong to God's Family" full lesson
- **Status:** PASS (NEW in v5.0)

- **Test:** "what is the first lesson?"
- **Expected:** Defaults to Kindergarten lesson 1
- **Status:** PASS (NEW in v5.0)

### **Test 1.3: Bible Menu Navigation**
- **Test:** Bible > Teach Me > Kindergarten
- **Expected:** Shows 5 lesson buttons, menu stays open after selection
- **Status:** PASS (FIXED in v5.0)
- **Critical Fix:** Menus no longer disappear after lesson responses

---

## Debug Control Center Tests

### **Test 2.1: Debug Gear Button**
- **Test:** Click  gear button in top-right corner
- **Expected:** Opens comprehensive debug control center
- **Status:** PASS (NEW in v5.0)
- **Features:** Unified debug interface replacing multiple scattered buttons

### **Test 2.2: Test Panel Controls**
- **Test:** Toggle test panel buttons in debug center
- **Expected:** Sound, Bible, and Lesson test panels toggle properly
- **Status:** PASS (NEW in v5.0)

### **Test 2.3: Quick Test Buttons**
- **Test:** "Test Ten Commandments" button
- **Expected:** Automatically sends "tell me the full 10 commandments"
- **Status:** PASS (NEW in v5.0)

### **Test 2.4: Comprehensive System Test**
- **Test:** "Run Comprehensive Test" button
- **Expected:** Tests all detection systems, outputs results to console
- **Status:** PASS (NEW in v5.0)
- **Coverage:** Tests Bible topics, lessons, curriculum, characters, dog facts

---

## Bible Integration Tests

### **Test 3.1: Ten Commandments Full Text**
- **Test:** "tell me the full 10 commandments"
- **Expected:** Complete NAB Exodus 20:1-17 text with proper formatting
- **Status:** PASS (FIXED in v5.0)
- **Sample Response:** "**The Ten Commandments (NAB - Exodus 20:1-17)** Then God spoke all these words: I am the LORD your God..."

- **Test:** "what are the 10 commandments?"
- **Expected:** Same full NAB text
- **Status:** PASS (FIXED in v5.0)

### **Test 3.2: Prayer Detection**
- **Test:** "what is the our father?"
- **Expected:** Complete Our Father prayer text
- **Status:** PASS (NEW in v5.0)
- **Sample Response:** "*sits reverently* The Our Father is the most important prayer Jesus taught us! 'Our Father, who art in heaven, hallowed be thy name...'"

### **Test 3.3: Bible Character vs Topics Priority**
- **Test:** "Tell me about the Ten Commandments"
- **Expected:** Ten Commandments topic response (NOT Moses character)
- **Status:** PASS (FIXED in v5.0)
- **Critical Fix:** Detection order corrected - Bible topics before Bible characters

- **Test:** "Tell me about Moses"
- **Expected:** Moses character response
- **Status:** PASS

### **Test 3.4: Random Verse System**
- **Test:** Bible menu "Get a Random Verse" button
- **Expected:** Shows random child-friendly verse without errors
- **Status:** PASS (FIXED in v5.0)
- **Critical Fix:** handleVerseOfDay function restored

---

## Basic Question Handler Tests

### **Test 4.1: Date and Time Questions**
- **Test:** "what day is it?"
- **Expected:** Current day and full date display
- **Status:** PASS (FIXED in v5.0)
- **Sample Response:** "*tilts head thoughtfully* Today is Monday! The full date is Monday, September 22, 2025. What a wonderful day to chat with you! "

- **Test:** "what time is it?"
- **Expected:** Current time in 12-hour format
- **Status:** PASS (FIXED in v5.0)
- **Sample Response:** "*looks around* It's 12:42 AM right now! Time flies when we're having fun together! "

### **Test 4.2: Math Questions**
- **Test:** "what is 2+2?"
- **Expected:** Correct math response with personality
- **Status:** PASS (FIXED in v5.0)
- **Sample Response:** "*counts on paws* 2 plus 2 equals 4! Math is fun! "

- **Test:** "what is 10-4?"
- **Expected:** Correct subtraction result
- **Status:** PASS (FIXED in v5.0)

### **Test 4.3: Personal Questions**
- **Test:** "how old are you?"
- **Expected:** Age response about being a young pup
- **Status:** PASS (FIXED in v5.0)
- **Sample Response:** "*wags tail proudly* I'm a young pup in dog years, but I've been learning and growing every day!..."

- **Test:** "what is your favorite color?"
- **Expected:** Rainbow colors response
- **Status:** PASS (FIXED in v5.0)

### **Test 4.4: Weather and General Questions**
- **Test:** "what's the weather?"
- **Expected:** Weather check suggestion
- **Status:** PASS (FIXED in v5.0)
- **Sample Response:** "*looks out window* I can't check the weather for you, but I hope it's a beautiful day!..."

---

## Name System Tests (COPPA Compliant)

### **Test 5.1: Age Verification System**
- **Test:** Access app without age verification
- **Expected:** Mandatory age verification modal blocks access
- **Status:** PASS (MAINTAINED in v5.0)
- **Compliance:** Full COPPA compliance maintained

### **Test 5.2: Name Collection (13+ Only)**
- **Test:** 13+ user says "John"
- **Expected:** Personalized greeting with name
- **Status:** PASS (MAINTAINED in v5.0)
- **Sample Response:** "*wags tail enthusiastically* Nice to meet you, John! I'm Daisy!..."

- **Test:** "what is my name?" (13+ user)
- **Expected:** Name recall response
- **Status:** PASS (MAINTAINED in v5.0)
- **Sample Response:** "*wags tail proudly* Your name is John! I remember because you're my special friend! "

### **Test 5.3: Under 13 Protection**
- **Test:** Under 13 user attempts name collection
- **Expected:** COPPA-compliant refusal
- **Status:** PASS (MAINTAINED in v5.0)
- **Sample Response:** "*tilts head gently* I don't collect names from children under 13 to keep you safe!..."

---
