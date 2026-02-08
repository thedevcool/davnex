import { NextResponse } from "next/server";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export async function POST(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email exists in tvSubscriptions collection
    const subscriptionsRef = collection(db, "tvSubscriptions");
    const subscriptionQuery = query(
      subscriptionsRef,
      where("email", "==", email),
      limit(1),
    );
    const subscriptionSnapshot = await getDocs(subscriptionQuery);

    if (!subscriptionSnapshot.empty) {
      // User exists
      return NextResponse.json({
        exists: true,
        message: "Account found",
      });
    }

    // User doesn't exist
    return NextResponse.json({
      exists: false,
      message: "No account found",
    });
  } catch (error: any) {
    console.error("Error checking account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check account" },
      { status: 500 },
    );
  }
}
