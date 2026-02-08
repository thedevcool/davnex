"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db, isFirebaseConfigured, getAuthInstance } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { KeyRound, Wifi, Smartphone, Tv } from "lucide-react";
import { useToast } from "@/components/Toast";
import type { DataPlan } from "@/types";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

type PlanView = "device" | "tv";

export default function LodgeInternetPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [planView, setPlanView] = useState<PlanView>("device");
  const [selectedDeviceCount, setSelectedDeviceCount] = useState<number>(3);
  const [email, setEmail] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // TV Purchase flow states
  const [tvPurchaseStep, setTvPurchaseStep] = useState<
    "email" | "details" | "password" | null
  >(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [tvName, setTvName] = useState<string>("");
  const [tvMacAddress, setTvMacAddress] = useState<string>("");
  const [tvPassword, setTvPassword] = useState<string>("");
  const [tvConfirmPassword, setTvConfirmPassword] = useState<string>("");
  const [tvPaymentRef, setTvPaymentRef] = useState<string>("");
  const [tvSubscriptionId, setTvSubscriptionId] = useState<string>("");

  // Feedback states
  const [feedbackName, setFeedbackName] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<"review" | "complaint">(
    "review",
  );
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Plan availability states
  const [planAvailability, setPlanAvailability] = useState<
    Record<string, { available: boolean; count: number }>
  >({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    fetchPlans();

    // Load email from localStorage
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }

    // Check if user is logged in (for TV users)
    try {
      const auth = getAuthInstance();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
          setEmail(user.email || "");
        } else {
          setCurrentUser(null);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Auth initialization error:", error);
    }
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  // Clear selected plan if it becomes unavailable
  useEffect(() => {
    if (selectedPlanId && selectedPlan?.planType === "device") {
      const availability = planAvailability[selectedPlanId];
      if (availability && !availability.available) {
        setSelectedPlanId("");
        addToast({
          type: "warning",
          title: "Plan No Longer Available",
          message:
            "The selected plan no longer has codes available. Please choose another plan.",
        });
      }
    }
  }, [planAvailability, selectedPlanId, selectedPlan, addToast]);

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
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        // Infer planType for legacy plans that don't have it
        let planType = docData.planType;
        if (!planType) {
          // Legacy plans: if it has usersCount, it's a device plan
          planType = docData.usersCount ? "device" : "tv";
        }
        return {
          id: doc.id,
          ...docData,
          planType,
          createdAt: docData.createdAt?.toDate(),
          updatedAt: docData.updatedAt?.toDate(),
        };
      }) as DataPlan[];
      setPlans(data.filter((plan) => plan.isActive));

      // Check availability for device plans
      const devicePlans = data.filter(
        (plan) => plan.planType === "device" && plan.isActive,
      );
      if (devicePlans.length > 0) {
        checkPlanAvailability(devicePlans);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPlanAvailability = async (devicePlans: DataPlan[]) => {
    setCheckingAvailability(true);

    try {
      const availabilityPromises = devicePlans.map(async (plan) => {
        try {
          const response = await fetch("/api/data-codes/check-availability", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ planId: plan.id }),
          });

          if (response.ok) {
            const data = await response.json();
            return {
              planId: plan.id,
              available: data.available,
              count: data.count,
            };
          } else {
            return { planId: plan.id, available: false, count: 0 };
          }
        } catch (error) {
          console.error(
            `Error checking availability for plan ${plan.id}:`,
            error,
          );
          return { planId: plan.id, available: false, count: 0 };
        }
      });

      const results = await Promise.all(availabilityPromises);

      const availabilityMap: Record<
        string,
        { available: boolean; count: number }
      > = {};
      results.forEach((result) => {
        availabilityMap[result.planId] = {
          available: result.available,
          count: result.count,
        };
      });

      setPlanAvailability(availabilityMap);
    } catch (error) {
      console.error("Error checking plan availability:", error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Filter plans by type and device count
  const filteredPlans = plans.filter((plan) => {
    if (planView === "device") {
      return (
        plan.planType === "device" && plan.usersCount === selectedDeviceCount
      );
    } else {
      return plan.planType === "tv";
    }
  });

  // Group device plans by name to avoid duplicates
  const displayPlans =
    planView === "device"
      ? Array.from(new Set(filteredPlans.map((p) => p.name))).map(
          (name) => filteredPlans.find((p) => p.name === name)!,
        )
      : filteredPlans;

  const handlePurchase = async () => {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    // Check availability for device plans
    if (selectedPlan.planType === "device") {
      const availability = planAvailability[selectedPlan.id];
      if (!availability?.available) {
        addToast({
          type: "error",
          title: "Plan Not Available",
          message:
            "No codes are currently available for this plan. Please select a different plan.",
        });
        return;
      }
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
      addToast({
        type: "error",
        title: "Configuration Error",
        message: "Paystack is not configured. Please contact support.",
      });
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
      addToast({
        type: "success",
        title: "Code Copied",
        message: "Code copied to clipboard!",
      });
    }
  };

  // TV Purchase Flow Functions
  const handleTvPurchaseStart = () => {
    if (!selectedPlan) {
      setError("Please select a TV plan");
      return;
    }

    setError("");

    // If user is already logged in, proceed directly to payment
    if (currentUser) {
      setIsExistingUser(true);
      handleTvPayment(true);
    } else {
      // Not logged in, start with email step
      setTvPurchaseStep("email");
    }
  };

  const handleTvEmailCheck = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setPurchasing(true);

    try {
      const response = await fetch("/api/tv/check-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const result = await response.json();

      if (result.exists) {
        // Existing user - redirect to login page
        addToast({
          type: "warning",
          title: "Account Exists",
          message:
            "An account already exists with this email. Please login to purchase a new subscription.",
        });
        router.push("/internet/login");
      } else {
        // New user - collect details
        setIsExistingUser(false);
        setTvPurchaseStep("details");
      }
    } catch (err: any) {
      console.error("Error checking account:", err);
      setError(err.message || "Failed to check account");
    } finally {
      setPurchasing(false);
    }
  };

  const handleTvDetailsSubmit = () => {
    if (!tvName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!tvMacAddress.trim()) {
      setError("Please enter your TV MAC address");
      return;
    }

    // Basic MAC address validation
    const macRegex =
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/;
    if (!macRegex.test(tvMacAddress.trim())) {
      setError("Please enter a valid MAC address (e.g., 00:1A:2B:3C:4D:5E)");
      return;
    }

    setError("");
    handleTvPayment(false);
  };

  const handleTvPayment = async (isExisting: boolean) => {
    if (!selectedPlan || !paystackLoaded || !window.PaystackPop) {
      setError("Payment system is not ready. Please try again.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      addToast({
        type: "error",
        title: "Configuration Error",
        message: "Paystack is not configured. Please contact support.",
      });
      return;
    }

    setPurchasing(true);
    setError("");

    try {
      const totalAmount = selectedPlan.price + 100; // Add ₦100 bank charges
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: totalAmount * 100,
        currency: "NGN",
        ref: `TV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          planType: "tv",
          isExistingUser: isExisting,
          name: isExisting ? "" : tvName,
          macAddress: isExisting ? "" : tvMacAddress,
        },
        callback: (response: any) =>
          handleTvPaymentSuccess(response, isExisting),
        onClose: () => {
          setPurchasing(false);
          setError("Payment was cancelled");
        },
      });

      handler.openIframe();
    } catch (err: any) {
      console.error("Payment error:", err);
      setError("Failed to initiate payment");
      setPurchasing(false);
    }
  };

  const handleTvPaymentSuccess = async (response: any, isExisting: boolean) => {
    const reference = response.reference;
    setTvPaymentRef(reference);

    try {
      const purchaseResponse = await fetch("/api/tv/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: isExisting ? "" : tvName.trim(),
          macAddress: isExisting ? "" : tvMacAddress.trim(),
          planId: selectedPlan!.id,
          paymentRef: reference,
          isNewUser: !isExisting,
        }),
      });

      const result = await purchaseResponse.json();

      if (!purchaseResponse.ok) {
        throw new Error(result.error || "Failed to process purchase");
      }

      setTvSubscriptionId(result.subscriptionId);

      if (result.isNewUser) {
        // Show password creation modal
        setTvPurchaseStep("password");
      } else {
        // Redirect to dashboard
        window.location.href = "/internet/dashboard";
      }
    } catch (err: any) {
      console.error("Error processing TV purchase:", err);
      setError(
        err.message ||
          "Payment successful but failed to activate subscription. Please contact support.",
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!tvPassword.trim() || tvPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (tvPassword !== tvConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setPurchasing(true);

    try {
      // Create Firebase Auth account on client side
      const auth = getAuthInstance();
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        tvPassword,
      );
      const user = userCredential.user;

      // Link user to subscription
      const response = await fetch("/api/tv/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          subscriptionId: tvSubscriptionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to link account to subscription",
        );
      }

      // Redirect to dashboard
      addToast({
        type: "success",
        title: "Account Created",
        message: "Account created successfully! Redirecting to dashboard...",
      });
      window.location.href = "/internet/dashboard";
    } catch (err: any) {
      console.error("Error creating account:", err);
      // Handle specific Firebase Auth errors
      if (err.code === "auth/email-already-in-use") {
        setError(
          "An account with this email already exists. Please use the login page.",
        );
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message || "Failed to create account");
      }
    } finally {
      setPurchasing(false);
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
                  <label
                    htmlFor="feedbackName"
                    className="block text-sm font-medium text-apple-gray-700 mb-2"
                  >
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
                  <label
                    htmlFor="feedbackEmail"
                    className="block text-sm font-medium text-apple-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="feedbackEmail"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="your.email@example.com"
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
                  <label
                    htmlFor="feedbackMessage"
                    className="block text-sm font-medium text-apple-gray-700 mb-2"
                  >
                    {feedbackType === "review"
                      ? "Your Review"
                      : "Your Complaint"}
                  </label>
                  <textarea
                    id="feedbackMessage"
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder={
                      feedbackType === "review"
                        ? "Share your experience..."
                        : "Describe your issue..."
                    }
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
                We appreciate you taking the time to share your thoughts with
                us.
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

            {/* Device/TV Type Toggle */}
            <div className="inline-flex items-center gap-2 bg-apple-gray-100 rounded-2xl p-2 shadow-inner">
              <button
                onClick={() => {
                  setPlanView("device");
                  setSelectedDeviceCount(3);
                  setSelectedPlanId("");
                  setTvPurchaseStep(null);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  planView === "device" && selectedDeviceCount === 3
                    ? "bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white shadow-lg"
                    : "text-apple-gray-700 hover:text-apple-gray-900"
                }`}
              >
                <Smartphone className="w-5 h-5 inline-block mr-2" />3 Devices
              </button>
              <button
                onClick={() => {
                  setPlanView("device");
                  setSelectedDeviceCount(5);
                  setSelectedPlanId("");
                  setTvPurchaseStep(null);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  planView === "device" && selectedDeviceCount === 5
                    ? "bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white shadow-lg"
                    : "text-apple-gray-700 hover:text-apple-gray-900"
                }`}
              >
                <Smartphone className="w-5 h-5 inline-block mr-2" />5 Devices
              </button>
              <button
                onClick={() => {
                  setPlanView("tv");
                  setSelectedPlanId("");
                  setTvPurchaseStep(null);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  planView === "tv"
                    ? "bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white shadow-lg"
                    : "text-apple-gray-700 hover:text-apple-gray-900"
                }`}
              >
                <Tv className="w-5 h-5 inline-block mr-2" />
                TV Unlimited
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
                {displayPlans.map((plan) => {
                  const availability = planAvailability[plan.id];
                  const isDevicePlan = plan.planType === "device";
                  const isAvailable =
                    !isDevicePlan || availability?.available !== false;
                  const codeCount = availability?.count || 0;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => isAvailable && setSelectedPlanId(plan.id)}
                      className={`group relative bg-white rounded-3xl shadow-sm p-8 transition-all duration-300 border-2 ${
                        !isAvailable
                          ? "border-apple-gray-200 bg-apple-gray-50 cursor-not-allowed opacity-60"
                          : selectedPlanId === plan.id
                            ? "border-blue-500 shadow-2xl scale-105 bg-gradient-to-br from-blue-50 to-purple-50 cursor-pointer"
                            : "border-apple-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-102 cursor-pointer"
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
                          {plan.planType === "tv"
                            ? `${plan.duration} Days Subscription`
                            : `Monthly Plan • ${plan.usersCount} Device${plan.usersCount !== 1 ? "s" : ""}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPlan && (
                <div className="max-w-3xl mx-auto bg-gradient-to-br from-apple-gray-50 to-white rounded-3xl shadow-lg p-8 border border-apple-gray-200">
                  <div className="mb-6">
                    <p className="text-sm text-apple-gray-600 mb-2 font-medium uppercase tracking-wide">
                      Selected Plan
                    </p>
                    <p className="text-2xl font-semibold text-apple-gray-900 mb-1">
                      {selectedPlan.name}
                    </p>
                    <p className="text-lg text-apple-gray-600 flex items-center gap-2 mb-3">
                      {selectedPlan.planType === "tv" ? (
                        <>
                          <Tv className="w-5 h-5" />
                          {selectedPlan.duration} Days Subscription
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-5 h-5" />
                          {selectedPlan.usersCount} Device
                          {selectedPlan.usersCount !== 1 ? "s" : ""}
                        </>
                      )}
                    </p>
                    <div className="text-sm text-apple-gray-600 space-y-1">
                      <p className="flex justify-between">
                        <span>Plan Price:</span>
                        <span className="font-semibold">
                          ₦{selectedPlan.price.toLocaleString()}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Bank Charges:</span>
                        <span className="font-semibold">₦100</span>
                      </p>
                      <div className="border-t border-apple-gray-300 pt-1 mt-1">
                        <p className="flex justify-between text-base font-bold text-apple-gray-900">
                          <span>Total:</span>
                          <span>
                            ₦{(selectedPlan.price + 100).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedPlan.planType === "device" ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handlePurchase();
                      }}
                    >
                      <div className="mb-6">
                        <label
                          htmlFor="email"
                          className="block text-sm text-apple-gray-700 mb-2 font-medium"
                        >
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

                      {(() => {
                        const availability = planAvailability[selectedPlan.id];
                        const isAvailable = availability?.available !== false;
                        const isDevicePlan = selectedPlan.planType === "device";
                        const codesNotAvailable = isDevicePlan && !isAvailable;

                        return (
                          <>
                            {codesNotAvailable && (
                              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  No codes available for this plan
                                </div>
                                <p className="text-red-500 text-xs mt-1">
                                  Please select a different plan or try again
                                  later.
                                </p>
                              </div>
                            )}
                            <button
                              type="submit"
                              disabled={
                                purchasing ||
                                !!revealedCode ||
                                !paystackLoaded ||
                                !email ||
                                codesNotAvailable
                              }
                              className={`w-full font-semibold px-10 py-5 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed shadow-xl text-lg ${
                                codesNotAvailable
                                  ? "bg-gray-400 text-gray-600 opacity-50"
                                  : "bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white hover:opacity-90 hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50"
                              }`}
                            >
                              {codesNotAvailable
                                ? "No Codes Available"
                                : !paystackLoaded
                                  ? "Loading payment..."
                                  : purchasing
                                    ? "Processing..."
                                    : `Pay ₦${(selectedPlan.price + 100).toLocaleString()}`}
                            </button>
                          </>
                        );
                      })()}
                    </form>
                  ) : (
                    <button
                      onClick={handleTvPurchaseStart}
                      disabled={purchasing || !paystackLoaded}
                      className="w-full bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white font-semibold px-10 py-5 rounded-2xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
                    >
                      {!paystackLoaded
                        ? "Loading payment..."
                        : "Continue to Purchase"}
                    </button>
                  )}
                </div>
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

      {/* TV Purchase Modals */}
      {tvPurchaseStep === "email" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
            <button
              onClick={() => setTvPurchaseStep(null)}
              className="absolute top-4 right-4 text-apple-gray-400 hover:text-apple-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-400 rounded-2xl mb-4">
                <Tv className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-apple-gray-900 mb-2">
                TV Unlimited Purchase
              </h3>
              <p className="text-apple-gray-600">
                Enter your email to get started
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="your.email@example.com"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border-2 border-apple-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleTvEmailCheck}
                disabled={purchasing}
                className="w-full bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {purchasing ? "Checking..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tvPurchaseStep === "details" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
            <button
              onClick={() => setTvPurchaseStep(null)}
              className="absolute top-4 right-4 text-apple-gray-400 hover:text-apple-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-400 rounded-2xl mb-4">
                <Tv className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-apple-gray-900 mb-2">
                Your Details
              </h3>
              <p className="text-apple-gray-600">
                We need a few details to set up your account
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={tvName}
                  onChange={(e) => setTvName(e.target.value)}
                  placeholder="John Doe"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border-2 border-apple-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  TV MAC Address
                </label>
                <input
                  type="text"
                  value={tvMacAddress}
                  onChange={(e) => setTvMacAddress(e.target.value)}
                  placeholder="00:1A:2B:3C:4D:5E"
                  className="w-full px-4 py-3 rounded-xl border-2 border-apple-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                />
                <p className="mt-1 text-xs text-apple-gray-500">
                  Find this in your TV's network settings
                </p>
              </div>

              <button
                onClick={handleTvDetailsSubmit}
                disabled={purchasing}
                className="w-full bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {purchasing ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tvPurchaseStep === "password" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-apple-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-apple-gray-600">
                Create a password to access your dashboard
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={tvPassword}
                  onChange={(e) => setTvPassword(e.target.value)}
                  placeholder="Enter password (min. 6 characters)"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border-2 border-apple-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={tvConfirmPassword}
                  onChange={(e) => setTvConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-apple-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleCreateAccount}
                disabled={purchasing}
                className="w-full bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {purchasing
                  ? "Creating Account..."
                  : "Create Account & Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
