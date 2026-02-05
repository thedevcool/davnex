"use client";

import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Cookie helper functions
const setCookie = (name: string, value: string, hours: number) => {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        set({ isAuthenticated: true });
        if (typeof window !== "undefined") {
          // Set cookie with 12 hours expiry
          setCookie("davnex-admin", "true", 12);
          // Keep localStorage as fallback
          localStorage.setItem("davnex-admin", "true");
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },

  logout: () => {
    set({ isAuthenticated: false });
    if (typeof window !== "undefined") {
      deleteCookie("davnex-admin");
      localStorage.removeItem("davnex-admin");
    }
  },
}));

// Check if user is authenticated on load
if (typeof window !== "undefined") {
  const cookieAuth = getCookie("davnex-admin") === "true";
  const localStorageAuth = localStorage.getItem("davnex-admin") === "true";
  
  // Prioritize cookie auth
  if (cookieAuth) {
    useAuthStore.setState({ isAuthenticated: true });
  } else if (localStorageAuth) {
    // If localStorage says true but cookie expired, log out
    localStorage.removeItem("davnex-admin");
    useAuthStore.setState({ isAuthenticated: false });
  }
}
