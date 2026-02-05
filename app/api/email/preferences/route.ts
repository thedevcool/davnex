import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email, preferences } = await request.json();

    if (!email || !preferences) {
      return NextResponse.json(
        { error: 'Email and preferences are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Find user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userDoc = usersSnapshot.docs[0];

    // Update email preferences
    await updateDoc(doc(db, 'users', userDoc.id), {
      emailPreferences: preferences,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Find user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = usersSnapshot.docs[0].data();

    return NextResponse.json({
      success: true,
      preferences: user.emailPreferences || {
        promotional: false,
        stockAlerts: false,
        orderUpdates: true,
        comingSoon: false,
      },
    });
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email preferences' },
      { status: 500 }
    );
  }
}
