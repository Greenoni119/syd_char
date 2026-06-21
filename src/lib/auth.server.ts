import { cookies } from 'next/headers'
import { createClient } from './supabase/server'
import { v4 as uuidv4 } from 'uuid'

export interface GuestSession {
  id: string
  invite_token_id: string
  created_at: string
  last_accessed: string
}

export interface InviteToken {
  id: string
  token: string
  active: boolean
  created_at: string
  expires_at: string | null
}

const SESSION_COOKIE_NAME = 'wedding_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function validateInviteToken(token: string): Promise<InviteToken | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .eq('active', true)
    .single()
  
  if (error || !data) {
    return null
  }
  
  // Check if token has expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null
  }
  
  return data
}

export async function createGuestSession(inviteTokenId: string): Promise<GuestSession | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('guest_sessions')
    .insert({
      invite_token_id: inviteTokenId,
    })
    .select()
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getGuestSession(): Promise<GuestSession | null> {
  const sessionId = await getSessionCookie()
  if (!sessionId) return null
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('guest_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  // Update last accessed time
  await supabase
    .from('guest_sessions')
    .update({ last_accessed: new Date().toISOString() })
    .eq('id', sessionId)
  
  return data
}

export async function requireAuth(): Promise<GuestSession> {
  const session = await getGuestSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function generateInviteToken(): Promise<string> {
  return uuidv4()
}
