import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/emailService';
import { getPaymentSuccessEmail } from '@/lib/email/emailTemplates';

export async function POST(request: NextRequest) {
  try {
    const orderDetails = await request.json();

    if (!orderDetails.orderId || !orderDetails.customerName || !orderDetails.items) {
      return NextResponse.json(
        { error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const emailHtml = getPaymentSuccessEmail(orderDetails);

    await sendEmail({
      to: orderDetails.customerEmail,
      subject: `Order Confirmed - #${orderDetails.orderId}`,
      html: emailHtml,
      text: `Your order #${orderDetails.orderId} has been confirmed. Thank you for shopping with Davnex Store!`,
    });

    return NextResponse.json({ success: true, message: 'Payment confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send payment confirmation email' },
      { status: 500 }
    );
  }
}
