"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Bell, Package, Clock, Check } from "lucide-react";

function EmailPreferencesContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const promoParam = searchParams.get("promo");

  const [email, setEmail] = useState(emailParam || "");
  const [preferences, setPreferences] = useState({
    promotional: false,
    stockAlerts: false,
    orderUpdates: true,
    comingSoon: false,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // If promo param is set from welcome email, update preference
    if (promoParam === "yes") {
      setPreferences(prev => ({ ...prev, promotional: true }));
    } else if (promoParam === "no") {
      setPreferences(prev => ({ ...prev, promotional: false }));
    }

    // Fetch current preferences if email is provided
    if (emailParam) {
      fetchPreferences(emailParam);
    }
  }, [emailParam, promoParam]);

  const fetchPreferences = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/email/preferences?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const handleSave = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);
    setSaved(false);

    try {
      const response = await fetch("/api/email/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, preferences }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-semibold text-apple-gray-900 mb-2">
              Email Preferences
            </h1>
            <p className="text-apple-gray-600">
              Manage how you'd like to hear from us
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-apple-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!emailParam}
                className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-apple-gray-100"
                placeholder="your@email.com"
              />
            </div>

            <div className="h-px bg-apple-gray-200" />

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-apple-gray-900">
                Choose what you'd like to receive
              </h3>

              {/* Promotional Emails */}
              <label className="flex items-start gap-4 p-4 border border-apple-gray-200 rounded-lg cursor-pointer hover:bg-apple-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.promotional}
                  onChange={(e) =>
                    setPreferences({ ...preferences, promotional: e.target.checked })
                  }
                  className="mt-1 w-5 h-5 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-apple-gray-900">
                      Promotional Emails
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray-600">
                    Get exclusive deals, special offers, and product announcements
                  </p>
                </div>
              </label>

              {/* Stock Alerts */}
              <label className="flex items-start gap-4 p-4 border border-apple-gray-200 rounded-lg cursor-pointer hover:bg-apple-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.stockAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, stockAlerts: e.target.checked })
                  }
                  className="mt-1 w-5 h-5 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-apple-gray-900">
                      Back in Stock Alerts
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray-600">
                    Be notified when products you're interested in are back in stock
                  </p>
                </div>
              </label>

              {/* Order Updates */}
              <label className="flex items-start gap-4 p-4 border border-apple-gray-200 rounded-lg cursor-pointer hover:bg-apple-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.orderUpdates}
                  onChange={(e) =>
                    setPreferences({ ...preferences, orderUpdates: e.target.checked })
                  }
                  className="mt-1 w-5 h-5 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-apple-gray-900">
                      Order Updates
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray-600">
                    Receive updates about your orders, shipping, and delivery (recommended)
                  </p>
                </div>
              </label>

              {/* Coming Soon */}
              <label className="flex items-start gap-4 p-4 border border-apple-gray-200 rounded-lg cursor-pointer hover:bg-apple-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.comingSoon}
                  onChange={(e) =>
                    setPreferences({ ...preferences, comingSoon: e.target.checked })
                  }
                  className="mt-1 w-5 h-5 text-blue-600 border-apple-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-apple-gray-900">
                      Coming Soon Alerts
                    </span>
                  </div>
                  <p className="text-sm text-apple-gray-600">
                    Get early access notifications for upcoming products and launches
                  </p>
                </div>
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-apple-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Saving...</span>
                </>
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>

            <p className="text-xs text-center text-apple-gray-500 mt-4">
              You can update your preferences at any time. We respect your privacy
              and will never share your email with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailPreferencesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-apple-gray-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    }>
      <EmailPreferencesContent />
    </Suspense>
  );
}
