import { NextRequest, NextResponse } from "next/server";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase not configured" },
      { status: 500 }
    );
  }

  try {
    const purchasesQuery = query(
      collection(db, "dataPurchases"),
      orderBy("purchasedAt", "desc")
    );
    
    const snapshot = await getDocs(purchasesQuery);
    const purchases = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      purchasedAt: doc.data().purchasedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
