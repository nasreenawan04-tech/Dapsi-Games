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
- Global rankings by total XP with multiple filter modes:
  - **All Time**: Overall leaderboard across all users
  - **Weekly**: Top performers in the last 7 days
  - **Daily**: Today's leaders based on recent activity
  - **Friends**: Leaderboard filtered to show only your friends
- Tab-based UI with Radix UI Tabs for smooth filtering
- Top 3 podium display with animations
- User position highlighting
- Avatar system with fallbacks
- Streak and level displays
- **Firebase Integration**: Dynamic Firestore queries based on timeframe and friend lists

### 6. Badges & Rewards System
- Achievement tracking (8 different badges)
- **Automated badge unlocking** - badges unlock automatically when milestones are reached
- Real-time toast notifications when new badges are unlocked
- Unlocked vs. Locked badge displays
- Progress percentage tracking
- Badge categories: Focus, Consistency, XP Collection, Mastery
- Visual feedback with icons and colors
- **Firebase Integration**: Badge unlock logic integrated into Pomodoro timer and task completion

### 7. User Profile
- Account information management
- XP history tracking
- Statistics display (Total XP, Streak, Level)
- Theme customization (Light/Dark mode)
- Avatar display
- Badge showcase
- Daily streak tracking with visual indicators

### 8. Friend System
- Search for other students by name or email
- Send and receive friend requests
- Accept/reject friend requests
- Manage friend list (add/remove friends)
- Friend-specific leaderboard to compete with friends
- View friends' XP, level, and badges
- Three-tab interface: My Friends, Requests, Find Friends
- **Firebase Integration**: Real-time friend lists and friend request management

### 9. Study Groups
- Create study groups with custom names and descriptions
- Join existing groups to study with others
- Group member management (admin/member roles)
- Group leaderboards showing all members' XP rankings
- Leave groups functionality
- Admin indicators (crown icons for group creators)
- Member count and role badges
- Two-tab interface: My Groups, Discover Groups
- **Firebase Integration**: Real-time group data and XP aggregation

### 10. Activity Feed
- Global feed showing recent study activities from all users
- Real-time updates (auto-refresh every 30 seconds)
- Activity types: Pomodoro sessions completed, tasks finished
- Shows user name, activity description, XP earned, and time
- Visual icons for different activity types
- Latest 30 activities displayed
- **Firebase Integration**: Queries activities collection with real-time listeners

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
  lastStreakUpdate: Timestamp
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

### friends
```typescript
{
  id: string (auto-generated)
  userId: string (Firebase UID)
  friendId: string (Firebase UID)
  createdAt: Timestamp
}
```

### friendRequests
```typescript
{
  id: string (auto-generated)
  fromUserId: string (Firebase UID)
  toUserId: string (Firebase UID)
  status: "pending" | "accepted" | "rejected"
  createdAt: Timestamp
}
```

### studyGroups
```typescript
{
  id: string (auto-generated)
  name: string
  description: string
  createdBy: string (Firebase UID)
  memberCount: number
  createdAt: Timestamp
}
```

### groupMembers
```typescript
{
  id: string (auto-generated)
  groupId: string
  userId: string (Firebase UID)
  role: "admin" | "member"
  joinedAt: Timestamp
}
```

### activities
```typescript
{
  id: string (auto-generated)
  userId: string (Firebase UID)
  type: "session" | "task" | "badge"
  text: string
  xp: number
  createdAt: Timestamp
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
- `/planner` - Task management (protected)
- `/leaderboard` - Global rankings with filters (protected)
- `/friends` - Friend system and friend leaderboard (protected)
- `/groups` - Study groups and group challenges (protected)
- `/activity` - Global activity feed (protected)
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

### Phase 3: Gamification & Social Features (✅ COMPLETED)
✅ Automated badge unlocking system
✅ Streak calculation and daily check-ins on login
✅ Enhanced leaderboard with multiple filter modes (All Time, Weekly, Daily, Friends)
✅ Friend system with requests, acceptance, and friend management
✅ Friend-specific leaderboard
✅ Study groups with creation, joining, and group leaderboards
✅ Global activity feed showing real-time user activities
✅ Toast notifications for badge unlocks
✅ Integration of social features into navigation
✅ Enhanced Firebase helper functions (20+ new functions)

### Phase 4: Testing & Final Polishing (PENDING)
- End-to-end testing of all Firebase features
- Error handling improvements for offline scenarios
- Loading states optimization
- Performance optimization for large datasets
- Final visual polish and animations
- User onboarding flow
- Help documentation and tooltips

## Firebase Helper Functions (client/src/lib/firebase.ts)

### Authentication
- `signUpWithEmail(email, password, name)` - Creates user + Firestore profile
- `signInWithEmail(email, password)` - Authenticates user
- `logOut()` - Signs out user
- `resetPassword(email)` - Sends password reset email

### User Management
- `getUserProfile(userId)` - Fetches user document from Firestore
- `updateUserXP(userId, xpToAdd)` - Adds XP and recalculates level
- `calculateStreak(userId)` - Updates daily streak on login

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
- `getWeeklyLeaderboard(limitCount)` - Gets weekly top performers
- `getDailyLeaderboard(limitCount)` - Gets today's top performers
- `getFriendsLeaderboard(userId, limitCount)` - Gets friend-only leaderboard

### Badges
- `getUserBadges(userId)` - Fetches unlocked badges
- `unlockBadge(userId, badgeId)` - Unlocks new badge
- `checkAndUnlockBadges(userId)` - Automatically checks and unlocks eligible badges

### Friends
- `searchUsers(query)` - Search for users by name or email
- `sendFriendRequest(fromUserId, toUserId)` - Send a friend request
- `getFriendRequests(userId)` - Get pending friend requests
- `acceptFriendRequest(requestId, fromUserId, toUserId)` - Accept request
- `rejectFriendRequest(requestId)` - Reject request
- `getFriends(userId)` - Get user's friend list
- `removeFriend(userId, friendId)` - Remove a friend

### Study Groups
- `createStudyGroup(userId, name, description)` - Create a new study group
- `joinStudyGroup(userId, groupId)` - Join an existing group
- `leaveStudyGroup(userId, groupId)` - Leave a group
- `getUserGroups(userId)` - Get user's groups
- `getAllGroups(limitCount)` - Get all available groups
- `getGroupLeaderboard(groupId)` - Get group member leaderboard

### Activity Feed
- `recordActivity(userId, type, text, xp)` - Record a user activity
- `getGlobalActivityFeed(limitCount)` - Get recent global activities

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
