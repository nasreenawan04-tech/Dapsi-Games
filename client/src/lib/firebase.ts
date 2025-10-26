import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification, User } from "firebase/auth";
import { initializeFirestore, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs, addDoc, deleteDoc, where, Timestamp, persistentLocalCache, persistentMultipleTabManager, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing. Please check your environment variables.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with offline persistence (modern API)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});


// Auth functions
export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Send email verification
  await sendEmailVerification(user);

  // Create user document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email: user.email,
    name: name,
    xp: 0,
    level: "Novice",
    streak: 0,
    lastActive: Timestamp.now(),
    createdAt: Timestamp.now(),
  });

  return user;
};

export const resendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  } else if (!user) {
    throw new Error("No user is currently signed in");
  } else {
    throw new Error("Email is already verified");
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Update last active
  await updateDoc(doc(db, "users", userCredential.user.uid), {
    lastActive: Timestamp.now(),
  });

  return userCredential.user;
};

export const logOut = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// User functions
export const getUserProfile = async (userId: string) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

export const updateUserXP = async (userId: string, xpToAdd: number) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const currentXP = userDoc.data().xp || 0;
    const oldLevel = userDoc.data().level || "Novice";
    const newXP = currentXP + xpToAdd;

    // Determine level based on XP
    let level = "Novice";
    if (newXP >= 2000) level = "Master";
    else if (newXP >= 500) level = "Scholar";

    const leveledUp = level !== oldLevel;

    await updateDoc(userRef, {
      xp: newXP,
      level: level,
    });

    return { xp: newXP, level, leveledUp, oldLevel };
  }

  return null;
};

// Task functions
export const createTask = async (userId: string, task: any) => {
  const taskData = {
    userId,
    title: task.title,
    subject: task.subject || "",
    dueDate: task.dueDate ? Timestamp.fromDate(new Date(task.dueDate)) : null,
    completed: false,
    xpReward: task.xpReward || 10,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, "tasks"), taskData);
  return { id: docRef.id, ...taskData };
};

export const getUserTasks = async (userId: string) => {
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  tasks.sort((a: any, b: any) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  
  return tasks;
};

export const updateTask = async (taskId: string, updates: any) => {
  await updateDoc(doc(db, "tasks", taskId), updates);
};

export const deleteTask = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const completeTask = async (taskId: string, userId: string) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists() && !taskDoc.data().completed) {
      await updateDoc(taskRef, { 
        completed: true,
        completedAt: Timestamp.now()
      });
      const xpReward = taskDoc.data().xpReward || 10;
      await updateUserXP(userId, xpReward);
      return xpReward;
    }

    return 0;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
};

// Pomodoro session functions
export const recordPomodoroSession = async (userId: string, duration: number, xpEarned: number) => {
  try {
    await addDoc(collection(db, "pomodoroSessions"), {
      userId,
      duration,
      xpEarned,
      completedAt: Timestamp.now(),
    });

    await updateUserXP(userId, xpEarned);
  } catch (error) {
    console.error("Error recording pomodoro session:", error);
    throw error;
  }
};

// Leaderboard functions
export const getLeaderboard = async (limitCount: number = 10) => {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("xp", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

// Badge functions
export const getUserBadges = async (userId: string) => {
  try {
    const q = query(
      collection(db, "userBadges"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }
};

export const unlockBadge = async (userId: string, badgeId: string) => {
  const existingBadge = await getDocs(
    query(
      collection(db, "userBadges"),
      where("userId", "==", userId),
      where("badgeId", "==", badgeId)
    )
  );

  if (existingBadge.empty) {
    await addDoc(collection(db, "userBadges"), {
      userId,
      badgeId,
      unlockedAt: Timestamp.now(),
    });
    return true;
  }

  return false;
};

export const getWeeklyStats = async (userId: string) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const pomodoroQuery = query(
    collection(db, "pomodoroSessions"),
    where("userId", "==", userId),
    where("completedAt", ">=", Timestamp.fromDate(sevenDaysAgo))
  );

  const tasksSnapshot = await getDocs(
    query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("completed", "==", true)
    )
  );

  const pomodoroSnapshot = await getDocs(pomodoroQuery);
  
  const pomodoroData = pomodoroSnapshot.docs.map(doc => doc.data());
  pomodoroData.sort((a: any, b: any) => {
    const aTime = a.completedAt?.toMillis?.() || 0;
    const bTime = b.completedAt?.toMillis?.() || 0;
    return aTime - bTime;
  });

  const dailyStats = new Map();

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyStats.set(dateStr, {
      date: dateStr,
      studyTime: 0,
      xpEarned: 0,
      tasksCompleted: 0,
    });
  }

  pomodoroData.forEach(data => {
    const date = data.completedAt.toDate();
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const stats = dailyStats.get(dateStr);
    if (stats) {
      stats.studyTime += data.duration;
      stats.xpEarned += data.xpEarned;
    }
  });

  tasksSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const completedDate = data.completedAt 
      ? data.completedAt.toDate() 
      : data.createdAt?.toDate();

    if (completedDate && completedDate >= sevenDaysAgo) {
      const dateStr = completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const stats = dailyStats.get(dateStr);
      if (stats) {
        stats.tasksCompleted += 1;
        stats.xpEarned += data.xpReward || 0;
      }
    }
  });

  return Array.from(dailyStats.values());
};

export const getTodayStats = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pomodoroQuery = query(
    collection(db, "pomodoroSessions"),
    where("userId", "==", userId),
    where("completedAt", ">=", Timestamp.fromDate(today))
  );

  const tasksSnapshot = await getDocs(
    query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("completed", "==", true)
    )
  );

  const pomodoroSnapshot = await getDocs(pomodoroQuery);

  const pomodoroSessions = pomodoroSnapshot.docs.length;
  const totalStudyTime = pomodoroSnapshot.docs.reduce((sum, doc) => {
    return sum + (doc.data().duration || 0);
  }, 0);

  const tasksCompleted = tasksSnapshot.docs.filter(doc => {
    const data = doc.data();
    const completedDate = data.completedAt 
      ? data.completedAt.toDate() 
      : data.createdAt?.toDate();

    if (completedDate) {
      return completedDate >= today;
    }
    return false;
  }).length;

  return {
    pomodoroSessions,
    totalStudyTime,
    tasksCompleted,
  };
};

export const getRecentActivities = async (userId: string, limitCount: number = 10) => {
  const pomodoroQuery = query(
    collection(db, "pomodoroSessions"),
    where("userId", "==", userId)
  );

  const tasksSnapshot = await getDocs(
    query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("completed", "==", true)
    )
  );

  const pomodoroSnapshot = await getDocs(pomodoroQuery);
  
  const sortedPomodoros = pomodoroSnapshot.docs
    .map(doc => doc.data())
    .sort((a: any, b: any) => {
      const aTime = a.completedAt?.toMillis?.() || 0;
      const bTime = b.completedAt?.toMillis?.() || 0;
      return bTime - aTime;
    })
    .slice(0, limitCount);

  const activities: any[] = [];

  sortedPomodoros.forEach(data => {
    activities.push({
      type: "session",
      text: `Completed ${data.duration}-min focus session`,
      xp: data.xpEarned,
      timestamp: data.completedAt.toDate(),
    });
  });

  tasksSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const completedDate = data.completedAt 
      ? data.completedAt.toDate() 
      : data.createdAt?.toDate();

    if (completedDate) {
      activities.push({
        type: "task",
        text: `Finished ${data.title}`,
        xp: data.xpReward,
        timestamp: completedDate,
      });
    }
  });

  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return activities.slice(0, limitCount).map(activity => {
    const now = new Date();
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
      ...activity,
      time: timeAgo,
    };
  });
};

// PHASE 3: Gamification & Social Features

// Automated badge checking and unlocking
export const checkAndUnlockBadges = async (userId: string) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return [];

  const userData = userDoc.data();
  const userXP = userData.xp || 0;
  const userLevel = userData.level || "Novice";

  const pomodoroSnapshot = await getDocs(
    query(collection(db, "pomodoroSessions"), where("userId", "==", userId))
  );
  const pomodoroCount = pomodoroSnapshot.docs.length;

  const tasksSnapshot = await getDocs(
    query(collection(db, "tasks"), where("userId", "==", userId), where("completed", "==", true))
  );
  const tasksCompleted = tasksSnapshot.docs.length;

  const userStreak = userData.streak || 0;

  const badgeConditions = [
    { id: "first_focus", condition: pomodoroCount >= 1 },
    { id: "dedicated_learner", condition: userStreak >= 7 },
    { id: "task_master", condition: tasksCompleted >= 10 },
    { id: "rising_star", condition: userXP >= 500 },
    { id: "focus_champion", condition: pomodoroCount >= 25 },
    { id: "consistency_king", condition: userStreak >= 30 },
    { id: "xp_collector", condition: userXP >= 2000 },
    { id: "master_learner", condition: userLevel === "Master" },
  ];

  const unlockedBadges = [];

  for (const badge of badgeConditions) {
    if (badge.condition) {
      const unlocked = await unlockBadge(userId, badge.id);
      if (unlocked) {
        unlockedBadges.push(badge.id);
      }
    }
  }

  return unlockedBadges;
};

// Streak calculation and update
export const updateStreak = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) return;

  const userData = userDoc.data();
  const lastActive = userData.lastActive?.toDate() || new Date(0);
  const now = new Date();

  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  oneDayAgo.setHours(0, 0, 0, 0);

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);

  const lastActiveDay = new Date(lastActive);
  lastActiveDay.setHours(0, 0, 0, 0);

  const currentStreak = userData.streak || 0;

  if (lastActiveDay >= oneDayAgo) {
    await updateDoc(userRef, {
      streak: currentStreak + 1,
      lastActive: Timestamp.now(),
    });
    return currentStreak + 1;
  } else if (lastActiveDay < twoDaysAgo) {
    await updateDoc(userRef, {
      streak: 1,
      lastActive: Timestamp.now(),
    });
    return 1;
  } else {
    await updateDoc(userRef, {
      lastActive: Timestamp.now(),
    });
    return currentStreak;
  }
};

// Leaderboard with time filters
export const getFilteredLeaderboard = async (timeFilter: "all" | "daily" | "weekly" = "all", limitCount: number = 20) => {
  let usersQuery = query(collection(db, "users"), orderBy("xp", "desc"), limit(limitCount));

  if (timeFilter === "daily" || timeFilter === "weekly") {
    const now = new Date();
    const startDate = new Date(now);

    if (timeFilter === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    }

    const allUsersSnapshot = await getDocs(query(collection(db, "users")));
    const userScores: any[] = [];

    for (const userDoc of allUsersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      const pomodoroQuery = query(
        collection(db, "pomodoroSessions"),
        where("userId", "==", userId),
        where("completedAt", ">=", Timestamp.fromDate(startDate))
      );

      const tasksQuery = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("completed", "==", true)
      );

      const [pomodoroSnapshot, tasksSnapshot] = await Promise.all([
        getDocs(pomodoroQuery),
        getDocs(tasksQuery)
      ]);

      let periodXP = 0;

      pomodoroSnapshot.docs.forEach(doc => {
        periodXP += doc.data().xpEarned || 0;
      });

      tasksSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const completedDate = data.completedAt?.toDate();
        if (completedDate && completedDate >= startDate) {
          periodXP += data.xpReward || 0;
        }
      });

      if (periodXP > 0) {
        userScores.push({
          ...userData,
          id: userId,
          xp: periodXP,
        });
      }
    }

    userScores.sort((a, b) => b.xp - a.xp);
    return userScores.slice(0, limitCount).map((user, index) => ({
      rank: index + 1,
      ...user,
    }));
  }

  const querySnapshot = await getDocs(usersQuery);
  return querySnapshot.docs.map((doc, index) => ({
    rank: index + 1,
    ...doc.data(),
  }));
};

// Friend system
export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
  const existingRequest = await getDocs(
    query(
      collection(db, "friendRequests"),
      where("fromUserId", "==", fromUserId),
      where("toUserId", "==", toUserId)
    )
  );

  if (existingRequest.empty) {
    await addDoc(collection(db, "friendRequests"), {
      fromUserId,
      toUserId,
      status: "pending",
      createdAt: Timestamp.now(),
    });
    return true;
  }

  return false;
};

export const acceptFriendRequest = async (requestId: string, fromUserId: string, toUserId: string) => {
  await updateDoc(doc(db, "friendRequests", requestId), {
    status: "accepted",
  });

  await addDoc(collection(db, "friends"), {
    userId: fromUserId,
    friendId: toUserId,
    createdAt: Timestamp.now(),
  });

  await addDoc(collection(db, "friends"), {
    userId: toUserId,
    friendId: fromUserId,
    createdAt: Timestamp.now(),
  });
};

export const rejectFriendRequest = async (requestId: string) => {
  await updateDoc(doc(db, "friendRequests", requestId), {
    status: "rejected",
  });
};

export const removeFriend = async (userId: string, friendId: string) => {
  const friendship1 = await getDocs(
    query(
      collection(db, "friends"),
      where("userId", "==", userId),
      where("friendId", "==", friendId)
    )
  );

  const friendship2 = await getDocs(
    query(
      collection(db, "friends"),
      where("userId", "==", friendId),
      where("friendId", "==", userId)
    )
  );

  friendship1.docs.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  friendship2.docs.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
};

export const getFriends = async (userId: string) => {
  const q = query(
    collection(db, "friends"),
    where("userId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  const friendIds = querySnapshot.docs.map(doc => doc.data().friendId);

  const friends = [];
  for (const friendId of friendIds) {
    const friendDoc = await getDoc(doc(db, "users", friendId));
    if (friendDoc.exists()) {
      friends.push({
        id: friendId,
        ...friendDoc.data(),
      });
    }
  }

  return friends;
};

export const getFriendRequests = async (userId: string) => {
  const q = query(
    collection(db, "friendRequests"),
    where("toUserId", "==", userId),
    where("status", "==", "pending")
  );

  const querySnapshot = await getDocs(q);
  const requests = [];

  for (const requestDoc of querySnapshot.docs) {
    const requestData = requestDoc.data();
    const fromUserDoc = await getDoc(doc(db, "users", requestData.fromUserId));

    if (fromUserDoc.exists()) {
      requests.push({
        id: requestDoc.id,
        fromUser: {
          id: requestData.fromUserId,
          ...fromUserDoc.data(),
        },
        createdAt: requestData.createdAt,
      });
    }
  }

  return requests;
};

export const getFriendsLeaderboard = async (userId: string, limitCount: number = 20) => {
  const friends = await getFriends(userId);
  const friendIds = friends.map(f => f.id);
  friendIds.push(userId);

  const leaderboard: any[] = [];

  for (const friendId of friendIds) {
    const userDoc = await getDoc(doc(db, "users", friendId));
    if (userDoc.exists()) {
      leaderboard.push({
        id: friendId,
        ...userDoc.data(),
      });
    }
  }

  leaderboard.sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0));

  return leaderboard.slice(0, limitCount).map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
};

// Study Groups
export const createStudyGroup = async (creatorId: string, name: string, description: string) => {
  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    description,
    creatorId,
    memberCount: 1,
    totalXP: 0,
    createdAt: Timestamp.now(),
  });

  await addDoc(collection(db, "groupMembers"), {
    groupId: groupRef.id,
    userId: creatorId,
    role: "admin",
    joinedAt: Timestamp.now(),
  });

  return groupRef.id;
};

export const joinStudyGroup = async (userId: string, groupId: string) => {
  const existingMember = await getDocs(
    query(
      collection(db, "groupMembers"),
      where("groupId", "==", groupId),
      where("userId", "==", userId)
    )
  );

  if (existingMember.empty) {
    await addDoc(collection(db, "groupMembers"), {
      groupId,
      userId,
      role: "member",
      joinedAt: Timestamp.now(),
    });

    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);
    if (groupDoc.exists()) {
      await updateDoc(groupRef, {
        memberCount: (groupDoc.data().memberCount || 0) + 1,
      });
    }

    return true;
  }

  return false;
};

export const leaveStudyGroup = async (userId: string, groupId: string) => {
  const memberQuery = query(
    collection(db, "groupMembers"),
    where("groupId", "==", groupId),
    where("userId", "==", userId)
  );

  const memberSnapshot = await getDocs(memberQuery);

  memberSnapshot.docs.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);
  if (groupDoc.exists()) {
    await updateDoc(groupRef, {
      memberCount: Math.max(0, (groupDoc.data().memberCount || 1) - 1),
    });
  }
};

export const getUserGroups = async (userId: string) => {
  const q = query(
    collection(db, "groupMembers"),
    where("userId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  const groups = [];

  for (const memberDoc of querySnapshot.docs) {
    const groupId = memberDoc.data().groupId;
    const groupDoc = await getDoc(doc(db, "groups", groupId));

    if (groupDoc.exists()) {
      groups.push({
        id: groupId,
        ...groupDoc.data(),
        role: memberDoc.data().role,
      });
    }
  }

  return groups;
};

export const getGroupLeaderboard = async (groupId: string) => {
  const membersQuery = query(
    collection(db, "groupMembers"),
    where("groupId", "==", groupId)
  );

  const membersSnapshot = await getDocs(membersQuery);
  const leaderboard: any[] = [];

  for (const memberDoc of membersSnapshot.docs) {
    const userId = memberDoc.data().userId;
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      leaderboard.push({
        id: userId,
        ...userDoc.data(),
        role: memberDoc.data().role,
      });
    }
  }

  leaderboard.sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0));

  return leaderboard.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
};

export const getAllGroups = async (limitCount: number = 20) => {
  const q = query(
    collection(db, "groups"),
    orderBy("memberCount", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Activity Feed
export const getGlobalActivityFeed = async (limitCount: number = 20) => {
  const pomodoroQuery = query(
    collection(db, "pomodoroSessions"),
    orderBy("completedAt", "desc"),
    limit(limitCount * 2)
  );

  const tasksQuery = query(
    collection(db, "tasks"),
    where("completed", "==", true)
  );

  const [pomodoroSnapshot, tasksSnapshot] = await Promise.all([
    getDocs(pomodoroQuery),
    getDocs(tasksQuery)
  ]);
  
  const sortedTasks = tasksSnapshot.docs
    .map(doc => doc.data())
    .filter((data: any) => data.completedAt)
    .sort((a: any, b: any) => {
      const aTime = a.completedAt?.toMillis?.() || 0;
      const bTime = b.completedAt?.toMillis?.() || 0;
      return bTime - aTime;
    })
    .slice(0, limitCount * 2);

  const activities: any[] = [];

  const userCache = new Map();

  for (const sessionDoc of pomodoroSnapshot.docs) {
    const data = sessionDoc.data();
    let user = userCache.get(data.userId);

    if (!user) {
      const userDoc = await getDoc(doc(db, "users", data.userId));
      if (userDoc.exists()) {
        user = userDoc.data();
        userCache.set(data.userId, user);
      }
    }

    if (user) {
      activities.push({
        type: "session",
        userName: user.name,
        userId: data.userId,
        text: `completed a ${data.duration}-min focus session`,
        xp: data.xpEarned,
        timestamp: data.completedAt.toDate(),
      });
    }
  }

  for (const data of sortedTasks) {
    let user = userCache.get(data.userId);

    if (!user) {
      const userDoc = await getDoc(doc(db, "users", data.userId));
      if (userDoc.exists()) {
        user = userDoc.data();
        userCache.set(data.userId, user);
      }
    }

    if (user) {
      activities.push({
        type: "task",
        userName: user.name,
        userId: data.userId,
        text: `completed "${data.title}"`,
        xp: data.xpReward,
        timestamp: data.completedAt.toDate(),
      });
    }
  }

  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return activities.slice(0, limitCount).map(activity => {
    const now = new Date();
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
      ...activity,
      time: timeAgo,
    };
  });
};

export const searchUsers = async (searchTerm: string, limitCount: number = 10) => {
  const usersSnapshot = await getDocs(query(collection(db, "users")));

  const results = usersSnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((user: any) => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, limitCount);

  return results;
};

// PHASE 6: Store & Rewards System
export const getUserPurchases = async (userId: string): Promise<string[]> => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (userDoc.exists()) {
    return userDoc.data().purchases || [];
  }
  return [];
};

export const purchaseItem = async (userId: string, itemId: string, itemPrice: number) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentXP = userData.xp || 0;
  const purchases = userData.purchases || [];

  if (purchases.includes(itemId)) {
    throw new Error("Item already purchased");
  }

  if (currentXP < itemPrice) {
    throw new Error("Insufficient XP");
  }

  await updateDoc(userRef, {
    xp: currentXP - itemPrice,
    purchases: [...purchases, itemId],
  });

  await addDoc(collection(db, "activities"), {
    userId,
    type: "purchase",
    text: `purchased an item from the store`,
    xp: -itemPrice,
    createdAt: Timestamp.now(),
  });

  return { success: true, newXP: currentXP - itemPrice };
};

export const applyTheme = async (userId: string, themeId: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    activeTheme: themeId,
  });
};

export const applyAvatarBorder = async (userId: string, borderId: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    avatarBorder: borderId,
  });
};

// MESSAGING SYSTEM
export const sendMessage = async (fromUserId: string, toUserId: string, text: string) => {
  const conversationId = [fromUserId, toUserId].sort().join('_');
  
  const messageData = {
    conversationId,
    fromUserId,
    toUserId,
    text,
    read: false,
    createdAt: Timestamp.now(),
  };

  await addDoc(collection(db, "messages"), messageData);
  
  const conversationRef = doc(db, "conversations", conversationId);
  const conversationDoc = await getDoc(conversationRef);
  
  if (!conversationDoc.exists()) {
    await setDoc(conversationRef, {
      participants: [fromUserId, toUserId],
      lastMessage: text,
      lastMessageTime: Timestamp.now(),
      lastMessageFrom: fromUserId,
      createdAt: Timestamp.now(),
    });
  } else {
    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageTime: Timestamp.now(),
      lastMessageFrom: fromUserId,
    });
  }

  return messageData;
};

export const subscribeToConversation = (
  userId: string,
  friendId: string,
  onUpdate: (messages: any[]) => void
) => {
  const conversationId = [userId, friendId].sort().join('_');
  
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    messages.sort((a: any, b: any) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return aTime - bTime;
    });
    onUpdate(messages);
  });
};

export const subscribeToConversations = (
  userId: string,
  onUpdate: (conversations: any[]) => void
) => {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );

  return onSnapshot(q, async (snapshot) => {
    const conversations = [];
    
    for (const conversationDoc of snapshot.docs) {
      const conversationData = conversationDoc.data();
      const otherUserId = conversationData.participants.find((id: string) => id !== userId);
      
      const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
      const otherUserData = otherUserDoc.exists() ? otherUserDoc.data() : {};
      
      const unreadQuery = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationDoc.id),
        where("toUserId", "==", userId),
        where("read", "==", false)
      );
      const unreadSnapshot = await getDocs(unreadQuery);
      const unreadCount = unreadSnapshot.docs.length;
      
      conversations.push({
        id: conversationDoc.id,
        ...conversationData,
        otherUser: {
          id: otherUserId,
          name: otherUserData.name,
          email: otherUserData.email,
          xp: otherUserData.xp,
          level: otherUserData.level,
        },
        unreadCount,
      });
    }
    
    conversations.sort((a: any, b: any) => {
      const aTime = a.lastMessageTime?.toMillis?.() || 0;
      const bTime = b.lastMessageTime?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    onUpdate(conversations);
  });
};

export const markMessagesAsRead = async (userId: string, friendId: string) => {
  const conversationId = [userId, friendId].sort().join('_');
  
  const unreadQuery = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    where("toUserId", "==", userId),
    where("read", "==", false)
  );
  
  const unreadSnapshot = await getDocs(unreadQuery);
  
  const updatePromises = unreadSnapshot.docs.map(messageDoc =>
    updateDoc(doc(db, "messages", messageDoc.id), { read: true })
  );
  
  await Promise.all(updatePromises);
};

export const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    isOnline,
    lastSeen: Timestamp.now(),
  });
};

export const subscribeToUserStatus = (userId: string, onUpdate: (status: any) => void) => {
  const userRef = doc(db, "users", userId);
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      onUpdate({
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen,
      });
    }
  });
};

export const setTypingStatus = async (conversationId: string, userId: string, isTyping: boolean) => {
  const typingRef = doc(db, "typing", conversationId);
  if (isTyping) {
    await setDoc(typingRef, {
      [userId]: Timestamp.now(),
    }, { merge: true });
  } else {
    const typingDoc = await getDoc(typingRef);
    if (typingDoc.exists()) {
      const data = typingDoc.data();
      delete data[userId];
      if (Object.keys(data).length === 0) {
        await deleteDoc(typingRef);
      } else {
        await setDoc(typingRef, data);
      }
    }
  }
};

export const subscribeToTypingStatus = (
  conversationId: string,
  currentUserId: string,
  onUpdate: (isTyping: boolean) => void
) => {
  const typingRef = doc(db, "typing", conversationId);
  return onSnapshot(typingRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const otherUserIds = Object.keys(data).filter(id => id !== currentUserId);
      const isTyping = otherUserIds.length > 0;
      const lastTypingTime = otherUserIds.length > 0 
        ? data[otherUserIds[0]]?.toMillis?.() || 0 
        : 0;
      const now = Date.now();
      const isRecent = (now - lastTypingTime) < 5000;
      onUpdate(isTyping && isRecent);
    } else {
      onUpdate(false);
    }
  });
};

export const addMessageReaction = async (messageId: string, userId: string, reaction: string) => {
  const messageRef = doc(db, "messages", messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (messageDoc.exists()) {
    const reactions = messageDoc.data().reactions || {};
    if (!reactions[reaction]) {
      reactions[reaction] = [];
    }
    if (!reactions[reaction].includes(userId)) {
      reactions[reaction].push(userId);
    }
    await updateDoc(messageRef, { reactions });
  }
};

export const removeMessageReaction = async (messageId: string, userId: string, reaction: string) => {
  const messageRef = doc(db, "messages", messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (messageDoc.exists()) {
    const reactions = messageDoc.data().reactions || {};
    if (reactions[reaction]) {
      reactions[reaction] = reactions[reaction].filter((id: string) => id !== userId);
      if (reactions[reaction].length === 0) {
        delete reactions[reaction];
      }
    }
    await updateDoc(messageRef, { reactions });
  }
};

export const deleteMessage = async (messageId: string) => {
  const messageRef = doc(db, "messages", messageId);
  await updateDoc(messageRef, {
    deleted: true,
    text: "This message was deleted",
  });
};

export const editMessage = async (messageId: string, newText: string) => {
  const messageRef = doc(db, "messages", messageId);
  await updateDoc(messageRef, {
    text: newText,
    edited: true,
    editedAt: Timestamp.now(),
  });
};

export const getSuggestedFriends = async (userId: string, userXP: number) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return [];

  const userData = userDoc.data();
  const friendIds = userData.friends || [];

  const usersQuery = query(collection(db, "users"));
  const usersSnapshot = await getDocs(usersQuery);

  const suggestions = usersSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((u: any) => {
      if (u.id === userId) return false;
      if (friendIds.includes(u.id)) return false;
      const xpDiff = Math.abs((u.xp || 0) - userXP);
      return xpDiff < 500;
    })
    .sort((a: any, b: any) => {
      const aDiff = Math.abs((a.xp || 0) - userXP);
      const bDiff = Math.abs((b.xp || 0) - userXP);
      return aDiff - bDiff;
    })
    .slice(0, 5);

  return suggestions;
};