import { api } from "../utils/api";

export async function getMentorClasses() {
  const response = await api("/paket-kelas/mentor");

  return response?.data || [];
}

export async function getClassParticipants(id_paketkelas) {
  if (!id_paketkelas) {
    return [];
  }

  const response = await api(
    `/absensi/kelas/peserta?id_paketkelas=${id_paketkelas}`
  );

  return response?.data || [];
}
