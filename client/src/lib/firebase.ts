import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs, addDoc, deleteDoc, where, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
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
    const newXP = currentXP + xpToAdd;
    
    // Determine level based on XP
    let level = "Novice";
    if (newXP >= 2000) level = "Master";
    else if (newXP >= 500) level = "Scholar";
    
    await updateDoc(userRef, {
      xp: newXP,
      level: level,
    });
    
    return { xp: newXP, level };
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
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateTask = async (taskId: string, updates: any) => {
  await updateDoc(doc(db, "tasks", taskId), updates);
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, "tasks", taskId));
};

export const completeTask = async (taskId: string, userId: string) => {
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
};

// Pomodoro session functions
export const recordPomodoroSession = async (userId: string, duration: number, xpEarned: number) => {
  await addDoc(collection(db, "pomodoroSessions"), {
    userId,
    duration,
    xpEarned,
    completedAt: Timestamp.now(),
  });
  
  await updateUserXP(userId, xpEarned);
};

// Leaderboard functions
export const getLeaderboard = async (limitCount: number = 10) => {
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
};

// Badge functions
export const getUserBadges = async (userId: string) => {
  const q = query(
    collection(db, "userBadges"),
    where("userId", "==", userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
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
    where("completedAt", ">=", Timestamp.fromDate(sevenDaysAgo)),
    orderBy("completedAt", "asc")
  );
  
  const tasksSnapshot = await getDocs(
    query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("completed", "==", true)
    )
  );
  
  const pomodoroSnapshot = await getDocs(pomodoroQuery);
  
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
  
  pomodoroSnapshot.docs.forEach(doc => {
    const data = doc.data();
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
    where("userId", "==", userId),
    orderBy("completedAt", "desc"),
    limit(limitCount)
  );
  
  const tasksSnapshot = await getDocs(
    query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("completed", "==", true)
    )
  );
  
  const pomodoroSnapshot = await getDocs(pomodoroQuery);
  
  const activities: any[] = [];
  
  pomodoroSnapshot.docs.forEach(doc => {
    const data = doc.data();
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
  
  const leaderboard = [];
  
  for (const friendId of friendIds) {
    const userDoc = await getDoc(doc(db, "users", friendId));
    if (userDoc.exists()) {
      leaderboard.push({
        id: friendId,
        ...userDoc.data(),
      });
    }
  }
  
  leaderboard.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  
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
  const leaderboard = [];
  
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
  
  leaderboard.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  
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
    where("completed", "==", true),
    orderBy("completedAt", "desc"),
    limit(limitCount * 2)
  );
  
  const [pomodoroSnapshot, tasksSnapshot] = await Promise.all([
    getDocs(pomodoroQuery),
    getDocs(tasksQuery)
  ]);
  
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
  
  for (const taskDoc of tasksSnapshot.docs) {
    const data = taskDoc.data();
    if (data.completedAt) {
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
