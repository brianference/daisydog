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

## User Preferences
(To be added as we learn user preferences)
