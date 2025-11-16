"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types";

// Fallback products if Firebase isn't configured
const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Pro Wireless Earbuds",
    price: 179000,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=960&h=1200&fit=crop&auto=format&q=90",
    category: "Audio",
    description: "Premium Sound",
    inStock: true,
    badge: "NEW",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Elite Noise-Cancelling Headphones",
    price: 315000,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=960&h=1200&fit=crop&auto=format&q=90",
    category: "Audio",
    description: "Studio Quality",
    inStock: true,
    badge: "NEW",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Magsafe Leather Case",
    price: 53000,
    image:
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=960&h=1200&fit=crop&auto=format&q=90",
    category: "Cases",
    description: "Premium Protection",
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Fitness Smartwatch Pro",
    price: 269000,
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=960&h=1200&fit=crop&auto=format&q=90",
    category: "Wearables",
    description: "Track Your Fitness",
    inStock: true,
    badge: "NEW",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Ultra-Fast Power Bank",
    price: 71000,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=960&h=1200&fit=crop&auto=format&q=90",
    category: "Charging",
    description: "20000mAh Capacity",
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    name: "3-in-1 Wireless Charger",
    price: 80000,
    image:
      "https://images.unsplash.com/photo-1591290619762-9282cd1a3e0b?w=960&h=1200&fit=crop&auto=format&q=90",
    category: "Charging",
    description: "Multi-Device Charging",
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    name: "Premium Laptop Sleeve",
    price: 44000,
    image:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=960&h=1200&fit=crop&auto=format&q=90",
    category: "Cases",
    description: "Fits up to 16 inch",
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const LatestProducts = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { products: firebaseProducts, loading } = useProducts({ limit: 10 });
  const [displayProducts, setDisplayProducts] = useState(fallbackProducts);

  useEffect(() => {
    // Use Firebase products if available, otherwise use fallback
    if (!loading && firebaseProducts.length > 0) {
      setDisplayProducts(firebaseProducts);
    }
  }, [firebaseProducts, loading]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      const targetScroll =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="section-spacing bg-white">
      <div className="mx-auto max-w-wide container-padding">
        {/* Header with gradient title and subtitle beside */}
        <div className="flex items-baseline gap-3 mb-12 flex-wrap">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold gradient-text-shadow">
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
              The latest.
            </span>
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl text-apple-gray-600 opacity-70">
            Premium accessories you'll love.
          </p>
        </div>

        {/* Products Container with horizontal scroll */}
        <div className="relative">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-3 hover:bg-white transition-all hidden md:block"
            aria-label="Scroll left"
          >
            <ChevronRight className="w-6 h-6 rotate-180 text-apple-gray-900" />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-3 hover:bg-white transition-all hidden md:block"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-apple-gray-900" />
          </button>

          {/* Products */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {displayProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="flex-shrink-0 group cursor-pointer"
                style={{ width: "280px" }}
              >
                <div className="bg-apple-gray-50 rounded-2xl p-6 mb-4 group-hover:bg-apple-gray-100 transition-colors">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-contain"
                  />
                </div>
                <div className="px-2">
                  {product.badge && (
                    <span className="inline-block px-2 py-1 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white text-xs font-semibold rounded mb-2">
                      {product.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-semibold text-apple-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-apple-gray-600 mb-2">
                      {product.description}
                    </p>
                  )}
                  <p className="text-sm text-apple-gray-900">
                    From ₦{product.price.toLocaleString()} or ₦
                    {Math.floor(product.price / 12).toLocaleString()} per month
                    for 12 months
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestProducts;
