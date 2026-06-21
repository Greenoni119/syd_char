import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mediaType = formData.get("mediaType") as "photo" | "video";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!mediaType || !["photo", "video"].includes(mediaType)) {
      return NextResponse.json(
        { error: "Invalid media type" },
        { status: 400 },
      );
    }

    // File size validation
    const maxSize =
      mediaType === "photo" ? 50 * 1024 * 1024 : 500 * 1024 * 1024; // 50MB for photos, 500MB for videos
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${mediaType === "photo" ? "50MB" : "500MB"}`,
        },
        { status: 400 },
      );
    }

    const result = await uploadFile(file, mediaType);

    if (!result) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, media: result });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
