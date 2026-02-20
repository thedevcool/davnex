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
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    // Send admin summary email if there were any notifications sent
    if (
      (results.expiringSoonNotifications > 0 ||
        results.expiredNotifications > 0) &&
      process.env.ADMIN_EMAIL
    ) {
      try {
        const adminSummary = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
              .stat-box { background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 15px 0; }
              .stat-number { font-size: 32px; font-weight: bold; color: #0071e3; }
              .warning { color: #f59e0b; }
              .error { color: #ef4444; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📊 TV Subscription Expiry Check Summary</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Daily automated check completed</p>
              </div>
              
              <div class="stat-box">
                <p style="margin: 0; color: #86868b;">Expiring Soon (24h warning sent)</p>
                <p class="stat-number warning">${results.expiringSoonNotifications}</p>
              </div>
              
              <div class="stat-box">
                <p style="margin: 0; color: #86868b;">Subscriptions Expired</p>
                <p class="stat-number error">${results.expiredNotifications}</p>
              </div>
              
              ${
                results.errors.length > 0
                  ? `
              <div class="stat-box" style="border-left: 4px solid #ef4444;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #991b1b;">⚠️ Errors (${results.errors.length})</p>
                <ul style="margin: 0; padding-left: 20px; color: #86868b;">
                  ${results.errors.map((err) => `<li>${err}</li>`).join("")}
                </ul>
              </div>
              `
                  : ""
              }
              
              <p style="margin-top: 30px; color: #86868b;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/tv-users" style="color: #0071e3; text-decoration: none;">View TV Users Dashboard →</a>
              </p>
              
              <p style="font-size: 12px; color: #86868b; margin-top: 30px;">
                Automated report from Davnex Lodge Internet<br/>
                ${new Date().toLocaleString()}
              </p>
            </div>
          </body>
          </html>
        `;

        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `TV Subscription Expiry Summary - ${results.expiringSoonNotifications} expiring, ${results.expiredNotifications} expired`,
          html: adminSummary,
          senderName: "Davnex System",
        });

        console.log("Admin summary email sent successfully");
      } catch (error) {
        console.error("Error sending admin summary email:", error);
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
