import { api } from "../utils/api";

/*
 * ==========================================
 * MENTOR CHECK-IN
 * ==========================================
 */

export async function mentorCheckIn({
  id_jadwal,
  latitude,
  longitude,
  accuracy,
  evidence,
}) {
  const formData = new FormData();

  formData.append("id_jadwal", String(id_jadwal));

  if (latitude !== undefined && latitude !== null) {
    formData.append("latitude", String(latitude));
  }

  if (longitude !== undefined && longitude !== null) {
    formData.append("longitude", String(longitude));
  }

  if (accuracy !== undefined && accuracy !== null) {
    formData.append("accuracy", String(accuracy));
  }

  if (evidence) {
    formData.append("evidence_url", evidence);
  }

  return api("/absensi/mentor/check-in", {
    method: "POST",
    body: formData,
  });
}

/*
 * ==========================================
 * MENTOR CHECK-OUT
 * ==========================================
 */

export async function mentorCheckOut({
  id_jadwal,
  latitude,
  longitude,
  accuracy,
  evidence,
}) {
  const formData = new FormData();

  formData.append("id_jadwal", String(id_jadwal));

  if (latitude !== undefined && latitude !== null) {
    formData.append("latitude", String(latitude));
  }

  if (longitude !== undefined && longitude !== null) {
    formData.append("longitude", String(longitude));
  }

  if (accuracy !== undefined && accuracy !== null) {
    formData.append("accuracy", String(accuracy));
  }

  if (evidence) {
    formData.append("evidence", evidence, evidence.name || "evidence.jpg");
  }

  return api("/absensi/mentor/check-out", {
    method: "POST",
    body: formData,
  });
}

export async function getMentorAttendanceStatus(idJadwal) {
  return api(`/absensi/mentor/${idJadwal}/status`);
}

export async function getParticipantAttendance(id_jadwal) {
  return api(`/absensi/peserta/jadwal/${id_jadwal}`, {
    method: "GET",
  });
}

export async function createParticipantAttendance(data) {
  return api("/absensi/peserta", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateParticipantAttendance(idAbsensi, data) {
  return api(`/absensi/peserta/${idAbsensi}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteParticipantAttendance(idAbsensi) {
  return api(`/absensi/peserta/${idAbsensi}`, {
    method: "DELETE",
  });
}

export async function getAttendanceBySchedules(schedules = []) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return [];
  }

  const requests = schedules
    .filter((schedule) => schedule?.id_jadwal)
    .map(async (schedule) => {
      try {
        const response = await getParticipantAttendance(schedule.id_jadwal);

        return {
          schedule,
          meta: {
            total: Number(response?.meta?.total ?? 0),
            hadir: Number(response?.meta?.hadir ?? 0),
            izin: Number(response?.meta?.izin ?? 0),
            sakit: Number(response?.meta?.sakit ?? 0),
            alpha: Number(response?.meta?.alpha ?? 0),
          },
        };
      } catch (error) {
        console.error(
          `Failed to load attendance for schedule ${schedule.id_jadwal}:`,
          error,
        );

        return {
          schedule,
          meta: {
            total: 0,
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpha: 0,
          },
          error,
        };
      }
    });

  return Promise.all(requests);
}

export async function mentorCheckInGroup(schedules = [], payload = {}) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return [];
  }

  const results = [];

  for (const schedule of schedules) {
    if (!schedule?.id_jadwal) {
      continue;
    }

    const response = await mentorCheckIn({
      ...payload,
      id_jadwal: schedule.id_jadwal,
    });

    results.push({
      id_jadwal: schedule.id_jadwal,
      response,
    });
  }

  return results;
}

export async function mentorCheckOutGroup(schedules = [], payload = {}) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return [];
  }

  const results = [];

  for (const schedule of schedules) {
    if (!schedule?.id_jadwal) {
      continue;
    }

    const response = await mentorCheckOut({
      ...payload,
      id_jadwal: schedule.id_jadwal,
    });

    results.push({
      id_jadwal: schedule.id_jadwal,
      response,
    });
  }

  return results;
}
