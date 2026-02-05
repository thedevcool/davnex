import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/emailService';
import { getOrderStatusEmail } from '@/lib/email/emailTemplates';

export async function POST(request: NextRequest) {
  try {
    const orderDetails = await request.json();

    if (!orderDetails.orderId || !orderDetails.customerName || !orderDetails.status) {
      return NextResponse.json(
        { error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const statusMessages = {
      packing: 'Your order is being packed and will ship soon!',
      'on-the-way': 'Your order is on the way! Get ready to receive it.',
      'delivered-station': 'Your order has arrived at the pickup station.',
      'delivered-doorstep': 'Your order has been delivered! Enjoy your new products.',
    };

    const statusMessage = statusMessages[orderDetails.status as keyof typeof statusMessages] || 'Your order status has been updated.';

    const emailHtml = getOrderStatusEmail({
      ...orderDetails,
      statusMessage,
    });

    await sendEmail({
      to: orderDetails.customerEmail,
      subject: `Order Update - #${orderDetails.orderId}`,
      html: emailHtml,
      text: `${statusMessage} Order #${orderDetails.orderId}`,
    });

    return NextResponse.json({ success: true, message: 'Order status email sent successfully' });
  } catch (error) {
    console.error('Error sending order status email:', error);
    return NextResponse.json(
      { error: 'Failed to send order status email' },
      { status: 500 }
    );
  }
}
