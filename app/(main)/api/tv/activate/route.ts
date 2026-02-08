import { NextResponse } from "next/server";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { sendEmail } from "@/lib/email/emailService";
import { getTVSubscriptionActivatedEmail } from "@/lib/email/emailTemplates";

export async function POST(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const subscriptionId =
      typeof body.subscriptionId === "string" ? body.subscriptionId : "";

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
      );
    }

    // Get subscription
    const subscriptionRef = doc(db, "tvSubscriptions", subscriptionId);
    const subscriptionSnap = await getDoc(subscriptionRef);

    if (!subscriptionSnap.exists()) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    const subscription = subscriptionSnap.data();

    // Check if already active
    if (subscription.subscriptionStatus === "active") {
      return NextResponse.json(
        { error: "Subscription is already active" },
        { status: 400 },
      );
    }

    // Activate subscription
    const activatedAt = new Date();
    const expiresAt = new Date(
      activatedAt.getTime() + subscription.duration * 24 * 60 * 60 * 1000,
    );

    await updateDoc(subscriptionRef, {
      subscriptionStatus: "active",
      activatedAt: serverTimestamp(),
      expiresAt,
      updatedAt: serverTimestamp(),
    });

    // Send activation email to customer
    try {
      const activationEmailHtml = getTVSubscriptionActivatedEmail({
        customerName: subscription.name || subscription.email.split("@")[0],
        planName: subscription.planName,
        duration: subscription.duration,
        activatedAt: activatedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });

      await sendEmail({
        to: subscription.email,
        subject: `Your TV Subscription is Now Active! - ${subscription.planName}`,
        html: activationEmailHtml,
        senderName: "Lodge Internet",
      });

      console.log(`Activation email sent to ${subscription.email}`);
    } catch (emailError) {
      console.error("Error sending activation email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
      activatedAt,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Error activating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate subscription" },
      { status: 500 },
    );
  }
}
