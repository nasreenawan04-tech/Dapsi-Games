# DapsiGames - Gamified Study & Productivity Hub

## Overview
DapsiGames is a comprehensive study and productivity application designed to transform studying into an engaging, gamified experience for students. It incentivizes users with XP points, badges, and leaderboard rankings for completing study tasks, maintaining focus, and achieving goals. The project aims to motivate students aged 13-25 by making learning more interactive and rewarding.

## Recent Changes
### October 25, 2025 - Phase 6: Gamification Logic & Rewards (COMPLETED)
- **Level-Up Celebrations**: Implemented visual level-up celebrations with confetti animations
  - Created LevelUpModal component with confetti effects similar to BadgeUnlockModal
  - Backend endpoints (/api/pomodoro/complete, /api/tasks/:taskId/complete) now return `leveledUp` boolean by comparing old vs new levels
  - Integrated LevelUpModal in both PomodoroTimer and Planner components for seamless user experience
  - Badge unlock notifications properly delayed to avoid clashing with level-up celebrations
- **PDF Export for Study Planner**: Added comprehensive PDF export functionality
  - Integrated jsPDF and jspdf-autotable libraries for professional PDF generation
  - Export includes user info header, pending tasks table, completed tasks table, and branding footer
  - Proper handling of Firestore timestamps and missing due dates
  - Download button disabled when no tasks available
- **Sound Packs in Virtual Store**: Expanded store inventory with ambient sound options
  - Added 6 sound pack items: Rainfall Ambience (300 XP), Coffee Shop (300 XP), Forest Sounds (350 XP), Lo-fi Beats (400 XP), White Noise (250 XP), Ocean Waves (350 XP)
  - Created dedicated "Sounds" tab in Store page alongside existing categories
  - Sound packs use existing purchase pipeline and are purchasable with XP
  - Each item includes descriptive icons and color-coded backgrounds
- **System Integrity**: All Phase 6 features passed comprehensive architect review with no security issues or regressions in existing XP, badge, or task systems

### October 25, 2025 - Phase 5: Core Back-End Integration (COMPLETED)
- **Secure Backend API Integration**: Implemented Express.js backend with Firebase Admin SDK for secure server-side operations
  - Set up Firebase Admin SDK with service account credentials (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY)
  - Created Firebase ID token verification middleware for all protected endpoints
  - Created `/api/pomodoro/complete` endpoint - server-side XP calculation (25min=50XP, 50min=100XP), session recording, automatic badge checking
  - Created `/api/tasks/:taskId/complete` endpoint - task ownership validation, XP rewards from task documents, automatic badge notifications
  - Created `/api/leaderboard` endpoint - efficient global leaderboard retrieval with proper ranking
  - Created `/api/badges/check` endpoint - automated badge unlocking based on achievements (8 badges: First Focus, Task Master, Streak Star, Master Learner, Social Butterfly, Group Leader, Early Bird, Night Owl)
  - Created `/api/users/streak` endpoint - daily streak management with same-day inflation prevention via calendar date normalization
  - Created `/api/users/stats` endpoint - user statistics aggregation (total sessions, tasks completed, badges unlocked)
- **Frontend Integration**: Updated frontend components to use new backend APIs with proper authentication
  - All API calls send Firebase ID token in Authorization header for verification
  - PomodoroTimer component uses backend API with automatic badge unlock notifications
  - Planner component uses backend API for task completion with XP and badge rewards
  - Leaderboard component uses backend API for global leaderboard data
  - Created `client/src/lib/api.ts` with helper functions and automatic fallback to direct Firebase calls for resilience
- **Security & Integrity**:
  - All XP calculations happen server-side - clients cannot manipulate XP values
  - Task completion validates ownership before awarding XP - prevents cross-user manipulation
  - Streak endpoint prevents same-day inflation - only one increment per calendar day
  - Firebase ID tokens verified on every protected route - unauthorized requests rejected with 401
  - UserId derived from verified token, never trusted from request body
- **Enhanced User Experience**: Automatic badge unlock notifications with toast messages when completing sessions or tasks

### October 25, 2025 - Phase 4: Email Verification Implementation
- **Added Email Verification**: Implemented Firebase email verification to secure user accounts
  - New users receive verification email automatically upon signup
  - Unverified users are redirected to verification page before accessing protected content
  - Created dedicated EmailVerification page with resend functionality
  - Added 60-second cooldown timer for resend requests
  - Updated AuthContext to track emailVerified status
  - Modified ProtectedRoute component to enforce verification requirement
- **Enhanced Security**: Users must verify their email address before accessing any app features
- **Improved UX**: Clear messaging and easy resend option for verification emails

## User Preferences
- Clean, minimal, gamified interface
- Focus on motivation and progress visualization
- Smooth animations and delightful micro-interactions
- Mobile-first responsive design
- Accessibility compliance (WCAG AA)

## System Architecture
The application is built with a modern web stack, emphasizing a gamified user experience and real-time data synchronization.

### UI/UX Decisions
- **Color Palette**: Utilizes a vibrant palette with Blue (focus), Teal (productivity), and Purple (gamification) accents against a clean white and gray background.
- **Typography**: Employs Inter for headings and system UI fonts for body text, ensuring readability.
- **Design System**: Leverages Shadcn UI with Radix primitives for consistent and accessible components.
- **Responsiveness**: Designed with a mobile-first approach, ensuring optimal experience across devices.
- **Gamification**: Integrates XP points, levels (Novice, Scholar, Master), badges, and leaderboards directly into the UI.
- **Animations**: Incorporates smooth transitions and micro-interactions using CSS transforms for performance.

### Technical Implementations
- **Frontend**: React 19 with TypeScript, Wouter for routing, and TailwindCSS for styling. State management is handled via React Context API and TanStack Query.
- **Authentication System**: Comprehensive authentication system using Firebase Authentication featuring:
  - Email/password registration with automatic verification email dispatch
  - Email verification requirement before accessing protected content
  - Secure login with session persistence
  - Password reset functionality
  - Real-time auth state management via Firebase Auth observers
  - Protected routes that redirect unverified users to verification page
  - Email verification page with resend capability and cooldown timer
- **Gamified Dashboard**: Displays user XP, level progression, daily goals, recent activity, and quick stats, providing a central hub for user progress.
- **Pomodoro Focus Timer**: Customizable timer with XP rewards upon completion, integrated with Firebase to record sessions and update user XP.
- **Study Planner**: Enables CRUD operations for study tasks, subject categorization, due date tracking, and XP rewards, with all data stored in Firestore.
- **Real-time Leaderboard**: Features global and filtered leaderboards (All Time, Weekly, Daily, Friends) based on XP, powered by real-time Firestore queries.
- **Badges & Rewards System**: Tracks and automatically unlocks 8 distinct badges based on user milestones (e.g., "First Focus," "Master Learner"), with real-time notifications.
- **User Profile**: Allows users to manage account information, view XP history, statistics, theme customization, and showcase unlocked badges.
- **Friend System**: Supports searching for users, sending/receiving friend requests, and managing friend lists, including a friend-specific leaderboard.
- **Study Groups**: Facilitates creation, joining, and management of study groups, complete with group leaderboards.
- **Activity Feed**: Provides a global, real-time feed of user study activities, showing recent Pomodoro sessions and task completions.

### System Design Choices
- **Hybrid Architecture**: Combines client-side Firebase for real-time features with server-side Express.js backend for core game logic
  - Frontend uses Firebase Authentication and real-time listeners for UI updates
  - Backend handles XP calculations, badge unlocking, and data validation via Firebase Admin SDK
  - API layer provides fallback mechanisms to direct Firebase calls for resilience
- **Real-time Data**: Leverages Firebase's real-time capabilities for dynamic updates across leaderboards, activity feeds, and user progress.
- **Modular Component Architecture**: Organized project structure with reusable components and dedicated contexts for state management.
- **Secure Server-Side Operations**: Critical game logic executed on backend to prevent client-side manipulation of XP and badges.

## External Dependencies
- **Firebase**:
    - **Firebase Firestore**: Primary NoSQL database for all application data (users, tasks, sessions, badges, friends, groups, activities).
    - **Firebase Authentication**: Manages user registration, login, session management, and password resets.
    - **Firebase Admin SDK**: Server-side SDK for privileged Firestore access and secure operations.
- **Express.js**: Backend web framework for API endpoints.
- **React**: Frontend library for building user interfaces.
- **Wouter**: Lightweight client-side routing.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Shadcn UI & Radix UI**: UI component libraries for accessible and customizable components.
- **TanStack Query**: For data fetching, caching, and state management.
- **Google Fonts**: For optimized font loading (Inter).