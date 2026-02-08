import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { hashMacAddress, encryptMacAddress } from "@/lib/macAddressCrypto";
import { sendEmail } from "@/lib/email/emailService";
import {
  getTVSubscriptionCreatedEmail,
  getTVSubscriptionAdminNotification,
} from "@/lib/email/emailTemplates";

export async function POST(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const macAddress =
      typeof body.macAddress === "string" ? body.macAddress.trim() : "";
    const planId = typeof body.planId === "string" ? body.planId : "";
    const paymentRef =
      typeof body.paymentRef === "string" ? body.paymentRef : "";
    const isNewUser = body.isNewUser === true;

    if (!email || !planId || !paymentRef) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // For new users, name and MAC address are required
    if (isNewUser && (!name || !macAddress)) {
      return NextResponse.json(
        { error: "Name and MAC address are required for new users" },
        { status: 400 },
      );
    }

    // Get plan details
    const planRef = doc(db, "dataPlans", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().planType !== "tv") {
      return NextResponse.json({ error: "Invalid TV plan" }, { status: 404 });
    }

    const plan = planSnap.data();

    // Create subscription data
    const subscriptionData: any = {
      email,
      planId,
      planName: plan.name,
      duration: plan.duration,
      price: plan.price,
      paymentRef,
      paymentStatus: "paid",
      subscriptionStatus: "pending_activation",
      paidAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (isNewUser) {
      subscriptionData.name = name;
      subscriptionData.macAddressHash = encryptMacAddress(macAddress); // Store encrypted for admin viewing
      // User ID will be added after account creation
      subscriptionData.userId = "";
    }

    // Create subscription
    const subscriptionsRef = collection(db, "tvSubscriptions");
    const newSubscription = await addDoc(subscriptionsRef, subscriptionData);

    // Send email notifications
    try {
      // Email to customer
      const customerEmailHtml = getTVSubscriptionCreatedEmail({
        customerName: isNewUser ? name : email.split("@")[0],
        customerEmail: email,
        planName: plan.name,
        duration: plan.duration,
        price: plan.price,
        paymentRef,
      });

      await sendEmail({
        to: email,
        subject: `TV Unlimited Subscription Created - ${plan.name}`,
        html: customerEmailHtml,
        senderName: "Lodge Internet",
      });

      console.log(`Subscription creation email sent to ${email}`);

      // Email to admin
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const adminEmailHtml = getTVSubscriptionAdminNotification({
          customerName: isNewUser ? name : email.split("@")[0],
          customerEmail: email,
          macAddress: isNewUser ? macAddress : "Existing user - no MAC update",
          planName: plan.name,
          duration: plan.duration,
          price: plan.price,
          paymentRef,
          subscriptionId: newSubscription.id,
        });

        await sendEmail({
          to: adminEmail,
          subject: `New TV Subscription - ${plan.name} - ${isNewUser ? name : email}`,
          html: adminEmailHtml,
          senderName: "Lodge Internet",
        });

        console.log(`Admin notification email sent`);
      }
    } catch (emailError) {
      console.error("Error sending subscription emails:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      subscriptionId: newSubscription.id,
      isNewUser,
      message: isNewUser
        ? "Payment successful. Please create your password to access your dashboard."
        : "Payment successful. Your subscription is pending admin activation.",
    });
  } catch (error: any) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process purchase" },
      { status: 500 },
    );
  }
}
