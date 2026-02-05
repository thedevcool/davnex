import { Product } from "@/types";

/**
 * Helper function to convert Firebase Timestamp or Date to Date object
 */
const toDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a Firebase Timestamp (has toDate method)
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // If it's a timestamp number
  if (typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  // If it's a string
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  
  return null;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (product: Product): number | null => {
  if (!product.originalPrice || product.originalPrice <= product.price) {
    return null;
  }
  const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
  return Math.round(discount);
};

/**
 * Get automatic badge for a product based on its status
 * Priority: Coming Soon > Out of Stock > Back in Stock > Custom Badge > Discount
 */
export const getProductBadge = (product: Product): {
  text: string;
  color: string;
  priority: number;
} | null => {
  const now = new Date();

  // Coming Soon (highest priority)
  const availableDate = toDate(product.availableDate);
  if (availableDate && availableDate > now) {
    return {
      text: "COMING SOON",
      color: "from-purple-400 via-purple-500 to-purple-600",
      priority: 1,
    };
  }

  // Out of Stock
  if (product.stockQuantity <= 0) {
    return {
      text: "OUT OF STOCK",
      color: "from-red-400 via-red-500 to-red-600",
      priority: 2,
    };
  }

  // Back in Stock (show for 7 days after restock)
  const restockDate = toDate(product.restockDate);
  if (restockDate) {
    const daysSinceRestock = Math.floor(
      (now.getTime() - restockDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceRestock <= 7) {
      return {
        text: "BACK IN STOCK",
        color: "from-green-400 via-green-500 to-green-600",
        priority: 3,
      };
    }
  }

  // Custom Badge (from admin)
  if (product.badge) {
    return {
      text: product.badge,
      color: "from-blue-400 via-blue-500 to-blue-600",
      priority: 4,
    };
  }

  // Discount Badge (lowest priority)
  const discount = calculateDiscount(product);
  if (discount && discount > 0) {
    return {
      text: `${discount}% OFF`,
      color: "from-orange-400 via-orange-500 to-orange-600",
      priority: 5,
    };
  }

  return null;
};

/**
 * Calculate time remaining until product becomes available
 */
export const getCountdown = (availableDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isAvailable: boolean;
} => {
  const now = new Date();
  const diff = availableDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isAvailable: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isAvailable: false };
};

/**
 * Check if product is available for purchase
 */
export const isProductAvailable = (product: Product): boolean => {
  const now = new Date();
  
  // Check if it's a coming soon product
  const availableDate = toDate(product.availableDate);
  if (availableDate && availableDate > now) {
    return false;
  }

  // Check if it's in stock
  if (product.stockQuantity <= 0) {
    return false;
  }

  return product.inStock;
};

/**
 * Format price with discount display
 */
export const formatPriceWithDiscount = (product: Product): {
  currentPrice: string;
  originalPrice: string | null;
  discount: number | null;
} => {
  const currentPrice = `₦${product.price.toLocaleString()}`;
  const discount = calculateDiscount(product);
  const originalPrice = product.originalPrice
    ? `₦${product.originalPrice.toLocaleString()}`
    : null;

  return { currentPrice, originalPrice, discount };
};
