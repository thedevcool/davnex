"use client";

import { ChevronRight } from "lucide-react";
import { useRef } from "react";

const holidayProducts = [
  {
    id: 1,
    name: "Premium Leather Phone Case with MagSafe – Ocean Blue",
    badge: "New",
    price: "₦53,000",
    colors: ["blue", "blue", "sienna", "green", "black"],
  },
  {
    id: 2,
    name: "Sport Wireless Earbuds — High-Performance — Electric Orange",
    price: "₦135,000",
    colors: ["orange", "blue", "navy", "moss", "black"],
  },
  {
    id: 3,
    name: "Minimalist Leather Wallet with MagSafe – Navy",
    badge: "New",
    price: "₦44,000",
    colors: ["navy", "cherry", "black", "clear"],
  },
  {
    id: 4,
    name: "PopSocket Magnetic Grip & Stand",
    badge: "Only at Davnex",
    price: "₦27,000",
    colors: ["cherry", "black", "clear"],
  },
  {
    id: 5,
    name: "Compact Magnetic Power Bank (5000mAh)",
    badge: "Only at Davnex",
    price: "₦45,000",
    colors: ["blue", "white"],
  },
  {
    id: 6,
    name: "Travel Tech Organizer Kit",
    badge: "Only at Davnex",
    price: "₦72,000",
    colors: ["yellow", "blue", "blue", "green", "gray"],
  },
  {
    id: 7,
    name: "Silicone Sport Band for Smartwatch",
    badge: "New",
    price: "$49.00",
    colors: [],
  },
  {
    id: 8,
    name: "FUJIFILM Instax Mini Link 3 Printer Bundle",
    price: "$116.95",
    colors: [],
  },
];

const HolidayPicks = () => {
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
        <div className="mb-12">
          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold gradient-text-shadow">
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
                Holiday picks.
              </span>
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-apple-gray-600 opacity-70">
              Perfect gifts that impress.
            </p>
          </div>
          <div className="inline-flex items-center bg-apple-gray-100 px-4 py-2 rounded-full">
            <span className="text-xs font-semibold text-apple-gray-800">
              ACCESSORIES
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
          {holidayProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] group bg-apple-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square bg-white rounded-xl mb-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-apple-gray-200 rounded-lg"></div>
              </div>
              {product.badge && (
                <span className="inline-block text-xs font-medium text-orange-600 mb-2">
                  {product.badge}
                </span>
              )}
              <h3 className="text-base font-semibold text-apple-gray-800 mb-2 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-base text-apple-gray-800 font-medium mb-3">
                {product.price}
              </p>
              {product.colors.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {product.colors.slice(0, 5).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border border-apple-gray-300"
                      style={{
                        backgroundColor:
                          color === "blue"
                            ? "#0071e3"
                            : color === "blue"
                            ? "#a855f7"
                            : color === "navy"
                            ? "#1e3a8a"
                            : color === "orange"
                            ? "#ff6b35"
                            : color === "black"
                            ? "#1d1d1f"
                            : color === "white"
                            ? "#ffffff"
                            : color === "green"
                            ? "#10b981"
                            : color === "yellow"
                            ? "#fbbf24"
                            : color === "cherry"
                            ? "#dc2626"
                            : color === "clear"
                            ? "transparent"
                            : color === "gray"
                            ? "#6b7280"
                            : color === "moss"
                            ? "#84cc16"
                            : color === "sienna"
                            ? "#a0522d"
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
            Previous - Holiday picks.
          </span>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-full bg-white hover:bg-apple-gray-100 shadow-md transition-colors border border-apple-gray-200"
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5 text-apple-gray-800" />
          </button>
          <span className="text-sm text-apple-gray-600">
            Next - Holiday picks.
          </span>
        </div>

        {/* Gift Card CTA */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-blue-600 to-black-600 rounded-3xl p-8 text-center text-white">
            <p className="text-xs font-semibold mb-2">DAVNEX GIFT CARD</p>
            <h3 className="text-2xl sm:text-3xl font-semibold mb-3">
              The perfect gift for tech lovers.
            </h3>
            <p className="text-base mb-6">
              Let them choose their favorite premium accessories.
            </p>
            <button className="btn-primary bg-white text-blue-600 hover:bg-apple-gray-100">
              Shop Gift Cards
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HolidayPicks;
