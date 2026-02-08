import { NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
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
    const userId = typeof body.userId === "string" ? body.userId : "";
    const subscriptionId =
      typeof body.subscriptionId === "string" ? body.subscriptionId : "";

    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Update subscription with userId
    const subscriptionRef = doc(db, "tvSubscriptions", subscriptionId);
    await updateDoc(subscriptionRef, {
      userId: userId,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Account linked to subscription successfully.",
    });
  } catch (error: any) {
    console.error("Error linking account to subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to link account to subscription" },
      { status: 500 },
    );
  }
}
