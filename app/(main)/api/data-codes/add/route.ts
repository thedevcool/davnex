import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  encryptCode,
  hashCode,
  maskCode,
  normalizeCode,
} from "@/lib/dataCodeCrypto";

export async function POST(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const planName =
      typeof body.planName === "string" ? body.planName.trim() : "";
    const usersCount = Number(body.usersCount);
    const price = Number(body.price);
    const rawCode = typeof body.code === "string" ? body.code : "";

    if (!planName || !usersCount || !price || !rawCode.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const normalizedCode = normalizeCode(rawCode);
    const plansRef = collection(db, "dataPlans");
    const planQuery = query(
      plansRef,
      where("name", "==", planName),
      where("usersCount", "==", usersCount),
      where("price", "==", price),
      limit(1),
    );
    const planSnapshot = await getDocs(planQuery);

    let planId: string;
    if (planSnapshot.empty) {
      const created = await addDoc(plansRef, {
        name: planName,
        usersCount,
        price,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      planId = created.id;
    } else {
      const existing = planSnapshot.docs[0];
      planId = existing.id;
      await updateDoc(existing.ref, { updatedAt: serverTimestamp() });
    }

    const codesRef = collection(db, "dataCodes");
    const codeHash = hashCode(normalizedCode);
    const duplicateQuery = query(
      codesRef,
      where("planId", "==", planId),
      where("codeHash", "==", codeHash),
      limit(1),
    );
    const duplicateSnapshot = await getDocs(duplicateQuery);
    if (!duplicateSnapshot.empty) {
      return NextResponse.json(
        { error: "This code already exists for the selected plan" },
        { status: 409 },
      );
    }

    const encryptedCode = encryptCode(normalizedCode);
    const codeMask = maskCode(normalizedCode);

    const createdCode = await addDoc(codesRef, {
      planId,
      codeHash,
      codeMask,
      encryptedCode,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      planId,
      codeId: createdCode.id,
      codeMask,
    });
  } catch (error) {
    console.error("Error adding data code:", error);
    return NextResponse.json(
      { error: "Failed to add data code" },
      { status: 500 },
    );
  }
}
