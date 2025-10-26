# DapsiGames - Gamified Study & Productivity Hub

## Overview
DapsiGames is a comprehensive study and productivity application designed to transform studying into an engaging, gamified experience for students aged 13-25. It incentivizes users with XP points, badges, and leaderboard rankings for completing study tasks, maintaining focus, and achieving goals, aiming to make learning more interactive and rewarding. The project includes a full-featured website with public-facing pages, PWA support, analytics, and monetization capabilities.

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
- **Authentication System**: Comprehensive Firebase Authentication with email/password, verification, password reset, and real-time state management. Email verification is enforced before accessing protected content.
- **Gamified Dashboard**: Displays user XP, level progression, daily goals, recent activity, and quick stats.
- **Pomodoro Focus Timer**: Customizable timer with server-side XP rewards and session recording.
- **Study Planner**: CRUD operations for study tasks, subject categorization, due date tracking, and server-side XP rewards, with PDF export functionality.
- **Real-time Leaderboard**: Global and filtered leaderboards (All Time, Weekly, Daily, Friends) based on XP, powered by Firestore.
- **Badges & Rewards System**: Tracks and automatically unlocks 8 distinct badges based on user milestones with real-time notifications and level-up celebrations.
- **User Profile**: Manages account info, XP history, stats, theme customization, and unlocked badges.
- **Friend System**: Supports user search, friend requests, and friend lists including a friend-specific leaderboard.
- **Messaging System**: Real-time one-on-one messaging between friends with unread message indicators, conversation history, and auto-scrolling chat interface.
- **Study Groups**: Facilitates creation, joining, and management of study groups with group leaderboards.
- **Activity Feed**: Real-time global feed of user study activities.
- **Virtual Store**: Includes purchasable items like sound packs (e.g., Rainfall Ambience, Lo-fi Beats) using XP.
- **PWA Implementation**: Full Progressive Web App support with manifest, icons, service worker for caching, and offline capabilities.
- **Website Structure**: Transformed into a full-featured website with public-facing pages (About, Features, Pricing, Contact, FAQ) and enhanced navigation and footer components.
- **SEO Implementation**: Comprehensive SEO system with:
  - Dynamic meta tags (title, description, keywords) per page
  - Open Graph and Twitter Card support for social sharing
  - Canonical URLs for all pages
  - JSON-LD structured data (Organization and WebSite schemas)
  - robots.txt for search engine crawling guidelines
  - sitemap.xml for search engine indexing
  - Unique, descriptive metadata for all public pages

### System Design Choices
- **Hybrid Architecture**: Combines client-side Firebase for real-time features with a server-side Express.js backend for core game logic, secure XP calculations, and badge unlocking via Firebase Admin SDK.
- **Real-time Data**: Leverages Firebase for dynamic updates across the application.
- **Modular Component Architecture**: Organized project structure with reusable components.
- **Secure Server-Side Operations**: Critical game logic (XP, badges) executed on the backend to prevent client-side manipulation.
- **Build Optimization**: Vite build configuration optimized for low-memory environments:
  - Single vendor chunk instead of granular code splitting to reduce memory usage
  - esbuild minification (faster and more memory-efficient than Terser)
  - Simplified PWA workbox configuration
  - Source maps disabled in production

## External Dependencies
- **Firebase**:
    - **Firebase Firestore**: Primary NoSQL database for all application data.
    - **Firebase Authentication**: Manages user authentication.
    - **Firebase Admin SDK**: Server-side SDK for privileged operations.
- **Express.js**: Backend web framework for API endpoints.
- **React**: Frontend library.
- **Wouter**: Lightweight client-side routing.
- **TailwindCSS**: Utility-first CSS framework.
- **Shadcn UI & Radix UI**: UI component libraries.
- **TanStack Query**: For data fetching and state management.
- **Google Fonts**: For typography.
- **jsPDF & jspdf-autotable**: For PDF generation.
- **vite-plugin-pwa**: For Progressive Web App functionality.
- **Google Analytics**: For user behavior tracking.
- **Google AdSense**: For monetization infrastructure.
- **Stripe**: For premium subscription payment processing.