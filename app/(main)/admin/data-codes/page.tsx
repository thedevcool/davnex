"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Logo from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, RefreshCw, Trash2, LayoutGrid, Receipt, MessageSquare, Star } from "lucide-react";
import type { DataPlan, DataCode } from "@/types";

interface DataPurchase {
  id: string;
  planId: string;
  planName: string;
  usersCount: number;
  price: number;
  codeId: string;
  purchasedAt: Date;
}

interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  planName: string;
  type: "review" | "complaint";
  rating?: number;
  message: string;
  createdAt: string;
}

const USER_OPTIONS = [3, 5];

export default function AdminDataCodesPage() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const [planName, setPlanName] = useState("");
  const [usersCount, setUsersCount] = useState<number>(USER_OPTIONS[0]);
  const [price, setPrice] = useState<number>(0);
  const [codeInput, setCodeInput] = useState("");
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [isNewPlan, setIsNewPlan] = useState(true);
  const [codes, setCodes] = useState<DataCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<DataPurchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "review" | "complaint">("all");

  useEffect(() => {
    fetchPlans();
    fetchPurchases();
    fetchFeedback();
  }, []);

  const fetchPlans = async () => {
    if (!isFirebaseConfigured() || !db) return;

    try {
      const plansQuery = query(
        collection(db, "dataPlans"),
        orderBy("name", "asc"),
      );
      const snapshot = await getDocs(plansQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as DataPlan[];
      setPlans(data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  const fetchPurchases = async () => {
    if (!isFirebaseConfigured() || !db) return;
    setLoadingPurchases(true);

    try {
      const purchasesQuery = query(
        collection(db, "dataPurchases"),
        orderBy("purchasedAt", "desc"),
      );
      const snapshot = await getDocs(purchasesQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        purchasedAt: doc.data().purchasedAt?.toDate(),
      })) as DataPurchase[];
      setPurchases(data);
    } catch (err) {
      console.error("Error fetching purchases:", err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);

    try {
      const response = await fetch("/api/data-codes/feedback");
      const result = await response.json();
      
      if (response.ok) {
        setFeedback(result.feedback || []);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.price, 0);

  const selectedPlan = useMemo(() => {
    if (selectedPlanId && !isNewPlan) {
      return plans.find((plan) => plan.id === selectedPlanId);
    }
    const normalizedName = planName.trim().toLowerCase();
    return plans.find(
      (plan) =>
        plan.name.toLowerCase() === normalizedName &&
        plan.usersCount === usersCount &&
        plan.price === price,
    );
  }, [plans, planName, usersCount, price, selectedPlanId, isNewPlan]);

  const fetchCodes = async (targetPlanId: string) => {
    if (!isFirebaseConfigured() || !db) return;
    setLoadingCodes(true);
    try {
      const codesQuery = query(
        collection(db, "dataCodes"),
        where("planId", "==", targetPlanId),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(codesQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        planId: targetPlanId,
        codeMask: doc.data().codeMask,
        createdAt: doc.data().createdAt?.toDate(),
      })) as DataCode[];
      setCodes(data);
    } catch (err) {
      console.error("Error fetching codes:", err);
      setError("Failed to load codes for this plan.");
    } finally {
      setLoadingCodes(false);
    }
  };

  const handleLoadCodes = async () => {
    setError("");
    const plan = selectedPlan;
    if (!plan) {
      setError("No matching plan found. Add a code to create it first.");
      return;
    }

    setPlanId(plan.id);
    await fetchCodes(plan.id);
  };

  const handleAddCode = async () => {
    setError("");

    const currentPlanName = isNewPlan ? planName : selectedPlan?.name || "";
    const currentUsersCount = isNewPlan ? usersCount : selectedPlan?.usersCount || 0;
    const currentPrice = isNewPlan ? price : selectedPlan?.price || 0;

    if (!currentPlanName.trim() || !currentPrice || !codeInput.trim()) {
      setError("Please select/enter plan details and a code.");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch("/api/data-codes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName: currentPlanName.trim(),
          usersCount: currentUsersCount,
          price: currentPrice,
          code: codeInput.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to add code");
      }

      setPlanId(result.planId);
      if (!isNewPlan) {
        setSelectedPlanId(result.planId);
      }
      setCodes((prev) => [
        {
          id: result.codeId,
          planId: result.planId,
          codeMask: result.codeMask,
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setCodeInput("");
      await fetchPlans();
    } catch (err: any) {
      console.error("Error adding code:", err);
      setError(err?.message || "Failed to add code");
    } finally {
      setAdding(false);
    }
  };

  const handlePlanChange = (value: string) => {
    if (value === "new") {
      setIsNewPlan(true);
      setSelectedPlanId("");
      setPlanName("");
      setUsersCount(USER_OPTIONS[0]);
      setPrice(0);
      setPlanId(null);
      setCodes([]);
    } else {
      const plan = plans.find((p) => p.id === value);
      if (plan) {
        setIsNewPlan(false);
        setSelectedPlanId(value);
        setPlanName(plan.name);
        setUsersCount(plan.usersCount);
        setPrice(plan.price);
        setPlanId(plan.id);
        fetchCodes(plan.id);
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const handleDeleteCode = async (codeId: string, codeMask: string) => {
    if (
      !confirm(
        `Delete code ${codeMask}?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(codeId);
    setError("");

    try {
      const response = await fetch("/api/data-codes/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codeId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete code");
      }

      setCodes((prev) => prev.filter((code) => code.id !== codeId));
    } catch (err: any) {
      console.error("Error deleting code:", err);
      setError(err?.message || "Failed to delete code");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeletePlan = async (planToDelete: DataPlan) => {
    if (
      !confirm(
        `Delete plan "${planToDelete.name}" (${planToDelete.usersCount} Users - ₦${planToDelete.price.toLocaleString()})?\n\nThis will delete the plan and ALL associated codes.\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingPlan(planToDelete.id);
    setError("");

    try {
      const response = await fetch("/api/data-codes/delete-plan", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: planToDelete.id }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete plan");
      }

      // Remove plan from list
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      
      // Reset if this was the selected plan
      if (selectedPlanId === planToDelete.id) {
        setSelectedPlanId("");
        setIsNewPlan(true);
        setCodes([]);
        setPlanId(null);
      }

      alert(`Plan deleted successfully. ${result.deletedCodesCount} code(s) were also removed.`);
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      setError(err?.message || "Failed to delete plan");
    } finally {
      setDeletingPlan(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-apple-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Logo variant="dark" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
                    Data Codes
                  </h1>
                  <p className="text-sm text-apple-gray-600">
                    Lodge Internet • Fast and Reliable Hostel Internet
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPurchases(!showPurchases)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-colors shadow-sm"
                >
                  <Receipt className="w-4 h-4" />
                  {showPurchases ? "Hide" : "View"} Purchases
                </button>
                <button
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showFeedback ? "Hide" : "View"} Feedback
                </button>
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 text-sm font-medium text-apple-gray-700 hover:bg-apple-gray-100 rounded-lg transition-colors"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray-700 hover:bg-apple-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Purchases Log Section */}
          {showPurchases && (
            <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-apple-gray-800">
                    Purchase Log
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-apple-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₦{totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>

              {loadingPurchases ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-apple-gray-500">Loading purchases...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-apple-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-apple-gray-500">No purchases yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-apple-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-apple-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-apple-gray-700">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-apple-gray-700">Users</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-apple-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b border-apple-gray-100 hover:bg-apple-gray-50">
                          <td className="py-3 px-4 text-sm text-apple-gray-600">
                            {purchase.purchasedAt?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-apple-gray-900">
                            {purchase.planName}
                          </td>
                          <td className="py-3 px-4 text-sm text-apple-gray-600">
                            {purchase.usersCount} Users
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">
                            ₦{purchase.price.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex items-center justify-between text-sm text-apple-gray-600">
                    <span>{purchases.length} total purchase{purchases.length !== 1 ? 's' : ''}</span>
                    <button
                      onClick={fetchPurchases}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Existing Plans Section */}
          {plans.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-apple-gray-800">
                    All Data Plans
                  </h2>
                </div>
                <span className="text-sm text-apple-gray-500">
                  {plans.length} plan{plans.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="relative border border-apple-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold text-apple-gray-900 mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-apple-gray-600">
                        {plan.usersCount} Users
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ₦{plan.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeletePlan(plan)}
                        disabled={deletingPlan === plan.id}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete plan and all codes"
                      >
                        {deletingPlan === plan.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <KeyRound className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-apple-gray-800">
                  Add New Code
                </h2>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                    Select Plan
                  </label>
                  <select
                    value={isNewPlan ? "new" : selectedPlanId}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">+ Create New Plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.usersCount} Users - ₦
                        {plan.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {isNewPlan && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                        Data Plan Name
                      </label>
                      <input
                        type="text"
                        value={planName}
                        onChange={(event) => {
                          setPlanName(event.target.value);
                          setPlanId(null);
                          setCodes([]);
                        }}
                        className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g. Lodge Internet 10GB"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                        Number of Users
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {USER_OPTIONS.map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => {
                              setUsersCount(count);
                              setPlanId(null);
                              setCodes([]);
                            }}
                            className={`px-4 py-3 rounded-lg border font-semibold transition-all ${
                              usersCount === count
                                ? "border-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white"
                                : "border-apple-gray-200 text-apple-gray-700 hover:bg-apple-gray-50"
                            }`}
                          >
                            {count} Users
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                        Price (₦)
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(event) => {
                          setPrice(Number(event.target.value));
                          setPlanId(null);
                          setCodes([]);
                        }}
                        className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g. 3500"
                        min={0}
                      />
                    </div>
                  </>
                )}

                {!isNewPlan && selectedPlan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Selected Plan Details
                    </p>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>
                        <strong>Name:</strong> {selectedPlan.name}
                      </p>
                      <p>
                        <strong>Users:</strong> {selectedPlan.usersCount}
                      </p>
                      <p>
                        <strong>Price:</strong> ₦
                        {selectedPlan.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                    Access Code
                  </label>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(event) => setCodeInput(event.target.value)}
                    className="w-full px-4 py-3 border border-apple-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter one code"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleAddCode}
                    disabled={adding}
                    className="flex-1 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {adding ? "Adding..." : "Add Code"}
                  </button>
                  {!isNewPlan && (
                    <button
                      onClick={handleLoadCodes}
                      type="button"
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-apple-gray-200 text-apple-gray-700 rounded-lg hover:bg-apple-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reload
                    </button>
                  )}
                </div>

                <p className="text-xs text-apple-gray-500">
                  Codes are encrypted and hashed before storage. Only masked
                  values are shown here.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-apple-gray-800">
                    Added Codes
                  </h2>
                  <p className="text-sm text-apple-gray-500">
                    {planId
                      ? "Showing latest codes for this plan"
                      : "Select a plan and load codes"}
                  </p>
                </div>
                {selectedPlan && (
                  <span className="text-xs font-medium text-apple-gray-600 bg-apple-gray-100 px-3 py-1 rounded-full">
                    ₦{selectedPlan.price.toLocaleString()} •{" "}
                    {selectedPlan.usersCount} Users
                  </span>
                )}
              </div>

              {loadingCodes ? (
                <div className="text-sm text-apple-gray-500">
                  Loading codes...
                </div>
              ) : codes.length === 0 ? (
                <div className="text-sm text-apple-gray-500">
                  No codes added for this plan yet.
                </div>
              ) : (
                <ul className="space-y-3">
                  {codes.map((code) => (
                    <li
                      key={code.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 border border-apple-gray-200 rounded-lg hover:border-apple-gray-300 transition-colors"
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-mono text-sm text-apple-gray-700">
                          {code.codeMask}
                        </span>
                        <span className="text-xs text-apple-gray-500">
                          {code.createdAt
                            ? new Date(code.createdAt).toLocaleString()
                            : "Just now"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCode(code.id, code.codeMask)}
                        disabled={deleting === code.id}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete code"
                      >
                        {deleting === code.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Feedback Section */}
          {showFeedback && (
            <section className="bg-white rounded-2xl shadow-sm p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold text-apple-gray-800">
                    Customer Feedback
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFeedbackFilter("all")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        feedbackFilter === "all"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200"
                      }`}
                    >
                      All ({feedback.length})
                    </button>
                    <button
                      onClick={() => setFeedbackFilter("review")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        feedbackFilter === "review"
                          ? "bg-green-100 text-green-700"
                          : "bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200"
                      }`}
                    >
                      Reviews ({feedback.filter(f => f.type === "review").length})
                    </button>
                    <button
                      onClick={() => setFeedbackFilter("complaint")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        feedbackFilter === "complaint"
                          ? "bg-red-100 text-red-700"
                          : "bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200"
                      }`}
                    >
                      Complaints ({feedback.filter(f => f.type === "complaint").length})
                    </button>
                  </div>
                  <button
                    onClick={fetchFeedback}
                    className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {loadingFeedback ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-apple-gray-500">Loading feedback...</p>
                </div>
              ) : feedback.filter(f => feedbackFilter === "all" || f.type === feedbackFilter).length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-apple-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-apple-gray-500">
                    {feedbackFilter === "all" ? "No feedback yet" : `No ${feedbackFilter}s yet`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback
                    .filter(f => feedbackFilter === "all" || f.type === feedbackFilter)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`border-2 rounded-xl p-5 transition-all ${
                          item.type === "review"
                            ? "border-green-200 bg-green-50/50 hover:border-green-300"
                            : "border-red-200 bg-red-50/50 hover:border-red-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-2xl ${item.type === "review" ? "text-green-600" : "text-red-600"}`}>
                                {item.type === "review" ? "⭐" : "⚠️"}
                              </span>
                              <h3 className="font-semibold text-apple-gray-900">
                                {item.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.type === "review"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {item.type === "review" ? "Review" : "Complaint"}
                              </span>
                            </div>
                            <p className="text-sm text-apple-gray-600">
                              {item.email} • {item.planName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-apple-gray-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-apple-gray-400">
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {item.type === "review" && item.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= item.rating!
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-apple-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium text-apple-gray-700">
                              {item.rating}/5
                            </span>
                          </div>
                        )}

                        <div className={`p-4 rounded-lg ${
                          item.type === "review" ? "bg-white" : "bg-white"
                        }`}>
                          <p className="text-apple-gray-800 whitespace-pre-wrap">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
