
import crypto from "node:crypto";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !redirectUri) {
    return res.status(500).send(
      "Konfigurasi TikTok belum lengkap di server."
    );
  }

  const state = crypto.randomBytes(32).toString("hex");

  res.setHeader("Set-Cookie", [
    `tiktok_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
  ]);

  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: "user.info.basic,video.list",
    redirect_uri: redirectUri,
    state,
  });

  return res.redirect(
    302,
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  );
}
