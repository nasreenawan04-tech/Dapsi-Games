# DapsiGames Deployment Guide

## Overview
DapsiGames is a full-stack gamified study productivity platform built with React, Express, Firebase, and deployed on Replit.

## Prerequisites

### Required Environment Variables
Ensure all Firebase configuration secrets are set in Replit Secrets:

**Firebase Admin SDK (Server-side):**
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

**Firebase Client SDK (Frontend):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Firebase Setup

### 1. Firestore Security Rules
Deploy the security rules to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

The rules are defined in `firestore.rules` and ensure:
- Users can only access their own data
- XP/level updates are server-controlled
- Email verification is required for critical actions
- Proper ownership validation for all operations

### 2. Firestore Indexes
Deploy the composite indexes:

```bash
firebase deploy --only firestore:indexes
```

Indexes are defined in `firestore.indexes.json` for optimized queries.

## Deployment on Replit

### Development Mode
The app runs automatically in development mode:
- Server: Express (port 5000)
- Frontend: Vite dev server (proxied through Express)
- Hot reload enabled

### Production Deployment

1. **Automatic Build Process:**
   - The deployment automatically runs `npm run build` which:
     - Builds the frontend with Vite
     - Bundles the server code with esbuild
     - Outputs to `dist/` directory

2. **Deploy to Replit:**
   - Click the "Deploy" button in Replit
   - Select "Autoscale" deployment target
   - The app will be deployed with the configuration in `.replitdeployrc`
   - Build and start commands are executed automatically

### Deployment Configuration
The `.replitdeployrc` file configures:
- Build command: `npm run build` (Vite + esbuild)
- Run command: `npm start` (production server)
- Deployment target: Autoscale (serverless)
- Port mapping: 5000 → 80

**Important:** Never use `npm run dev` in production - it runs the development server which is slower and includes dev tools.

## Performance Optimizations

### Code Splitting
The Vite build automatically splits code into optimized chunks:
- **vendor**: React core libraries
- **firebase**: Firebase SDK modules
- **ui**: UI component libraries
- **forms**: Form handling libraries

### Caching Strategy (PWA)
- **Static Assets**: Cache-first strategy
- **API Calls**: Network-first with 5-minute cache
- **Firebase Storage**: Stale-while-revalidate
- **Google Fonts**: Cache-first (365 days)

### Bundle Optimization
- Minification with Terser
- Tree shaking enabled
- Console logs removed in production
- Source maps disabled in production

## Security Checklist

- [ ] Firebase security rules deployed and tested
- [ ] All environment variables configured
- [ ] HTTPS enabled (automatic on Replit)
- [ ] XSS protection via input sanitization
- [ ] CORS configured properly
- [ ] Client-side rate limiting implemented
- [ ] Email verification required for sensitive actions
- [ ] **Critical:** XP/level/streak modifications blocked on client (server-only via Admin SDK)
- [ ] Ownership validation enforced on all user data

## Monitoring & Analytics

### Error Tracking
- Client-side errors logged via error boundary
- Server errors logged to console
- Consider integrating Sentry for production monitoring

### Performance Monitoring
- Use Lighthouse for regular audits
- Monitor bundle size with `npm run build --report`
- Track Core Web Vitals

## Post-Deployment Testing

1. **Authentication Flow:**
   - Sign up new user
   - Email verification
   - Login/logout
   - Password reset

2. **Core Features:**
   - Pomodoro timer completion
   - XP earning and level progression
   - Task creation and completion
   - Streak tracking
   - Leaderboard updates

3. **Security Tests:**
   - Verify user data isolation
   - Test unauthorized access attempts
   - Validate input sanitization

4. **Performance Tests:**
   - Check page load times (<3s)
   - Test PWA offline functionality
   - Verify mobile responsiveness

## Troubleshooting

### Common Issues

**Firebase Connection Failed:**
- Verify all environment variables are set correctly
- Check Firebase project quotas
- Ensure Firestore is enabled in Firebase Console

**Build Errors:**
- Clear `node_modules` and reinstall: `npm install`
- Check for TypeScript errors: `npm run typecheck`
- Verify all imports are correct

**Deployment Issues:**
- Check workflow logs in Replit
- Verify port 5000 is available
- Ensure all dependencies are installed

## Maintenance

### Regular Tasks
- Monitor Firebase usage and costs
- Review security rules quarterly
- Update dependencies monthly
- Check for security vulnerabilities: `npm audit`

### Backup Strategy
- Firestore data: Use Firebase automatic backups
- Code: Maintain Git repository with regular commits
- Environment variables: Document in secure location

## Scaling Considerations

When traffic grows:
1. **Firebase:**
   - Upgrade to Blaze plan for unlimited usage
   - Implement Cloud Functions for complex operations
   - Use Firestore query optimization

2. **Hosting:**
   - Consider CDN for static assets
   - Implement Redis caching for API responses
   - Use Firebase Hosting with Replit API

3. **Performance:**
   - Enable compression (gzip/brotli)
   - Implement pagination for leaderboards
   - Add database indexes as needed

## Support & Documentation

- **Firebase Console:** https://console.firebase.google.com
- **Replit Docs:** https://docs.replit.com
- **Issue Tracking:** Document bugs and features in project tracker

---

**Last Updated:** ${new Date().toLocaleDateString()}
**Version:** 1.0.0
