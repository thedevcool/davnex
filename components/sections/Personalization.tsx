"use client";

import { useRef } from "react";
import { ChevronRight } from "lucide-react";

const personalizationProducts = [
  {
    id: 1,
    name: "Custom Wireless Earbuds",
    badge: "New",
    price: "₦179,000",
    engraving: true,
    colors: [],
  },
  {
    id: 2,
    name: "Personalized Phone Case",
    price: "₦44,000",
    engraving: true,
    colors: [],
  },
  {
    id: 3,
    name: "Premium Headphones",
    price: "₦315,000",
    engraving: true,
    colors: ["blue", "blue", "midnight", "starlight", "orange"],
  },
  {
    id: 4,
    name: "Engraved Stylus Pen",
    price: "₦71,000",
    engraving: true,
    colors: [],
  },
  {
    id: 5,
    name: "Custom Power Bank",
    price: "₦80,000",
    engraving: false,
    colors: [],
  },
];

const Personalization = () => {
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
    <section className="section-spacing bg-apple-gray-100">
      <div className="mx-auto max-w-wide container-padding">
        {/* Header with gradient title and subtitle beside */}
        <div className="mb-12">
          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold gradient-text-shadow">
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
                Personalization.
              </span>
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-apple-gray-600 opacity-70">
              Make it uniquely yours.
            </p>
          </div>
          <div className="inline-flex items-center bg-white px-4 py-2 rounded-full">
            <span className="text-xs font-semibold text-apple-gray-800">
              FREE CUSTOM ENGRAVING
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Products - Full Width */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth pb-4 px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {personalizationProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] group"
            >
              <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-square bg-apple-gray-50 rounded-xl mb-4 flex items-center justify-center">
                  <div className="w-40 h-40 bg-apple-gray-200 rounded-lg"></div>
                </div>
                {product.badge && (
                  <span className="inline-block text-xs font-medium text-orange-600 mb-2">
                    {product.badge}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-apple-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-base text-apple-gray-800 font-medium mb-2">
                  {product.price}
                </p>
                {product.engraving && (
                  <p className="text-xs text-apple-gray-500 mb-3">
                    Free Engraving
                  </p>
                )}
                {product.colors.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {product.colors.map((color) => (
                      <div
                        key={color}
                        className="w-6 h-6 rounded-full border-2 border-apple-gray-300"
                        style={{
                          backgroundColor:
                            color === "blue"
                              ? "#0071e3"
                              : color === "blue"
                              ? "#a855f7"
                              : color === "midnight"
                              ? "#1d1d1f"
                              : color === "starlight"
                              ? "#f5f5f7"
                              : color === "orange"
                              ? "#ff6b35"
                              : color,
                        }}
                      ></div>
                    ))}
                  </div>
                )}
                <button className="text-apple-blue text-sm font-medium hover:underline">
                  Buy
                </button>
              </div>
            </div>
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
            Previous - Personalization.
          </span>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-full bg-white hover:bg-apple-gray-100 shadow-md transition-colors border border-apple-gray-200"
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5 text-apple-gray-800" />
          </button>
          <span className="text-sm text-apple-gray-600">
            Next - Personalization.
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-wide container-padding">
        <div className="mt-8 p-6 bg-white rounded-2xl text-center">
          <p className="text-base text-apple-gray-600">
            Personalize your accessories. Add custom engraving, choose colors,
            and make it truly yours.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Personalization;
