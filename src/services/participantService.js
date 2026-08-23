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

export async function getTryoutArrearsMonitoring(id_paketkelas, id_user) {
  if (!id_paketkelas) {
    return [];
  }

  const params = new URLSearchParams({
    id_paketkelas: String(id_paketkelas),
  });

  if (id_user) {
    params.set("id_user", String(id_user));
  }

  const response = await api(`/tryout/tunggakan/monitoring?${params}`);

  return response?.data ?? response ?? [];
}

export async function getMateriProgressMonitoring(id_paketkelas) {
  if (!id_paketkelas) {
    return [];
  }

  const params = new URLSearchParams({
    id_paketkelas: String(id_paketkelas),
  });

  const response = await api(`/materi/progress/monitoring?${params}`);

  return response?.data ?? response ?? [];
}
