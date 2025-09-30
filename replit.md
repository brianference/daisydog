# DaisyDog - AI Virtual Pet Companion for Kids

## Project Overview
DaisyDog is an AI-powered virtual companion for children ages 5-18. It's a React + Vite frontend application that uses Google Gemini AI API and Supabase for database operations. The app provides a safe, interactive chatbot experience with a friendly golden retriever personality.

## Architecture
- **Frontend**: React 18 + Vite 6 + Framer Motion
- **AI Integration**: Google Gemini AI API (@google/genai)
- **Database**: Supabase (direct client-side connection)
- **Styling**: CSS3 with responsive design
- **Routing**: React Router v6

## Tech Stack
- React 18.2.0
- Vite 6.0.0
- Google Gemini AI SDK
- Supabase Client
- Framer Motion for animations
- React Router DOM
- React Query for data fetching

## Development Setup

### Environment
- Node.js 20.x (required for Vite 6 and @google/genai)
- npm 10.x
- Port 5000 (configured for Replit)

### Configuration
The project is configured for Replit environment:
- Vite server runs on port 5000 with host 0.0.0.0
- HMR configured for Replit's proxy (WSS on port 443)
- Preview mode also uses port 5000

### Running the App
```bash
npm run dev
```

The app runs on port 5000 and is accessible via Replit's web preview.

### Environment Variables (Optional)
Create `.env.local` for API features:
- `VITE_GEMINI_API_KEY` - Google Gemini API key
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

The app works with local responses if API keys are not configured.

## Deployment
- **Type**: Autoscale (static site)
- **Build**: `npm run build`
- **Run**: `npx vite preview --host 0.0.0.0 --port 5000`

## Project Structure
```
/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages
│   ├── services/       # API integrations (Gemini, Supabase)
│   ├── hooks/          # Custom React hooks
│   ├── constants/      # Safety systems and constants
│   ├── data/           # Static data
│   └── utils/          # Utility functions
├── public/
│   ├── assets/         # Images, videos, sounds
│   └── sounds/         # Audio files
├── backend/            # (Not used - FastAPI reference code)
└── docs/               # Documentation

```

## Key Features
- Safe AI chat with child-appropriate responses
- Interactive games (Fetch, Hide & Seek, Tug of War)
- Video responses with emotions
- Sound effects and music
- Hunger and energy system
- Educational content integration
- Multi-layered safety system

## Notes
- The backend/ folder contains FastAPI reference code but is NOT used in production
- Frontend directly connects to Gemini AI and Supabase
- No backend server is needed - it's a pure frontend application
- All safety filters and content moderation happen client-side

## Recent Changes
- Upgraded to Node.js 20 for Vite 6 compatibility
- Configured Vite for Replit environment (port 5000, proper host settings)
- Set up autoscale deployment configuration
- All dependencies installed and tested
- **Mobile Optimization (Sept 30, 2025)**:
  - Fixed hunger bar and status indicators overflow on mobile screens
  - Added viewport constraints to prevent horizontal scrolling
  - Optimized age verification modal for small screens (95% width with proper padding)
  - Enhanced chat info section with responsive scaling at 768px and 480px breakpoints
  - Message input properly fixed to bottom with safe-area support for iOS
  - Footer navigation now uses horizontal scroll on mobile to display all links (About, Chat, FAQ, Privacy, Contact, Read the Book)
  - Action buttons (quick actions) display in single row with horizontal scroll instead of wrapping to two rows
  - Both send (paw) and feed (bone) buttons now have orange backgrounds for consistency
  - Debug/gear icon repositioned to avoid overlap with hamburger menu on mobile
  - Daisy's avatar hidden on mobile to allow message bubbles to use full screen width
- **Database Setup (Sept 30, 2025)**:
  - Created Supabase database tables: sessions, safety_events, performance_logs, feature_analytics, content_cache
  - Added performance indexes for all tables
  - Resolved RLS (Row Level Security) error preventing session creation
  - Database schema follows COPPA compliance with anonymous tracking only
- **Constitutional Content & Testing System Overhaul (Sept 30, 2025)**:
  - Fixed critical content gaps: Added 9 missing amendment definitions (4th, 5th, 9th, 16th-18th, 21st-22nd, 26th amendments)
  - Resolved user-reported 16th Amendment issue that was returning generic responses instead of specific constitutional text
  - Removed duplicate amendment entries and organized content structure properly
  - **Comprehensive Test Suite Enhancements**:
    - Updated testAmendments() to test ALL 20 UI amendments (was only testing 5)
    - Added response quality validation to detect generic fallback responses
    - Built regression testing system with golden dataset validating:
      * Specific amendment text markers (case-insensitive, flexible hyphenation)
      * At least 2 amendment-specific keywords per response
      * Multiple generic fallback pattern detection
      * Adequate response length (>150 characters)
    - Enhanced failure reporting with detailed keyword match counts and issue categorization
    - All tests integrated into Pre-Release Test Suite (Category 6: Constitutional Content Tests)
  - Test commands available in browser console:
    * `window.runPreReleaseTests()` - Full test suite
    * `window.quickTest('constitution')` - Constitutional content tests only
- **UI Button Pattern Fix & Testing (Sept 30, 2025)**:
  - Fixed Bible "Verse of the Day" button bug: Changed from sending user messages (orange) to Daisy messages (white)
  - Root cause: Button used handleQuickMessage() instead of creating Daisy message directly
  - **New Category 9: UI Button Pattern Tests**:
    - Validates action buttons (Verse of Day, Dance) create Daisy messages, not user messages
    - Prevents regression of button implementation bugs
    - Detects misuse of handleQuickMessage in action button handlers
  - Documented proper button patterns:
    * Action buttons → Create Daisy messages directly
    * Query buttons → Use handleQuickMessage()
  - Test commands:
    * `window.quickTest('ui')` - UI button pattern tests only
- **Amendment Detection & Test System Fixes (Sept 30, 2025)**:
  - **Fixed 26th Amendment Bug**: "twenty-sixth amendment" was incorrectly returning 6th Amendment content
  - Root cause: Substring matching with wrong array order (sixthamendment checked before twentysixthamendment)
  - Solution: Reordered amendmentTopics array to check compound amendments (20+) first, teens (13-19) second, single digits (1-10) last
  - **New Substring Regression Tests**: Added testAmendmentSubstringBugs() testing 7 critical cases (26th→6th, 22nd→2nd, 21st→1st, etc.)
  - **Enhanced Test Failure Reporting**: Tests now show "got X (expected Y)" format for better debugging
  - **Tooltip Testing**: Added tooltip visibility tests to UI button pattern category
  - **Security Fix**: Gated sensitive API key logging behind `import.meta.env.DEV` flag to prevent production exposure
  - Test commands remain the same:
    * `window.runPreReleaseTests()` - Full test suite including new substring tests
    * `window.quickTest('constitution')` - Constitutional content + substring bug tests
- **Tooltip & Mobile Optimization Fixes (Sept 30, 2025)**:
  - **CRITICAL BUG FIX: Tooltips Not Showing**: Fixed tooltips being invisible on desktop and mobile
  - Root cause: `.quick-actions-compact` container had `overflow-x: auto` for horizontal scrolling, which also clipped vertical overflow where tooltips appear
  - Solution: Added `overflow-y: visible` to allow tooltips to display above buttons while maintaining horizontal scroll
  - **Mobile Hunger Bar Optimization**: Hid "Your friendly AI companion" text on mobile screens (max-width: 768px) to save space
  - **Enhanced Test System (v6.2.3)**: UI Button Pattern tests now detect CSS overflow issues that prevent tooltip visibility
    * Checks parent container overflow-x and overflow-y settings
    * Validates proper positioning for tooltip pseudo-elements
    * Detects configuration issues before they reach production
  - Test command: `window.quickTest('ui')` - Now catches tooltip CSS configuration bugs
  - **Tooltip Positioning Fix (Sept 30, 2025)**:
    - Changed tooltip display from above buttons to below buttons for better visibility
    - Updated CSS positioning: `bottom: 100%` → `top: 100%` (tooltip box appears below)
    - Fixed arrow alignment: Changed `margin-top: -5px` → `margin-top: 5px` to eliminate gap between arrow and tooltip box
    - Arrow now points upward with `border-bottom-color` instead of downward
    - Tooltips slide down smoothly with `translateY` animation
    - Better mobile experience: Tooltips display within input area space instead of being clipped at top of viewport
- **Video System Expansion (Sept 30, 2025)**:
  - **Added 8 New Videos** with portrait/tall aspect ratio for more emotional variety:
    * **bouncing.mp4** - Energetic, hyperactive, super excited situations
    * **digging.mp4** - Curious exploration, searching, investigating
    * **jumping.mp4** - Excited jumping, leaping, hopping
    * **layback.mp4** - Lounging, comfortable, content (different mood from lay-down)
    * **paws.mp4** - Requesting attention, begging, asking nicely
    * **tail-chase.mp4** - Super silly, goofy, ridiculous, comical
    * **tired.mp4** - Exhausted, sleepy, low energy, worn out
    * **waving.mp4** - Greetings, hellos, friendly welcomes
  - **Total Videos**: Now 14 videos (6 original landscape + 8 new portrait)
  - **Aspect Ratio Handling**: Added CSS support for portrait videos with `object-position: center 40%` for optimal framing in circular avatars
  - **Enhanced Emotion Mappings**: Added comprehensive keyword mappings in `useVideoEmotion.js` for all new videos
  - **VideoAssetManager Updates**: Extended video asset configuration with aspectRatio metadata
  - **Smart Video Selection**: System automatically uses appropriate video based on conversation context and keywords
  - Videos stored in: `public/assets/*.mp4`
  - All new videos have fallback images for graceful degradation
- **Video Integration & Avatar Fix (Sept 30, 2025)**:
  - **Fixed Avatar Display Bug**: Changed SmartDaisyAvatar from `useVideo={true}` to `useVideo={false}` to prevent rainbow gradient/loading state showing in circular avatars
  - **Video Display Location**: Videos now only display inside white chat message bubbles via InlineVideoMessage component, not in circular avatars
  - **Enhanced Button Video Variety**: Updated all main action buttons to use unique videos:
    * Tell a Story Button (📚) → Uses `digging.mp4` (curious, exploring) with story snippets
    * Do a Trick Button (🦴) → Uses `roll-over.mp4` (playful tricks) with trick demonstrations
    * Tell a Joke Button (😄) → Uses `bouncing.mp4` (energetic, excited) with dog jokes
    * Dance Button (💃) → Uses `tail-chase.mp4` (silly, spinning, goofy)
    * Play Games Button (🎮) → Uses `jumping.mp4` (excited, playful jumping)
    * Verse of Day Button (✝️) → Uses `waving.mp4` (friendly, welcoming greeting)
  - **Avatar Image Restoration**: Circular avatars now properly display emotion-based images (happy.png, excited.png, etc.) instead of attempting video playback
  - Console logs confirm proper loading: `🖼️ Avatar loaded: happy → /assets/images/emotions/happy.png`
- **Portrait Video & Games Submenu Fixes (Sept 30, 2025)**:
  - **Portrait Video Display Fix**: Adjusted InlineVideoMessage.css to accommodate taller portrait videos
    * Desktop: Increased height from 200px to 280px
    * Tablet (≤768px): Increased height from 160px to 220px
    * Mobile (≤480px): Increased height from 140px to 200px
    * Added `object-position: center 30%` at all breakpoints to keep Daisy's head visible
  - **Games Submenu Visibility Fix**: Fixed critical bug where games submenu wasn't appearing
    * Root cause: Submenus rendered after quick-actions buttons, causing off-screen display with sticky positioning
    * Solution: Reordered DOM in ChatPage.jsx so all submenus render ABOVE quick-actions buttons
    * Submenus now appear above buttons in the input container, visible in viewport
  - **Comprehensive Games Testing (v6.3.0)**: Added robust test suite for games submenu
    * Button click simulation to trigger submenu
    * Visibility validation (computed styles, height > 0)
    * Viewport position check (not clipped off-screen)
    * DOM order verification (submenu precedes quick-actions)
    * Automatic cleanup after each test
    * Run via: `window.runPreReleaseTests()` or `window.quickTest('games')`

## User Preferences
(To be added as we learn user preferences)
