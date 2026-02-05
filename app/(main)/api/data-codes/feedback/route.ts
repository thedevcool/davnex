import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

// POST - Submit feedback
export async function POST(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { name, email, planName, type, rating, message } = body;

    if (!name || !email || !planName || !type || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (type !== "review" && type !== "complaint") {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 },
      );
    }

    // Add feedback to database
    const feedbackRef = await addDoc(collection(db, "dataFeedback"), {
      name: name.trim(),
      email: email.trim(),
      planName: planName.trim(),
      type,
      rating: rating || null,
      message: message.trim(),
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: feedbackRef.id,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}

// GET - Fetch all feedback
export async function GET() {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 },
    );
  }

  try {
    const feedbackQuery = query(
      collection(db, "dataFeedback"),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(feedbackQuery);
    const feedback = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
