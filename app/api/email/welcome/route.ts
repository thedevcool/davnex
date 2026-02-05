import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/emailService';
import { getWelcomeEmail } from '@/lib/email/emailTemplates';

export async function POST(request: NextRequest) {
  try {
    const { userName, userEmail } = await request.json();

    if (!userName || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userName, userEmail' },
        { status: 400 }
      );
    }

    const emailHtml = getWelcomeEmail(userName, userEmail);

    await sendEmail({
      to: userEmail,
      subject: 'Welcome to Davnex Store! 🎉',
      html: emailHtml,
      text: `Welcome to Davnex Store, ${userName}! Thank you for joining us.`,
    });

    return NextResponse.json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
