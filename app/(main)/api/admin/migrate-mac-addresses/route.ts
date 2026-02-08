import { NextResponse } from "next/server";
import { collection, doc, getDocs, query, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export async function POST(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    // Get all TV subscriptions
    const subscriptionsRef = collection(db, "tvSubscriptions");
    const snapshot = await getDocs(subscriptionsRef);

    let updatedCount = 0;
    const errors: string[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Check if this subscription has a macAddressHash that looks like a hash (64 chars, hex)
      if (data.macAddressHash && /^[a-f0-9]{64}$/.test(data.macAddressHash)) {
        try {
          // This is a hash, we can't recover the original MAC address
          // Set it to null so admin knows it needs to be re-entered
          await updateDoc(doc(db, "tvSubscriptions", docSnap.id), {
            macAddressHash: null,
            migrationNote:
              "MAC address was hashed and cannot be recovered. Please ask user to provide MAC address again.",
            updatedAt: new Date(),
          });

          updatedCount++;
        } catch (error) {
          errors.push(`Failed to update subscription ${docSnap.id}: ${error}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. Updated ${updatedCount} subscriptions.`,
      updatedCount,
      errors,
    });
  } catch (error: any) {
    console.error("Error migrating MAC addresses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to migrate MAC addresses" },
      { status: 500 },
    );
  }
}
