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
    await updateDoc(taskRef, { completed: true });
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
  
  const tasksQuery = query(
    collection(db, "tasks"),
    where("userId", "==", userId),
    where("completed", "==", true),
    where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo)),
    orderBy("createdAt", "asc")
  );
  
  const [pomodoroSnapshot, tasksSnapshot] = await Promise.all([
    getDocs(pomodoroQuery),
    getDocs(tasksQuery)
  ]);
  
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
    const date = data.createdAt.toDate();
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const stats = dailyStats.get(dateStr);
    if (stats) {
      stats.tasksCompleted += 1;
      stats.xpEarned += data.xpReward || 0;
    }
  });
  
  return Array.from(dailyStats.values());
};

export const getRecentActivities = async (userId: string, limitCount: number = 10) => {
  const pomodoroQuery = query(
    collection(db, "pomodoroSessions"),
    where("userId", "==", userId),
    orderBy("completedAt", "desc"),
    limit(limitCount)
  );
  
  const tasksQuery = query(
    collection(db, "tasks"),
    where("userId", "==", userId),
    where("completed", "==", true),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  
  const [pomodoroSnapshot, tasksSnapshot] = await Promise.all([
    getDocs(pomodoroQuery),
    getDocs(tasksQuery)
  ]);
  
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
    activities.push({
      type: "task",
      text: `Finished ${data.title}`,
      xp: data.xpReward,
      timestamp: data.createdAt.toDate(),
    });
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
