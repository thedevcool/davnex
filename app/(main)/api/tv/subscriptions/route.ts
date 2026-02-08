import { NextResponse } from "next/server";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { decryptMacAddress } from "@/lib/macAddressCrypto";

export async function GET(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const status = searchParams.get("status"); // pending_activation, active, expired
    const isAdmin = searchParams.get("isAdmin") === "true";

    const subscriptionsRef = collection(db, "tvSubscriptions");
    let subscriptionQuery;

    if (userId) {
      // Get subscriptions for a specific user
      subscriptionQuery = query(
        subscriptionsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );
    } else if (email) {
      // Get subscriptions by email
      subscriptionQuery = query(
        subscriptionsRef,
        where("email", "==", email.toLowerCase()),
        orderBy("createdAt", "desc"),
      );
    } else if (status) {
      // Get subscriptions by status (admin only)
      subscriptionQuery = query(
        subscriptionsRef,
        where("subscriptionStatus", "==", status),
        orderBy("createdAt", "desc"),
      );
    } else {
      // Get all subscriptions (admin only)
      subscriptionQuery = query(subscriptionsRef, orderBy("createdAt", "desc"));
    }

    const snapshot = await getDocs(subscriptionQuery);
    const subscriptions = snapshot.docs.map((doc) => {
      const data = doc.data();
      const subscription: any = {
        id: doc.id,
        ...data,
        paidAt: data.paidAt?.toDate().toISOString(),
        activatedAt: data.activatedAt?.toDate().toISOString(),
        expiresAt: data.expiresAt?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      };

      // Decrypt MAC address for admin only
      if (isAdmin) {
        if (data.macAddressHash) {
          try {
            subscription.macAddress = decryptMacAddress(data.macAddressHash);
          } catch (e) {
            subscription.macAddress = "Error decrypting (invalid format)";
          }
        } else if (data.migrationNote) {
          subscription.macAddress = "MAC address needs re-entry";
        } else {
          subscription.macAddress = "No MAC address stored";
        }
      }

      // Don't send hash to client
      delete subscription.macAddressHash;

      return subscription;
    });

    return NextResponse.json({
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscriptions" },
      { status: 500 },
    );
  }
}
