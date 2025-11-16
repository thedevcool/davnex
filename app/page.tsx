"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner from "@/components/sections/HeroBanner";
import ProductNavigation from "@/components/sections/ProductNavigation";
import LatestSection from "@/components/sections/LatestSection";
import DynamicSection from "@/components/sections/DynamicSection";
import QuickLinks from "@/components/sections/QuickLinks";
import { getActiveSections } from "@/lib/sections";
import { Section } from "@/types";

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchSections = async () => {
      console.log("Homepage: Starting to fetch sections...");
      const activeSections = await getActiveSections();
      console.log("Homepage: Received sections:", activeSections);
      setSections(activeSections);
      setLoading(false);
    };

    fetchSections();
  }, []);

  // Handle scroll to section from URL hash
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            const headerHeight = 88;
            const elementPosition =
              element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }, 100);
      }
    }
  }, [loading]);

  const backgroundColors = [
    "bg-white",
    "bg-apple-gray-50",
    "bg-gradient-to-b from-blue-50 to-blue-50",
    "bg-white",
    "bg-apple-gray-50",
  ];

  return (
    <>
      <HeroBanner />
      <ProductNavigation />

      {/* The Latest Section - Always shows first */}
      <LatestSection backgroundColor="bg-white" />

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      ) : sections.length > 0 ? (
        sections.map((section, index) => (
          <DynamicSection
            key={section.id}
            section={section}
            backgroundColor={backgroundColors[index % backgroundColors.length]}
          />
        ))
      ) : (
        <div className="text-center py-24">
          <p className="text-apple-gray-600 text-lg">
            No sections available yet. Check back soon!
          </p>
        </div>
      )}

      <QuickLinks />
    </>
  );
}
