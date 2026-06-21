import { NextRequest, NextResponse } from "next/server";
import { getMediaFiles, getSignedUrl } from "@/lib/storage";
import archiver from "archiver";

export async function GET(request: NextRequest) {
  try {
    const mediaFiles = await getMediaFiles(1000, 0); // Get all files

    if (mediaFiles.length === 0) {
      return NextResponse.json(
        { error: "No files to download" },
        { status: 400 },
      );
    }

    // Create a ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // Create a transform stream to capture the archive output
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on("end", () => {
      console.log(`Archive finished. Total bytes: ${archive.pointer()}`);
    });

    archive.on("error", (err: Error) => {
      console.error("Archive error:", err);
    });

    // Add files to archive
    for (const media of mediaFiles) {
      const signedUrl = await getSignedUrl(media.storage_path);
      if (signedUrl) {
        try {
          const response = await fetch(signedUrl);
          if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer());
            const folder = media.media_type === "photo" ? "photos" : "videos";
            archive.append(buffer, { name: `${folder}/${media.file_name}` });
          }
        } catch (error) {
          console.error(`Error fetching file ${media.file_name}:`, error);
        }
      }
    }

    archive.finalize();

    // Wait for archive to finish
    await new Promise((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="wedding-photos-${new Date().toISOString().split("T")[0]}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download all error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
