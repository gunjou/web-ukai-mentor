import { clearAuthSession, getAccessToken } from "./auth";

const API_URL = process.env.REACT_APP_API_URL;

export async function api(endpoint, options = {}) {
  const token = getAccessToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  /*
   * Tambahkan token secara otomatis
   * jika user sudah login.
   */
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const networkError = new Error("Tidak dapat terhubung ke server.");

    networkError.isNetworkError = true;
    networkError.originalError = error;

    throw networkError;
  }

  /*
   * Coba baca response JSON.
   */
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  /*
   * Token/session tidak valid.
   */
  if (response.status === 401) {
    const isLoginRequest = endpoint === "/auth/login";

    if (!isLoginRequest) {
      clearAuthSession();

      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    const error = new Error(data?.message || data?.msg || "Unauthorized");

    error.status = 401;
    error.data = data;
    error.isUnauthorized = true;

    throw error;
  }

  /*
   * Error HTTP lainnya.
   */
  if (!response.ok) {
    const error = new Error(
      data?.message || data?.msg || "Terjadi kesalahan pada server."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}
