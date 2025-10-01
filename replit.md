# DaisyDog - AI Virtual Pet Companion for Kids

## Overview
DaisyDog is an AI-powered virtual companion designed for children aged 5-18. This React + Vite frontend application leverages the Google Gemini AI API and Supabase to deliver a safe, interactive chatbot experience embodied by a friendly golden retriever personality. The project aims to provide engaging and educational content, including interactive games, video responses, and a multi-layered safety system, all within a pure frontend architecture without a dedicated backend server.

## User Preferences
### Development Workflow
**MANDATORY TESTING BEFORE PUSH:**
- **ALWAYS test changes before pushing to GitHub**
- **Run screenshot tool to verify UI works**
- **Check console logs for errors**
- **Test critical features affected by changes**
- **Never push without verification**

## System Architecture
DaisyDog is built as a React 18 + Vite 6 frontend with **Netlify serverless functions** for secure backend operations. **Framer Motion** is integrated for UI animations, enhancing the interactive experience. The application uses **Google Gemini AI** for conversational capabilities, **OpenAI Whisper & TTS** for voice features, and **Supabase** for database operations. Styling is handled with **CSS3** focusing on responsive design. **React Router v6** manages client-side navigation. The project incorporates a comprehensive **multi-layered safety system** and integrates **educational content**. Core features include:
- Safe AI chat with child-appropriate responses.
- Interactive games with dynamic action buttons for gameplay:
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