# DaisyDog - AI Virtual Pet Companion for Kids

## Overview
DaisyDog is an AI-powered virtual companion designed for children aged 5-18. This React + Vite frontend application leverages the Google Gemini AI API and Supabase to deliver a safe, interactive chatbot experience embodied by a friendly golden retriever personality. The project aims to provide engaging and educational content, including interactive games, video responses, and a multi-layered safety system, all within a pure frontend architecture without a dedicated backend server.

## Recent Changes (October 3, 2025)
**Database Decision: Staying with Supabase**
- Attempted PostgreSQL migration but reverted due to browser security limitations
- DATABASE_URL cannot be accessed from browser (server-side only for security)
- @neondatabase/serverless requires Netlify serverless functions (complex refactoring)
- Staying with Supabase for browser-safe database access with existing architecture
- All logging continues via Supabase (sessions, safety_events, performance_logs, voice_transcripts)

**Video Display Improvements:**
- Restored larger video heights in chat messages for better visibility
- Desktop: 280px → 320px
- Tablet: 220px → 250px  
- Mobile: 200px → 220px
- Maintains object-position: center 30% to keep Daisy's head visible

**Game Fixes & Improvements:**
- Memory Match: Fixed Daisy AI showing both card flips (removed playerView stripping)
- Memory Match: Increased card boxes 20% (90px → 108px) for better visibility
- Memory Match: Flipped cards show 300% larger emojis (36px → 108px)
- Tic-Tac-Toe: Daisy now places paw icons (🐾) instead of circles (○)
- Word Scramble: Fixed disappearing letters by using unique AnimatePresence keys (targetWord-index-letter)
- Background Music: Fixed async/await in GameContainer.jsx for all games
- All BoardGame.io games now play background music 5 seconds after voice instructions

**Catholic Prayer System Enhancements:**
- Separated Guardian Angel and Bedtime Prayer into distinct prayer topics
- Guardian Angel Prayer: "Angel of God, my guardian dear..." (keywords: guardian angel, angel of god)
- Bedtime Prayer: "God, our Father, I come to say..." (keywords: bedtime prayer, prayer before sleep)
- Fixed prayer ordering in bibleTopics to check specific prayers before generic "prayer" topic
- All prayers now display full traditional text: Hail Mary, Meal Prayer, Guardian Angel, Bedtime Prayer, Our Father
- Bible topics checked BEFORE biblical characters to prevent "Mary" name match override
- Enhanced Debug Control Center with 5 tabs: Games, Voice, Safety, Constitution, Bible/Prayer
- Added automated prayer testing with 5 prayer validation tests

## Previous Changes (October 2, 2025)
**Go Fish Hand Refill & UI Improvements:**
- Added automatic hand refill logic to maintain 5 cards during gameplay
- Refill triggers after pair removal in both askForCard and drawCard moves
- Properly checks for new pairs after each refill card draw
- Changed UI to show "Your Pairs: X" and "Daisy's Pairs: Y" for clarity
- Added .player-info CSS styling to match .opponent-info display
- Refill logic safely handles deck exhaustion without infinite loops

**Memory Match & Tic Tac Toe Height Increases:**
- Memory Match: Added min-height: 650px for better card visibility
- Tic Tac Toe: Added min-height: 550px for improved board display
- Memory Match uses custom AI implementation in MemoryMatchAIBoard component
- AI properly flips two cards with delays (1s → flip → 1s → flip → 2.5s → endTurn)

**Previous Changes:**
- Go Fish: Changed from 4-of-a-kind "books" to 2-of-a-kind "pairs" (classic Go Fish rules)
- Updated UI terminology from "Books" to "Pairs" throughout
- Implemented proper pair counting logic with `Math.floor(count / 2)`
- Fixed initialization bug with defensive checks (`G.pairs?.['1']?.length || 0`)
- UI Spacing Optimization: Reduced GameContainer padding from 15px to 8px for more compact layout
- Decreased header padding and margins (10px → 8px, margin 10px → 6px)
- Go Fish specific reductions: board padding 20px → 8px, game area gap 30px → 12px
- Player hand min-height reduced from 140px to 100px for better space utilization

## User Preferences
### Development Workflow
**MANDATORY TESTING PROTOCOL:**

**1. Pre-Change Validation (ALWAYS FIRST)**
- Screenshot BEFORE making any UI changes
- Document exact current values (widths, colors, positions, file paths)
- Verify all referenced files actually exist before using them
- Check if routes exist before linking to them

**2. Build Validation (For Production Changes)**
- Run `npm run build` locally to catch build-time issues
- Verify dist/ folder contains all expected files
- Check that all assets and routes are generated
- Test links and images in built output

**3. Link & Asset Checking**
- Manually verify every link points to a real route
- Confirm every image src points to an actual file
- Test with actual file system checks, never assume
- Use data URIs for simple assets when appropriate

**4. Protected Core Files (NEVER DELETE)**
- index.html (Vite entry point)
- package.json (Dependencies)
- vite.config.js (Build config)
- netlify.toml (Deployment config)
- .env files (Environment secrets)
- Always verify file purpose before any deletion

**5. Incremental Testing**
- Make ONE change at a time
- Screenshot immediately after each change
- Compare before/after screenshots side-by-side
- Get user approval before proceeding to next change

**6. Pre-Push Checklist**
- ✅ Screenshot tool shows UI works correctly
- ✅ Console logs are clean (no errors)
- ✅ Build succeeds without errors
- ✅ All links and assets verified
- ✅ Architect review passed for code changes
- ✅ User has approved visual changes

## System Architecture
DaisyDog is built as a React 18 + Vite 6 frontend with **Netlify serverless functions** for secure backend operations. **Framer Motion** is integrated for UI animations, enhancing the interactive experience. The application uses **Google Gemini AI** for conversational capabilities, **OpenAI Whisper & TTS** for voice features, and **Supabase** for database operations. Styling is handled with **CSS3** focusing on responsive design. **React Router v6** manages client-side navigation. The project incorporates a comprehensive **multi-layered safety system** and integrates **educational content**. Core features include:
- Safe AI chat with child-appropriate responses.
- **9 BoardGame.io Visual Interactive Games** with full AI opponents (Daisy):
  - **Two-Player Strategy Games:** Tic-Tac-Toe, Connect Four, Memory Match, Checkers, Go Fish
  - **Single-Player Puzzle Games:** Simple Puzzle, Color Matching, Pattern Builder, Word Scramble
  - Modern & Clean theme (blue palette) with smooth animations
  - Proper turn management with `events.endTurn()` pattern
  - BoardWrapper pattern for theme and event handler integration
- Interactive legacy games with dynamic action buttons for gameplay:
  - **Fetch** - Classic ball throwing game
  - **Tug of War** - Strength competition with pull mechanics
  - **Guessing Game** - Number guessing with hint system
  - **Hide & Seek** - Dual-mode Forest Adventure with sophisticated mechanics:
    - Mode 1: Player hides (4 hiding spots with visibility ratings, AI-driven seeking behavior)
    - Mode 2: Player seeks (hot/cold distance feedback, hint system, progressive difficulty)
    - Phase-based state machine with safe transitions
- **Voice Features** with OpenAI Audio API:
  - Speech-to-text using Whisper for voice input
  - Text-to-speech with Shimmer voice (child-friendly female voice) for responses
  - Clean text processing (removes emojis, formatting, and prompts before TTS)
  - Sound effects disabled during voice conversations to prevent interruption
  - HMAC token-based authentication for security
  - Rate limiting (10 requests/min per session)
  - Auto-start recording on microphone button click
  - 30-second maximum recording duration
- Video responses with emotional expressions and sound effects.
- Hunger and energy management system for the virtual pet.
- A robust testing system including constitutional content validation, UI button pattern checks, and game action verification.
- Mobile optimization ensures a consistent user experience across various devices.
- Video assets are managed to support both landscape and portrait aspect ratios, displayed within chat bubbles rather than avatars.
- Submenus for games and other quick actions are correctly positioned to ensure visibility and proper interaction flow.

## External Dependencies
- **Google Gemini AI API**: Used for AI-powered conversational capabilities.
- **OpenAI Audio API**: Whisper (speech-to-text) and TTS (text-to-speech) for voice features.
- **Supabase**: Utilized for database storage (sessions, safety events, performance logs, feature analytics, content cache).
- **Netlify Functions**: Serverless backend for secure API key management, voice authentication, and content moderation.

## Deployment Status
**Production URLs (Active):**
- **Primary:** https://daisydog.org (Custom domain)
- **Netlify:** https://daisydog.netlify.app

**Voice Features Status:** ✅ Fully operational on production
- Whisper transcription working
- TTS with Shimmer voice active
- HMAC authentication configured
- Rate limiting enforced

**Development URL:** https://daisydogchat.replit.app (Note: May have CDN caching issues - use production URLs for testing)

## Debug Control Center
**NEW: Integrated Testing & Debugging Interface:**
- 🔧 Fixed button in bottom-right corner
- **Game Testing:** Validates all 9 BoardGame.io games initialization
- **Voice Testing:** Checks microphone, audio context, and OpenAI integration
- **Safety Testing:** Runs constitutional content filters and safety responses
- **Export Logs:** One-click JSON download of test results and error logs
- **Usage:** Click 🔧 button → Select tab → Run tests → Export logs

## Testing Infrastructure
**Comprehensive FREE Testing Stack ($0/month):**

### Automated Testing (FREE - Unlimited)
- **Playwright Extended**: Unlimited automated tests for safety filters, visual regression, mobile responsive
  - Config: `testing/playwright-extended/playwright.config.extended.ts`
  - Tests: `testing/playwright-extended/tests/safety-filters.spec.ts`
  - Commands: `npm run test:playwright-extended`, `npm run test:safety-automated`, `npm run test:visual-regression`
  
- **GitHub Actions CI/CD**: 2,000 minutes/month free tier
  - Workflow: `.github/workflows/testing-automation.yml`
  - Daily automated: Safety tests, visual regression, mobile responsive
  - Pre-release: Full suite with `[full-test]` commit message
  - Lighthouse: Performance & accessibility checks

### Manual Testing (FREE)
- **Kobiton Community**: Unlimited manual testing on real devices (older models)
  - Command: `npm run test:kobiton` (opens portal.kobiton.com)
  - Use for: Safety feature validation, voice testing on real devices
  
- **Appetize.io**: 100 minutes/month manual testing
  - Command: `npm run test:appetize` (opens appetize.io)
  - Use for: iframe/game integration, network throttling, video performance

### Beta Testing (FREE)
- **TestFlight**: 10,000 iOS testers max
  - Config: `testing/beta-testing/testflight-config.json`
  - For: Family groups, educators, parent reviewers
  
- **Google Play Beta**: Unlimited Android testers
  - Config: `testing/beta-testing/google-play-beta.json`
  - Tracks: Internal (100), Closed (unlimited), Open (unlimited)

### Pre-Deployment (MANDATORY)
**Always run before deploying:**
```bash
npm run pre-deploy
```
This script:
1. Tests production build (`npm run build`)
2. Verifies dist/ folder contents
3. Checks for broken links
4. Runs safety filter tests (fails hard on errors)
5. Starts preview server for manual verification

**Netlify Build Plugins:**
- `@netlify/plugin-lighthouse`: Performance audits (0.7 performance, 0.8 SEO thresholds)
- `netlify-plugin-cache`: Caches .npm and dist (excludes node_modules symlinks)
- `netlify-plugin-checklinks`: Validates internal links

## Contact Form Email Setup
**⚠️ ACTION REQUIRED:** To receive contact form submissions at brianference@protonmail.com:

1. **Login to Netlify Dashboard:** https://app.netlify.com
2. **Navigate to:** Site settings → Notifications → Form submission notifications
3. **Add Email Notification:**
   - Click "Add notification"
   - Select "Email notification" → "Form submission"
   - Choose form: "contact" (or "All forms")
   - Enter email: **brianference@protonmail.com**
   - Click "Save"

**Notes:**
- Emails will come from: `formresponses@netlify.com`
- Reply-To will be set to the submitter's email
- Check spam folder for first email, then mark as "Not Spam"
- Form is already configured with hidden Netlify Forms detection