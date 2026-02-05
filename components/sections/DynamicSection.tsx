"use client";

import { useEffect, useState } from "react";
import { Section, Product } from "@/types";
import { getProductsBySection } from "@/lib/sections";
import Link from "next/link";
import ProductBadge from "@/components/ProductBadge";
import PriceDisplay from "@/components/PriceDisplay";

interface DynamicSectionProps {
  section: Section;
  backgroundColor?: string;
}

export default function DynamicSection({
  section,
  backgroundColor = "bg-apple-gray-50",
}: DynamicSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const sectionProducts = await getProductsBySection(section.id, 12);
      setProducts(sectionProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [section.id]);

  // Don't render if no products
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section
      id={`section-${section.id}`}
      className={`py-16 ${backgroundColor} scroll-mt-24`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Apple Style (same line) */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2">
            <span className="text-blue-600">{section.name}.</span>{" "}
            {section.description && (
              <span className="text-gray-600">{section.description}</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300">
                  <ProductBadge product={product} />
                  <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-apple-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <PriceDisplay product={product} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
