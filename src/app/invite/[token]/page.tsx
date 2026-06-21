import { redirect } from "next/navigation";
import {
  validateInviteToken,
  createGuestSession,
  setSessionCookie,
} from "@/lib/auth.server";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;

  // Validate the invite token
  const inviteToken = await validateInviteToken(token);

  if (!inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired. Please contact the
            wedding couple for a new QR code.
          </p>
        </div>
      </div>
    );
  }

  // Create a guest session
  const session = await createGuestSession(inviteToken.id);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">
            Something went wrong. Please try scanning the QR code again.
          </p>
        </div>
      </div>
    );
  }

  // Set the session cookie
  await setSessionCookie(session.id);

  // Redirect to gallery
  redirect("/gallery");
}
