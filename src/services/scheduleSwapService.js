import { api } from "../utils/api";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function getScheduleSwapCandidates(params) {
  return api(`/jadwal/tukar/kandidat${buildQuery(params)}`);
}

export async function createScheduleSwap(payload) {
  return api("/jadwal/tukar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getScheduleSwaps(params) {
  return api(`/jadwal/tukar${buildQuery(params)}`);
}

export async function getScheduleSwapDetail(idRequest) {
  return api(`/jadwal/tukar/${idRequest}`);
}

export async function respondToScheduleSwap(idRequest, action, payload) {
  const options = { method: "PATCH" };

  if (payload !== undefined) {
    options.body = JSON.stringify(payload);
  }

  return api(`/jadwal/tukar/${idRequest}/${action}`, options);
}
