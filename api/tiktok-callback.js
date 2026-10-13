
import crypto from "node:crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const code = req.query.code;
  const returnedState = req.query.state;
  const savedState = req.cookies?.tiktok_oauth_state;

  res.setHeader("Set-Cookie", [
    "tiktok_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
  ]);

  if (
    typeof code !== "string" ||
    typeof returnedState !== "string" ||
    typeof savedState !== "string" ||
    returnedState !== savedState
  ) {
    return res.status(400).send(
      "Login gagal: verifikasi keamanan tidak cocok. Silakan coba lagi."
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    return res.status(500).send(
      "Konfigurasi TikTok belum lengkap di server."
    );
  }

  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error("TikTok token exchange failed:", {
        status: response.status,
        error: result.error,
      });
      return res.status(502).send(
        "TikTok belum dapat menyelesaikan login. Periksa konfigurasi aplikasi dan coba lagi."
      );
    }

    // Belum menyimpan token atau membuat sesi pengguna.
    // Jangan tampilkan token di browser.
    return res.status(200).send(
      "Kode otorisasi berhasil ditukar. Penyimpanan akun dan sesi aman belum dikonfigurasi."
    );
  } catch (error) {
    console.error("TikTok callback request failed:", error.message);
    return res.status(502).send(
      "Tidak dapat menghubungi layanan TikTok. Silakan coba lagi."
    );
  }
}
