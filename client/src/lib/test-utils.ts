/**
 * Testing utilities for XP calculations and game logic
 */

// Level thresholds match the production values
export const LEVEL_THRESHOLDS = {
  Novice: 0,
  Scholar: 500,
  Master: 2000,
} as const;

/**
 * Calculate level from XP
 */
export function calculateLevelFromXP(xp: number): string {
  if (xp >= LEVEL_THRESHOLDS.Master) {
    return "Master";
  } else if (xp >= LEVEL_THRESHOLDS.Scholar) {
    return "Scholar";
  }
  return "Novice";
}

/**
 * Calculate XP for Pomodoro session
 */
export function calculatePomodoroXP(duration: 25 | 50): number {
  if (duration === 25) {
    return 50;
  } else if (duration === 50) {
    return 100;
  }
  return 0;
}

/**
 * Test if level up should occur
 */
export function shouldLevelUp(oldXP: number, newXP: number): boolean {
  const oldLevel = calculateLevelFromXP(oldXP);
  const newLevel = calculateLevelFromXP(newXP);
  return oldLevel !== newLevel;
}

/**
 * Calculate streak based on last active date
 */
export function calculateStreak(lastActiveDate: Date, currentStreak: number): number {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const lastActiveDay = new Date(lastActiveDate);
  lastActiveDay.setHours(0, 0, 0, 0);
  
  // Already checked in today
  if (lastActiveDay.getTime() === today.getTime()) {
    return currentStreak;
  }
  // Checked in yesterday - increment streak
  else if (lastActiveDay.getTime() === yesterday.getTime()) {
    return currentStreak + 1;
  }
  // Missed a day - reset to 1
  else {
    return 1;
  }
}

/**
 * Validate XP calculation consistency
 * Returns true if calculation is correct
 */
export function validateXPCalculation(
  oldXP: number,
  earnedXP: number,
  newXP: number
): boolean {
  return oldXP + earnedXP === newXP;
}

/**
 * Test badge unlock conditions
 */
export interface BadgeCondition {
  id: string;
  name: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  xp: number;
  level: string;
  pomodoroCount: number;
  tasksCompleted: number;
  streak: number;
}

export const BADGE_CONDITIONS: BadgeCondition[] = [
  {
    id: "first_focus",
    name: "First Focus",
    condition: (stats) => stats.pomodoroCount >= 1,
  },
  {
    id: "dedicated_learner",
    name: "Dedicated Learner",
    condition: (stats) => stats.streak >= 7,
  },
  {
    id: "task_master",
    name: "Task Master",
    condition: (stats) => stats.tasksCompleted >= 10,
  },
  {
    id: "rising_star",
    name: "Rising Star",
    condition: (stats) => stats.xp >= 500,
  },
  {
    id: "focus_champion",
    name: "Focus Champion",
    condition: (stats) => stats.pomodoroCount >= 25,
  },
  {
    id: "consistency_king",
    name: "Consistency King",
    condition: (stats) => stats.streak >= 30,
  },
  {
    id: "xp_collector",
    name: "XP Collector",
    condition: (stats) => stats.xp >= 2000,
  },
  {
    id: "master_learner",
    name: "Master Learner",
    condition: (stats) => stats.level === "Master",
  },
];

/**
 * Get badges that should be unlocked for given stats
 */
export function getBadgesToUnlock(stats: UserStats): string[] {
  return BADGE_CONDITIONS
    .filter((badge) => badge.condition(stats))
    .map((badge) => badge.id);
}

/**
 * Run comprehensive XP and streak tests
 */
export function runGameLogicTests(): {
  passed: boolean;
  results: Array<{ test: string; passed: boolean; message?: string }>;
} {
  const results: Array<{ test: string; passed: boolean; message?: string }> = [];

  // Test 1: Level calculation
  results.push({
    test: "Level calculation for Novice",
    passed: calculateLevelFromXP(0) === "Novice" && calculateLevelFromXP(499) === "Novice",
  });

  results.push({
    test: "Level calculation for Scholar",
    passed: calculateLevelFromXP(500) === "Scholar" && calculateLevelFromXP(1999) === "Scholar",
  });

  results.push({
    test: "Level calculation for Master",
    passed: calculateLevelFromXP(2000) === "Master" && calculateLevelFromXP(5000) === "Master",
  });

  // Test 2: Pomodoro XP calculation
  results.push({
    test: "25-minute Pomodoro awards 50 XP",
    passed: calculatePomodoroXP(25) === 50,
  });

  results.push({
    test: "50-minute Pomodoro awards 100 XP",
    passed: calculatePomodoroXP(50) === 100,
  });

  // Test 3: XP validation
  results.push({
    test: "XP calculation is consistent",
    passed: validateXPCalculation(100, 50, 150) && !validateXPCalculation(100, 50, 140),
  });

  // Test 4: Level up detection
  results.push({
    test: "Level up detection works",
    passed: shouldLevelUp(490, 510) && !shouldLevelUp(400, 450),
  });

  // Test 5: Streak calculation
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  results.push({
    test: "Streak increments when active yesterday",
    passed: calculateStreak(yesterday, 5) === 6,
  });

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  results.push({
    test: "Streak resets when missed days",
    passed: calculateStreak(threeDaysAgo, 10) === 1,
  });

  // Test 6: Badge unlocks
  const testStats: UserStats = {
    xp: 600,
    level: "Scholar",
    pomodoroCount: 30,
    tasksCompleted: 15,
    streak: 10,
  };
  const unlockedBadges = getBadgesToUnlock(testStats);
  results.push({
    test: "Badge unlock logic works",
    passed: unlockedBadges.includes("first_focus") &&
            unlockedBadges.includes("dedicated_learner") &&
            unlockedBadges.includes("task_master") &&
            unlockedBadges.includes("rising_star") &&
            unlockedBadges.includes("focus_champion"),
    message: `Unlocked: ${unlockedBadges.join(", ")}`,
  });

  const allPassed = results.every((r) => r.passed);

  return {
    passed: allPassed,
    results,
  };
}
