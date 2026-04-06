"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserDoc {
  email: string;
  displayName: string;
  role: "student" | "admin";
  subscription_tier: "explorer" | "scholar" | "scholar_pro" | "academy" | "academy_elite";
  subscription_expiry: any;
  credits: number;
  institution_id: string | null;
  last_test_at: any;
  created_at: any;
}

interface AuthContextRef {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  isPaid: boolean;
  isAdmin: boolean;
  isAcademy: boolean;
}

const AuthContext = createContext<AuthContextRef | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setUserDoc(null);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to real-time updates for the user document in Firestore
    const unsubDoc = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserDoc(snapshot.data() as UserDoc);
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user document:", error);
      setLoading(false);
    });

    return () => unsubDoc();
  }, [user]);

  const isAdmin = userDoc?.role === "admin";
  const isAcademy = userDoc?.subscription_tier === "academy" || userDoc?.subscription_tier === "academy_elite";
  const isPaid = userDoc?.subscription_tier !== "explorer" && !!userDoc?.subscription_tier;

  return (
    <AuthContext.Provider value={{
      user,
      userDoc,
      loading,
      isPaid,
      isAdmin,
      isAcademy,
    }}>
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
