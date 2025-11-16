"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { User } from "@/types";

interface UserStore {
  user: User | null;
  loading: boolean;
  isHydrated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  setHydrated: () => void;
}

const googleProvider = new GoogleAuthProvider();

// Helper to create/update user in Firestore
const saveUserToFirestore = async (firebaseUser: FirebaseUser) => {
  if (!db || !isFirebaseConfigured()) return;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const userData = {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "User",
    photoURL: firebaseUser.photoURL || "",
    lastLoginAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    // New user - add createdAt
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  } else {
    // Existing user - update last login
    await setDoc(userRef, userData, { merge: true });
  }
};

// Convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "User",
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      isHydrated: false,

      signInWithGoogle: async () => {
        if (!auth || !isFirebaseConfigured()) {
          throw new Error("Firebase Auth is not configured");
        }

        try {
          const result = await signInWithPopup(auth, googleProvider);
          await saveUserToFirestore(result.user);
          const user = convertFirebaseUser(result.user);
          set({ user, loading: false });
        } catch (error: any) {
          console.error("Google sign-in error:", error);
          throw new Error(error.message || "Failed to sign in with Google");
        }
      },

      signInWithEmail: async (email: string, password: string) => {
        if (!auth || !isFirebaseConfigured()) {
          throw new Error("Firebase Auth is not configured");
        }

        try {
          const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          await saveUserToFirestore(result.user);
          const user = convertFirebaseUser(result.user);
          set({ user, loading: false });
        } catch (error: any) {
          console.error("Email sign-in error:", error);
          throw new Error(error.message || "Failed to sign in with email");
        }
      },

      signUpWithEmail: async (
        email: string,
        password: string,
        displayName: string
      ) => {
        if (!auth || !isFirebaseConfigured()) {
          throw new Error("Firebase Auth is not configured");
        }

        try {
          const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

          // Update display name
          if (result.user) {
            await saveUserToFirestore(result.user);
            const user = convertFirebaseUser(result.user);
            user.displayName = displayName;
            set({ user, loading: false });
          }
        } catch (error: any) {
          console.error("Email sign-up error:", error);
          throw new Error(error.message || "Failed to create account");
        }
      },

      resetPassword: async (email: string) => {
        if (!auth || !isFirebaseConfigured()) {
          throw new Error("Firebase Auth is not configured");
        }

        try {
          await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
          console.error("Password reset error:", error);
          throw new Error(
            error.message || "Failed to send password reset email"
          );
        }
      },

      signOutUser: async () => {
        if (!auth || !isFirebaseConfigured()) {
          return;
        }

        try {
          await signOut(auth);
          set({ user: null });
        } catch (error) {
          console.error("Sign-out error:", error);
        }
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: "davnex-user",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// Listen to Firebase Auth state changes
if (typeof window !== "undefined" && auth) {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      await saveUserToFirestore(firebaseUser);
      const user = convertFirebaseUser(firebaseUser);
      useUserStore.setState({ user, loading: false });
    } else {
      useUserStore.setState({ user: null, loading: false });
    }
  });
}
