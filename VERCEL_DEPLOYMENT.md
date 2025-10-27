# Vercel Deployment Guide for DapsiGames

## Issue Diagnosed: Blank White Screen on Vercel

### Root Cause
The blank white screen occurs because the previous `vercel.json` configuration was routing **all requests** (including static assets like HTML, CSS, and JavaScript) to the `/api` endpoint instead of serving the static frontend build.

### Architecture Understanding
DapsiGames uses a **hybrid architecture**:
- **Frontend**: Vite + React (Single Page Application)
- **Backend**: Express + Firebase Admin SDK (API server)

### Deployment Options

#### Option 1: Static Frontend Only (Recommended for Vercel)
Deploy only the frontend to Vercel and use Firebase Client SDK exclusively.

**Configuration**: Already set up in the new `vercel.json`

**Pros**:
- Simple deployment
- Fast CDN delivery
- No backend complexity
- All Firebase operations via client SDK

**Cons**:
- No server-side API endpoints
- XP calculations done client-side (can be moved to Firebase Functions if needed)

**Steps**:
1. Ensure all Firebase environment variables are set in Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

2. Deploy with: `vercel --prod`

3. The app will work fully with Firebase Client SDK

#### Option 2: Split Deployment (Frontend + Backend Separate)
- **Frontend**: Vercel (static site)
- **Backend**: Replit, Railway, Render, or Firebase Functions

**Steps**:
1. Deploy frontend to Vercel (static)
2. Deploy backend to Replit or another platform
3. Update frontend API calls to point to backend URL
4. Configure CORS on backend to allow Vercel domain

#### Option 3: Vercel Serverless Functions (Advanced)
Convert Express routes to Vercel serverless functions.

**Challenges**:
- Firebase Admin SDK in serverless environment
- Cold starts
- Complex refactoring needed

## Current Fix Applied

### Updated `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "outputDirectory": "dist/public",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### What This Does:
1. **Builds**: Runs `npm run build` to create production frontend
2. **Output**: Serves files from `dist/public`
3. **Routing**: All routes go to `index.html` (SPA routing)
4. **Caching**: Optimizes asset delivery with proper cache headers

### Environment Variables Required on Vercel:
Set these in Vercel Project Settings → Environment Variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Testing Locally Before Deploying

1. Build the project:
   ```bash
   npm run build
   ```

2. Serve the production build:
   ```bash
   npx serve dist/public
   ```

3. Open http://localhost:3000 and verify:
   - ✅ Homepage loads
   - ✅ Firebase authentication works
   - ✅ Navigation works
   - ✅ No console errors
   - ✅ All features functional

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all 6 `VITE_FIREBASE_*` variables
   - Mark them for Production, Preview, and Development

4. **Deploy**:
   ```bash
   vercel --prod
   ```

5. **Verify Deployment**:
   - Open the Vercel URL
   - Check browser console for errors
   - Test authentication
   - Test all major features

## Post-Deployment Checklist

- [ ] Homepage displays correctly
- [ ] No blank white screen
- [ ] Firebase authentication works
- [ ] User can sign up/login
- [ ] Navigation between pages works
- [ ] All assets load (images, fonts, icons)
- [ ] No 404 errors in console
- [ ] Browser console has no critical errors
- [ ] Mobile responsive design works

## Troubleshooting

### Still Seeing Blank Screen?
1. Check Vercel build logs for errors
2. Verify all environment variables are set correctly
3. Check browser console for JavaScript errors
4. Ensure Firebase project is configured properly

### Firebase Not Connecting?
1. Verify all `VITE_FIREBASE_*` environment variables
2. Check Firebase Console → Project Settings
3. Ensure Firebase Authentication is enabled
4. Verify Firestore database is created

### 404 Errors on Page Refresh?
- Already fixed with the `rewrites` configuration in `vercel.json`
- All routes now correctly fallback to `index.html`

## Summary

✅ **What Caused the Blank Screen**: Incorrect `vercel.json` routing all requests to `/api`

✅ **The Fix**: Updated `vercel.json` to serve static SPA with proper routing

✅ **Deployment Type**: Static frontend with Firebase Client SDK

✅ **Ready to Deploy**: Yes, after setting environment variables on Vercel

The app will now deploy successfully to Vercel and display correctly!
