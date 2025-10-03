# DaisyDog - AI Virtual Pet Companion for Kids

## Overview
DaisyDog is an AI-powered virtual companion for children aged 5-18. This React + Vite frontend application leverages the Google Gemini AI API and Supabase to provide a safe, interactive chatbot experience embodied by a friendly golden retriever personality. The project aims to deliver engaging and educational content, including interactive games, video responses, and a multi-layered safety system, all within a pure frontend architecture without a dedicated backend server.

## Recent Changes (October 3, 2025 - Session 2)
**Critical Game Fixes:**

**Checkers AI Freeze Fix:**
- Fixed Checkers AI not taking turns after first move
- Moved AI logic to separate CheckersAIBoard component for player 1
- Applied same pattern as TicTacToe and Connect Four
- AI now validates playerID === '1' and checks turn before making moves

**Word Scramble Progression Fix:**
- Fixed game hanging after first word (1/5)
- Letters now appear for words 2-5
- Added events.endTurn() after word completion to properly update state
- Scrambled letters render correctly with unique keys

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