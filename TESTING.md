# DapsiGames Testing Guide

## Testing Overview
This document outlines how to test and validate the DapsiGames application.

## Automated Tests

### Running Game Logic Tests
The app includes automated tests for XP calculations, level progression, streak logic, and badge unlocks.

To run the tests in the browser console:
```javascript
import { runGameLogicTests } from '@/lib/test-utils';
const results = runGameLogicTests();
console.log('Test Results:', results);
```

### Test Coverage

#### XP Calculation Tests
- ✅ Level calculation (Novice → Scholar → Master)
- ✅ Pomodoro XP rewards (25 min = 50 XP, 50 min = 100 XP)
- ✅ XP validation and consistency
- ✅ Level up detection

#### Streak Logic Tests
- ✅ Streak increments when active yesterday
- ✅ Streak resets after missing days
- ✅ Streak maintains when already checked in today

#### Badge Unlock Tests
- ✅ First Focus (1 Pomodoro)
- ✅ Dedicated Learner (7-day streak)
- ✅ Task Master (10 tasks)
- ✅ Rising Star (500 XP)
- ✅ Focus Champion (25 Pomodoros)
- ✅ Consistency King (30-day streak)
- ✅ XP Collector (2000 XP)
- ✅ Master Learner (Master level)

## Manual Testing Checklist

### Authentication Flow
- [ ] Sign up with new email
- [ ] Receive verification email
- [ ] Verify email through link
- [ ] Login with verified account
- [ ] Logout successfully
- [ ] Reset password flow
- [ ] Session persistence across page refreshes

### Dashboard Features
- [ ] Welcome banner displays correct user info
- [ ] XP and level display accurately
- [ ] Streak counter updates daily
- [ ] Pomodoro timer widget loads
- [ ] Weekly progress graph shows data
- [ ] Recent activities populate

### Pomodoro Timer
- [ ] Start 25-minute session
- [ ] Pause and resume timer
- [ ] Reset timer
- [ ] Complete session and earn XP
- [ ] Start 50-minute session
- [ ] Complete and verify 100 XP reward
- [ ] Level up animation triggers when threshold reached

### Study Planner
- [ ] Create new task
- [ ] Set subject and due date
- [ ] Complete task and earn XP
- [ ] Delete task
- [ ] Edit task details
- [ ] Filter tasks by subject
- [ ] Tasks persist after page refresh

### Leaderboard
- [ ] Global leaderboard loads top users
- [ ] User's rank is highlighted
- [ ] Leaderboard updates after XP changes
- [ ] Filter by daily/weekly/all-time
- [ ] Friends leaderboard (if friends added)

### Profile & Rewards
- [ ] View profile information
- [ ] See earned badges
- [ ] XP history displays
- [ ] Theme customization works
- [ ] Avatar customization
- [ ] Purchase items from store

### Store & Gamification
- [ ] Browse store items by category
- [ ] Purchase item with XP
- [ ] Insufficient XP prevents purchase
- [ ] Apply purchased theme
- [ ] Apply avatar border
- [ ] Badge unlock modal appears
- [ ] Confetti animation on unlock

### Responsive Design
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Navigation menu adapts
- [ ] All features accessible on mobile

### Security Testing
- [ ] Cannot access other users' data
- [ ] Protected routes require login
- [ ] Email verification enforced
- [ ] XSS protection (try entering `<script>alert('xss')</script>` in inputs)
- [ ] Cannot modify XP directly from client
- [ ] Rate limiting prevents spam

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Images load efficiently
- [ ] No layout shifts (CLS)
- [ ] Smooth animations (60fps)
- [ ] Bundle size reasonable
- [ ] PWA installable

### Error Handling
- [ ] Network errors show friendly messages
- [ ] Form validation errors display
- [ ] 404 page shows for invalid routes
- [ ] Error boundary catches React errors
- [ ] Toast notifications appear for actions
- [ ] Loading states show during async operations

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### PWA Features
- [ ] App installable on mobile
- [ ] Works offline (cached data)
- [ ] Push notifications (if implemented)
- [ ] Offline Pomodoro sessions work
- [ ] Service worker updates properly

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.8s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

### Bundle Size Targets
- **Initial JS Bundle:** < 300 KB (gzipped)
- **Initial CSS:** < 50 KB (gzipped)
- **Total Page Weight:** < 1 MB

## Test Data

### Sample User Journeys

#### New User - First Day
1. Sign up → Verify email
2. Complete onboarding tour
3. Start first Pomodoro (25 min)
4. Earn 50 XP + "First Focus" badge
5. Create first task
6. Complete task (earn 10 XP)
7. Check leaderboard position

#### Returning User - Daily Routine
1. Login → Streak increments
2. Check dashboard stats
3. Complete 2 Pomodoro sessions
4. Complete 3 tasks
5. Earn 220 XP total
6. Level up from Novice to Scholar (if at 500 XP)
7. Browse store and purchase theme

#### Power User - Achievement Hunter
1. Complete 25 Pomodoros → "Focus Champion"
2. Maintain 30-day streak → "Consistency King"
3. Reach 2000 XP → "Master" level + "XP Collector"
4. Complete 50+ tasks
5. Climb to top 10 on leaderboard
6. Unlock all badges

## Bug Reporting Template

```markdown
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Third step]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Device: [e.g., Desktop]
- Screen Size: [e.g., 1920x1080]

**Additional Context:**
[Any other relevant information]
```

## Acceptance Criteria

All features must meet these criteria before launch:
- ✅ All authentication flows work end-to-end
- ✅ XP calculations are accurate
- ✅ Streak logic functions correctly
- ✅ All badges unlock properly
- ✅ No console errors in production
- ✅ Mobile responsive on all screen sizes
- ✅ Security rules prevent unauthorized access
- ✅ Performance metrics meet targets
- ✅ PWA features work offline
- ✅ Error handling provides clear feedback

---

**Testing Completed:** ${new Date().toLocaleDateString()}
**Tester:** [Name]
**Status:** [Pass/Fail]
