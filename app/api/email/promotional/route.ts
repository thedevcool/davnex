import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/emailService';
import { getPromotionalEmail } from '@/lib/email/emailTemplates';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { title, message, ctaText, ctaUrl, imageUrl, sendToAll } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Fetch users who opted in for promotional emails
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const usersQuery = query(
      collection(db, 'users'),
      where('emailPreferences.promotional', '==', true)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No users opted in for promotional emails',
        sent: 0,
      });
    }

    const emailHtml = getPromotionalEmail({
      title,
      message,
      ctaText,
      ctaUrl,
      imageUrl,
    });

    // Send emails in batches to avoid rate limiting
    const batchSize = 10;
    const users = usersSnapshot.docs.map(doc => doc.data());
    let sentCount = 0;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const emailPromises = batch.map(user =>
        sendEmail({
          to: user.email,
          subject: title,
          html: emailHtml,
          text: message,
        }).catch(error => {
          console.error(`Failed to send to ${user.email}:`, error);
          return null;
        })
      );

      const results = await Promise.all(emailPromises);
      sentCount += results.filter(r => r !== null).length;

      // Wait a bit between batches to avoid rate limiting
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Promotional email sent to ${sentCount} users`,
      sent: sentCount,
      total: users.length,
    });
  } catch (error) {
    console.error('Error sending promotional email:', error);
    return NextResponse.json(
      { error: 'Failed to send promotional email' },
      { status: 500 }
    );
  }
}
