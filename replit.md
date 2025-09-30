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
- **Database Setup (Sept 30, 2025)**:
  - Created Supabase database tables: sessions, safety_events, performance_logs, feature_analytics, content_cache
  - Added performance indexes for all tables
  - Resolved RLS (Row Level Security) error preventing session creation
  - Database schema follows COPPA compliance with anonymous tracking only

## User Preferences
(To be added as we learn user preferences)
