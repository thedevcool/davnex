"use client";

import Link from "next/link";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Clock } from "lucide-react";
import ProductBadge from "@/components/ProductBadge";
import PriceDisplay from "@/components/PriceDisplay";

export default function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl sm:text-4xl font-semibold">
            <span className="text-blue-600">Recently viewed.</span>{" "}
            <span className="text-gray-600">Your browsing history</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {recentlyViewed.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <div className="bg-apple-gray-50 rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300">
                <ProductBadge product={product} />
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-apple-gray-900 mb-2 group-hover:text-purple-600 transition-colors text-sm line-clamp-2">
                  {product.name}
                </h3>
                <PriceDisplay product={product} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
