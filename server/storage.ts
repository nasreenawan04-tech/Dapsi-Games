import { type User, type InsertUser, type Task, type InsertTask, type PomodoroSession, type InsertPomodoroSession, type Badge, type UserBadge } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(userId: string, xpToAdd: number): Promise<{ xp: number; level: string } | null>;
  updateUserStreak(userId: string): Promise<number>;
  
  // Task operations
  createTask(userId: string, task: InsertTask): Promise<Task>;
  getUserTasks(userId: string): Promise<Task[]>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<void>;
  deleteTask(taskId: string): Promise<void>;
  completeTask(taskId: string, userId: string): Promise<number>;
  
  // Pomodoro session operations
  recordPomodoroSession(userId: string, session: InsertPomodoroSession): Promise<void>;
  
  // Leaderboard operations
  getLeaderboard(limit: number): Promise<any[]>;
  
  // Badge operations
  getUserBadges(userId: string): Promise<UserBadge[]>;
  unlockBadge(userId: string, badgeId: string): Promise<boolean>;
  checkAndUnlockBadges(userId: string): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private pomodoroSessions: Map<string, PomodoroSession>;
  private badges: Map<string, Badge>;
  private userBadges: Map<string, UserBadge>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.pomodoroSessions = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    
    // Initialize default badges
    this.initializeBadges();
  }

  private initializeBadges() {
    const defaultBadges: Badge[] = [
      { id: 'first_focus', name: 'First Focus', description: 'Complete your first Pomodoro session', icon: '🎯', requirement: 1, type: 'pomodoro' },
      { id: 'dedicated_learner', name: 'Dedicated Learner', description: 'Maintain a 7-day streak', icon: '🔥', requirement: 7, type: 'streak' },
      { id: 'task_master', name: 'Task Master', description: 'Complete 10 tasks', icon: '✅', requirement: 10, type: 'tasks' },
      { id: 'rising_star', name: 'Rising Star', description: 'Reach 500 XP', icon: '⭐', requirement: 500, type: 'xp' },
      { id: 'focus_champion', name: 'Focus Champion', description: 'Complete 25 Pomodoro sessions', icon: '🏆', requirement: 25, type: 'pomodoro' },
      { id: 'consistency_king', name: 'Consistency King', description: 'Maintain a 30-day streak', icon: '👑', requirement: 30, type: 'streak' },
      { id: 'xp_collector', name: 'XP Collector', description: 'Reach 2000 XP', icon: '💎', requirement: 2000, type: 'xp' },
      { id: 'master_learner', name: 'Master Learner', description: 'Reach Master level', icon: '🎓', requirement: 1, type: 'level' },
    ];
    
    defaultBadges.forEach(badge => this.badges.set(badge.id, badge));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      xp: 0,
      level: "Novice",
      streak: 0,
      avatar: null,
      lastActive: new Date(),
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserXP(userId: string, xpToAdd: number): Promise<{ xp: number; level: string } | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const newXP = user.xp + xpToAdd;
    
    // Determine level based on XP
    let level = "Novice";
    if (newXP >= 2000) level = "Master";
    else if (newXP >= 500) level = "Scholar";

    user.xp = newXP;
    user.level = level;
    this.users.set(userId, user);

    return { xp: newXP, level };
  }

  async updateUserStreak(userId: string): Promise<number> {
    const user = this.users.get(userId);
    if (!user) return 0;

    const now = new Date();
    const lastActive = user.lastActive || new Date(0);
    
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    oneDayAgo.setHours(0, 0, 0, 0);

    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const lastActiveDay = new Date(lastActive);
    lastActiveDay.setHours(0, 0, 0, 0);

    let newStreak = user.streak;

    if (lastActiveDay >= oneDayAgo) {
      newStreak = user.streak + 1;
    } else if (lastActiveDay < twoDaysAgo) {
      newStreak = 1;
    }

    user.streak = newStreak;
    user.lastActive = now;
    this.users.set(userId, user);

    return newStreak;
  }

  async createTask(userId: string, insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      id,
      userId,
      title: insertTask.title,
      subject: insertTask.subject || null,
      dueDate: insertTask.dueDate || null,
      completed: false,
      xpReward: insertTask.xpReward || 10,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      this.tasks.set(taskId, { ...task, ...updates });
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
  }

  async completeTask(taskId: string, userId: string): Promise<number> {
    const task = this.tasks.get(taskId);
    if (!task || task.completed) return 0;

    task.completed = true;
    this.tasks.set(taskId, task);

    const xpReward = task.xpReward || 10;
    await this.updateUserXP(userId, xpReward);
    
    return xpReward;
  }

  async recordPomodoroSession(userId: string, session: InsertPomodoroSession): Promise<void> {
    const id = randomUUID();
    const pomodoroSession: PomodoroSession = {
      id,
      userId,
      duration: session.duration,
      xpEarned: session.xpEarned,
      completedAt: new Date(),
    };
    this.pomodoroSessions.set(id, pomodoroSession);

    await this.updateUserXP(userId, session.xpEarned);
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const users = Array.from(this.users.values())
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit);

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      avatar: user.avatar,
    }));
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values())
      .filter(ub => ub.userId === userId);
  }

  async unlockBadge(userId: string, badgeId: string): Promise<boolean> {
    const existingBadge = Array.from(this.userBadges.values())
      .find(ub => ub.userId === userId && ub.badgeId === badgeId);

    if (existingBadge) return false;

    const id = randomUUID();
    const userBadge: UserBadge = {
      id,
      userId,
      badgeId,
      unlockedAt: new Date(),
    };
    this.userBadges.set(id, userBadge);
    return true;
  }

  async checkAndUnlockBadges(userId: string): Promise<string[]> {
    const user = this.users.get(userId);
    if (!user) return [];

    const userXP = user.xp;
    const userLevel = user.level;
    const userStreak = user.streak;

    const pomodoroCount = Array.from(this.pomodoroSessions.values())
      .filter(s => s.userId === userId).length;

    const tasksCompleted = Array.from(this.tasks.values())
      .filter(t => t.userId === userId && t.completed).length;

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
        const unlocked = await this.unlockBadge(userId, badge.id);
        if (unlocked) {
          unlockedBadges.push(badge.id);
        }
      }
    }

    return unlockedBadges;
  }
}

export const storage = new MemStorage();
