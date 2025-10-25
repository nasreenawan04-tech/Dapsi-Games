# DapsiGames Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from gamified productivity apps like Habitica, Forest, and modern dashboards like Linear and Notion, while maintaining a unique student-focused identity. The design emphasizes motivational elements, progress visualization, and playful gamification within a clean, focused interface.

## Color System (User-Specified)
- **Primary**: Bright Blue (#3b82f6) - Focus and energy
- **Secondary**: Teal (#14b8a6) - Calm productivity  
- **Accent**: Purple (#8b5cf6) - Playfulness and gamification
- **Background**: White (#ffffff) with subtle gray sections (#f9fafb)
- **Text**: Dark Slate (#1e293b) for strong readability
- **Dark Mode**: Implement optional dark theme for extended study sessions

## Typography
- **Headings**: Inter (weights: 600-800) - Modern, geometric sans-serif
- **Body**: System UI font stack for optimal performance and legibility
- **Hierarchy**: 
  - H1: 2.5rem (40px) - Hero headlines
  - H2: 2rem (32px) - Section headers
  - H3: 1.5rem (24px) - Card titles
  - Body: 1rem (16px) - Primary content
  - Small: 0.875rem (14px) - Metadata, badges

## Layout System
**Tailwind Spacing**: Use consistent spacing units: 2, 4, 8, 12, 16, 20, 24, 32 for padding, margins, and gaps
- **Container**: max-w-7xl for main content areas
- **Cards**: Consistent padding of p-6 or p-8
- **Sections**: py-12 to py-20 for vertical rhythm
- **Grid Layouts**: 2-3 columns for features, single column for forms

## Component Library

### Navigation
- **Desktop**: Horizontal nav bar with Dashboard, Planner, Leaderboard, Rewards, Profile links
- **Mobile**: Hamburger menu with slide-out sidebar
- **User Widget**: Profile avatar, XP display, level badge in top-right corner

### Cards
- **Base Style**: Rounded corners (rounded-xl), subtle shadow, white/gray background
- **Dashboard Cards**: Modular grid layout showcasing XP, goals, timer, recent activities
- **Feature Cards**: Icon + title + description pattern with hover lift effect
- **Planner Cards**: Task items with checkbox, subject tag, due date, XP reward display

### Gamification Elements
- **Progress Bars**: Animated fill with gradient overlay, showing XP growth
- **XP Meters**: Circular progress indicators for levels
- **Badges**: Icon-based achievements with unlock animations
- **Streak Indicators**: Fire emoji + counter for daily consistency
- **Level Display**: Clear visual hierarchy (Novice → Scholar → Master Learner)

### Pomodoro Timer
- **Circular Timer**: Large, centered circular countdown display
- **Controls**: Start/Pause/Reset buttons with clear iconography
- **Session Types**: Visual differentiation for 25min vs 50min sessions
- **Completion**: Confetti animation + XP reward popup

### Leaderboard
- **Table Layout**: Rank, Avatar, Name, XP columns
- **User Highlight**: Distinct background color for logged-in user's row
- **Top 3**: Crown icons or special badges for podium positions
- **Filters**: Toggle between Global and Friends rankings

### Forms
- **Input Fields**: Rounded, with focus states using primary blue
- **Buttons**: Primary (blue gradient), Secondary (teal), Accent (purple)
- **Validation**: Inline error messages in red, success in green
- **Checkboxes**: Custom styled with smooth check animation

### Modals & Popups
- **Badge Unlocks**: Animated popup with badge icon, title, description
- **XP Rewards**: Toast notifications in bottom-right corner
- **Confirmation Dialogs**: Centered overlay with backdrop blur

## Page-Specific Guidelines

### Home Page (Landing)
- **Hero Section**: Full-width with tagline "Study Smarter, Play Harder", gradient background, CTA buttons (Start Free, Log In)
- **Leaderboard Preview**: Top 3 users showcase with animated XP counters
- **Features Grid**: 3-column layout (Timer, Planner, Rewards) with icons
- **Testimonials**: Student quotes in card format
- **No Hero Image**: Use gradient backgrounds with floating gamification elements (badges, stars, XP icons)

### Dashboard
- **Welcome Banner**: User name + current XP + level badge
- **Grid Layout**: 2-3 column responsive grid
- **Timer Widget**: Prominent placement, always accessible
- **Goals Section**: Daily and weekly progress with completion checkboxes
- **Recent Activity**: Timeline-style list of earned XP and completed tasks
- **Quick Stats**: Cards showing total study time, tasks completed, badges earned

### Authentication Pages
- **Centered Forms**: max-w-md container, minimal distraction
- **Social Proof**: Small motivational quote or stat below form
- **Illustrations**: Optional abstract study-themed SVG graphics

## Visual Treatment

### Gradients
- Use soft gradients for backgrounds and cards (blue → teal, purple → blue)
- Gradient overlays on progress bars for depth

### Shadows
- **Subtle**: shadow-sm for cards at rest
- **Elevated**: shadow-lg for hover states and modals
- **Colored**: Tinted shadows using primary/accent colors at low opacity

### Animations
- **Micro-interactions**: Smooth transitions (200-300ms) on hover, focus
- **Progress**: Animated bar fills and counter increments
- **Rewards**: Celebratory animations (scale, bounce, confetti) for achievements
- **Page Transitions**: Subtle fade-in for route changes

### Icons
- **Library**: Heroicons (outline for navigation, solid for emphasis)
- **Size**: 5-6 for standard icons, 8-12 for feature illustrations
- **Color**: Match to surrounding context or use gradient fills

## Responsive Behavior
- **Breakpoints**: Mobile-first, tablet (md:), desktop (lg:)
- **Navigation**: Hamburger menu on mobile, full nav on desktop
- **Grid Collapse**: 3-col → 2-col → 1-col as viewport narrows
- **Timer**: Scales down but remains prominent on all screen sizes
- **Dashboard**: Stack cards vertically on mobile

## Accessibility
- High contrast text (WCAG AA minimum)
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Keyboard navigation support throughout
- Screen reader announcements for XP gains and level-ups

## Performance Considerations
- Lazy load badge animations and confetti effects
- Use CSS transforms for animations (not position/size)
- Optimize images (WebP format where supported)
- Implement skeleton screens for loading states