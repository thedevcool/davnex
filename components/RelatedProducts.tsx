"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductBadge from "@/components/ProductBadge";
import PriceDisplay from "@/components/PriceDisplay";

interface RelatedProductsProps {
  currentProduct: Product;
  maxItems?: number;
}

export default function RelatedProducts({
  currentProduct,
  maxItems = 8,
}: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        // First, try to get products from the same section
        let products: Product[] = [];

        if (currentProduct.sectionId) {
          const sectionQuery = query(
            collection(db, "products"),
            where("sectionId", "==", currentProduct.sectionId),
            limit(maxItems + 1) // Get one extra to exclude current product
          );
          const sectionSnapshot = await getDocs(sectionQuery);
          products = sectionSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              updatedAt: doc.data().updatedAt?.toDate(),
              availableDate: doc.data().availableDate?.toDate(),
              restockDate: doc.data().restockDate?.toDate(),
            }))
            .filter((p) => p.id !== currentProduct.id) as Product[];
        }

        // If not enough from section, get by category
        if (products.length < maxItems) {
          const categoryQuery = query(
            collection(db, "products"),
            where("category", "==", currentProduct.category),
            limit(maxItems + 1)
          );
          const categorySnapshot = await getDocs(categoryQuery);
          const categoryProducts = categorySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              updatedAt: doc.data().updatedAt?.toDate(),
              availableDate: doc.data().availableDate?.toDate(),
              restockDate: doc.data().restockDate?.toDate(),
            }))
            .filter((p) => p.id !== currentProduct.id) as Product[];

          // Merge and deduplicate
          const merged = [...products];
          categoryProducts.forEach((p) => {
            if (!merged.find((existing) => existing.id === p.id)) {
              merged.push(p);
            }
          });
          products = merged;
        }

        // Limit to maxItems and filter in-stock only
        setRelatedProducts(
          products.filter((p) => p.inStock).slice(0, maxItems)
        );
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProduct.id, currentProduct.sectionId, currentProduct.category, maxItems]);

  if (loading) {
    return (
      <section className="py-16 bg-apple-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-apple-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-8">
          <span className="text-blue-600">You may also like.</span>{" "}
          <span className="text-gray-600">Similar products</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {relatedProducts.map((product) => (
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
                <h3 className="font-semibold text-apple-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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
