
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const code = req.query.code;
  const returnedState = req.query.state;
  const savedState = req.cookies?.tiktok_oauth_state;

  res.setHeader("Set-Cookie", [
    "tiktok_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
  ]);

  if (!code || !returnedState || !savedState ||
      returnedState !== savedState) {
    return res.status(400).send(
      "Login TikTok gagal: verifikasi keamanan tidak cocok. Silakan coba lagi."
    );
  }

  // Pertukaran kode menjadi token akan ditambahkan
  // setelah konfigurasi kredensial dan endpoint diverifikasi.
  return res.status(501).send(
    "Verifikasi berhasil. Pertukaran token belum dikonfigurasi."
  );
}
