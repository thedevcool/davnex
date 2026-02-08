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
    const planType = body.planType === "tv" ? "tv" : "device";
    const usersCount = Number(body.usersCount) || undefined;
    const duration = Number(body.duration) || undefined;
    const price = Number(body.price);
    const rawCode = typeof body.code === "string" ? body.code : "";

    // Validate required fields
    if (!planName || !price) {
      return NextResponse.json(
        { error: "Plan name and price are required" },
        { status: 400 },
      );
    }

    // Validate plan-specific requirements
    if (planType === "device" && !usersCount) {
      return NextResponse.json(
        { error: "Users count is required for device plans" },
        { status: 400 },
      );
    }

    if (planType === "device" && !rawCode.trim()) {
      return NextResponse.json(
        { error: "Access code is required for device plans" },
        { status: 400 },
      );
    }

    if (planType === "tv" && !duration) {
      return NextResponse.json(
        { error: "Duration is required for TV plans" },
        { status: 400 },
      );
    }

    const plansRef = collection(db, "dataPlans");

    // Build query based on plan type
    let planQuery;
    if (planType === "device") {
      planQuery = query(
        plansRef,
        where("name", "==", planName),
        where("planType", "==", "device"),
        where("usersCount", "==", usersCount),
        where("price", "==", price),
        limit(1),
      );
    } else {
      planQuery = query(
        plansRef,
        where("name", "==", planName),
        where("planType", "==", "tv"),
        where("duration", "==", duration),
        where("price", "==", price),
        limit(1),
      );
    }

    const planSnapshot = await getDocs(planQuery);

    let planId: string;
    if (planSnapshot.empty) {
      // Create new plan with appropriate fields
      const planData: any = {
        name: planName,
        planType,
        price,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (planType === "device") {
        planData.usersCount = usersCount;
      } else {
        planData.duration = duration;
      }

      const created = await addDoc(plansRef, planData);
      planId = created.id;
    } else {
      const existing = planSnapshot.docs[0];
      planId = existing.id;
      await updateDoc(existing.ref, { updatedAt: serverTimestamp() });
    }

    // For TV plans, we're done - no codes needed
    if (planType === "tv") {
      return NextResponse.json({
        planId,
        message: "TV plan created successfully",
      });
    }

    // For device plans, create the code
    const normalizedCode = normalizeCode(rawCode);
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
