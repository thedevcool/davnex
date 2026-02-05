"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Logo from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Receipt, Download, Search } from "lucide-react";

interface DataPurchase {
  id: string;
  planId: string;
  planName: string;
  usersCount: number;
  price: number;
  codeId: string;
  purchasedAt: Date;
  customerEmail?: string;
}

export default function PurchaseLogsPage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [purchases, setPurchases] = useState<DataPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    if (!isFirebaseConfigured() || !db) {
      setLoading(false);
      return;
    }

    try {
      const purchasesQuery = query(
        collection(db, "dataPurchases"),
        orderBy("purchasedAt", "desc")
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
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.price, 0);
  const uniquePlans = Array.from(new Set(purchases.map(p => p.planName)));

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = searchTerm === "" || 
      purchase.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = filterPlan === "all" || purchase.planName === filterPlan;
    
    return matchesSearch && matchesPlan;
  });

  const exportToCSV = () => {
    const headers = ["Date", "Plan Name", "Users", "Price", "Customer Email"];
    const rows = filteredPurchases.map(p => [
      p.purchasedAt.toLocaleDateString(),
      p.planName,
      p.usersCount,
      `₦${p.price.toFixed(2)}`,
      p.customerEmail || "N/A"
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-apple-gray-50">
        <header className="bg-white shadow-sm border-b border-apple-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo variant="dark" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 bg-clip-text text-transparent">
                  Purchase Logs
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray-700 hover:bg-apple-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-apple-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-apple-gray-900">
                    {purchases.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-apple-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-apple-gray-900">
                    ₦{totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-apple-gray-600">Unique Plans</p>
                  <p className="text-2xl font-bold text-apple-gray-900">
                    {uniquePlans.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-apple-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by plan or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-4 py-2 border border-apple-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Plans</option>
                  {uniquePlans.map(plan => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
                <button
                  onClick={exportToCSV}
                  disabled={filteredPurchases.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 via-blue-500 to-black-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Purchases Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-apple-gray-500">
                  Loading purchases...
                </div>
              ) : filteredPurchases.length === 0 ? (
                <div className="p-8 text-center text-apple-gray-500">
                  {searchTerm || filterPlan !== "all" ? "No purchases match your filters" : "No purchases yet"}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-apple-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-apple-gray-200">
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-apple-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                          {purchase.purchasedAt.toLocaleDateString()} {purchase.purchasedAt.toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-apple-gray-900">
                            {purchase.planName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                          {purchase.usersCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ₦{purchase.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-900">
                          {purchase.customerEmail || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Summary */}
          {filteredPurchases.length > 0 && (
            <div className="mt-4 text-sm text-apple-gray-600 text-right">
              Showing {filteredPurchases.length} of {purchases.length} purchases
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
