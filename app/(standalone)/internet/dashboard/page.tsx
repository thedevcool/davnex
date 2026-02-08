"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";
import {
  Tv,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import type { TVSubscription } from "@/types";

export default function TVDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<TVSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchSubscription(currentUser.uid);
      } else {
        router.push("/internet/login");
      }
    });

    return () => unsubscribe();
  }, [router]);
  // Update countdown every minute for active subscriptions
  useEffect(() => {
    if (
      subscription?.subscriptionStatus === "active" &&
      subscription?.expiresAt
    ) {
      const interval = setInterval(() => {
        forceUpdate({});
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [subscription]);
  const fetchSubscription = async (userId: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tv/subscriptions?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();

      if (data.subscriptions && data.subscriptions.length > 0) {
        // Get the most recent subscription
        setSubscription(data.subscriptions[0]);
      } else {
        setError("No subscription found");
      }
    } catch (err: any) {
      console.error("Error fetching subscription:", err);
      setError(err.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuthInstance();
      await signOut(auth);
      router.push("/internet");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleRenew = () => {
    router.push("/internet");
  };

  const getTimeRemaining = () => {
    if (!subscription || !subscription.expiresAt) return null;

    const now = new Date();
    const expiry = new Date(subscription.expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff < 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-apple-gray-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600"></div>
          </div>
          <p className="text-lg text-apple-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-apple-gray-100 to-white">
      {/* Header */}
      <header className="bg-white border-b border-apple-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/internet")}
                className="p-2 text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-400 rounded-xl">
                  <Tv className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    TV Unlimited
                  </h1>
                  <p className="text-sm text-apple-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray-700 hover:bg-apple-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && !subscription ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-center">
            {error}
          </div>
        ) : subscription ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-apple-gray-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-apple-gray-900 mb-2">
                    Subscription Status
                  </h2>
                  <p className="text-apple-gray-600">{subscription.name}</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    subscription.subscriptionStatus === "active"
                      ? "bg-green-100 text-green-700"
                      : subscription.subscriptionStatus === "pending_activation"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {subscription.subscriptionStatus === "active" && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  )}
                  {subscription.subscriptionStatus === "pending_activation" && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Pending Activation
                    </span>
                  )}
                  {subscription.subscriptionStatus === "expired" && (
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Expired
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div className="bg-apple-gray-50 rounded-xl p-4">
                  <p className="text-sm text-apple-gray-600 mb-1">Plan</p>
                  <p className="text-lg font-semibold text-apple-gray-900">
                    {subscription.planName}
                  </p>
                </div>
                <div className="bg-apple-gray-50 rounded-xl p-4">
                  <p className="text-sm text-apple-gray-600 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-apple-gray-900">
                    {subscription.duration} Days
                  </p>
                </div>
                <div className="bg-apple-gray-50 rounded-xl p-4">
                  <p className="text-sm text-apple-gray-600 mb-1">Price</p>
                  <p className="text-lg font-semibold text-apple-gray-900">
                    ₦{subscription.price.toLocaleString()}
                  </p>
                </div>
                <div className="bg-apple-gray-50 rounded-xl p-4">
                  <p className="text-sm text-apple-gray-600 mb-1">
                    Payment Ref
                  </p>
                  <p className="text-sm font-mono text-apple-gray-900 truncate">
                    {subscription.paymentRef}
                  </p>
                </div>
              </div>

              {subscription.subscriptionStatus === "pending_activation" && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900 mb-1">
                        Waiting for Admin Activation
                      </p>
                      <p className="text-sm text-orange-700">
                        Your payment was successful. An administrator will
                        activate your subscription shortly. You'll be able to
                        use the service once activated.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {subscription.subscriptionStatus === "active" &&
                subscription.expiresAt && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                    <div className="text-center">
                      <p className="text-sm text-blue-700 mb-2 font-medium uppercase tracking-wide">
                        Time Remaining
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {getTimeRemaining()}
                      </p>
                      <p className="text-sm text-blue-600">
                        Expires on{" "}
                        {new Date(subscription.expiresAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                )}

              {subscription.subscriptionStatus === "expired" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-1">
                        Subscription Expired
                      </p>
                      <p className="text-sm text-red-700">
                        Your subscription ended on{" "}
                        {new Date(subscription.expiresAt!).toLocaleDateString()}
                        . Renew now to continue using TV Unlimited.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dates Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-apple-gray-200">
              <h3 className="text-xl font-semibold text-apple-gray-900 mb-4">
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-apple-gray-100">
                  <span className="text-apple-gray-600">Payment Date</span>
                  <span className="font-medium text-apple-gray-900">
                    {new Date(subscription.paidAt).toLocaleDateString()}
                  </span>
                </div>
                {subscription.activatedAt && (
                  <div className="flex justify-between items-center py-2 border-b border-apple-gray-100">
                    <span className="text-apple-gray-600">Activated Date</span>
                    <span className="font-medium text-apple-gray-900">
                      {new Date(subscription.activatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {subscription.expiresAt && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-apple-gray-600">Expiry Date</span>
                    <span className="font-medium text-apple-gray-900">
                      {new Date(subscription.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRenew}
              className="w-full bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Renew Subscription
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
