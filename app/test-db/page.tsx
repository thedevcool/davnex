"use client";

import { useEffect, useState } from "react";
import { getActiveSections, getProductsBySection } from "@/lib/sections";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Section, Product } from "@/types";

export default function TestDBPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check Firebase configuration
        const configured = isFirebaseConfigured();
        console.log("Firebase configured:", configured);

        if (!configured) {
          setError("Firebase is not configured. Check your .env.local file.");
          setLoading(false);
          return;
        }

        // Fetch sections
        console.log("Fetching sections...");
        const fetchedSections = await getActiveSections();
        console.log("Fetched sections:", fetchedSections);
        setSections(fetchedSections);

        // Fetch products for each section
        const productsData: Record<string, Product[]> = {};
        for (const section of fetchedSections) {
          console.log(`Fetching products for section: ${section.name}`);
          const sectionProducts = await getProductsBySection(section.id, 5);
          productsData[section.id] = sectionProducts;
        }
        setProducts(productsData);

        setLoading(false);
      } catch (err: any) {
        console.error("Test error:", err);
        setError(err.message || "Unknown error occurred");
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Database Connection Test
        </h1>

        {/* Firebase Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Firebase Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-medium">Configuration:</span>
              {isFirebaseConfigured() ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✓ Configured
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  ✗ Not Configured
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <p>
                API Key:{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_API_KEY
                  ? "✓ Set"
                  : "✗ Missing"}
              </p>
              <p>
                Project ID:{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Testing database connection...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Sections Display */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">
                Sections ({sections.length})
              </h2>
              {sections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No sections found in database</p>
                  <p className="text-sm">
                    Go to Admin Dashboard → Sections to create sections
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">
                          {section.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            section.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {section.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {section.description}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>ID: {section.id}</span>
                        <span>Order: {section.displayOrder}</span>
                        <span>
                          Products: {products[section.id]?.length || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products Display */}
            {sections.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Products by Section
                </h2>
                {sections.map((section) => (
                  <div key={section.id} className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">
                      {section.name} ({products[section.id]?.length || 0}{" "}
                      products)
                    </h3>
                    {products[section.id]?.length === 0 ? (
                      <p className="text-gray-500 text-sm italic ml-4">
                        No products assigned to this section yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products[section.id]?.map((product) => (
                          <div
                            key={product.id}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <div className="aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h4 className="font-medium text-sm">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              ₦{product.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {product.id}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-3">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>
              If Firebase is not configured, add credentials to .env.local
            </li>
            <li>
              If no sections found, go to{" "}
              <a href="/admin/dashboard" className="underline font-medium">
                Admin Dashboard
              </a>{" "}
              → Sections tab
            </li>
            <li>Create sections and activate them</li>
            <li>Add products and assign them to sections</li>
            <li>Refresh this page to see the data</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
