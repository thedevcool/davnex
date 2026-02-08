import { NextResponse } from "next/server";
import { deleteDoc, doc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export async function DELETE(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("id");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
      );
    }

    // Delete the subscription document
    const subscriptionRef = doc(db, "tvSubscriptions", subscriptionId);
    await deleteDoc(subscriptionRef);

    return NextResponse.json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 },
    );
  }
}
