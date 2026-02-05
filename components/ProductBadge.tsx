"use client";

import { Product } from "@/types";
import { getProductBadge } from "@/lib/productUtils";

interface ProductBadgeProps {
  product: Product;
  className?: string;
}

export default function ProductBadge({ product, className = "" }: ProductBadgeProps) {
  const badge = getProductBadge(product);

  if (!badge) {
    return null;
  }

  return (
    <span
      className={`inline-block px-3 py-1 bg-gradient-to-r ${badge.color} text-white text-xs font-semibold rounded-full ${className}`}
    >
      {badge.text}
    </span>
  );
}
