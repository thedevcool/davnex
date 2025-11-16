"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

const products = [
  {
    name: "Wireless Earbuds",
    href: "/shop/audio/earbuds",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Headphones",
    href: "/shop/audio/headphones",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Phone Cases",
    href: "/shop/cases/phone",
    image:
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Smartwatches",
    href: "/shop/wearables/smartwatch",
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Portable Chargers",
    href: "/shop/charging/portable",
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Wireless Chargers",
    href: "/shop/charging/wireless",
    image:
      "https://images.unsplash.com/photo-1591290619762-9282cd1a3e0b?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Laptop Sleeves",
    href: "/shop/cases/laptop",
    image:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "USB Cables",
    href: "/shop/cables",
    image:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Screen Protectors",
    href: "/shop/protection",
    image:
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Tech Organizers",
    href: "/shop/organizers",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=130&fit=crop&auto=format&q=80",
  },
  {
    name: "Gift Cards",
    href: "/shop/gift-cards",
    image:
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-holiday-giftcards-nav-202411?wid=200&hei=130&fmt=png-alpha&.v=1730139214530",
  },
];

const ProductNavigation = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
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
    <section className="bg-white py-6 border-b border-apple-gray-200">
      <div className="mx-auto max-w-wide container-padding relative">
        {/* Scroll buttons */}
        <button
          onClick={() => scroll("left")}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-apple-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-apple-gray-800" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-apple-gray-50 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-apple-gray-800" />
        </button>

        {/* Products grid */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 lg:gap-6 scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <Link
              key={product.name}
              href={product.href}
              className="flex-shrink-0 flex flex-col items-center group"
            >
              <div className="w-24 h-20 sm:w-28 sm:h-24 mb-2 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-medium text-apple-gray-800 group-hover:text-apple-blue transition-colors text-center">
                {product.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductNavigation;
