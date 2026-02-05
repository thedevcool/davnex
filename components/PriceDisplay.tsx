"use client";

import { Product } from "@/types";
import { formatPriceWithDiscount } from "@/lib/productUtils";

interface PriceDisplayProps {
  product: Product;
  className?: string;
  showDiscount?: boolean;
  showMonthlyPrice?: boolean;
}

export default function PriceDisplay({
  product,
  className = "",
  showDiscount = true,
  showMonthlyPrice = false,
}: PriceDisplayProps) {
  const { currentPrice, originalPrice, discount } = formatPriceWithDiscount(product);

  if (showMonthlyPrice) {
    return (
      <p className={`text-sm text-apple-gray-900 ${className}`}>
        From {currentPrice} or ₦{Math.floor(product.price / 12).toLocaleString()} per month for 12 months
      </p>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <p className="text-lg font-bold text-apple-gray-900">{currentPrice}</p>
      
      {originalPrice && showDiscount && (
        <>
          <p className="text-sm text-apple-gray-500 line-through">
            {originalPrice}
          </p>
          {discount && (
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
              Save {discount}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
