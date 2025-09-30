# DaisyDog - AI Virtual Pet Companion for Kids

## Overview
DaisyDog is an AI-powered virtual companion designed for children aged 5-18. This React + Vite frontend application leverages the Google Gemini AI API and Supabase to deliver a safe, interactive chatbot experience embodied by a friendly golden retriever personality. The project aims to provide engaging and educational content, including interactive games, video responses, and a multi-layered safety system, all within a pure frontend architecture without a dedicated backend server.

## User Preferences
(To be added as we learn user preferences)

## System Architecture
DaisyDog is built as a pure frontend application using **React 18** with **Vite 6** for a fast development experience. **Framer Motion** is integrated for UI animations, enhancing the interactive experience. The application directly connects to **Google Gemini AI** for conversational capabilities and **Supabase** for database operations, bypassing the need for a custom backend server. Styling is handled with **CSS3** focusing on responsive design. **React Router v6** manages client-side navigation. The project incorporates a comprehensive **multi-layered safety system** and integrates **educational content**. Core features include:
- Safe AI chat with child-appropriate responses.
- Interactive games (Fetch, Hide & Seek, Tug of War) with dynamic action buttons for gameplay.
- Video responses with emotional expressions and sound effects.
- Hunger and energy management system for the virtual pet.
- A robust testing system including constitutional content validation, UI button pattern checks, and game action verification.
- Mobile optimization ensures a consistent user experience across various devices.
- Video assets are managed to support both landscape and portrait aspect ratios, displayed within chat bubbles rather than avatars.
- Submenus for games and other quick actions are correctly positioned to ensure visibility and proper interaction flow.

## External Dependencies
- **Google Gemini AI API**: Used for AI-powered conversational capabilities.
- **Supabase**: Utilized for database storage (sessions, safety events, performance logs, feature analytics, content cache).