import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendBulkEmail } from "@/lib/email/emailService";
import { getPromotionalEmail } from "@/lib/email/emailTemplates";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * POST /api/email/promotional
 * Sends a broadcast to all users who have opted in to promotional emails.
 * Requires the `davnex-admin` session cookie (set at admin login).
 */
export async function POST(request: NextRequest) {
  // Verify admin session cookie
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("davnex-admin")?.value === "true";
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, message, ctaText, ctaUrl, imageUrl } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: "title and message are required" },
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
      where("emailPreferences.promotional", "==", true),
    );
    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "No users have opted in to promotional emails",
        sent: 0,
        total: 0,
      });
    }

    const emailHtml = getPromotionalEmail({
      title,
      message,
      ctaText,
      ctaUrl,
      imageUrl,
    });
    const recipients = snapshot.docs.map((d) => ({
      email: d.data().email as string,
      name: d.data().displayName as string | undefined,
    }));

    const result = await sendBulkEmail({
      recipients,
      subject: title,
      getHtml: () => emailHtml,
      getText: () => message,
    });

    return NextResponse.json({
      success: true,
      message: `Promotional email sent to ${result.successCount} of ${recipients.length} recipients`,
      sent: result.successCount,
      failed: result.failureCount,
      total: recipients.length,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error("[promotional] Error:", error);
    return NextResponse.json(
      { error: "Failed to send promotional email" },
      { status: 500 },
    );
  }
}
