import { NextRequest, NextResponse } from 'next/server'
import { getSignedUrl } from '@/lib/storage'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const storagePath = searchParams.get('path')

  if (!storagePath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  try {
    const url = await getSignedUrl(storagePath)
    if (!url) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
    }
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
  }
}
