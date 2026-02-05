import { NextResponse } from "next/server";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
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
    const planId = typeof body.planId === "string" ? body.planId.trim() : "";

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    const codesRef = collection(db, "dataCodes");
    const codeQuery = query(codesRef, where("planId", "==", planId));

    const snapshot = await getCountFromServer(codeQuery);
    const availableCount = snapshot.data().count;

    return NextResponse.json({
      available: availableCount > 0,
      count: availableCount,
    });
  } catch (error: any) {
    console.error("Error checking code availability:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check availability" },
      { status: 500 },
    );
  }
}
