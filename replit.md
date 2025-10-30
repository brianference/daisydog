# DaisyDog - AI Virtual Pet Companion for Kids

## Overview
DaisyDog is an AI-powered virtual companion for children aged 5-18. This React + Vite frontend application leverages the Google Gemini AI API and Supabase to provide a safe, interactive chatbot experience embodied by a friendly golden retriever personality. The project aims to deliver engaging and educational content, including interactive games, video responses, a multi-layered safety system, and comprehensive Catholic catechesis lessons with parent dashboard tracking.

## Recent Changes (October 30, 2025 - Session 5)
**Version 6.4.0 - Catholic Lesson Plans Feature (MAJOR):**

**Complete Catholic Catechesis System:**
- Built comprehensive database schema (catechesis_lessons, lesson_activities, lesson_progress, liturgical_calendar)
- Imported 9 Catholic lessons: Abraham, Adam & Eve, Ash Wednesday, Baptism of Jesus, Birth of Jesus, Creation (Days 1-7), Daniel
- Created lessons-api.cjs Netlify Function with full CRUD operations for lessons and progress tracking
- Implemented DaisyLessonAdapter service to convert formal lessons into Daisy's engaging, child-friendly teaching voice
- Built LessonsComponent UI with topic browsing (Bible Stories, Sacraments, Liturgy), age filters, and liturgical season suggestions
- Enhanced Parent Dashboard Learning Progress tab to display completed lessons, time spent, curriculum alignment

**Security Hardening (CRITICAL):**
- Implemented JWT-based authentication for both parent and child sessions
- Child accounts now receive secure session tokens (90-day expiration) when linking via 6-digit code
- Parent tokens include type='parent', child tokens include type='child' for role separation
- lessons-api enforces token-based authorization:
  - get-progress requires parent JWT + ownership validation
  - start-lesson/complete-lesson require child JWT, derive childId from token (prevents ID spoofing)
- Added fail-fast JWT_SECRET validation (no insecure fallbacks)
- Removed password reset/email verification token exposure from API responses
- Defense-in-depth: signature verification, type enforcement, ownership checks, parameterized SQL queries

**Architecture:**
- Lesson browsing is public (no auth required for reading lesson content)
- Progress tracking requires authenticated child session linked to parent account
- Parent dashboard aggregates progress across all linked children with proper authorization
- Supports scalability for 100+ lessons and multiple children per parent account

## Recent Changes (October 3, 2025 - Session 4)
**Version 6.3.0 - Simple Puzzle Game Fixes:**

**Simple Puzzle Image Slicing Fix (CRITICAL):**
- Fixed puzzle pieces showing duplicated image content (8 eyes instead of 2)
- Replaced fixed pixel-based background sizing (300px) with percentage-based calculations
- Background size now uses `${GRID_SIZE * 100}%` (300% for 3x3 grid)
- Background position uses percentages: 0%, 50%, 100% for proper image slicing
- Each puzzle piece now shows unique portion of the image across all responsive layouts

**Simple Puzzle Restart Image Variety:**
- Fixed restart button always showing same image
- Combined timestamp seed (Date.now()) with boardgame.io random for better variety
- Each restart now selects different image from 5 available face-cropped photos
- Image selection: `(timestamp % 5 + random) % 5` ensures proper distribution

**Games Menu UI Update:**
- Added Puzzle Builder button to ChatPage.jsx individual games submenu
- Removed debug console.logs from GameSelector component
- All 6 visible games now accessible: Memory Match, Tic Tac Toe, Checkers, Connect Four, Word Scramble, Puzzle Builder

## Recent Changes (October 3, 2025 - Session 3)
**Bug Fixes & Content Updates:**

**Word Scramble CRITICAL Fix:**
- Removed endTurn() call that was blocking progression past first word
- Single-player game doesn't need turn management
- Game now properly advances through all 5 words
- Added debug logging to track word progression

**Simple Puzzle Complete Fixes:**
- Added gameKey prop support for proper restart functionality
- Implemented touch event handlers (onTouchStart, onTouchEnd) for mobile drag/drop
- Added dynamic image selection from 5 face-cropped Unsplash images
- Fixed image slicing with crop=faces parameter and backgroundRepeat: no-repeat
- Added touchAction: 'none' to prevent scroll interference on mobile

**Mute Button Fix (All Games):**
- Fixed mute button not actually muting background music
- Removed duplicate toggleMute() calls in both branches
- Now correctly calls toggleMute() once and handles ElevenLabs separately

**Connect Four Restart Fix:**
- Added gameKey prop support to ConnectFour component
- Restart button now properly resets game by incrementing gameKey
- Follows same pattern as TicTacToe and other games

**Games Menu Updates:**
- Visible games (in order): Memory Match, Tic Tac Toe, Checkers, Connect Four, Word Scramble, Simple Puzzle
- Hidden games: Go Fish, Color Match, Pattern Builder

**American History Content Update:**
- Removed "September 11" and "First Black President" buttons
- Added Republican historical moments:
  - Reagan & Berlin Wall (1987)
  - Republican Party founding (1854)
  - Lincoln Frees Slaves (1863)

## Recent Changes (October 3, 2025 - Session 2)
**Critical Game Fixes:**

**Checkers AI & Double Jump Support:**
- Fixed Checkers AI not taking turns after first move
- Removed processingRef from CheckersBoard (human player) - only needed in AIBoard
- Added double/triple jump support with recursive findChainCaptures function
- AI and players can now make chain captures (jump over multiple pieces in one turn)
- Validates proper turn order and game state before moves

**Word Scramble Progression & Restart Fix:**
- Fixed game hanging after first word (1/5)
- Changed maxMoves from 1 to 20 to allow multiple letter selections per turn
- Letters now appear for all 5 words with proper state updates
- Fixed restart button - WordScramble now receives and uses gameKey prop as key on Client
- Restart properly resets game without hiding menu

**Go Fish Auto-Pair Detection:**
- Added auto-pair detection at setup - pairs are now marked immediately on deal
- After pairs removed, cards are auto-drawn to refill hand to 5 cards
- Hand always maintained at 5 cards until deck exhausted
- Recursive pair checking during card draws to handle chain pairs

**Memory Match Victory & Audio Fix:**
- Background music now stops when game ends (WIN/LOSE/DRAW)
- Victory sounds play correctly (victory.mp3, victoryBark.mp3)
- Daisy voice announces win/lose using ElevenLabsService
- Added stopBackgroundMusic() to all game-end handlers in GameContainer

**Memory Match StateID Error Fix:**
- Fixed "invalid stateID" errors (was=[71] expected=[72], was=[57] expected=[58])
- Added triple-check before endPlayerTurn: ctxRef.current, ctx.gameover, and ctx.currentPlayer validation
- Prevents turn ending after game is already over
- Applied to both AI and human player boards

**Global Restart Button Fix:**
- All games now restart properly without hiding menu
- Removed setSelectedBoardGame(null) from restart handler
- gameKey increments to force component re-mount
- Applied globally to ALL BoardGame.io games (TicTacToe, Connect Four, Memory Match, Checkers, Go Fish, Word Scramble, etc.)

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
DaisyDog is built as a React 18 + Vite 6 frontend with Netlify serverless functions for secure backend operations. Framer Motion is integrated for UI animations. Styling is handled with CSS3 focusing on responsive design, and React Router v6 manages client-side navigation. The project incorporates a comprehensive multi-layered safety system and integrates educational content. Core features include:
- Safe AI chat with child-appropriate responses.
- 9 BoardGame.io Visual Interactive Games with full AI opponents (Daisy), including two-player strategy games (Tic-Tac-Toe, Connect Four, Memory Match, Checkers, Go Fish) and single-player puzzle games (Simple Puzzle, Color Matching, Pattern Builder, Word Scramble). Games feature a modern & clean theme, smooth animations, and proper turn management.
- Interactive legacy games with dynamic action buttons for gameplay: Fetch, Tug of War, Guessing Game, and a sophisticated dual-mode Hide & Seek.
- Voice Features with OpenAI Audio API for Speech-to-text (Whisper) and Text-to-speech (Shimmer voice), including HMAC token-based authentication, rate limiting, and clean text processing.
- Video responses with emotional expressions and sound effects, optimized for various aspect ratios and displayed within chat bubbles.
- Hunger and energy management system for the virtual pet.
- A robust testing system including constitutional content validation, UI button pattern checks, and game action verification, accessible via an integrated Debug Control Center.
- Mobile optimization ensures a consistent user experience across various devices.

## External Dependencies
- **Google Gemini AI API**: Used for AI-powered conversational capabilities.
- **OpenAI Audio API**: Whisper (speech-to-text) and TTS (text-to-speech) for voice features.
- **Supabase**: Utilized for database storage (sessions, safety events, performance logs, feature analytics, content cache).
- **Netlify Functions**: Serverless backend for secure API key management, voice authentication, and content moderation.