import { NextRequest, NextResponse } from "next/server";
import { getMediaFiles, getSignedUrl } from "@/lib/storage";
import JSZip from "jszip";

export async function GET(request: NextRequest) {
  try {
    const mediaFiles = await getMediaFiles(1000, 0); // Get all files

    if (mediaFiles.length === 0) {
      return NextResponse.json(
        { error: "No files to download" },
        { status: 400 },
      );
    }

    // Create a ZIP archive using JSZip
    const zip = new JSZip();
    const photosFolder = zip.folder("photos");
    const videosFolder = zip.folder("videos");

    // Add files to archive
    for (const media of mediaFiles) {
      const signedUrl = await getSignedUrl(media.storage_path);
      if (signedUrl) {
        try {
          const response = await fetch(signedUrl);
          if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer());
            const folder =
              media.media_type === "photo" ? photosFolder : videosFolder;
            folder?.file(media.file_name, buffer);
          }
        } catch (error) {
          console.error(`Error fetching file ${media.file_name}:`, error);
        }
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: "blob" });

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="wedding-photos-${new Date().toISOString().split("T")[0]}.zip"`,
      },
    });
  } catch (error) {
    console.error("Download all error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
