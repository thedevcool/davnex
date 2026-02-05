import { NextResponse } from "next/server";
import { deleteDoc, doc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export async function DELETE(request: Request) {
  if (!isFirebaseConfigured() || !db) {
    return NextResponse.json(
      { error: "Firebase is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const codeId = typeof body.codeId === "string" ? body.codeId.trim() : "";

    if (!codeId) {
      return NextResponse.json(
        { error: "Missing codeId" },
        { status: 400 }
      );
    }

    const codeRef = doc(db, "dataCodes", codeId);
    await deleteDoc(codeRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting data code:", error);
    return NextResponse.json(
      { error: "Failed to delete data code" },
      { status: 500 }
    );
  }
}
