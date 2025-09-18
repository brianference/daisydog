# Daisy Dog Chat - Comprehensive Regression Test Checklist

## Critical Features That Must Always Work

### 🎯 Core Chat Functionality
- [ ] **Basic messaging works** - User can type and send messages
- [ ] **Daisy responds** - Daisy provides appropriate responses to messages
- [ ] **Message history preserved** - All messages stay visible in chat
- [ ] **Auto-scroll** - Chat automatically scrolls to newest messages
- [ ] **Typing indicator** - Shows when Daisy is "thinking"

### 🐕 Avatar & Visual System
- [ ] **Daisy avatar displays** - Avatar shows in header and messages
- [ ] **Avatar size appropriate** - Message avatars are properly sized (80px x 80px minimum - NOT TOO SMALL!)
- [ ] **Avatar visually prominent** - Message avatars are large enough to be clearly visible
- [ ] **Emotion system works** - Avatar changes based on Daisy's emotional state
- [ ] **Fallback images work** - Default happy.png loads if emotion image fails

### 🦴 Hunger System (CRITICAL)
- [ ] **Hunger level indicator visible** - Shows bone icons in header (1-5 bones)
- [ ] **Hunger level changes** - Decreases over time, increases when fed
- [ ] **Hunger prompts** - Daisy proactively asks to be fed when hungry
- [ ] **Feed bone button VISIBLE** - Brown bone button appears in message input area (LEFT side of input)
- [ ] **Feed bone button FUNCTIONAL** - Button actually works when clicked
- [ ] **Feed button styling** - Button is brown/tan colored with bone icon (FaBone)
- [ ] **Feeding works** - Clicking feed button increases hunger level
- [ ] **Hunger affects responses** - Daisy mentions being hungry in responses

### 👤 Name System (CRITICAL)
- [ ] **Name asking** - Daisy asks for user's name when first meeting
- [ ] **Name detection works** - Daisy recognizes names in various formats ("Brian", "My name is Brian", "I'm Brian")
- [ ] **Name repetition** - Daisy immediately repeats the name back to confirm (e.g., "Brian!")
- [ ] **Name remembering** - Daisy uses user's name in subsequent conversations
- [ ] **Name persistence** - Name is remembered across sessions
- [ ] **Header personalization** - Name appears in header ("Daisy & Brian")
- [ ] **Response personalization** - Name appears in responses when appropriate

### 🎮 Quick Action Buttons
- [ ] **Tell me a story** - Triggers expanded story responses
- [ ] **Tell a joke** - Triggers joke responses
- [ ] **Do a trick** - Triggers trick responses
- [ ] **Dance** - Triggers dance responses
- [ ] **Play game** - Shows game selection sub-menu (CRITICAL: Must show sub-options!)
- [ ] **How are you?** - Triggers feelings responses
- [ ] **Tell me your dreams** - Triggers dream responses

### 🎲 Game System (CRITICAL)
- [ ] **Game selection menu VISIBLE** - "Play game" button shows sub-options panel below
- [ ] **Game sub-menu appears** - Panel with 5 game options + "Maybe Later" button
- [ ] **Game buttons functional** - Each game option actually starts the game
- [ ] **Fetch game** - Interactive fetch game with multiple rounds
- [ ] **Tug of war** - Interactive tug of war with strength mechanics
- [ ] **Hide and seek** - Interactive hiding game
- [ ] **Ball game** - Interactive ball catching game
- [ ] **Guessing game** - Number/object guessing with hints
- [ ] **Game state persistence** - Games continue until completed
- [ ] **Game exit option** - "Stop game" button available during games

### 📚 Educational Features (CRITICAL)
- [ ] **Dog facts responses** - Responds to "dog facts" and related queries
- [ ] **Educational prompting** - Daisy proactively offers to share dog facts
- [ ] **Keyword detection** - Recognizes educational keywords and responds appropriately
- [ ] **25 unique dog facts** - Full range of educational content available

### 🎨 Enhanced Response System
- [ ] **Keyword mapping works** - Messages trigger appropriate response categories
- [ ] **Context awareness** - Responses consider conversation context
- [ ] **Emotional variety** - Different emotions trigger different response styles
- [ ] **Response variety** - Multiple responses available for each category

### 💬 Advanced Conversation Features
- [ ] **Conversation lag prompts** - Daisy prompts user after periods of inactivity
- [ ] **Mood-based responses** - Responses change based on Daisy's current mood
- [ ] **Memory system** - Daisy remembers previous conversation topics
- [ ] **Proactive engagement** - Daisy initiates conversations and topics

### 🎵 Sound System (If Enabled)
- [ ] **Sound toggle** - Volume controls work
- [ ] **Bark sounds** - Different barks for different emotions
- [ ] **Game sounds** - Audio feedback for games
- [ ] **UI sounds** - Button clicks and interactions

### 📱 UI/UX Requirements
- [ ] **Responsive design** - Works on different screen sizes
- [ ] **Clean layout** - No overlapping elements
- [ ] **Proper spacing** - Elements have appropriate margins/padding
- [ ] **Color scheme consistent** - Orange (#ff6b35) accent color throughout
- [ ] **Animations smooth** - Framer Motion animations work properly
- [ ] **Loading states** - Appropriate feedback during actions

### 🔧 Technical Requirements
- [ ] **No console errors** - Clean browser console
- [ ] **Unique React keys** - No duplicate key warnings
- [ ] **Memory management** - No memory leaks during extended use
- [ ] **Performance** - Smooth interactions without lag

## Regression Test Scenarios

### Scenario 1: First Time User Experience
1. Load chat page
2. Verify Daisy greets user
3. Verify Daisy asks for user's name
4. Provide name and verify Daisy remembers it
5. Verify hunger system is visible and working
6. Test all quick action buttons

### Scenario 2: Extended Conversation
1. Have conversation for 5+ minutes
2. Verify hunger level decreases over time
3. Verify Daisy prompts about being hungry
4. Feed Daisy and verify hunger increases
5. Test educational features by asking about dog facts
6. Verify Daisy proactively offers dog facts

### Scenario 3: Game System Testing
1. Click "Play game" button
2. Verify sub-menu appears with game options
3. Test each game type:
   - Fetch: Multiple rounds, scoring
   - Tug of war: Strength mechanics
   - Hide and seek: Finding mechanics
   - Ball game: Catching mechanics
   - Guessing: Hint system
4. Verify "Stop game" option works
5. Test game state persistence

### Scenario 4: Educational Content
1. Ask "Tell me dog facts"
2. Verify appropriate educational response
3. Ask follow-up questions about dog behavior
4. Verify Daisy proactively offers more facts
5. Test keyword recognition for educational topics

### Scenario 5: Personalization
1. Provide name to Daisy (test multiple formats: "Brian", "My name is Brian", "I'm Brian")
2. Verify Daisy immediately repeats the name back (e.g., "Brian! What a wonderful name!")
3. Have extended conversation
4. Verify name is used in header ("Daisy & Brian")
5. Verify name appears in responses
6. Test emotional state changes
7. Verify responses adapt to mood

## ⚠️ MOST COMMONLY MISSED CRITICAL ISSUES

### 🔴 **VISUAL ELEMENTS THAT ARE ALWAYS BROKEN:**
1. **Message avatar size TOO SMALL** - Must be 80px x 80px minimum, visually prominent
2. **Feed bone button MISSING/INVISIBLE** - Brown bone button must be visible in input area
3. **Game sub-menu NOT APPEARING** - "Play game" must show 5 game options below

### 🔴 **FUNCTIONAL ELEMENTS THAT BREAK:**
4. **Feed button not working** - Button exists but doesn't feed Daisy
5. **Game selection broken** - Sub-menu appears but buttons don't work
6. **Hunger system not updating** - Visual indicators don't change
7. **Name detection broken** - Daisy doesn't repeat/acknowledge user's name when entered
8. **Name not saved** - After name entry, Daisy doesn't remember/use the name
9. **Dog facts not working** - Daisy doesn't answer questions about dogs despite having 100 facts
10. **Proactive prompting broken** - Daisy doesn't alternate between feeding prompts and dog fact prompts
11. **Educational system missing** - No automatic dog education engagement
12. **Greeting repetition** - Daisy greets and asks for name multiple times at startup
13. **Hunger max event missing** - No silly event when hunger reaches maximum (5 bones)
14. **Hunger bone counter stuck** - Bones don't increase to show maximum hunger state
15. **Hunger bones not red** - Bones should be red and flashing when hungry
16. **Dog facts count wrong** - Should have 100 dog facts, currently only has 25
17. **Keyword recognition broken** - Questions like "what breed of dog are you?" and "are dogs alive?" get standard responses instead of dog facts

### 🔴 **THESE MUST BE MANUALLY TESTED EVERY TIME:**
- [ ] Click "Play game" → Does sub-menu with 5 games appear?
- [ ] Is feed bone button visible and brown colored?
- [ ] Are message avatars large enough (80px)?
- [ ] Does feed button actually work when clicked?
- [ ] Do game buttons actually start games?
- [ ] Enter name → Does Daisy repeat it back? (e.g., "Brian!" or "My name is Brian")
- [ ] After name entry → Is name used in header ("Daisy & Brian") and responses?
- [ ] Ask "dog facts" → Does Daisy provide educational dog information?
- [ ] Ask dog-related questions → Does Daisy answer with 25+ dog facts?
- [ ] Wait 2-3 minutes → Does Daisy alternate between feeding prompts and dog fact prompts?
- [ ] Feed Daisy → Does she thank you and offer dog facts?
- [ ] Ask dog facts → Does she share information and occasionally prompt to feed?
- [ ] Startup → Does Daisy greet only ONCE and ask for name only ONCE?
- [ ] Let hunger decrease → Do bones become more red/indicate higher hunger?
- [ ] Reach maximum hunger → Does silly event happen when hunger is at 5 bones?
- [ ] Ask "what breed of dog are you?" → Does Daisy give dog fact response?
- [ ] Ask "are dogs alive?" → Does Daisy give dog fact response?
- [ ] Count dog facts → Should have 100+ dog facts available
- [ ] Hunger bones → Should be red and flashing when hungry

## Critical Failure Points to Watch

1. **Missing hunger system** - Most common regression
2. **Broken game sub-menus** - Games not accessible
3. **Lost name functionality** - Personalization broken
4. **Educational content missing** - Dog facts not working
5. **Avatar sizing issues** - Images too small or missing
6. **Feed button missing** - Can't interact with hunger system
7. **Conversation lag system broken** - No proactive engagement

## Pre-Deployment Checklist

- [ ] All critical features tested and working
- [ ] No console errors in browser
- [ ] Responsive design verified on mobile/desktop
- [ ] Performance testing completed
- [ ] Educational content verified
- [ ] Game system fully functional
- [ ] Hunger system working properly
- [ ] Name system working properly
- [ ] All animations smooth and working

## Post-Deployment Monitoring

- Monitor for console errors
- Check user engagement with advanced features
- Verify educational content is being accessed
- Monitor game completion rates
- Check for any broken functionality reports

---

**Note**: This checklist must be completed before any deployment. Any missing features constitute a critical regression that must be fixed before release.
