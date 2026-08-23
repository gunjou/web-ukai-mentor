import { api } from "../utils/api";

export async function getSchedules() {
  const response = await api("/jadwal");

  return response?.data || [];
}

export async function getScheduleById(idJadwal) {
  return api(`/jadwal/${idJadwal}`);
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
