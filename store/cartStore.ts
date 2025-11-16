"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, CartItem } from "@/types";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

interface CartStore {
  items: CartItem[];
  isHydrated: boolean;
  userId: string | null;
  addItem: (product: Product, userId?: string) => Promise<void>;
  removeItem: (productId: string, userId?: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    userId?: string
  ) => Promise<void>;
  clearCart: (userId?: string) => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  setHydrated: () => void;
  setUserId: (userId: string | null) => void;
  loadUserCart: (userId: string) => Promise<void>;
  syncToFirebase: (userId: string, items: CartItem[]) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      userId: null,

      setHydrated: () => set({ isHydrated: true }),

      setUserId: (userId: string | null) => set({ userId }),

      // Load user's cart from Firebase
      loadUserCart: async (userId: string) => {
        if (!db || !isFirebaseConfigured()) return;

        try {
          const cartRef = doc(db, "carts", userId);
          const cartSnap = await getDoc(cartRef);

          if (cartSnap.exists()) {
            const cartData = cartSnap.data();
            set({ items: cartData.items || [], userId });
          } else {
            set({ items: [], userId });
          }
        } catch (error) {
          console.error("Error loading user cart:", error);
        }
      },

      // Sync cart to Firebase
      syncToFirebase: async (userId: string, items: CartItem[]) => {
        if (!db || !isFirebaseConfigured()) return;

        try {
          const cartRef = doc(db, "carts", userId);
          await setDoc(cartRef, {
            items,
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error("Error syncing cart to Firebase:", error);
        }
      },

      addItem: async (product: Product, userId?: string) => {
        const currentUserId = userId || get().userId;
        const items = get().items;
        const existingItem = items.find(
          (item) => item.product.id === product.id
        );

        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...items, { product, quantity: 1 }];
        }

        set({ items: newItems });

        // Sync to Firebase if user is logged in
        if (currentUserId) {
          await get().syncToFirebase(currentUserId, newItems);
        }
      },

      removeItem: async (productId: string, userId?: string) => {
        const currentUserId = userId || get().userId;
        const newItems = get().items.filter(
          (item) => item.product.id !== productId
        );
        set({ items: newItems });

        // Sync to Firebase if user is logged in
        if (currentUserId) {
          await get().syncToFirebase(currentUserId, newItems);
        }
      },

      updateQuantity: async (
        productId: string,
        quantity: number,
        userId?: string
      ) => {
        const currentUserId = userId || get().userId;

        if (quantity <= 0) {
          await get().removeItem(productId, currentUserId || undefined);
          return;
        }

        const newItems = get().items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        set({ items: newItems });

        // Sync to Firebase if user is logged in
        if (currentUserId) {
          await get().syncToFirebase(currentUserId, newItems);
        }
      },

      clearCart: async (userId?: string) => {
        const currentUserId = userId || get().userId;
        set({ items: [] });

        // Sync to Firebase if user is logged in
        if (currentUserId) {
          await get().syncToFirebase(currentUserId, []);
        }
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "davnex-cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
