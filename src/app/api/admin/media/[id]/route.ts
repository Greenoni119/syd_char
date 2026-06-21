import { NextRequest, NextResponse } from "next/server";
import { deleteMediaFile } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const success = await deleteMediaFile(id);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
