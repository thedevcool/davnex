"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";

const products = [
  {
    id: 1,
    name: "Pro Wireless Earbuds",
    tagline: "Premium Sound",
    price: "From ₦179,000 or ₦14,917 per month for 12 months",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=960&h=1200&fit=crop&auto=format&q=90",
    link: "/shop/audio/pro-earbuds",
  },
  {
    id: 2,
    name: "Elite Noise-Cancelling Headphones",
    tagline: "Studio Quality",
    price: "From ₦315,000 or ₦26,250 per month for 12 months",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=960&h=1200&fit=crop&auto=format&q=90",
    link: "/shop/audio/elite-headphones",
  },
  {
    id: 3,
    name: "Magsafe Leather Case",
    tagline: "Premium Protection",
    price: "From ₦53,000 or ₦4,417 per month for 12 months",
    image:
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=960&h=1200&fit=crop&auto=format&q=90",
    link: "/shop/cases/magsafe-leather",
  },
  {
    id: 4,
    name: "Fitness Smartwatch Pro",
    tagline: "",
    price: "From ₦269,000 or ₦22,417 per month for 12 months",
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=960&h=1200&fit=crop&auto=format&q=90",
    link: "/shop/wearables/smartwatch-pro",
  },
  {
    id: 5,
    name: "Ultra-Fast Power Bank",
    tagline: "20000mAh Capacity",
    price: "From ₦71,000 or ₦5,917 per month for 12 months",
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=960&h=1200&fit=crop&auto=format&q=90",
    link: "/shop/charging/power-bank",
  },
  {
    id: 6,
    name: "3-in-1 Wireless Charger",
    tagline: "Multi-Device Charging",
    price: "From ₦80,000 or ₦6,667 per month for 12 months",
    image:
      "https://images.unsplash.com/photo-1591290619762-9282cd1a3e0b?w=960&h=1200&fit=crop&auto=format&q=90",
    link: "/shop/charging/wireless-3in1",
  },
  {
    id: 7,
    name: "Premium Laptop Sleeve",
    tagline: "Fits up to 16 inch",
    price: "From ₦44,000 or ₦3,667 per month for 12 months",
    image:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=960&h=1200&fit=crop&auto=format&q=90",
    link: "/shop/cases/laptop-sleeve",
  },
];

const LatestProducts = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      </div>

      {/* Horizontal Scrollable Product Cards - Full Width */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={product.link}
              className="group relative overflow-hidden rounded-2xl bg-apple-gray-100 hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[85vw] sm:w-[400px]"
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                {product.tagline && (
                  <p className="text-xs font-medium text-orange-600 mb-1">
                    {product.tagline}
                  </p>
                )}
                <h3 className="text-2xl font-semibold text-apple-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-apple-gray-600 mb-4">
                  {product.price}
                </p>
                <span className="inline-flex items-center text-apple-blue text-base font-medium group-hover:underline">
                  Buy <ChevronRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Scroll Navigation Buttons */}
      <div className="mx-auto max-w-wide container-padding">
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => scroll("left")}
            className="p-3 rounded-full bg-white hover:bg-apple-gray-100 shadow-md transition-colors border border-apple-gray-200"
            aria-label="Previous products"
          >
            <ChevronRight className="h-5 w-5 text-apple-gray-800 rotate-180" />
          </button>
          <span className="text-sm text-apple-gray-600">
            Previous - The latest.
          </span>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-full bg-white hover:bg-apple-gray-100 shadow-md transition-colors border border-apple-gray-200"
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5 text-apple-gray-800" />
          </button>
          <span className="text-sm text-apple-gray-600">
            Next - The latest.
          </span>
        </div>
      </div>
    </section>
  );
};

export default LatestProducts;
