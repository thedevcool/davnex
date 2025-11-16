"use client";

import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,

  login: (username: string, password: string) => {
    // Simple hardcoded authentication
    if (username === "davo" && password === "davo") {
      set({ isAuthenticated: true });
      if (typeof window !== "undefined") {
        localStorage.setItem("davnex-admin", "true");
      }
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAuthenticated: false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("davnex-admin");
    }
  },
}));

// Check if user is authenticated on load
if (typeof window !== "undefined") {
  const isAuth = localStorage.getItem("davnex-admin") === "true";
  if (isAuth) {
    useAuthStore.setState({ isAuthenticated: true });
  }
}
