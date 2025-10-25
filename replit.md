# DapsiGames - Gamified Study & Productivity Hub

## Overview
DapsiGames is a comprehensive study and productivity application that transforms studying into a gamified experience for students. It rewards users with XP points, badges, and leaderboard rankings for completing study tasks, staying focused, and meeting goals.

## Tech Stack
- **Frontend**: React 19 with TypeScript, Wouter (routing), TailwindCSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (planned) / In-memory storage (current)
- **Authentication**: Firebase Auth (planned)
- **State Management**: React Context API, TanStack Query
- **UI Components**: Shadcn UI with Radix primitives

## Design System
### Color Palette
- **Primary**: Blue (#3b82f6 / HSL 217 91% 60%) - Focus and energy
- **Secondary**: Teal (#14b8a6 / HSL 174 72% 56%) - Calm productivity
- **Accent**: Purple (#8b5cf6 / HSL 262 83% 68%) - Playfulness and gamification
- **Background**: White with subtle gray sections
- **Text**: Dark Slate for strong readability

### Typography
- **Headings**: Inter (weights: 400-800)
- **Body**: System UI font stack
- **Font Loading**: Google Fonts with preconnect optimization

## Key Features

### 1. Authentication System
- Email/password signup and login
- Password reset functionality
- Session persistence
- Protected routes for authenticated users

### 2. Gamified Dashboard
- User XP display and level progression (Novice → Scholar → Master)
- Progress bars showing XP advancement
- Daily goals tracker
- Recent activity feed
- Quick stats cards (Total XP, Streak, Level, Badges)

### 3. Pomodoro Focus Timer
- Customizable durations (25 or 50 minutes)
- Circular progress indicator
- Start/Pause/Reset controls
- Automatic XP rewards on completion (50 XP for 25min, 100 XP for 50min)
- Visual feedback with gradient animations

### 4. Study Planner
- Task CRUD operations (Create, Read, Update, Delete)
- Subject categorization
- Due date tracking
- XP rewards per task
- Completion status tracking
- Pending vs. Completed task views

### 5. Real-time Leaderboard
- Global rankings by total XP
- Top 3 podium display with animations
- User position highlighting
- Avatar system with fallbacks
- Streak and level displays

### 6. Badges & Rewards System
- Achievement tracking (8 different badges)
- Unlocked vs. Locked badge displays
- Progress percentage
- Badge categories: Focus, Consistency, XP Collection, Mastery
- Visual feedback with icons and colors

### 7. User Profile
- Account information management
- XP history tracking
- Statistics display
- Theme customization (Light/Dark mode)
- Avatar display

## Data Models

### User
```typescript
{
  id: string
  email: string
  password: string (hashed)
  name: string
  avatar?: string
  xp: number (default: 0)
  level: string (Novice/Scholar/Master)
  streak: number (default: 0)
  lastActive: timestamp
  createdAt: timestamp
}
```

### Task
```typescript
{
  id: string
  userId: string
  title: string
  subject?: string
  dueDate?: timestamp
  completed: boolean (default: false)
  xpReward: number (default: 10)
  createdAt: timestamp
}
```

### PomodoroSession
```typescript
{
  id: string
  userId: string
  duration: number (25 or 50)
  xpEarned: number
  completedAt: timestamp
}
```

### Badge
```typescript
{
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  type: string
}
```

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.tsx         # Main navigation with mobile menu
│   │   │   ├── ThemeProvider.tsx      # Dark mode implementation
│   │   │   ├── ThemeToggle.tsx        # Theme switch button
│   │   │   ├── PomodoroTimer.tsx      # Focus timer component
│   │   │   ├── XPProgressBar.tsx      # Level progression display
│   │   │   ├── ProtectedRoute.tsx     # Auth guard wrapper
│   │   │   └── ui/                    # Shadcn components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # Authentication state
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Landing page
│   │   │   ├── Login.tsx              # Login form
│   │   │   ├── Signup.tsx             # Registration form
│   │   │   ├── ForgotPassword.tsx     # Password reset
│   │   │   ├── Dashboard.tsx          # Main user dashboard
│   │   │   ├── Leaderboard.tsx        # Global rankings
│   │   │   ├── Planner.tsx            # Task management
│   │   │   ├── Rewards.tsx            # Badge showcase
│   │   │   └── Profile.tsx            # User settings
│   │   ├── App.tsx                    # Root component with routing
│   │   ├── index.css                  # Global styles & CSS variables
│   │   └── main.tsx                   # Entry point
│   └── index.html                     # HTML template with SEO meta tags
├── server/
│   ├── routes.ts                      # API endpoints (to be implemented)
│   ├── storage.ts                     # Data persistence interface
│   └── index.ts                       # Express server setup
├── shared/
│   └── schema.ts                      # Shared TypeScript types & Zod schemas
└── design_guidelines.md               # Design system documentation
```

## Routes
- `/` - Public landing page
- `/login` - Authentication page
- `/signup` - Registration page
- `/forgot-password` - Password reset
- `/dashboard` - Main dashboard (protected)
- `/leaderboard` - Global rankings (protected)
- `/planner` - Task management (protected)
- `/rewards` - Badge collection (protected)
- `/profile` - User settings (protected)

## XP System
### Earning XP
- Complete 25-minute Pomodoro session: **50 XP**
- Complete 50-minute Pomodoro session: **100 XP**
- Complete a task: **10-50 XP** (customizable per task)
- Daily streak bonuses (planned)

### Level Progression
- **Novice**: 0 - 499 XP
- **Scholar**: 500 - 1,999 XP
- **Master**: 2,000+ XP

## Badges Available
1. **First Focus** - Complete first Pomodoro session
2. **Dedicated Learner** - 7-day study streak
3. **Task Master** - Complete 10 study tasks
4. **Rising Star** - Reach 500 XP
5. **Focus Champion** - Complete 25 Pomodoro sessions
6. **Consistency King** - 30-day study streak
7. **XP Collector** - Earn 2,000 XP
8. **Master Learner** - Reach Master level

## Implementation Status

### Phase 1: Foundation & Core UI (COMPLETED)
✅ Complete data schema with TypeScript types
✅ Design system configuration (colors, typography, animations)
✅ Theme provider with light/dark mode
✅ Authentication context and protected routes
✅ Responsive navigation (desktop + mobile)
✅ All page components (Home, Auth pages, Dashboard, Leaderboard, Planner, Rewards, Profile)
✅ Reusable components (PomodoroTimer, XPProgressBar, Navigation)
✅ SEO optimization (meta tags, Open Graph)
✅ Gamification elements (progress bars, badges, XP display)
✅ Smooth animations and transitions
✅ Mobile-responsive design

### Phase 2: Backend Implementation (PENDING)
- Firebase Authentication integration
- Firestore database setup
- API endpoints for all features
- Session management
- XP calculation logic
- Real-time leaderboard updates

### Phase 3: Integration & Testing (PENDING)
- Connect frontend to backend APIs
- Real-time data synchronization
- Error handling and loading states
- Form validation
- End-to-end testing
- Performance optimization

## Development Commands
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
```

## Next Steps
1. Set up Firebase project and obtain API credentials
2. Implement authentication endpoints
3. Create Firestore collections and indexes
4. Connect Pomodoro timer to XP system
5. Implement task management API
6. Add real-time leaderboard functionality
7. Implement badge unlock system
8. Add comprehensive error handling
9. Performance testing and optimization
10. Deploy to production

## User Preferences
- Primary audience: Students aged 13-25
- Clean, minimal, gamified interface
- Focus on motivation and progress visualization
- Smooth animations and delightful micro-interactions
- Mobile-first responsive design
- Accessibility compliance (WCAG AA)

## Notes
- All interactive elements have data-testid attributes for testing
- Components follow Shadcn design patterns
- Dark mode fully supported throughout
- Animations use CSS transforms for performance
- Images lazy-loaded where applicable
- Font loading optimized with preconnect
