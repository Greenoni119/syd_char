"use server";

import { redirect } from "next/navigation";
import {
  validateInviteToken,
  createGuestSession,
  setSessionCookie,
} from "@/lib/auth.server";

export async function acceptInvite(token: string) {
  try {
    console.log("Accepting invite with token:", token);

    // Validate the invite token
    const inviteToken = await validateInviteToken(token);
    console.log("Invite token validation result:", inviteToken);

    if (!inviteToken) {
      console.log("Token validation failed");
      return { error: "Invalid invitation" };
    }

    // Create a guest session
    const session = await createGuestSession(inviteToken.id);
    console.log("Session creation result:", session);

    if (!session) {
      console.log("Session creation failed");
      return { error: "Failed to create session" };
    }

    // Set the session cookie
    await setSessionCookie(session.id);
    console.log("Session cookie set successfully");

    return { success: true };
  } catch (error) {
    console.error("Error in acceptInvite:", error);
    return { error: "An error occurred" };
  }
}
