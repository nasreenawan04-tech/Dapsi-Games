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
