# DaisyDog Changelog

## v6.5.0 - Enhanced Hide & Seek: Dual-Mode Forest Adventure (Sept 30, 2025)

### 🎮 Major Game Enhancement: Sophisticated Hide & Seek

**What Changed:** Transformed basic Hide & Seek into a comprehensive dual-mode Forest Adventure Explorer with advanced gameplay mechanics.

### ✨ New Features

#### Dual-Mode Gameplay System
- **Mode 1: Player Hides** - Choose hiding spots, stay quiet, watch Daisy search with AI-driven behavior
- **Mode 2: Player Seeks** - Search for Daisy using hot/cold feedback and hint system
- Seamless mode selection via action buttons at game start

#### Four Unique Hiding Spots
Each spot has distinct characteristics:
- 🌳 **Behind Tree** - Easy (High visibility)
- 🌿 **In Bush** - Medium (Moderate visibility)
- 🪵 **Under Log** - Hard (Low visibility)
- 🍂 **Pile of Leaves** - Expert (Very low visibility)

#### Advanced Search Mechanics
**Hot/Cold Distance Feedback:**
- 🔥 "Very warm" - Adjacent spot (distance 1)
- 🌡️ "Warm" - 2 spots away (distance 2)
- ❄️ "Cold" - 3 spots away (distance 3)

**Hint System:**
- Up to 2 hints per game
- Reveals difficulty level and spot name initial
- Strategic resource management adds depth

**Progressive AI Seeking:**
- Daisy's search behavior adapts to hiding spot visibility
- Lower visibility = more attempts before discovery
- Probability-based discovery system

#### Phase-Based State Machine
Complete gameplay flow:
1. **Mode Selection** → Player chooses hide or seek
2. **Spot Selection** → Pick from 4 hiding spots (player hides mode)
3. **Player Hiding** → Stay quiet, wait for discovery
4. **Daisy Counting** → Transition phase before seeking
5. **Player Seeking** → Search with feedback and hints
6. **End** → Clean state reset for replay

### 🔧 Technical Implementation

**HideSeekGame.js**
- Dual-mode routing with prioritized button message matching
- Visibility-based discovery probabilities
- Distance calculations for hot/cold feedback
- Complete state management (modes, phases, positions, counters)
- Null guards for invalid states with graceful recovery
- Dynamic action buttons per phase

**Action Button Updates**
- Mode selection: "I'll hide" / "You hide" 
- Spot selection: All 4 hiding spots with emojis
- Player hiding: "Stay Quiet" / "Found Me!"
- Daisy counting: "Ready or not, here I come!"
- Player seeking: Search each spot + "Hot/Cold" + "Hint"

### 🐛 Bug Fixes
- Fixed mode selection routing to prioritize button messages correctly
- Simplified hot/cold temperature mapping to 3 reachable messages
- Added safety checks for null/undefined game positions
- Complete state reset in end() method prevents carryover bugs

### 📚 Documentation
- Updated system architecture with dual-mode game mechanics
- Documented hiding spot system and search tools
- Added phase-based state machine flow

---

## v6.4.0 - Game Action Button System & Interactive Gameplay (Sept 30, 2025)

### 🎮 CRITICAL FIX: Full Interactive Gameplay Restored

**Problem Solved:** Games now display action buttons for actual gameplay instead of just showing submenu options and ending immediately.

### ✨ New Features

#### Game Action Button System
- Added `activeGameActions` state to track current game action buttons
- Game action buttons conditionally replace quick actions during active gameplay
- Seamless UI flow: Submenu → Game starts → Action buttons appear → Gameplay → Game ends → Normal UI returns

#### Interactive Buttons by Game

**🪢 Tug of War**
- 💪 Pull harder
- 🏳️ Give up
- 🛑 Stop

**🎾 Fetch**
- 🎾 Throw ball
- 👏 Good catch
- 🛑 Stop

**🔢 Guessing Game**
- 1️⃣ Guess 1
- 5️⃣ Guess 5
- 🔟 Guess 10
- 💡 Hint
- 🛑 Stop

**🙈 Hide & Seek**
- ✅ Ready
- 👋 Found me
- 🛑 Stop

### 🔧 Technical Implementation

**ChatPage.jsx**
- Added `activeGameActions` state (line 41)
- Implemented `handleGameActionClick()` handler (lines 195-197)
- Game actions set when game starts (lines 414-416)
- Game actions cleared when game ends (line 234)
- Conditional UI rendering (lines 1678-1762)

**Game Architecture**
- Button clicks route through: `handleGameActionClick()` → `handleSendMessage()` → `GameManager.processGameInput()`
- Each game class provides `getAvailableActions()` method
- Actions update dynamically based on game state

### 🧪 Testing Enhancements

- Added game action button tests to preReleaseTestSuite (v6.4.0)
- Created standalone `window.testGameActions()` for interactive testing
- Tests verify buttons appear, replace quick actions, and execute properly

### 📚 Documentation

- Updated replit.md with complete game action button system details
- Documented UI flow and architecture changes
- Added game-specific action button mappings

---

## Previous Versions

See git history for earlier versions and changes.
