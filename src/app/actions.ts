"use server";

import { redirect } from "next/navigation";
import {
  validateInviteToken,
  createGuestSession,
  setSessionCookie,
} from "@/lib/auth.server";

export async function acceptInvite(token: string) {
  // Validate the invite token
  const inviteToken = await validateInviteToken(token);

  if (!inviteToken) {
    return { error: "Invalid invitation" };
  }

  // Create a guest session
  const session = await createGuestSession(inviteToken.id);

  if (!session) {
    return { error: "Failed to create session" };
  }

  // Set the session cookie
  await setSessionCookie(session.id);

  return { success: true };
}
