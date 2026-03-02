import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendEmail, sendBulkEmail } from "@/lib/email/emailService";
import { getPromotionalEmail } from "@/lib/email/emailTemplates";

/**
 * POST /api/email/send-direct
 *
 * Admin-only endpoint. Sends an email to one or more specific addresses.
 * Authentication is checked via the `davnex-admin` session cookie (set at login).
 *
 * Body:
 *   to        – single email string OR comma-separated OR array of strings
 *   subject   – email subject line
 *   message   – email body (HTML supported)
 *   ctaText   – optional button text
 *   ctaUrl    – optional button URL
 *   imageUrl  – optional header image
 *   senderName – optional sender display name (default: "Davnex Store")
 */
export async function POST(request: NextRequest) {
  // Verify admin session cookie
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("davnex-admin")?.value === "true";
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { to, subject, message, ctaText, ctaUrl, imageUrl, senderName } =
      body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "to, subject, and message are required" },
        { status: 400 },
      );
    }

    // Normalise `to` into an array of trimmed, non-empty addresses
    let recipients: string[] = [];
    if (Array.isArray(to)) {
      recipients = to.map((e: string) => e.trim()).filter(Boolean);
    } else if (typeof to === "string") {
      recipients = to
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No valid recipients provided" },
        { status: 400 },
      );
    }

    // Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = recipients.filter((e) => !emailRegex.test(e));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid email address(es): ${invalid.join(", ")}` },
        { status: 400 },
      );
    }

    const emailHtml = getPromotionalEmail({
      title: subject,
      message,
      ctaText,
      ctaUrl,
      imageUrl,
    });

    let successCount: number;
    let failureCount: number;
    let errors: string[];

    if (recipients.length === 1) {
      // Single recipient – use sendEmail directly
      await sendEmail({
        to: recipients[0],
        subject,
        html: emailHtml,
        text: message.replace(/<[^>]+>/g, ""), // strip HTML for plain-text fallback
        senderName: senderName || "Davnex Store",
      });
      successCount = 1;
      failureCount = 0;
      errors = [];
    } else {
      // Multiple recipients – use bulk sender with batching
      const result = await sendBulkEmail({
        recipients: recipients.map((email) => ({ email })),
        subject,
        getHtml: () => emailHtml,
        getText: () => message.replace(/<[^>]+>/g, ""),
        senderName: senderName || "Davnex Store",
      });
      successCount = result.successCount;
      failureCount = result.failureCount;
      errors = result.errors;
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${successCount} of ${recipients.length} recipient(s)`,
      sent: successCount,
      failed: failureCount,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[send-direct] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send email" },
      { status: 500 },
    );
  }
}
