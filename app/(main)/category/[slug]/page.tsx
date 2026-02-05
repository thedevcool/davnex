"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { Product, Category } from "@/types";
import ProductBadge from "@/components/ProductBadge";
import PriceDisplay from "@/components/PriceDisplay";
import { ArrowLeft, Filter } from "lucide-react";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [filterInStock, setFilterInStock] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchCategoryAndProducts(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...products];

    // Filter by stock
    if (filterInStock) {
      filtered = filtered.filter((p) => p.stockQuantity > 0);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
    }

    setFilteredProducts(filtered);
  }, [products, sortBy, filterInStock]);

  const fetchCategoryAndProducts = async (slug: string) => {
    if (!isFirebaseConfigured() || !db) {
      console.warn("Firebase not configured");
      setLoading(false);
      return;
    }

    try {
      // Fetch category
      const categoryQuery = query(
        collection(db, "categories"),
        where("slug", "==", slug)
      );
      const categorySnapshot = await getDocs(categoryQuery);

      if (categorySnapshot.empty) {
        console.error("Category not found");
        router.push("/");
        return;
      }

      const categoryData = {
        id: categorySnapshot.docs[0].id,
        ...categorySnapshot.docs[0].data(),
        createdAt: categorySnapshot.docs[0].data().createdAt?.toDate(),
        updatedAt: categorySnapshot.docs[0].data().updatedAt?.toDate(),
      } as Category;

      setCategory(categoryData);

      // Fetch products in this category
      const productsQuery = query(
        collection(db, "products"),
        where("category", "==", categoryData.name),
        orderBy("createdAt", "desc")
      );
      const productsSnapshot = await getDocs(productsQuery);

      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        availableDate: doc.data().availableDate?.toDate(),
        restockDate: doc.data().restockDate?.toDate(),
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching category and products:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-apple-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-apple-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-apple-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-apple-gray-600 hover:text-apple-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </button>

          <div className="flex items-center gap-6">
            <img
              src={category.image}
              alt={category.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-4xl font-bold text-apple-gray-900">
                {category.name}
              </h1>
              <p className="text-apple-gray-600 mt-2">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-apple-gray-600" />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filterInStock}
                  onChange={(e) => setFilterInStock(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-apple-gray-700">
                  In Stock Only
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-apple-gray-700">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-apple-gray-600 text-lg">
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
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
                  <h3 className="font-semibold text-apple-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <PriceDisplay product={product} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
