import { NextRequest, NextResponse } from "next/server";
import { sendBulkEmail } from "@/lib/email/emailService";
import { getBackInStockEmail } from "@/lib/email/emailTemplates";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, productPrice, productImage } =
      await request.json();

    if (!productId || !productName || !productPrice) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: productId, productName, productPrice",
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

    const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/product/${productId}`;

    const usersQuery = query(
      collection(db, "users"),
      where("emailPreferences.stockAlerts", "==", true),
      where("watchlist", "array-contains", productId),
    );
    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "No users are watching this product",
        sent: 0,
        total: 0,
      });
    }

    const recipients = snapshot.docs.map((d) => ({
      email: d.data().email as string,
      name: (d.data().displayName as string | undefined) ?? "Customer",
    }));

    const result = await sendBulkEmail({
      recipients,
      subject: `${productName} is Back in Stock! 🎉`,
      getHtml: (r) =>
        getBackInStockEmail(r.name ?? "Customer", {
          name: productName,
          price: productPrice,
          image: productImage,
          url: productUrl,
        }),
      getText: () =>
        `${productName} is back in stock! Order now: ${productUrl}`,
    });

    return NextResponse.json({
      success: true,
      message: `Back-in-stock notification sent to ${result.successCount} of ${recipients.length} watchers`,
      sent: result.successCount,
      failed: result.failureCount,
      total: recipients.length,
    });
  } catch (error) {
    console.error("[back-in-stock] Error:", error);
    return NextResponse.json(
      { error: "Failed to send back-in-stock notifications" },
      { status: 500 },
    );
  }
}
