# DapsiGames - Gamified Study & Productivity Hub

## Overview
DapsiGames is a comprehensive study and productivity application that transforms studying into a gamified experience for students. It rewards users with XP points, badges, and leaderboard rankings for completing study tasks, staying focused, and meeting goals.

**Tagline**: "Study Smarter, Play Harder"

## Tech Stack
- **Frontend**: React 19 with TypeScript, Wouter (routing), TailwindCSS
- **Backend**: Express.js with TypeScript, Firebase
- **Database**: Firebase Firestore (real-time NoSQL)
- **Authentication**: Firebase Auth (email/password)
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
- Firebase email/password authentication
- Real-time auth state management with onAuthStateChanged
- Password reset via Firebase
- Session persistence across browser refreshes
- Protected routes for authenticated users

### 2. Gamified Dashboard
- User XP display and level progression (Novice → Scholar → Master)
- Progress bars showing XP advancement
- Daily goals tracker
- Recent activity feed
- Quick stats cards (Total XP, Streak, Level, Badges)
- Real-time pending tasks counter

### 3. Pomodoro Focus Timer
- Customizable durations (25 or 50 minutes)
- Circular progress indicator
- Start/Pause/Reset controls
- Automatic XP rewards on completion (50 XP for 25min, 100 XP for 50min)
- Visual feedback with gradient animations
- **Firebase Integration**: Records sessions to Firestore and updates user XP

### 4. Study Planner
- Task CRUD operations (Create, Read, Update, Delete)
- Subject categorization
- Due date tracking with Firestore timestamps
- XP rewards per task
- Completion status tracking
- Pending vs. Completed task views
- **Firebase Integration**: All tasks stored in Firestore, real-time sync

### 5. Real-time Leaderboard
- Global rankings by total XP
- Top 3 podium display with animations
- User position highlighting
- Avatar system with fallbacks
- Streak and level displays
- **Firebase Integration**: Queries Firestore users collection ordered by XP

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

## Firebase Collections

### users
```typescript
{
  id: string (Firebase UID)
  email: string
  name: string
  xp: number (default: 0)
  level: string (Novice/Scholar/Master)
  streak: number (default: 0)
  lastActive: Timestamp
  createdAt: Timestamp
}
```

### tasks
```typescript
{
  id: string (auto-generated)
  userId: string (Firebase UID)
  title: string
  subject: string
  dueDate: Timestamp | null
  completed: boolean
  xpReward: number
  createdAt: Timestamp
}
```

### pomodoroSessions
```typescript
{
  id: string (auto-generated)
  userId: string (Firebase UID)
  duration: number (25 or 50)
  xpEarned: number
  completedAt: Timestamp
}
```

### userBadges
```typescript
{
  userId: string (Firebase UID)
  badgeId: string
  unlockedAt: Timestamp
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
│   │   │   ├── PomodoroTimer.tsx      # Focus timer with Firebase integration
│   │   │   ├── XPProgressBar.tsx      # Level progression display
│   │   │   ├── ProtectedRoute.tsx     # Auth guard wrapper
│   │   │   └── ui/                    # Shadcn components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # Firebase Auth state management
│   │   ├── lib/
│   │   │   └── firebase.ts            # Firebase SDK setup & helper functions
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Landing page
│   │   │   ├── Login.tsx              # Firebase login form
│   │   │   ├── Signup.tsx             # Firebase registration form
│   │   │   ├── ForgotPassword.tsx     # Firebase password reset
│   │   │   ├── Dashboard.tsx          # Main user dashboard
│   │   │   ├── Leaderboard.tsx        # Firestore-powered rankings
│   │   │   ├── Planner.tsx            # Firestore task management
│   │   │   ├── Rewards.tsx            # Badge showcase
│   │   │   └── Profile.tsx            # User settings
│   │   ├── App.tsx                    # Root component with routing
│   │   ├── index.css                  # Global styles & CSS variables
│   │   └── main.tsx                   # Entry point
│   └── index.html                     # HTML template with SEO meta tags
├── server/
│   ├── routes.ts                      # API endpoints (minimal, Firebase handles most)
│   ├── storage.ts                     # Storage interface
│   └── index.ts                       # Express server setup
├── shared/
│   └── schema.ts                      # Shared TypeScript types & Zod schemas
└── design_guidelines.md               # Design system documentation
```

## Firebase Configuration
Environment variables required (already configured):
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_APP_ID` - Firebase App ID
- `VITE_FIREBASE_PROJECT_ID` - Firebase Project ID

Firebase auto-generates:
- `authDomain`: `{PROJECT_ID}.firebaseapp.com`
- `storageBucket`: `{PROJECT_ID}.firebasestorage.app`

## Routes
- `/` - Public landing page
- `/login` - Firebase authentication page
- `/signup` - Firebase registration page
- `/forgot-password` - Firebase password reset
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

Levels are calculated dynamically based on XP and updated in Firestore.

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

### Phase 1: Foundation & Core UI (✅ COMPLETED)
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

### Phase 2: Firebase Integration (✅ COMPLETED)
✅ Firebase SDK installation and configuration
✅ Firebase Authentication setup (email/password)
✅ AuthContext with onAuthStateChanged listener
✅ Firestore database integration
✅ User profile creation on signup
✅ Pomodoro session recording with XP updates
✅ Task CRUD operations with Firestore
✅ Real-time leaderboard from Firestore
✅ User XP refresh functionality
✅ Firebase Timestamp handling

### Phase 3: Testing & Polishing (PENDING)
- End-to-end testing of all Firebase features
- Error handling improvements
- Loading states optimization
- Badge unlock automation
- Streak calculation logic
- Performance optimization
- Final visual polish

## Firebase Helper Functions (client/src/lib/firebase.ts)

### Authentication
- `signUpWithEmail(email, password, name)` - Creates user + Firestore profile
- `signInWithEmail(email, password)` - Authenticates user
- `logOut()` - Signs out user
- `resetPassword(email)` - Sends password reset email

### User Management
- `getUserProfile(userId)` - Fetches user document from Firestore
- `updateUserXP(userId, xpToAdd)` - Adds XP and recalculates level

### Task Management
- `createTask(userId, task)` - Creates new task in Firestore
- `getUserTasks(userId)` - Fetches user's tasks
- `updateTask(taskId, updates)` - Updates existing task
- `deleteTask(taskId)` - Deletes task
- `completeTask(taskId, userId)` - Marks complete + awards XP

### Pomodoro
- `recordPomodoroSession(userId, duration, xpEarned)` - Records session + awards XP

### Leaderboard
- `getLeaderboard(limitCount)` - Gets top users ordered by XP

### Badges
- `getUserBadges(userId)` - Fetches unlocked badges
- `unlockBadge(userId, badgeId)` - Unlocks new badge

## Development Commands
```bash
npm run dev       # Start development server (port 5000)
npm run build     # Build for production
npm run start     # Start production server
```

## Next Steps
1. ✅ Firebase SDK and configuration
2. ✅ Authentication flow implementation
3. ✅ Firestore collections setup
4. ✅ Pomodoro timer XP integration
5. ✅ Task management with Firestore
6. ✅ Real-time leaderboard
7. Badge unlock automation
8. Streak calculation logic
9. Error handling improvements
10. End-to-end testing
11. Performance optimization
12. Deploy to production

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
- Firebase handles real-time data synchronization
- No backend API needed for most features (Firebase SDK in frontend)
- Level calculation happens automatically on XP updates
