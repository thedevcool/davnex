export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Multiple product images
  category: string;
  description: string;
  specs?: {
    [key: string]: string;
  };
  inStock: boolean;
  badge?: string;
  featured?: boolean;
  sectionId?: string; // Section this product belongs to
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string; // User ID from Firebase Auth
  items: CartItem[];
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentStatus: "pending" | "paid" | "failed";
  paystackReference: string;
  createdAt: Date;
}

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Section {
  id: string;
  name: string;
  description: string;
  displayOrder: number; // Order in which sections appear on homepage
  isActive: boolean; // Whether section is visible on homepage
  createdAt: Date;
  updatedAt: Date;
}
