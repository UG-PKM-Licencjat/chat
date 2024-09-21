import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

export async function authenticate(
  token: string | undefined
): Promise<string | null> {
  if (!token) return null;

  token = token.split(" ")[1]; // Cut bearer off

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) return null;

  if (payload.iss != "https://accounts.google.com") return null;
  if (Math.floor(new Date().getTime() / 1000) > payload.exp) return null;

  return payload.sub;
}
