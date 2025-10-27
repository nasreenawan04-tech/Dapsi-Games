import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n');

let isInitialized = false;

if (projectId && clientEmail && privateKey) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    isInitialized = true;
  } else {
    isInitialized = true;
  }
} else {
  console.warn('Firebase Admin SDK credentials are not configured. Firebase features will be disabled.');
}

// Export null if not initialized to prevent usage without proper configuration
export const db = isInitialized ? admin.firestore() : null;
export const auth = isInitialized ? admin.auth() : null;
export { admin };
export { isInitialized };
