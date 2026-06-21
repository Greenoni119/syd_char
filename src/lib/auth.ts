import { v4 as uuidv4 } from "uuid";

export interface GuestSession {
  id: string;
  invite_token_id: string;
  created_at: string;
  last_accessed: string;
}

export interface InviteToken {
  id: string;
  token: string;
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export function generateInviteToken(): string {
  return uuidv4();
}
