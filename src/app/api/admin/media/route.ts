import { NextResponse } from 'next/server'
import { getMediaFiles, deleteMediaFile } from '@/lib/storage'

export async function GET() {
  try {
    const mediaFiles = await getMediaFiles(1000, 0)
    return NextResponse.json(mediaFiles)
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json([], { status: 500 })
  }
}
