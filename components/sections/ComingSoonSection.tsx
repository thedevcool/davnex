"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import ProductBadge from "@/components/ProductBadge";
import CountdownTimer from "@/components/CountdownTimer";

interface ComingSoonSectionProps {
  backgroundColor?: string;
}

export default function ComingSoonSection({
  backgroundColor = "bg-purple-50",
}: ComingSoonSectionProps) {
  const [comingSoonProducts, setComingSoonProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComingSoonProducts();
  }, []);

  const fetchComingSoonProducts = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const q = query(collection(db, "products"));
      const querySnapshot = await getDocs(q);

      const products = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          availableDate: doc.data().availableDate?.toDate(),
          restockDate: doc.data().restockDate?.toDate(),
        }))
        .filter(
          (p) => p.availableDate && p.availableDate > now
        ) as Product[];

      // Sort by available date (soonest first)
      products.sort((a, b) => {
        if (!a.availableDate || !b.availableDate) return 0;
        return a.availableDate.getTime() - b.availableDate.getTime();
      });

      setComingSoonProducts(products);
    } catch (error) {
      console.error("Error fetching coming soon products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={`py-16 ${backgroundColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (comingSoonProducts.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2">
          <span className="text-purple-600">Coming soon.</span>{" "}
          <span className="text-gray-600">Get ready for greatness</span>
        </h2>
        <p className="text-apple-gray-600 mb-8">
          Be the first to know when these products launch
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comingSoonProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <ProductBadge product={product} className="mb-3" />
                <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-apple-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover opacity-75"
                  />
                </div>
              </div>

              <h3 className="font-semibold text-apple-gray-900 mb-2 text-lg">
                {product.name}
              </h3>

              {product.description && (
                <p className="text-sm text-apple-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}

              {product.availableDate && (
                <CountdownTimer
                  availableDate={product.availableDate}
                  onCountdownComplete={() => fetchComingSoonProducts()}
                />
              )}

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-apple-gray-600 mb-1">
                  Expected Price
                </p>
                <p className="text-xl font-bold text-apple-gray-900">
                  ₦{product.price.toLocaleString()}
                </p>
              </div>

              <button
                disabled
                className="w-full mt-4 px-4 py-2 bg-apple-gray-200 text-apple-gray-500 rounded-lg font-semibold cursor-not-allowed"
              >
                Not Available Yet
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
