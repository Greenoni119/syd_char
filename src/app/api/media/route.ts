import { NextRequest, NextResponse } from "next/server";
import { getMediaFiles } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const files = await getMediaFiles(limit, offset);
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json([], { status: 500 });
  }
}
