import { api } from "../utils/api";

export async function getSchedules() {
  const response = await api("/jadwal");

  return response?.data || [];
}
export async function rescheduleSchedule(id, payload) {
  return api(`/jadwal/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
