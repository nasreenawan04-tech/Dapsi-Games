// Backend API helper functions for core operations
// These wrap direct Firestore calls with backend API endpoints

import { recordPomodoroSession as directRecordPomodoroSession, completeTask as directCompleteTask, getLeaderboard as directGetLeaderboard, updateUserXP, checkAndUnlockBadges, updateStreak, auth } from './firebase';

// Helper to get Firebase ID token
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Helper to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Record a Pomodoro session through backend API
export async function recordPomodoroSessionViaAPI(userId: string, duration: number, xpEarned: number) {
  try {
    const result = await apiCall('/api/pomodoro/complete', {
      method: 'POST',
      body: JSON.stringify({ duration }), // userId comes from verified token
    });
    return result;
  } catch (error) {
    console.error('Backend API failed, falling back to direct Firebase call:', error);
    // Fallback to direct Firebase call
    await directRecordPomodoroSession(userId, duration, xpEarned);
    return { success: true, unlockedBadges: [] };
  }
}

// Complete a task through backend API
export async function completeTaskViaAPI(taskId: string, userId: string) {
  try {
    const result = await apiCall(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({}), // userId comes from verified token
    });
    return result;
  } catch (error) {
    console.error('Backend API failed, falling back to direct Firebase call:', error);
    // Fallback to direct Firebase call
    const xpReward = await directCompleteTask(taskId, userId);
    return { success: true, xpReward, unlockedBadges: [] };
  }
}

// Get leaderboard through backend API
export async function getLeaderboardViaAPI(limit: number = 20) {
  try {
    const result = await apiCall(`/api/leaderboard?limit=${limit}`);
    return result;
  } catch (error) {
    console.error('Backend API failed, falling back to direct Firebase call:', error);
    // Fallback to direct Firebase call
    return await directGetLeaderboard(limit);
  }
}

// Check and unlock badges through backend API
export async function checkBadgesViaAPI(userId: string) {
  try {
    const result = await apiCall('/api/badges/check', {
      method: 'POST',
      body: JSON.stringify({}), // userId comes from verified token
    });
    return result.unlockedBadges || [];
  } catch (error) {
    console.error('Backend API failed, falling back to direct Firebase call:', error);
    // Fallback to direct Firebase call
    return await checkAndUnlockBadges(userId);
  }
}

// Update user streak through backend API
export async function updateStreakViaAPI(userId: string) {
  try {
    const result = await apiCall('/api/users/streak', {
      method: 'POST',
      body: JSON.stringify({}), // userId comes from verified token
    });
    return result.streak;
  } catch (error) {
    console.error('Backend API failed, falling back to direct Firebase call:', error);
    // Fallback to direct Firebase call
    return await updateStreak(userId);
  }
}

// Get user stats through backend API
export async function getUserStatsViaAPI(userId: string) {
  try {
    const result = await apiCall('/api/users/stats'); // userId comes from verified token
    return result;
  } catch (error) {
    console.error('Backend API failed:', error);
    return null;
  }
}
