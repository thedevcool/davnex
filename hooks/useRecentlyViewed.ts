"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";

const RECENTLY_VIEWED_KEY = "davnex_recently_viewed";
const MAX_RECENT_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load recently viewed products from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          const products = parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          setRecentlyViewed(products);
        } catch (error) {
          console.error("Error loading recently viewed:", error);
        }
      }
    }
  }, []);

  // Add a product to recently viewed
  const addToRecentlyViewed = (product: Product) => {
    if (typeof window === "undefined") return;

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      
      // Add to beginning of array
      const updated = [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      
      return updated;
    });
  };

  // Clear recently viewed
  const clearRecentlyViewed = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
      setRecentlyViewed([]);
    }
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
};
