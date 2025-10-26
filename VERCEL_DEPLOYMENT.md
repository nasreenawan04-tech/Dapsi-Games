# Vercel Deployment Guide for DapsiGames

## Overview
This guide will help you deploy your fullstack Vite + Express app to Vercel without warnings or errors.

## Step 1: Vercel Dashboard Configuration

Go to your project in Vercel Dashboard → **Settings** → **General**

### Build & Development Settings

Configure these settings in the Vercel dashboard (DO NOT add them to `vercel.json` as that causes the warning):

- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install`
- **Development Command:** (leave blank)

## Step 2: Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**, add all your Firebase and other secrets:

### Firebase Admin SDK (Server-side):
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

### Firebase Client SDK (Frontend):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Other Variables (if applicable):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Step 3: Deploy

1. **Push to GitHub** (if using Git integration):
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push
   ```

2. **Or use Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel
   ```

## How It Works

### Build Process
When you deploy, Vercel will:
1. Run `npm install` to install dependencies
2. Run `npm run build` which:
   - Builds the Vite frontend → `dist/public/`
   - Bundles the Express backend → `dist/index.js`
3. Deploy the `api/index.js` serverless function

### Routing
The `vercel.json` configuration routes:
- `/api/*` requests → Express serverless function
- All other requests → Express serverless function (which serves the React SPA)

### The Express Serverless Function
The `api/index.js` file:
1. Registers all your API routes
2. Serves static files from `dist/public/`
3. Falls back to `index.html` for client-side routing (React Router)

## Troubleshooting

### "404 NOT_FOUND" Error
✅ **Fixed!** The updated `vercel.json` now properly routes all requests.

### "Build and Development Settings will not apply" Warning
✅ **Fixed!** Build settings are now ONLY in the Vercel dashboard, not in `vercel.json`.

### Build Fails
- Check that all environment variables are set in Vercel dashboard
- Make sure the build command runs locally: `npm run build`
- Check Vercel build logs for specific errors

### API Routes Not Working
- Ensure API routes are prefixed with `/api` in your frontend code
- Check that `server/routes.js` is properly exporting routes

### Static Files Not Loading
- Verify the build output directory is set to `dist/public`
- Check that Vite build completed successfully
- Ensure images/assets are in the `public/` folder or imported correctly

## Local Testing with Vercel CLI

Test your Vercel deployment locally:

```bash
npm i -g vercel
vercel dev
```

This runs your app exactly as it will run on Vercel.

## Performance Tips

1. **Enable Caching**: Already configured in your PWA setup
2. **Monitor Bundle Size**: Run `npm run build` and check the output
3. **Use Vercel Analytics**: Enable in Vercel dashboard for performance monitoring

## Important Notes

- ⚠️ Vercel serverless functions have a 10-second timeout on Hobby plan
- ⚠️ WebSockets are not supported (if you add real-time features, use Vercel Edge Functions or external service)
- ✅ The app is stateless - each request gets a fresh function instance
- ✅ Database connections use Firebase (external service) which is perfect for serverless

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Run `vercel dev` locally to reproduce
3. Verify all environment variables are set
4. Ensure the build succeeds locally with `npm run build`
