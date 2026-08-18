export function getLoginErrorMessage(error) {
  /*
   * Tidak dapat terhubung ke server
   */
  if (error?.isNetworkError) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }

  const status = error?.status;

  /*
   * 401 biasanya berarti:
   * email/password salah
   */
  if (status === 401) {
    return "Email atau password salah.";
  }

  /*
   * 403 = akun tidak memiliki akses
   */
  if (status === 403) {
    return "Akun Anda tidak memiliki akses ke sistem ini.";
  }

  /*
   * 422 = data login tidak valid
   */
  if (status === 422) {
    return "Email atau password tidak valid.";
  }

  /*
   * 429 = terlalu banyak percobaan
   */
  if (status === 429) {
    return "Terlalu banyak percobaan login. Silakan coba lagi beberapa saat.";
  }

  /*
   * 5xx = masalah server
   */
  if (status >= 500) {
    return "Terjadi gangguan pada server. Silakan coba lagi.";
  }

  /*
   * Fallback
   */
  return "Login gagal. Silakan periksa data login Anda dan coba lagi.";
}
