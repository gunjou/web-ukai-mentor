import { api } from "../utils/api";

export async function getSchedules() {
  const response = await api("/jadwal");

  return response?.data || [];
}

export async function getScheduleById(idJadwal) {
  return api(`/jadwal/${idJadwal}`);
}

export async function getSchedulesGroup() {
  const response = await api("/jadwal/group");

  return response?.data || [];
}

export async function getScheduleByIdGroup(idJadwal) {
  return api(`/jadwal/${idJadwal}/group`);
}

export async function createSchedule(payload) {
  return api("/jadwal", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      topik: payload?.topik ?? "",
      catatan: payload?.catatan ?? "",
    }),
  });
}

export async function updateSchedule(idJadwal, payload) {
  return api(`/jadwal/${idJadwal}`, {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      topik: payload?.topik ?? "",
      catatan: payload?.catatan ?? "",
    }),
  });
}

export async function rescheduleSchedule(id, payload) {
  return api(`/jadwal/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/*
 * Jadwal khusus mentor wali kelas.
 *
 * - Tanpa id_paketkelas : backend hanya mengirim ringkasan di meta
 *   (total jadwal & total kelas per tanggal).
 * - Dengan id_paketkelas: backend mengirim daftar jadwal kelas tersebut.
 */
export async function getSchedulesWaliKelas({
  bulan,
  startDate,
  endDate,
  idPaketkelas,
} = {}) {
  const params = new URLSearchParams();

  if (startDate && endDate) {
    params.set("start_date", startDate);
    params.set("end_date", endDate);
  } else if (bulan) {
    params.set("bulan", bulan);
  }

  if (idPaketkelas) {
    params.set("id_paketkelas", String(idPaketkelas));
  }

  const query = params.toString();

  const response = await api(`/jadwal/wali-kelas${query ? `?${query}` : ""}`);

  return {
    data: Array.isArray(response?.data) ? response.data : [],
    meta: response?.meta || null,
  };
}
