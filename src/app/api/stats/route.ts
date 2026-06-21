import { NextResponse } from 'next/server'
import { getMediaStats } from '@/lib/storage'

export async function GET() {
  try {
    const stats = await getMediaStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { totalPhotos: 0, totalVideos: 0, totalStorage: 0 },
      { status: 500 }
    )
  }
}
