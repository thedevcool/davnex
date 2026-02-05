"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { KeyRound, Wifi, Users } from "lucide-react";
import type { DataPlan } from "@/types";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export default function LodgeInternetPage() {
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    if (!isFirebaseConfigured() || !db) {
      setLoading(false);
      return;
    }

    try {
      const plansQuery = query(
        collection(db, "dataPlans"),
        orderBy("price", "asc")
      );
      const snapshot = await getDocs(plansQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as DataPlan[];
      setPlans(data.filter((plan) => plan.isActive));
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  const handlePurchase = () => {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setError("Payment system is still loading. Please try again in a moment.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey || paystackKey === "your_paystack_public_key_here") {
      alert("Paystack is not configured. Please contact support.");
      return;
    }

    setPurchasing(true);
    setError("");

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: "adebayoayobamidavid@gmail.com",
      amount: selectedPlan.price * 100, // Paystack expects amount in kobo
      currency: "NGN",
      ref: `LODGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        usersCount: selectedPlan.usersCount,
      },
      onClose: function () {
        setPurchasing(false);
      },
      callback: function (response: any) {
        handlePaymentSuccess(response.reference);
      },
    });

    handler.openIframe();
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      const response = await fetch("/api/data-codes/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlanId,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to retrieve code");
      }

      setRevealedCode(result.code);
    } catch (err: any) {
      console.error("Error claiming code:", err);
      setError(err?.message || "Failed to retrieve your access code. Please contact support with your payment reference: " + reference);
    } finally {
      setPurchasing(false);
    }
  };

  const copyToClipboard = () => {
    if (revealedCode) {
      navigator.clipboard.writeText(revealedCode);
      alert("Code copied to clipboard!");
    }
  };

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="lazyOnload"
        onLoad={() => setPaystackLoaded(true)}
        onError={() => setError("Failed to load payment system. Please refresh the page.")}
      />
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-apple-gray-100 to-white pt-32 pb-16 overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 right-1/4 w-96 h-96 bg-gradient-radial from-blue-100 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-gradient-radial from-purple-100 to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="relative mx-auto max-w-wide px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left side - Logo and Title */}
              <div className="flex items-center gap-6">
                <div className="p-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Wifi className="w-14 h-14 sm:w-16 sm:h-16 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold mb-2">
                    <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                      Lodge Internet
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl text-apple-gray-600 font-medium">
                    by Davnex
                  </p>
                </div>
              </div>

              {/* Right side - Tagline */}
              <div className="lg:text-right max-w-md">
                <p className="text-2xl sm:text-3xl font-semibold text-apple-gray-900 mb-3" style={{ opacity: 0.8 }}>
                  Fast and reliable
                  <br />
                  hostel internet.
                </p>
                <p className="text-base sm:text-lg text-apple-gray-600">
                  Get instant access to high-speed internet for your room
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Code Revealed Section */}
        {revealedCode && (
          <section className="py-12 bg-gradient-to-b from-green-50 to-white border-t border-apple-gray-200">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-green-200 relative overflow-hidden">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400 to-green-600 opacity-10 rounded-bl-full"></div>
                
                <div className="relative text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 shadow-lg">
                    <KeyRound className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-semibold text-apple-gray-900 mb-3">
                    Payment Successful!
                  </h2>
                  <p className="text-lg text-apple-gray-600">
                    Here's your access code. Save it now!
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-300 rounded-2xl p-8 mb-8">
                  <p className="text-sm text-green-700 mb-4 font-semibold text-center uppercase tracking-wide">
                    Your Access Code
                  </p>
                  <div className="bg-white rounded-xl p-6 mb-6 shadow-inner">
                    <p className="text-3xl sm:text-4xl font-mono font-bold text-center text-green-900 tracking-widest break-all">
                      {revealedCode}
                    </p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Copy Code
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-6">
                  <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>Important: Save Your Code Now!</span>
                  </p>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    This code has been permanently removed from our database for security.
                    Make sure to copy or screenshot it now - you won't be able to see it again.
                  </p>
                </div>

                <div className="text-sm text-apple-gray-600 space-y-3 bg-apple-gray-50 rounded-xl p-6">
                  <p className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span>Screenshot this page or copy the code</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span>Use this code to connect to Lodge Internet</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span>Each code is single-use and cannot be recovered</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Plans Selection */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-semibold text-apple-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-lg sm:text-xl text-apple-gray-600 max-w-2xl mx-auto">
                Select a data plan and get instant access to high-speed internet
              </p>
            </div>

            {error && (
              <div className="mb-8 max-w-3xl mx-auto bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-2xl flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600"></div>
                </div>
                <p className="text-lg text-apple-gray-600">Loading plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-20 bg-apple-gray-50 rounded-3xl max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-apple-gray-200 rounded-2xl mb-6">
                  <Wifi className="w-8 h-8 text-apple-gray-600" />
                </div>
                <p className="text-lg text-apple-gray-600">
                  No plans available at the moment. Please check back later.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`group relative bg-white rounded-3xl shadow-sm p-8 cursor-pointer transition-all duration-300 border-2 ${
                        selectedPlanId === plan.id
                          ? "border-blue-500 shadow-2xl scale-105 bg-gradient-to-br from-blue-50 to-purple-50"
                          : "border-apple-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-102"
                      }`}
                    >
                      {selectedPlanId === plan.id && (
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}

                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-all duration-300 ${
                          selectedPlanId === plan.id 
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg' 
                            : 'bg-apple-gray-100 group-hover:bg-blue-100'
                        }`}>
                          <Wifi className={`w-8 h-8 ${selectedPlanId === plan.id ? 'text-white' : 'text-apple-gray-700 group-hover:text-blue-600'}`} strokeWidth={2.5} />
                        </div>

                        <h3 className="text-2xl font-semibold text-apple-gray-900 mb-4">
                          {plan.name}
                        </h3>

                        <div className="flex items-center justify-center gap-3 mb-6">
                          <Users className={`w-6 h-6 ${selectedPlanId === plan.id ? 'text-blue-600' : 'text-apple-gray-600'}`} strokeWidth={2} />
                          <span className="text-lg font-medium text-apple-gray-700">
                            {plan.usersCount} Users
                          </span>
                        </div>

                        <div className="mb-3">
                          <span className={`text-5xl font-semibold ${
                            selectedPlanId === plan.id 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                              : 'text-apple-gray-900'
                          }`}>
                            ₦{plan.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-sm text-apple-gray-600 font-medium">
                          One-time payment
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPlan && (
                  <form 
                    className="max-w-3xl mx-auto bg-gradient-to-br from-apple-gray-50 to-white rounded-3xl shadow-lg p-8 border border-apple-gray-200" 
                    onSubmit={(e) => { e.preventDefault(); handlePurchase(); }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-sm text-apple-gray-600 mb-2 font-medium uppercase tracking-wide">
                          Selected Plan
                        </p>
                        <p className="text-2xl font-semibold text-apple-gray-900 mb-1">
                          {selectedPlan.name}
                        </p>
                        <p className="text-lg text-apple-gray-600 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {selectedPlan.usersCount} Users
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={purchasing || !!revealedCode || !paystackLoaded}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg whitespace-nowrap"
                      >
                        {!paystackLoaded
                          ? "Loading payment..."
                          : purchasing
                          ? "Processing..."
                          : `Pay ₦${selectedPlan.price.toLocaleString()}`}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-b from-apple-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl font-semibold text-center text-apple-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-center text-lg text-apple-gray-600 mb-12 max-w-2xl mx-auto">
              Get started with Lodge Internet in three simple steps
            </p>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">1</span>
                </div>
                <h3 className="text-xl font-semibold text-apple-gray-900 mb-3">
                  Choose Plan
                </h3>
                <p className="text-base text-apple-gray-600 leading-relaxed">
                  Select a data plan based on the number of users you need
                </p>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">2</span>
                </div>
                <h3 className="text-xl font-semibold text-apple-gray-900 mb-3">
                  Make Payment
                </h3>
                <p className="text-base text-apple-gray-600 leading-relaxed">
                  Complete secure payment through our trusted Paystack gateway
                </p>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-4xl font-bold bg-gradient-to-br from-green-600 to-green-800 bg-clip-text text-transparent">3</span>
                </div>
                <h3 className="text-xl font-semibold text-apple-gray-900 mb-3">
                  Get Code
                </h3>
                <p className="text-base text-apple-gray-600 leading-relaxed">
                  Receive your instant access code - save it immediately!
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-16 bg-white rounded-3xl shadow-lg p-8 border border-apple-gray-200 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-2xl flex-shrink-0">
                  <KeyRound className="w-8 h-8 text-blue-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-apple-gray-900 mb-3">
                    Need Help?
                  </h3>
                  <p className="text-base text-apple-gray-600 leading-relaxed mb-4">
                    Our support team is here to assist you with any questions about Lodge Internet plans or codes.
                  </p>
                  <a 
                    href="/support" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Contact Support
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
