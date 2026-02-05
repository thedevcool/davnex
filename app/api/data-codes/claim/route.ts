import { NextResponse } from "next/server";
import {
  collection,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { decryptCode } from "@/lib/dataCodeCrypto";

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
    const codeQuery = query(
      codesRef,
      where("planId", "==", planId),
      orderBy("createdAt", "asc"),
      limit(1),
    );

    const codeSnapshot = await getDocs(codeQuery);
    if (codeSnapshot.empty) {
      return NextResponse.json(
        { error: "No available codes for this plan" },
        { status: 404 },
      );
    }

    const codeDoc = codeSnapshot.docs[0];
    const data = codeDoc.data();
    const decryptedCode = decryptCode(data.encryptedCode as string);

    await deleteDoc(codeDoc.ref);

    return NextResponse.json({
      code: decryptedCode,
    });
  } catch (error) {
    console.error("Error claiming data code:", error);
    return NextResponse.json(
      { error: "Failed to claim data code" },
      { status: 500 },
    );
  }
}
