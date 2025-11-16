"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";

export const useProducts = (filters?: {
  category?: string;
  featured?: boolean;
  limit?: number;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Check if Firebase is configured
        if (!db) {
          console.warn("Firebase is not configured. Using fallback data.");
          setLoading(false);
          return;
        }

        const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

        if (filters?.category) {
          constraints.push(where("category", "==", filters.category));
        }

        if (filters?.featured !== undefined) {
          constraints.push(where("featured", "==", filters.featured));
        }

        if (filters?.limit) {
          constraints.push(limit(filters.limit));
        }

        const q = query(collection(db, "products"), ...constraints);
        const querySnapshot = await getDocs(q);

        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Product[];

        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters?.category, filters?.featured, filters?.limit]);

  return { products, loading, error };
};
