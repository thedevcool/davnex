import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/emailService';
import { getBackInStockEmail } from '@/lib/email/emailTemplates';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, productPrice, productImage } = await request.json();

    if (!productId || !productName || !productPrice) {
      return NextResponse.json(
        { error: 'Missing required product details' },
        { status: 400 }
      );
    }

    // Fetch users who opted in for stock alerts and have this product in watchlist
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const usersQuery = query(
      collection(db, 'users'),
      where('emailPreferences.stockAlerts', '==', true),
      where('watchlist', 'array-contains', productId)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No users watching this product',
        sent: 0,
      });
    }

    const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/product/${productId}`;

    // Send emails
    let sentCount = 0;
    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      try {
        const emailHtml = getBackInStockEmail(user.displayName || 'Customer', {
          name: productName,
          price: productPrice,
          image: productImage,
          url: productUrl,
        });

        await sendEmail({
          to: user.email,
          subject: `${productName} is Back in Stock! 🎉`,
          html: emailHtml,
          text: `${productName} is back in stock! Order now: ${productUrl}`,
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${user.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Back in stock notification sent to ${sentCount} users`,
      sent: sentCount,
    });
  } catch (error) {
    console.error('Error sending back in stock notification:', error);
    return NextResponse.json(
      { error: 'Failed to send back in stock notification' },
      { status: 500 }
    );
  }
}
