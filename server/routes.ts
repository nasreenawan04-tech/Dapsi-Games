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

  // Get user's unlocked badges
  app.get("/api/badges", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!; // From verified token

      const userBadgesSnapshot = await db.collection('userBadges')
        .where('userId', '==', userId)
        .get();

      const badges = userBadgesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.json(badges);
    } catch (error: any) {
      console.error("Error fetching user badges:", error);
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

  // Update user profile (name and email)
  app.patch("/api/users/profile", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!; // From verified token
      const { name, email } = req.body;

      // Validate input
      const updateSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters").trim().optional(),
        email: z.string().email("Invalid email address").trim().optional(),
      });

      const validatedData = updateSchema.parse({ name, email });

      if (!validatedData.name && !validatedData.email) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const updateData: any = {};
      let authEmailUpdated = false;
      
      if (validatedData.name) {
        updateData.name = validatedData.name;
      }

      if (validatedData.email) {
        // Check if email is already in use by another user
        const emailQuery = await db.collection('users')
          .where('email', '==', validatedData.email)
          .get();
        
        if (!emailQuery.empty && emailQuery.docs[0].id !== userId) {
          return res.status(400).json({ error: "Email is already in use by another account" });
        }

        // Update Firebase Auth email first
        try {
          await adminAuth.updateUser(userId, {
            email: validatedData.email,
          });
          authEmailUpdated = true;
          updateData.email = validatedData.email;
        } catch (error: any) {
          console.error("Error updating Firebase Auth email:", error);
          const errorMessage = error.code === 'auth/email-already-exists' 
            ? "Email is already in use by another account" 
            : "Failed to update email. Please try again later.";
          return res.status(400).json({ error: errorMessage });
        }
      }

      // Update Firestore
      await userRef.update(updateData);

      // Get updated user data
      const updatedUser = await userRef.get();
      const userData = updatedUser.data();

      // Get current auth email to ensure consistency
      const authUser = await adminAuth.getUser(userId);

      return res.json({
        success: true,
        user: {
          id: userId,
          name: userData?.name,
          email: authUser.email,
          xp: userData?.xp,
          level: userData?.level,
          streak: userData?.streak,
        },
      });
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
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

  // Get recent activities (pomodoro sessions and completed tasks)
  app.get("/api/users/activities", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!; // From verified token
      const limitParam = req.query.limit as string;
      const limit = limitParam ? parseInt(limitParam, 10) : 10;

      if (limit < 1 || limit > 50) {
        return res.status(400).json({ error: "Limit must be between 1 and 50" });
      }

      // Fetch pomodoro sessions
      const pomodoroSnapshot = await db.collection('pomodoroSessions')
        .where('userId', '==', userId)
        .orderBy('completedAt', 'desc')
        .limit(limit)
        .get();

      // Fetch completed tasks
      const tasksSnapshot = await db.collection('tasks')
        .where('userId', '==', userId)
        .where('completed', '==', true)
        .orderBy('completedAt', 'desc')
        .limit(limit)
        .get();

      const activities: any[] = [];

      // Add pomodoro sessions
      pomodoroSnapshot.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          type: 'session',
          text: `Completed ${data.duration}-min focus session`,
          xp: data.xpEarned,
          timestamp: data.completedAt.toDate(),
        });
      });

      // Add completed tasks
      tasksSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const completedDate = data.completedAt ? data.completedAt.toDate() : data.createdAt?.toDate();
        if (completedDate) {
          activities.push({
            type: 'task',
            text: `Finished ${data.title}`,
            xp: data.xpReward,
            timestamp: completedDate,
          });
        }
      });

      // Sort by timestamp and limit
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const limitedActivities = activities.slice(0, limit);

      // Format time ago
      const now = new Date();
      const formattedActivities = limitedActivities.map(activity => {
        const diff = now.getTime() - activity.timestamp.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        let timeAgo;
        if (days > 0) {
          timeAgo = days === 1 ? "1 day ago" : `${days} days ago`;
        } else if (hours > 0) {
          timeAgo = hours === 1 ? "1 hour ago" : `${hours} hours ago`;
        } else {
          timeAgo = "Just now";
        }

        return {
          type: activity.type,
          text: activity.text,
          xp: activity.xp,
          time: timeAgo,
        };
      });

      return res.json(formattedActivities);
    } catch (error: any) {
      console.error("Error fetching user activities:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Get detailed user statistics
  app.get("/api/users/detailed-stats", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      const [pomodoroSnapshot, tasksSnapshot, completedTasksSnapshot, badgesSnapshot] = await Promise.all([
        db.collection('pomodoroSessions').where('userId', '==', userId).get(),
        db.collection('tasks').where('userId', '==', userId).get(),
        db.collection('tasks').where('userId', '==', userId).where('completed', '==', true).get(),
        db.collection('userBadges').where('userId', '==', userId).get(),
      ]);

      const totalSessions = pomodoroSnapshot.size;
      const totalTasks = tasksSnapshot.size;
      const completedTasks = completedTasksSnapshot.size;
      const totalBadges = badgesSnapshot.size;
      const pendingTasks = totalTasks - completedTasks;

      let totalFocusMinutes = 0;
      pomodoroSnapshot.docs.forEach(doc => {
        totalFocusMinutes += doc.data().duration || 0;
      });

      return res.json({
        totalSessions,
        totalTasks,
        completedTasks,
        pendingTasks,
        totalBadges,
        totalFocusMinutes,
      });
    } catch (error: any) {
      console.error("Error fetching detailed stats:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Update user avatar
  app.patch("/api/users/avatar", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { avatarUrl } = req.body;

      if (!avatarUrl || typeof avatarUrl !== 'string') {
        return res.status(400).json({ error: "Invalid avatar URL" });
      }

      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        avatar: avatarUrl,
      });

      return res.json({ success: true, avatarUrl });
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Delete user account
  app.delete("/api/users/account", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      await Promise.all([
        db.collection('users').doc(userId).delete(),
        adminAuth.deleteUser(userId),
      ]);

      const collectionsToDelete = ['tasks', 'pomodoroSessions', 'userBadges', 'activities'];
      await Promise.all(
        collectionsToDelete.map(async (collectionName) => {
          const snapshot = await db.collection(collectionName).where('userId', '==', userId).get();
          const batch = db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          return batch.commit();
        })
      );

      return res.json({ success: true, message: "Account deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting account:", error);
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
