"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types";

// Default accessory categories matching Apple Store design
// Mapped to sections (sectionId) - sections will be created later
const defaultCategories: Category[] = [
  {
    id: "1",
    name: "Cases & Protection",
    slug: "cases-protection",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 1,
    isActive: true,
    sectionId: "cases", // Maps to Cases section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Charging & Cables",
    slug: "charging-cables",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 2,
    isActive: true,
    sectionId: "charging", // Maps to Charging section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Headphones & Speakers",
    slug: "headphones-speakers",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 3,
    isActive: true,
    sectionId: "audio", // Maps to Audio section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Watches & Bands",
    slug: "watches-bands",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 4,
    isActive: true,
    sectionId: "wearables", // Maps to Wearables section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Power & Batteries",
    slug: "power-batteries",
    image: "https://images.unsplash.com/photo-1609592001058-5d5e1c5e1b1c?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 5,
    isActive: true,
    sectionId: "power", // Maps to Power section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    name: "Mounts & Stands",
    slug: "mounts-stands",
    image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 6,
    isActive: true,
    sectionId: "mounts", // Maps to Mounts section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    name: "Screen Protectors",
    slug: "screen-protectors",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 7,
    isActive: true,
    sectionId: "screen-protection", // Maps to Screen Protection section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    name: "Adapters & Hubs",
    slug: "adapters-hubs",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 8,
    isActive: true,
    sectionId: "adapters", // Maps to Adapters section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    name: "Storage & Memory",
    slug: "storage-memory",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 9,
    isActive: true,
    sectionId: "storage", // Maps to Storage section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "10",
    name: "Cleaning & Care",
    slug: "cleaning-care",
    image: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 10,
    isActive: true,
    sectionId: "cleaning", // Maps to Cleaning section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "11",
    name: "Smart Home",
    slug: "smart-home",
    image: "https://images.unsplash.com/photo-1558089687-e1c1e5f24b89?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 11,
    isActive: true,
    sectionId: "smart-home", // Maps to Smart Home section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "12",
    name: "Photography & Video",
    slug: "photography-video",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=400&fit=crop&auto=format&q=90",
    displayOrder: 12,
    isActive: true,
    sectionId: "photography", // Maps to Photography section
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function CategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "categories"),
        where("isActive", "==", true),
        orderBy("displayOrder", "asc")
      );
      const querySnapshot = await getDocs(q);

      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Category[];

      // Use Firebase categories if available, otherwise keep defaults
      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Keep default categories on error
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const targetScroll =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-white border-y border-apple-gray-200">
      <div className="relative w-full overflow-hidden">
        {/* Left Fade Gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-md hover:shadow-lg transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-apple-gray-900" />
        </button>

        {/* Categories Container - Full Width Scrolling */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-16"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex-shrink-0 group"
            >
              <div className="text-center w-28">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-apple-gray-100 group-hover:shadow-lg transition-all duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xs font-normal text-apple-gray-900 group-hover:text-blue-600 transition-colors px-1 line-clamp-2">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-md hover:shadow-lg transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-apple-gray-900" />
        </button>

        {/* Right Fade Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
