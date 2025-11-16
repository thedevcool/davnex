"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { collection, addDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { ArrowLeft, CreditCard, Package, Check } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useUserStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (items.length === 0 && !orderComplete) {
    router.push("/cart");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const createOrder = async (
    reference: string,
    status: "paid" | "pending" | "failed"
  ) => {
    if (!isFirebaseConfigured() || !db) {
      console.error("Firebase not configured, cannot save order");
      return;
    }

    try {
      const orderData = {
        userId: user?.id || null, // Associate order with user
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total: getTotal(),
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state}`,
        paymentStatus: status,
        paystackReference: reference,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "orders"), orderData);
      console.log("✅ Order saved successfully:", reference);
    } catch (error) {
      console.error("❌ Error creating order:", error);
      throw error;
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim()
    ) {
      alert("Please enter complete shipping address");
      return;
    }

    setLoading(true);

    try {
      // Load Paystack inline script
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

        if (!paystackKey || paystackKey === "your_paystack_public_key_here") {
          alert(
            "⚠️  Paystack is not configured.\n\nPlease add your Paystack public key to .env.local file.\n\nGet your key from: https://dashboard.paystack.com/"
          );
          setLoading(false);
          return;
        }

        try {
          const handler = window.PaystackPop.setup({
            key: paystackKey,
            email: formData.email,
            amount: getTotal() * 100, // Convert to kobo
            currency: "NGN",
            ref: "DVX" + Math.floor(Math.random() * 1000000000 + 1),
            metadata: {
              custom_fields: [
                {
                  display_name: "Customer Name",
                  variable_name: "customer_name",
                  value: `${formData.firstName} ${formData.lastName}`,
                },
                {
                  display_name: "Phone Number",
                  variable_name: "phone_number",
                  value: formData.phone,
                },
              ],
            },
            callback: async function (response: any) {
              // Payment successful
              console.log("✅ Payment successful:", response.reference);
              try {
                await createOrder(response.reference, "paid");
                clearCart();
                setOrderComplete(true);
              } catch (error) {
                console.error("Error saving order:", error);
                alert(
                  "Payment successful but order could not be saved. Please contact support with reference: " +
                    response.reference
                );
              } finally {
                setLoading(false);
              }
            },
            onClose: function () {
              console.log("Payment popup closed");
              setLoading(false);
            },
          });

          handler.openIframe();
        } catch (popupError) {
          console.error("Paystack popup error:", popupError);
          alert("Failed to open payment popup. Please try again.");
          setLoading(false);
        }
      };

      script.onerror = () => {
        console.error("Failed to load Paystack script");
        alert(
          "Failed to load payment system. Please check your internet connection and try again."
        );
        setLoading(false);
      };
    } catch (error) {
      console.error("Payment initialization error:", error);
      alert("Payment initialization failed. Please try again.");
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-apple-gray-900 mb-4">
            Order Successful!
          </h1>

          <p className="text-apple-gray-600 mb-8">
            Thank you for your purchase. We've received your order and will send
            you a confirmation email shortly.
          </p>

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full py-3 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
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
          href="/cart"
          className="inline-flex items-center gap-2 text-apple-gray-600 hover:text-apple-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cart
        </Link>

        <h1 className="text-4xl font-bold text-apple-gray-900 mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-apple-gray-900 mb-6">
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-apple-gray-900 mb-6">
                  Shipping Address
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Lagos"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay with Paystack
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold text-apple-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-contain bg-apple-gray-50 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-apple-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-apple-gray-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-apple-gray-900">
                        ₦{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-apple-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-apple-gray-600">
                  <span>Subtotal</span>
                  <span>₦{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-apple-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-apple-gray-900 pt-2">
                  <span>Total</span>
                  <span>₦{getTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-apple-gray-700">
                    Your order will be delivered within 2-5 business days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
