import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { Product, Section } from "@/types";

/**
 * Fetch all active sections ordered by displayOrder
 */
export async function getActiveSections(): Promise<Section[]> {
  if (!isFirebaseConfigured() || !db) {
    console.warn("Firebase not configured or db is null");
    return [];
  }

  try {
    // Fetch all sections and filter/sort in JavaScript to avoid composite index requirement
    const q = query(collection(db, "sections"));
    const querySnapshot = await getDocs(q);
    const sections = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Section[];

    // Filter for active sections and sort by displayOrder
    const activeSections = sections
      .filter((section) => section.isActive === true)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return activeSections;
  } catch (error) {
    console.error("Error fetching active sections:", error);
    return [];
  }
}

/**
 * Fetch products for a specific section
 */
export async function getProductsBySection(
  sectionId: string,
  limitCount: number = 12,
): Promise<Product[]> {
  if (!isFirebaseConfigured() || !db) {
    console.warn("Firebase not configured or db is null");
    return [];
  }

  try {
    console.log(`Fetching products for section ${sectionId}...`);
    // Fetch all products for section and filter/sort in JavaScript
    const q = query(
      collection(db, "products"),
      where("sectionId", "==", sectionId),
    );
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      availableDate: doc.data().availableDate?.toDate(),
      restockDate: doc.data().restockDate?.toDate(),
    })) as Product[];

    // Filter for in-stock, sort by createdAt, and limit
    const inStockProducts = products
      .filter((product) => product.inStock === true)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, limitCount);

    console.log(
      `Found ${inStockProducts.length} products for section ${sectionId}`,
    );
    return inStockProducts;
  } catch (error) {
    console.error("Error fetching products by section:", error);
    return [];
  }
}

/**
 * Fetch all products (for sections without specific products assigned)
 */
export async function getAllProducts(
  limitCount: number = 12,
): Promise<Product[]> {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    // Fetch all products and filter/sort in JavaScript
    const q = query(collection(db, "products"));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      availableDate: doc.data().availableDate?.toDate(),
      restockDate: doc.data().restockDate?.toDate(),
    })) as Product[];

    // Filter for in-stock, sort by createdAt, and limit
    const inStockProducts = products
      .filter((product) => product.inStock === true)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, limitCount);

    return inStockProducts;
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

/**
 * Fetch latest products (products with "NEW" badge)
 */
export async function getLatestProducts(
  limitCount: number = 12,
): Promise<Product[]> {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    console.log("Fetching latest products with NEW badge...");
    // Fetch all products and filter for NEW badge
    const q = query(collection(db, "products"));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];

    // Filter for in-stock products with "NEW" badge, sort by createdAt, and limit
    const latestProducts = products
      .filter(
        (product) =>
          product.inStock === true && product.badge?.toUpperCase() === "NEW",
      )
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, limitCount);

    console.log(`Found ${latestProducts.length} latest products`);
    return latestProducts;
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return [];
  }
}

/**
 * Fetch featured products
 */
export async function getFeaturedProducts(
  limitCount: number = 8,
): Promise<Product[]> {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      where("inStock", "==", true),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}
