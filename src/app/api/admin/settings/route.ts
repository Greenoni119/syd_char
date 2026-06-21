import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory settings storage (in production, use a database)
let settings = {
  uploadsEnabled: true,
  downloadsEnabled: true,
}

export async function GET() {
  return NextResponse.json(settings)
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    settings = { ...settings, ...body }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
