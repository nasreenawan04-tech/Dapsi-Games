# DapsiGames - Gamified Study & Productivity Hub

## Overview
DapsiGames is a comprehensive study and productivity application designed to transform studying into an engaging, gamified experience for students. It incentivizes users with XP points, badges, and leaderboard rankings for completing study tasks, maintaining focus, and achieving goals. The project aims to motivate students aged 13-25 by making learning more interactive and rewarding.

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
- **Authentication System**: Implemented using Firebase Authentication for email/password login, registration, password reset, and real-time auth state management. Protected routes ensure secure access to user-specific content.
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
- **Client-Side Firebase Integration**: Most features directly interact with Firebase Firestore and Authentication from the client-side, minimizing the need for a custom backend server for core functionalities.
- **Real-time Data**: Leverages Firebase's real-time capabilities for dynamic updates across leaderboards, activity feeds, and user progress.
- **Modular Component Architecture**: Organized project structure with reusable components and dedicated contexts for state management.

## External Dependencies
- **Firebase**:
    - **Firebase Firestore**: Primary NoSQL database for all application data (users, tasks, sessions, badges, friends, groups, activities).
    - **Firebase Authentication**: Manages user registration, login, session management, and password resets.
- **React**: Frontend library for building user interfaces.
- **Wouter**: Lightweight client-side routing.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Shadcn UI & Radix UI**: UI component libraries for accessible and customizable components.
- **TanStack Query**: For data fetching, caching, and state management.
- **Google Fonts**: For optimized font loading (Inter).