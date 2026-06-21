import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInviteToken } from '@/lib/auth'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const token = generateInviteToken()
    
    const { data, error } = await supabase
      .from('invite_tokens')
      .insert({ token })
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }
}
