import { NextResponse } from "next/server";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export async function DELETE(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const planId = typeof body.planId === "string" ? body.planId.trim() : "";

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // Delete all codes associated with this plan first
    const codesRef = collection(db, "dataCodes");
    const codesQuery = query(codesRef, where("planId", "==", planId));
    const codesSnapshot = await getDocs(codesQuery);

    const deletePromises = codesSnapshot.docs.map((codeDoc) =>
      deleteDoc(codeDoc.ref)
    );
    await Promise.all(deletePromises);

    // Delete the plan itself
    const planRef = doc(db, "dataPlans", planId);
    await deleteDoc(planRef);

    return NextResponse.json({
      success: true,
      message: "Plan and all associated codes deleted successfully",
      deletedCodesCount: codesSnapshot.size,
    });
  } catch (error: any) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete plan" },
      { status: 500 },
    );
  }
}
