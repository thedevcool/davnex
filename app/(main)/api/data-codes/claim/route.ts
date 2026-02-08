import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { decryptCode } from "@/lib/dataCodeCrypto";
import { sendEmail } from "@/lib/email/emailService";
import { getDeviceCodeEmail } from "@/lib/email/emailTemplates";

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
    const customerEmail =
      typeof body.email === "string" ? body.email.trim() : "";

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

    // Get plan details
    const planRef = doc(db, "dataPlans", planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const planData = planDoc.data();

    // Log the purchase
    await addDoc(collection(db, "dataPurchases"), {
      planId: planId,
      planName: planData.name,
      usersCount: planData.usersCount,
      price: planData.price,
      codeId: codeDoc.id,
      customerEmail: customerEmail || "N/A",
      purchasedAt: new Date(),
    });

    // Delete the code
    await deleteDoc(codeDoc.ref);

    // Send email to customer with the code
    if (customerEmail && customerEmail !== "N/A") {
      try {
        const emailHtml = getDeviceCodeEmail({
          customerEmail,
          planName: planData.name,
          usersCount: planData.usersCount || 0,
          duration: planData.duration
            ? `${planData.duration} days`
            : "As specified",
          price: planData.price,
          code: decryptedCode,
        });

        await sendEmail({
          to: customerEmail,
          subject: `Your Lodge Internet Access Code - ${planData.name}`,
          html: emailHtml,
          senderName: "Lodge Internet",
        });

        console.log(`Access code email sent to ${customerEmail}`);
      } catch (emailError) {
        console.error("Error sending code email:", emailError);
        // Don't fail the request if email fails
      }
    }

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
