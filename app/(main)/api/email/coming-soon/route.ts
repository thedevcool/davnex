import { NextRequest, NextResponse } from "next/server";
import { sendBulkEmail } from "@/lib/email/emailService";
import { getComingSoonEmail } from "@/lib/email/emailTemplates";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const {
      productId,
      productName,
      productPrice,
      productImage,
      availableDate,
    } = await request.json();

    if (!productId || !productName || !productPrice || !availableDate) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: productId, productName, productPrice, availableDate",
        },
        { status: 400 },
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 },
      );
    }

    const usersQuery = query(
      collection(db, "users"),
      where("emailPreferences.comingSoon", "==", true),
    );
    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "No users have opted in for coming-soon alerts",
        sent: 0,
        total: 0,
      });
    }

    const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/product/${productId}`;
    const availableDateObj = new Date(availableDate);
    const recipients = snapshot.docs.map((d) => ({
      email: d.data().email as string,
      name: (d.data().displayName as string | undefined) ?? "Customer",
    }));

    const result = await sendBulkEmail({
      recipients,
      subject: `Coming Soon: ${productName} ⏳`,
      getHtml: (r) =>
        getComingSoonEmail(r.name ?? "Customer", {
          name: productName,
          price: productPrice,
          image: productImage,
          availableDate: availableDateObj,
          url: productUrl,
        }),
      getText: () =>
        `${productName} is coming soon to Davnex Store! Available: ${availableDateObj.toLocaleDateString()}`,
    });

    return NextResponse.json({
      success: true,
      message: `Coming-soon notification sent to ${result.successCount} of ${recipients.length} users`,
      sent: result.successCount,
      failed: result.failureCount,
      total: recipients.length,
    });
  } catch (error) {
    console.error("[coming-soon] Error:", error);
    return NextResponse.json(
      { error: "Failed to send coming-soon notifications" },
      { status: 500 },
    );
  }
}
