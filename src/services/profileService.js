import { api } from "../utils/api";

export function getProfile() {
  return api("/profile");
}

export function updateProfile(profile) {
  return api("/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function updatePassword(passwords) {
  return api("/profile/password", {
    method: "PUT",
    body: JSON.stringify(passwords),
  });
}

export async function getWaliKelasStatus() {
  const response = await api("/profile/wali-kelas");

  return {
    isWaliKelas: response?.data?.is_wali_kelas === true,
    totalKelas: response?.data?.total_kelas ?? 0,
    kelas: Array.isArray(response?.data?.kelas) ? response.data.kelas : [],
  };
}
