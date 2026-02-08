"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Logo from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { LogOut, Tv, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { TVSubscription } from "@/types";

export default function AdminTVUsersPage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const { addToast } = useToast();

  const [subscriptions, setSubscriptions] = useState<TVSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "expired">(
    "pending",
  );
  const [activating, setActivating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [checkingExpiry, setCheckingExpiry] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState("");

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete" | "migrate";
    subscriptionId?: string;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "delete",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [activeTab]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tv/subscriptions?status=${activeTab === "pending" ? "pending_activation" : activeTab}&isAdmin=true`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err: any) {
      console.error("Error fetching subscriptions:", err);
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (subscriptionId: string) => {
    setActivating(subscriptionId);
    setError("");

    try {
      const response = await fetch("/api/tv/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to activate subscription");
      }

      // Refresh subscriptions
      await fetchSubscriptions();
      addToast({
        type: "success",
        title: "Subscription Activated",
        message: "Subscription activated successfully!",
      });
    } catch (err: any) {
      console.error("Error activating subscription:", err);
      setError(err.message || "Failed to activate subscription");
    } finally {
      setActivating(null);
    }
  };

  const handleCheckExpiry = async () => {
    setCheckingExpiry(true);
    setError("");

    try {
      const response = await fetch("/api/tv/check-expiry", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to check expiry");
      }

      // Refresh subscriptions to show updated statuses
      await fetchSubscriptions();

      const { expiringSoonNotifications, expiredNotifications } =
        result.results;
      addToast({
        type: "success",
        title: "Expiry Check Complete",
        message: `Expiry check completed!\n- Expiring soon notifications: ${expiringSoonNotifications}\n- Expired notifications: ${expiredNotifications}`,
      });
    } catch (err: any) {
      console.error("Error checking expiry:", err);
      setError(err.message || "Failed to check expiry");
    } finally {
      setCheckingExpiry(false);
    }
  };

  const handleDelete = async (subscriptionId: string) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      subscriptionId,
      title: "Delete Subscription",
      message:
        "Are you sure you want to permanently delete this subscription? This action cannot be undone.",
      onConfirm: () => confirmDelete(subscriptionId),
    });
  };

  const confirmDelete = async (subscriptionId: string) => {
    setDeleting(subscriptionId);
    setError("");

    try {
      const response = await fetch(`/api/tv/delete?id=${subscriptionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete subscription");
      }

      // Refresh subscriptions
      await fetchSubscriptions();
      addToast({
        type: "success",
        title: "Subscription Deleted",
        message: "Subscription deleted successfully!",
      });
    } catch (err: any) {
      console.error("Error deleting subscription:", err);
      addToast({
        type: "error",
        title: "Delete Failed",
        message: err.message || "Failed to delete subscription",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleMigrateMacAddresses = async () => {
    setConfirmModal({
      isOpen: true,
      type: "migrate",
      title: "Migrate MAC Addresses",
      message:
        "This will migrate MAC addresses from old hash format to encrypted format. This is safe to run multiple times. Continue?",
      onConfirm: () => confirmMigration(),
    });
  };

  const confirmMigration = async () => {
    setMigrating(true);
    setError("");

    try {
      const response = await fetch("/api/admin/migrate-mac-addresses", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to migrate MAC addresses");
      }

      // Refresh subscriptions to show updated statuses
      await fetchSubscriptions();

      addToast({
        type: "success",
        title: "Migration Complete",
        message: `MAC address migration completed!\n- Updated ${result.updatedCount} subscription(s)\n- Please refresh the page to see changes`,
      });
    } catch (err: any) {
      console.error("Error migrating MAC addresses:", err);
      setError(err.message || "Failed to migrate MAC addresses");
    } finally {
      setMigrating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const filteredSubscriptions = subscriptions;

  const pendingCount = subscriptions.filter(
    (s) => s.subscriptionStatus === "pending_activation",
  ).length;
  const activeCount = subscriptions.filter(
    (s) => s.subscriptionStatus === "active",
  ).length;
  const expiredCount = subscriptions.filter(
    (s) => s.subscriptionStatus === "expired",
  ).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-apple-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-apple-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <Logo />
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/data-codes"
                  className="text-apple-gray-600 hover:text-apple-gray-800 text-sm font-medium"
                >
                  Data Codes
                </Link>
                <Link
                  href="/admin/purchase-logs"
                  className="text-apple-gray-600 hover:text-apple-gray-800 text-sm font-medium"
                >
                  Purchase Logs
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray-700 hover:text-apple-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-apple-gray-900 mb-2">
                TV Unlimited Users
              </h1>
              <p className="text-apple-gray-600">
                Manage TV subscription activations and view user details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMigrateMacAddresses}
                disabled={migrating}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {migrating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Migrating...
                  </span>
                ) : (
                  "Fix MAC Addresses"
                )}
              </button>
              <button
                onClick={handleCheckExpiry}
                disabled={checkingExpiry}
                className="px-4 py-2 bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingExpiry ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Checking...
                  </span>
                ) : (
                  "Check for Expiring Subscriptions"
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 border-b border-apple-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                  activeTab === "pending"
                    ? "text-apple-blue border-b-2 border-apple-blue"
                    : "text-apple-gray-600 hover:text-apple-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Activation
                  {pendingCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                  activeTab === "active"
                    ? "text-apple-blue border-b-2 border-apple-blue"
                    : "text-apple-gray-600 hover:text-apple-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Active
                  {activeCount > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("expired")}
                className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                  activeTab === "expired"
                    ? "text-apple-blue border-b-2 border-apple-blue"
                    : "text-apple-gray-600 hover:text-apple-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Expired
                  {expiredCount > 0 && (
                    <span className="bg-apple-gray-400 text-white text-xs px-2 py-0.5 rounded-full">
                      {expiredCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Subscriptions List */}
          <div className="bg-white rounded-xl shadow-sm border border-apple-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-apple-gray-600">
                Loading subscriptions...
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="p-8 text-center text-apple-gray-600">
                <Tv className="w-12 h-12 mx-auto mb-3 text-apple-gray-400" />
                <p>No {activeTab} subscriptions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-apple-gray-50 border-b border-apple-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-600 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-600 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-600 uppercase tracking-wider">
                        MAC Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-600 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-600 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-apple-gray-200">
                    {filteredSubscriptions.map((subscription) => (
                      <tr
                        key={subscription.id}
                        className="hover:bg-apple-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-apple-gray-900">
                              {subscription.name}
                            </div>
                            <div className="text-apple-gray-600">
                              {subscription.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-apple-gray-900">
                              {subscription.planName}
                            </div>
                            <div className="text-apple-gray-600">
                              {subscription.duration} days • ₦
                              {subscription.price.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-mono text-apple-gray-900">
                            {(subscription as any).macAddress || "****"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-apple-gray-900">
                              ₦{subscription.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-apple-gray-600">
                              Ref: {subscription.paymentRef}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-apple-gray-600">
                            <div>
                              Paid:{" "}
                              {new Date(
                                subscription.paidAt,
                              ).toLocaleDateString()}
                            </div>
                            {subscription.activatedAt && (
                              <div className="text-green-600">
                                Activated:{" "}
                                {new Date(
                                  subscription.activatedAt,
                                ).toLocaleDateString()}
                              </div>
                            )}
                            {subscription.expiresAt && (
                              <div className="text-red-600">
                                Expires:{" "}
                                {new Date(
                                  subscription.expiresAt,
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {activeTab === "pending" && (
                              <button
                                onClick={() => handleActivate(subscription.id)}
                                disabled={activating === subscription.id}
                                className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-400 text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                              >
                                {activating === subscription.id
                                  ? "Activating..."
                                  : "Activate"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(subscription.id)}
                              disabled={deleting === subscription.id}
                              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deleting === subscription.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === "delete" ? "danger" : "warning"}
        confirmText={confirmModal.type === "delete" ? "Delete" : "Continue"}
      />
    </ProtectedRoute>
  );
}
