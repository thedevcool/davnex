import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/emailService';
import { getPasswordResetEmail } from '@/lib/email/emailTemplates';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in Firestore
    if (db) {
      await addDoc(collection(db, 'passwordResetTokens'), {
        email,
        token: resetToken,
        expiresAt,
        used: false,
        createdAt: serverTimestamp(),
      });
    }

    // Send reset email
    const emailHtml = getPasswordResetEmail(userName || 'there', resetToken);

    await sendEmail({
      to: email,
      subject: 'Reset Your Password - Davnex Store',
      html: emailHtml,
      text: `Reset your password by visiting: ${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    );
  }
}
