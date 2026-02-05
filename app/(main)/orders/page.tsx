"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { Order } from "@/types";
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const orderStatusConfig = {
  packing: {
    label: "Packing",
    icon: Package,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Your order is being prepared",
    progress: 25,
  },
  "on-the-way": {
    label: "On the Way",
    icon: Truck,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Your order is out for delivery",
    progress: 75,
  },
  "delivered-station": {
    label: "Delivered to Station",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Ready for pickup at station",
    progress: 100,
  },
  "delivered-doorstep": {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Delivered to your doorstep",
    progress: 100,
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!isFirebaseConfigured() || !db || !user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.id),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Order[];

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-apple-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-apple-gray-600 hover:text-apple-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Store
        </button>

        <h1 className="text-4xl font-bold text-apple-gray-900 mb-8">
          <span className="text-blue-600">Your orders.</span>{" "}
          <span className="text-gray-600">Track your purchases</span>
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 text-apple-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-apple-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-apple-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = orderStatusConfig[order.orderStatus];
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b">
                    <div>
                      <h3 className="text-lg font-semibold text-apple-gray-900 mb-1">
                        Order #{order.paystackReference}
                      </h3>
                      <p className="text-sm text-apple-gray-600">
                        Placed on{" "}
                        {order.createdAt?.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bgColor}`}>
                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      <span className={`font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-apple-gray-700">
                        {statusInfo.description}
                      </p>
                      <span className="text-sm font-semibold text-blue-600">
                        {statusInfo.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-apple-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${statusInfo.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-20 h-20 object-contain bg-apple-gray-50 rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-apple-gray-900">
                            {item.productName}
                          </h4>
                          <p className="text-sm text-apple-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-apple-gray-900">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t">
                    <div className="space-y-1">
                      <p className="text-sm text-apple-gray-600">
                        <span className="font-medium">Delivery:</span>{" "}
                        {order.deliveryMethod === "door-to-door"
                          ? "Door-to-Door"
                          : "Station Pickup"}
                      </p>
                      <p className="text-sm text-apple-gray-600">
                        <span className="font-medium">Payment:</span>{" "}
                        <span
                          className={
                            order.paymentStatus === "paid"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        >
                          {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-apple-gray-600 mb-1">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-apple-gray-900">
                        ₦{order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
