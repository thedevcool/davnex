import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/emailService';
import { getComingSoonEmail } from '@/lib/email/emailTemplates';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, productPrice, productImage, availableDate } = await request.json();

    if (!productId || !productName || !productPrice || !availableDate) {
      return NextResponse.json(
        { error: 'Missing required product details' },
        { status: 400 }
      );
    }

    // Fetch users who opted in for coming soon alerts
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const usersQuery = query(
      collection(db, 'users'),
      where('emailPreferences.comingSoon', '==', true)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No users opted in for coming soon alerts',
        sent: 0,
      });
    }

    const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/product/${productId}`;
    const availableDateObj = new Date(availableDate);

    // Send emails in batches
    const batchSize = 10;
    const users = usersSnapshot.docs.map(doc => doc.data());
    let sentCount = 0;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const emailPromises = batch.map(user => {
        const emailHtml = getComingSoonEmail(user.displayName || 'Customer', {
          name: productName,
          price: productPrice,
          image: productImage,
          availableDate: availableDateObj,
          url: productUrl,
        });

        return sendEmail({
          to: user.email,
          subject: `Coming Soon: ${productName} ⏳`,
          html: emailHtml,
          text: `${productName} is coming soon to Davnex Store! Available: ${availableDateObj.toLocaleDateString()}`,
        }).catch(error => {
          console.error(`Failed to send to ${user.email}:`, error);
          return null;
        });
      });

      const results = await Promise.all(emailPromises);
      sentCount += results.filter(r => r !== null).length;

      // Wait between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Coming soon notification sent to ${sentCount} users`,
      sent: sentCount,
    });
  } catch (error) {
    console.error('Error sending coming soon notification:', error);
    return NextResponse.json(
      { error: 'Failed to send coming soon notification' },
      { status: 500 }
    );
  }
}
