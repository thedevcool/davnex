export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // For showing discounts
  image: string;
  images?: string[]; // Multiple product images
  category: string;
  description: string;
  specs?: {
    [key: string]: string;
  };
  inStock: boolean;
  stockQuantity: number; // Number of units available
  badge?: string;
  featured?: boolean;
  sectionId?: string; // Section this product belongs to
  availableDate?: Date; // For coming soon products with countdown
  restockDate?: Date; // When product was restocked (for "Back in Stock" badge)
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string; // User ID from Firebase Auth
  items: OrderItem[];
  total: number;
  deliveryMethod: "door-to-door" | "station-pickup"; // New delivery option
  deliveryFee: number; // Delivery fee (₦500 for door-to-door, ₦0 for station pickup)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "packing"
    | "on-the-way"
    | "delivered-station"
    | "delivered-doorstep"; // Order tracking status
  paystackReference: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  emailPreferences?: {
    promotional: boolean; // Opt-in for promotional emails
    stockAlerts: boolean; // Opt-in for back-in-stock alerts
    orderUpdates: boolean; // Order status updates (default true)
    comingSoon: boolean; // Countdown and new product alerts
  };
  watchlist?: string[]; // Product IDs user wants to be notified about
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string; // Category image for display
  displayOrder: number; // Order in which categories appear
  isActive: boolean; // Whether category is visible
  sectionId?: string; // Maps category to a section for filtering products
  createdAt: Date;
  updatedAt: Date;
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

export interface DataPlan {
  id: string;
  name: string;
  usersCount: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataCode {
  id: string;
  planId: string;
  codeMask: string;
  createdAt: Date;
}
