"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import AuthModal from "@/components/AuthModal";
import RelatedProducts from "@/components/RelatedProducts";
import ProductBadge from "@/components/ProductBadge";
import PriceDisplay from "@/components/PriceDisplay";
import CountdownTimer from "@/components/CountdownTimer";
import { isProductAvailable } from "@/lib/productUtils";
import {
  ShoppingBag,
  Check,
  ArrowLeft,
  Truck,
  Shield,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { addItem } = useCartStore();
  const { user } = useUserStore();
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    if (!isFirebaseConfigured() || !db) {
      console.warn("Firebase not configured");
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const productData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
          availableDate: docSnap.data().availableDate?.toDate(),
          restockDate: docSnap.data().restockDate?.toDate(),
        } as Product;

        setProduct(productData);
        // Add to recently viewed
        addToRecentlyViewed(productData);
      } else {
        console.error("Product not found");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      // Show sign-in modal if user is not logged in
      setShowAuthModal(true);
      return;
    }

    if (product) {
      await addItem(product, user.id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleAuthSuccess = async () => {
    // After successful sign-in, add product to cart
    if (product && user) {
      await addItem(product, user.id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-apple-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-apple-gray-600 hover:text-apple-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Store
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="bg-apple-gray-50 rounded-2xl p-8 mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`bg-apple-gray-50 rounded-lg p-4 transition-all ${
                      selectedImage === idx
                        ? "ring-2 ring-blue-500"
                        : "hover:ring-2 hover:ring-apple-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-20 object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <ProductBadge product={product} />

            <h1 className="text-4xl font-bold text-apple-gray-900 mb-4">
              {product.name}
            </h1>

            <PriceDisplay product={product} className="text-3xl mb-6" />

            {/* Countdown Timer for Coming Soon Products */}
            {product.availableDate && new Date(product.availableDate) > new Date() && (
              <div className="mb-6">
                <CountdownTimer 
                  availableDate={new Date(product.availableDate)} 
                  onCountdownComplete={() => {
                    // Refresh product data when countdown completes
                    if (params.id) {
                      fetchProduct(params.id as string);
                    }
                  }}
                />
              </div>
            )}

            <div className="mb-8">
              <p className="text-apple-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {product.stockQuantity === 0 ? (
                <div className="text-red-600 font-medium">Out of Stock</div>
              ) : product.stockQuantity <= 5 ? (
                <div className="flex items-center gap-2 text-orange-600">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Only {product.stockQuantity} left in stock!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">In Stock</span>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!isProductAvailable(product)}
                className="w-full py-4 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart!
                  </>
                ) : !isProductAvailable(product) ? (
                  product.availableDate && new Date(product.availableDate) > new Date() ? (
                    "Coming Soon"
                  ) : (
                    "Out of Stock"
                  )
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="block w-full py-4 border-2 border-blue-500 text-blue-500 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-center"
              >
                View Cart
              </Link>
            </div>

            {/* Features */}
            <div className="space-y-4 border-t border-apple-gray-200 pt-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-apple-gray-900">
                    Fast Delivery
                  </h3>
                  <p className="text-sm text-apple-gray-600">
                    Free delivery within Lagos in 24-48 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-apple-gray-900">
                    Warranty Protection
                  </h3>
                  <p className="text-sm text-apple-gray-600">
                    1-year manufacturer warranty included
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-apple-gray-900">
                    Easy Returns
                  </h3>
                  <p className="text-sm text-apple-gray-600">
                    30-day return policy on all products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product && <RelatedProducts currentProduct={product} maxItems={8} />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
