import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, signUpWithEmail, signInWithEmail, logOut, resetPassword as firebaseResetPassword, getUserProfile, updateStreak } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface User {
  id: string;
  email: string;
  name: string;
  xp: number;
  level: string;
  streak: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await updateStreak(firebaseUser.uid);
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: profile.name,
            xp: profile.xp || 0,
            level: profile.level || "Novice",
            streak: profile.streak || 0,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      const profile = await getUserProfile(auth.currentUser.uid);
      if (profile) {
        setUser({
          id: auth.currentUser.uid,
          email: auth.currentUser.email || "",
          name: profile.name,
          xp: profile.xp || 0,
          level: profile.level || "Novice",
          streak: profile.streak || 0,
        });
      }
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const signup = async (name: string, email: string, password: string) => {
    await signUpWithEmail(email, password, name);
  };

  const logout = async () => {
    await logOut();
  };

  const resetPassword = async (email: string) => {
    await firebaseResetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, resetPassword, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
