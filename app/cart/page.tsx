"use client";

import { useCartStore } from "@/store/cartStore";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } =
    useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-apple-gray-600 hover:text-apple-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </Link>

          <div className="text-center py-16">
            <div className="p-6 bg-apple-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-apple-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-apple-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-apple-gray-600 mb-8">
              Start shopping to add items to your cart
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-apple-gray-600 hover:text-apple-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Store
        </Link>

        <h1 className="text-4xl font-bold text-apple-gray-900 mb-2">
          Shopping Cart
        </h1>
        <p className="text-apple-gray-600 mb-8">
          {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in your
          cart
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex gap-6">
                  <Link href={`/product/${item.product.id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-32 h-32 object-contain bg-apple-gray-50 rounded-lg cursor-pointer hover:bg-apple-gray-100 transition-colors"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="text-lg font-semibold text-apple-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-apple-gray-600">
                          {item.product.category}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="p-2 bg-apple-gray-100 rounded-lg hover:bg-apple-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold text-apple-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="p-2 bg-apple-gray-100 rounded-lg hover:bg-apple-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-apple-gray-900">
                          ₦
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString()}
                        </p>
                        <p className="text-sm text-apple-gray-600">
                          ₦{item.product.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-apple-gray-600">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span>₦{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-apple-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-apple-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-apple-gray-900">
                    <span>Total</span>
                    <span>₦{getTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-4 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-apple-gray-700">
                  <strong>Free delivery</strong> within Lagos for orders over
                  ₦50,000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
