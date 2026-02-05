"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { KeyRound, Wifi, Smartphone } from "lucide-react";
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
  const [selectedDeviceCount, setSelectedDeviceCount] = useState<number>(3);
  const [email, setEmail] = useState<string>("");
  const [feedbackName, setFeedbackName] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<"review" | "complaint">("review");
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchPlans();
    // Load email from localStorage
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Save to localStorage
    localStorage.setItem("userEmail", newEmail);
  };

  const fetchPlans = async () => {
    if (!isFirebaseConfigured() || !db) {
      setLoading(false);
      return;
    }

    try {
      const plansQuery = query(
        collection(db, "dataPlans"),
        orderBy("price", "asc"),
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

  // Filter plans by selected device count
  const filteredPlans = plans.filter(
    (plan) => plan.usersCount === selectedDeviceCount,
  );

  // Group plans by name (data amount) to avoid duplicates
  const uniquePlanNames = Array.from(new Set(filteredPlans.map((p) => p.name)));
  const displayPlans = uniquePlanNames.map(
    (name) => filteredPlans.find((p) => p.name === name)!,
  );

  const handlePurchase = async () => {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address for receipt");
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setError(
        "Payment system is still loading. Please try again in a moment.",
      );
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey || paystackKey === "your_paystack_public_key_here") {
      alert("Paystack is not configured. Please contact support.");
      return;
    }

    setPurchasing(true);
    setError("");

    try {
      // Check if codes are available before payment
      const availabilityResponse = await fetch(
        "/api/data-codes/check-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: selectedPlan.id,
          }),
        },
      );

      const availabilityData = await availabilityResponse.json();

      if (!availabilityResponse.ok || !availabilityData.available) {
        setError(
          `Sorry, there are no available codes for ${selectedPlan.name} at the moment. Please try another plan or check back later.`,
        );
        setPurchasing(false);
        return;
      }

      // Proceed with payment if codes are available
      // Add ₦100 bank charges to the price
      const totalAmount = selectedPlan.price + 100;
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: totalAmount * 100, // Paystack expects amount in kobo
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
    } catch (err: any) {
      console.error("Error checking availability:", err);
      setError("Failed to verify code availability. Please try again.");
      setPurchasing(false);
    }
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
          email: email,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to retrieve code");
      }

      setRevealedCode(result.code);
    } catch (err: any) {
      console.error("Error claiming code:", err);
      setError(
        err?.message ||
          "Failed to retrieve your access code. Please contact support with your payment reference: " +
            reference,
      );
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackMessage.trim()) {
      setError("Please enter your name and feedback message");
      return;
    }

    setSubmittingFeedback(true);
    setError("");

    try {
      const response = await fetch("/api/data-codes/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: feedbackName,
          email: email,
          planName: selectedPlan?.name || "",
          type: feedbackType,
          rating: feedbackType === "review" ? feedbackRating : null,
          message: feedbackMessage,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit feedback");
      }

      setFeedbackSubmitted(true);
      setFeedbackName("");
      setFeedbackMessage("");
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(err?.message || "Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="lazyOnload"
        onLoad={() => setPaystackLoaded(true)}
        onError={() =>
          setError("Failed to load payment system. Please refresh the page.")
        }
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-apple-gray-100 to-white pt-20 pb-16 overflow-hidden">
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
                <Wifi
                  className="w-14 h-14 sm:w-16 sm:h-16 text-white"
                  strokeWidth={2.5}
                />
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
              <p
                className="text-2xl sm:text-3xl font-semibold text-apple-gray-900 mb-3"
                style={{ opacity: 0.8 }}
              >
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
                  <KeyRound
                    className="w-10 h-10 text-white"
                    strokeWidth={2.5}
                  />
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
                  This code has been permanently removed from our database for
                  security. Make sure to copy or screenshot it now - you won't
                  be able to see it again.
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

      {/* Feedback/Review Section - Shows after payment */}
      {revealedCode && !feedbackSubmitted && (
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-lg p-8 border border-blue-200">
              <h3 className="text-2xl font-semibold text-apple-gray-900 mb-4 text-center">
                📝 Share Your Feedback (Optional)
              </h3>
              <p className="text-apple-gray-600 mb-6 text-center">
                Help us improve our service by sharing your experience
              </p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div>
                  <label htmlFor="feedbackName" className="block text-sm font-medium text-apple-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="feedbackName"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-apple-gray-200 focus:border-blue-500 focus:outline-none text-base transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                    Plan Purchased
                  </label>
                  <input
                    type="text"
                    value={selectedPlan?.name || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-apple-gray-200 bg-apple-gray-50 text-apple-gray-600 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-700 mb-3">
                    Feedback Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFeedbackType("review")}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                        feedbackType === "review"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-white border-2 border-apple-gray-300 text-apple-gray-700 hover:border-blue-400"
                      }`}
                    >
                      ⭐ Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackType("complaint")}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                        feedbackType === "complaint"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-white border-2 border-apple-gray-300 text-apple-gray-700 hover:border-blue-400"
                      }`}
                    >
                      ⚠️ Complaint
                    </button>
                  </div>
                </div>

                {feedbackType === "review" && (
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 mb-3">
                      Rating
                    </label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="text-4xl transition-transform hover:scale-110"
                        >
                          {star <= feedbackRating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-apple-gray-600 mt-2">
                      {feedbackRating} out of 5 stars
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="feedbackMessage" className="block text-sm font-medium text-apple-gray-700 mb-2">
                    {feedbackType === "review" ? "Your Review" : "Your Complaint"}
                  </label>
                  <textarea
                    id="feedbackMessage"
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder={feedbackType === "review" ? "Share your experience..." : "Describe your issue..."}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-apple-gray-200 focus:border-blue-500 focus:outline-none text-base transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Feedback Submitted Confirmation */}
      {feedbackSubmitted && (
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow-lg p-8 border border-green-300 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-semibold text-green-900 mb-2">
                Thank You for Your Feedback!
              </h3>
              <p className="text-green-700">
                We appreciate you taking the time to share your thoughts with us.
              </p>
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
            <p className="text-lg sm:text-xl text-apple-gray-600 max-w-2xl mx-auto mb-8">
              Select a data plan and get instant access to high-speed internet
            </p>

            {/* Device Count Toggle */}
            <div className="inline-flex items-center gap-2 bg-apple-gray-100 rounded-2xl p-2 shadow-inner">
              <button
                onClick={() => {
                  setSelectedDeviceCount(3);
                  setSelectedPlanId("");
                }}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedDeviceCount === 3
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-apple-gray-700 hover:text-apple-gray-900"
                }`}
              >
                <Smartphone className="w-5 h-5 inline-block mr-2" />3 Devices
              </button>
              <button
                onClick={() => {
                  setSelectedDeviceCount(5);
                  setSelectedPlanId("");
                }}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedDeviceCount === 5
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-apple-gray-700 hover:text-apple-gray-900"
                }`}
              >
                <Smartphone className="w-5 h-5 inline-block mr-2" />5 Devices
              </button>
            </div>
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
          ) : displayPlans.length === 0 ? (
            <div className="text-center py-20 bg-apple-gray-50 rounded-3xl max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-apple-gray-200 rounded-2xl mb-6">
                <Wifi className="w-8 h-8 text-apple-gray-600" />
              </div>
              <p className="text-lg text-apple-gray-600">
                No plans available for {selectedDeviceCount} devices at the
                moment.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
                {displayPlans.map((plan) => (
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
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-all duration-300 ${
                          selectedPlanId === plan.id
                            ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg"
                            : "bg-apple-gray-100 group-hover:bg-blue-100"
                        }`}
                      >
                        <Wifi
                          className={`w-8 h-8 ${selectedPlanId === plan.id ? "text-white" : "text-apple-gray-700 group-hover:text-blue-600"}`}
                          strokeWidth={2.5}
                        />
                      </div>

                      <h3 className="text-2xl font-semibold text-apple-gray-900 mb-4">
                        {plan.name}
                      </h3>

                      <div className="mb-6">
                        <span
                          className={`text-5xl font-semibold ${
                            selectedPlanId === plan.id
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                              : "text-apple-gray-900"
                          }`}
                        >
                          ₦{plan.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-sm text-apple-gray-600 font-medium">
                        Monthly Plan • {selectedDeviceCount} Devices
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPlan && (
                <form
                  className="max-w-3xl mx-auto bg-gradient-to-br from-apple-gray-50 to-white rounded-3xl shadow-lg p-8 border border-apple-gray-200"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePurchase();
                  }}
                >
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm text-apple-gray-700 mb-2 font-medium">
                      Email Address (for receipt)
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="your.email@example.com"
                      required
                      className="w-full px-4 py-4 rounded-xl border-2 border-apple-gray-200 focus:border-blue-500 focus:outline-none text-base transition-colors"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-sm text-apple-gray-600 mb-2 font-medium uppercase tracking-wide">
                        Selected Plan
                      </p>
                      <p className="text-2xl font-semibold text-apple-gray-900 mb-1">
                        {selectedPlan.name}
                      </p>
                      <p className="text-lg text-apple-gray-600 flex items-center gap-2 mb-3">
                        <Smartphone className="w-5 h-5" />
                        {selectedDeviceCount} Devices
                      </p>
                      <div className="text-sm text-apple-gray-600 space-y-1">
                        <p className="flex justify-between">
                          <span>Plan Price:</span>
                          <span className="font-semibold">₦{selectedPlan.price.toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Bank Charges:</span>
                          <span className="font-semibold">₦100</span>
                        </p>
                        <div className="border-t border-apple-gray-300 pt-1 mt-1">
                          <p className="flex justify-between text-base font-bold text-apple-gray-900">
                            <span>Total:</span>
                            <span>₦{(selectedPlan.price + 100).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={purchasing || !!revealedCode || !paystackLoaded || !email}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg whitespace-nowrap"
                    >
                      {!paystackLoaded
                        ? "Loading payment..."
                        : purchasing
                          ? "Processing..."
                          : `Pay ₦${(selectedPlan.price + 100).toLocaleString()}`}
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
                <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold text-apple-gray-900 mb-3">
                Choose Plan
              </h3>
              <p className="text-base text-apple-gray-600 leading-relaxed">
                Select a data plan based on the number of devices you need
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  2
                </span>
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
                <span className="text-4xl font-bold bg-gradient-to-br from-green-600 to-green-800 bg-clip-text text-transparent">
                  3
                </span>
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
                  Our support team is here to assist you with any questions
                  about Lodge Internet plans or codes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/2348130437519"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-xl"
                  >
                    Chat with Davo
                    <svg
                      className="w-5 h-5 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://wa.me/2347048817060"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-xl"
                  >
                    Chat with Stephen
                    <svg
                      className="w-5 h-5 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
