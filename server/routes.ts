import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, auth as adminAuth } from "./firebase-admin";
import { insertPomodoroSessionSchema, insertTaskSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

// Initialize Stripe if configured
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
  : null;

// Extend Express Request type to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

// Middleware to verify Firebase auth token
const verifyFirebaseToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token with Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    
    next();
  } catch (error: any) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Record Pomodoro session and award XP
  // XP is calculated server-side based on duration
  app.post("/api/pomodoro/complete", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!; // From verified token
      const { duration } = req.body;

      if (!duration || typeof duration !== 'number') {
        return res.status(400).json({ error: "Invalid duration" });
      }

      // Server-side XP calculation based on duration
      let xpEarned = 0;
      if (duration === 25) {
        xpEarned = 50;
      } else if (duration === 50) {
        xpEarned = 100;
      } else {
        return res.status(400).json({ error: "Invalid duration (must be 25 or 50)" });
      }

      // Validate input
      const validatedSession = insertPomodoroSessionSchema.parse({ duration, xpEarned });

      // Record session in Firestore
      await db.collection('pomodoroSessions').add({
        userId,
        duration: validatedSession.duration,
        xpEarned: validatedSession.xpEarned,
        completedAt: new Date(),
      });

      // Update user XP
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const currentXP = userDoc.data()?.xp || 0;
        const oldLevel = userDoc.data()?.level || "Novice";
        const newXP = currentXP + xpEarned;

        // Determine level based on XP
        let level = "Novice";
        if (newXP >= 2000) level = "Master";
        else if (newXP >= 500) level = "Scholar";

        const leveledUp = level !== oldLevel;

        await userRef.update({
          xp: newXP,
          level: level,
        });

        // Check and unlock badges
        const unlockedBadges = await checkAndUnlockBadges(userId);

        return res.json({ 
          success: true, 
          xp: newXP, 
          level,
          leveledUp,
          xpEarned,
          unlockedBadges 
        });
      }

      return res.status(404).json({ error: "User not found" });
    } catch (error: any) {
      console.error("Error recording pomodoro session:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Complete task and award XP
  // XP reward is read from the task document (server-side data)
  app.post("/api/tasks/:taskId/complete", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!; // From verified token
      const { taskId } = req.params;

      const taskRef = db.collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        return res.status(404).json({ error: "Task not found" });
      }

      const taskData = taskDoc.data();

      // Verify task belongs to the authenticated user
      if (taskData?.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: Task does not belong to user" });
      }

      if (taskData?.completed) {
        return res.status(400).json({ error: "Task already completed" });
      }

      // Mark task as completed
      await taskRef.update({
        completed: true,
        completedAt: new Date(),
      });

      // XP reward comes from the task document (server-side data)
      const xpReward = taskData?.xpReward || 10;

      // Update user XP
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const currentXP = userDoc.data()?.xp || 0;
        const oldLevel = userDoc.data()?.level || "Novice";
        const newXP = currentXP + xpReward;

        let level = "Novice";
        if (newXP >= 2000) level = "Master";
        else if (newXP >= 500) level = "Scholar";

        const leveledUp = level !== oldLevel;

        await userRef.update({
          xp: newXP,
          level: level,
        });

        // Check and unlock badges
        const unlockedBadges = await checkAndUnlockBadges(userId);

        return res.json({ 
          success: true, 
          xpReward, 
          xp: newXP, 
          level,
          leveledUp,
          unlockedBadges 
        });
      }

      return res.status(404).json({ error: "User not found" });
    } catch (error: any) {
      console.error("Error completing task:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Get leaderboard with filtering
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limitParam = req.query.limit as string;
      const limit = limitParam ? parseInt(limitParam, 10) : 20;

      // Validate limit
      if (limit < 1 || limit > 100) {
        return res.status(400).json({ error: "Limit must be between 1 and 100" });
      }

      const usersSnapshot = await db.collection('users')
        .orderBy('xp', 'desc')
        .limit(limit)
        .get();

      const leaderboard = usersSnapshot.docs.map((doc, index) => ({
        rank: index + 1,
        id: doc.id,
        name: doc.data().name,
        xp: doc.data().xp,
        level: doc.data().level,
        streak: doc.data().streak,
        avatar: doc.data().avatar,
      }));

      return res.json(leaderboard);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Check and unlock badges for a user
  app.post("/api/badges/check", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!; // From verified token

      const unlockedBadges = await checkAndUnlockBadges(userId);

      return res.json({ unlockedBadges });
    } catch (error: any) {
      console.error("Error checking badges:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Update user streak
  app.post("/api/users/streak", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!; // From verified token

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      const lastActive = userData?.lastActive?.toDate() || new Date(0);
      const now = new Date();

      // Get today's date at midnight
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      // Get yesterday's date at midnight
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      // Get day before yesterday at midnight
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      // Get last active date at midnight
      const lastActiveDay = new Date(lastActive);
      lastActiveDay.setHours(0, 0, 0, 0);

      const currentStreak = userData?.streak || 0;
      let newStreak = currentStreak;
      let shouldUpdate = false;

      // Check if user already checked in today
      if (lastActiveDay.getTime() === today.getTime()) {
        // Already checked in today, don't increment
        return res.json({ streak: currentStreak, message: "Already checked in today" });
      } else if (lastActiveDay.getTime() === yesterday.getTime()) {
        // Last activity was yesterday, increment streak
        newStreak = currentStreak + 1;
        shouldUpdate = true;
      } else if (lastActiveDay.getTime() < yesterday.getTime()) {
        // Missed a day, reset streak to 1
        newStreak = 1;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await userRef.update({
          streak: newStreak,
          lastActive: now,
        });
      }

      return res.json({ streak: newStreak });
    } catch (error: any) {
      console.error("Error updating streak:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Get user stats
  app.get("/api/users/stats", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!; // From verified token

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();

      return res.json({
        xp: userData?.xp || 0,
        level: userData?.level || "Novice",
        streak: userData?.streak || 0,
      });
    } catch (error: any) {
      console.error("Error fetching user stats:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Create Stripe subscription for premium membership
  app.post("/api/create-subscription", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Premium subscriptions are currently unavailable. Stripe is not configured.",
          configured: false 
        });
      }

      const userId = req.userId!;
      const userEmail = req.userEmail;

      if (!userEmail) {
        return res.status(400).json({ error: "User email not found" });
      }

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();

      // Check if user already has a subscription
      if (userData?.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);
        
        if (subscription.status === 'active') {
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          });
        }
      }

      // Create or retrieve Stripe customer
      let customerId = userData?.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId,
          },
        });
        customerId = customer.id;
        
        await userRef.update({
          stripeCustomerId: customerId,
        });
      }

      // Create or get price for premium subscription
      const prices = await stripe.prices.list({
        lookup_keys: ['dapsigames_premium_monthly'],
        limit: 1,
      });

      let priceId: string;

      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        // Create product and price if they don't exist
        const product = await stripe.products.create({
          name: 'DapsiGames Premium',
          description: 'Ad-free, custom themes, analytics, and cloud sync',
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 500, // $5.00 in cents
          currency: 'usd',
          recurring: { interval: 'month' },
          lookup_key: 'dapsigames_premium_monthly',
        });

        priceId = price.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      await userRef.update({
        stripeSubscriptionId: subscription.id,
      });

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to check and unlock badges
async function checkAndUnlockBadges(userId: string): Promise<string[]> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return [];

  const userData = userDoc.data();
  const userXP = userData?.xp || 0;
  const userLevel = userData?.level || "Novice";
  const userStreak = userData?.streak || 0;

  // Count pomodoro sessions
  const pomodoroSnapshot = await db.collection('pomodoroSessions')
    .where('userId', '==', userId)
    .get();
  const pomodoroCount = pomodoroSnapshot.size;

  // Count completed tasks
  const tasksSnapshot = await db.collection('tasks')
    .where('userId', '==', userId)
    .where('completed', '==', true)
    .get();
  const tasksCompleted = tasksSnapshot.size;

  const badgeConditions = [
    { id: 'first_focus', condition: pomodoroCount >= 1 },
    { id: 'dedicated_learner', condition: userStreak >= 7 },
    { id: 'task_master', condition: tasksCompleted >= 10 },
    { id: 'rising_star', condition: userXP >= 500 },
    { id: 'focus_champion', condition: pomodoroCount >= 25 },
    { id: 'consistency_king', condition: userStreak >= 30 },
    { id: 'xp_collector', condition: userXP >= 2000 },
    { id: 'master_learner', condition: userLevel === 'Master' },
  ];

  const unlockedBadges: string[] = [];

  for (const badge of badgeConditions) {
    if (badge.condition) {
      // Check if badge already unlocked
      const existingBadge = await db.collection('userBadges')
        .where('userId', '==', userId)
        .where('badgeId', '==', badge.id)
        .get();

      if (existingBadge.empty) {
        await db.collection('userBadges').add({
          userId,
          badgeId: badge.id,
          unlockedAt: new Date(),
        });
        unlockedBadges.push(badge.id);
      }
    }
  }

  return unlockedBadges;
}
