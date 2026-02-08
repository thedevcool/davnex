import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { sendEmail } from "@/lib/email/emailService";
import {
  getTVSubscriptionExpiringSoonEmail,
  getTVSubscriptionExpiredEmail,
} from "@/lib/email/emailTemplates";

/**
 * API route to check for expiring and expired TV subscriptions
 * This should be called by a cron job daily
 * Can be manually triggered from admin panel
 */
export async function POST(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const results = {
      expiringSoonNotifications: 0,
      expiredNotifications: 0,
      errors: [] as string[],
    };

    // Check for subscriptions expiring in the next 24 hours
    const subscriptionsRef = collection(db, "tvSubscriptions");
    const activeQuery = query(
      subscriptionsRef,
      where("subscriptionStatus", "==", "active"),
    );

    const activeSnap = await getDocs(activeQuery);

    for (const subscriptionDoc of activeSnap.docs) {
      const subscription = subscriptionDoc.data();
      const expiresAt = subscription.expiresAt?.toDate();

      if (!expiresAt) continue;

      // Check if expired
      if (expiresAt <= now) {
        try {
          // Update status to expired
          await updateDoc(doc(db, "tvSubscriptions", subscriptionDoc.id), {
            subscriptionStatus: "expired",
            updatedAt: new Date(),
          });

          // Send expired email
          const expiredEmailHtml = getTVSubscriptionExpiredEmail({
            customerName: subscription.name || subscription.email.split("@")[0],
            planName: subscription.planName,
            expiredAt: expiresAt.toISOString(),
          });

          await sendEmail({
            to: subscription.email,
            subject: `Your TV Subscription Has Expired - ${subscription.planName}`,
            html: expiredEmailHtml,
            senderName: "Lodge Internet",
          });

          results.expiredNotifications++;
          console.log(`Expired notification sent to ${subscription.email}`);
        } catch (error) {
          console.error(
            `Error processing expired subscription ${subscriptionDoc.id}:`,
            error,
          );
          results.errors.push(`Failed to process ${subscription.email}`);
        }
      }
      // Check if expiring soon (within next 24 hours) and not already notified
      else if (expiresAt <= tomorrow && !subscription.expiryReminderSent) {
        try {
          // Send expiring soon email
          const expiringEmailHtml = getTVSubscriptionExpiringSoonEmail({
            customerName: subscription.name || subscription.email.split("@")[0],
            planName: subscription.planName,
            expiresAt: expiresAt.toISOString(),
          });

          await sendEmail({
            to: subscription.email,
            subject: `Your TV Subscription Expires Soon - ${subscription.planName}`,
            html: expiringEmailHtml,
            senderName: "Lodge Internet",
          });

          // Mark as notified
          await updateDoc(doc(db, "tvSubscriptions", subscriptionDoc.id), {
            expiryReminderSent: true,
            updatedAt: new Date(),
          });

          results.expiringSoonNotifications++;
          console.log(`Expiry reminder sent to ${subscription.email}`);
        } catch (error) {
          console.error(
            `Error sending expiry reminder to ${subscription.email}:`,
            error,
          );
          results.errors.push(`Failed to notify ${subscription.email}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Expiry check completed",
      results,
    });
  } catch (error: any) {
    console.error("Error checking subscription expiry:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check subscription expiry" },
      { status: 500 },
    );
  }
}
