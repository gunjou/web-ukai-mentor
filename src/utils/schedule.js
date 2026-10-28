export function formatTime(time) {
  if (!time) {
    return "-";
  }

  return String(time).slice(0, 5);
}

export function formatScheduleDate(date) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getMeetingType(schedule) {
  return (schedule?.type_pertemuan || "OFFLINE").toUpperCase();
}

export function getScheduleDate(schedule) {
  return (
    schedule?.tanggal_efektif ||
    schedule?.tanggal_reschedule ||
    schedule?.tanggal ||
    null
  );
}

export function getScheduleStartTime(schedule) {
  return (
    schedule?.waktu_mulai_efektif ||
    schedule?.waktu_mulai_reschedule ||
    schedule?.waktu_mulai ||
    null
  );
}

export function getScheduleEndTime(schedule) {
  return (
    schedule?.waktu_selesai_efektif ||
    schedule?.waktu_selesai_reschedule ||
    schedule?.waktu_selesai ||
    null
  );
}

export function isRescheduled(schedule) {
  if (!schedule) {
    return false;
  }

  return Boolean(
    schedule.tanggal_reschedule ||
    schedule.waktu_mulai_reschedule ||
    schedule.waktu_selesai_reschedule,
  );
}

/*
 * Kelompokkan jadwal flat (per kelas) menjadi format group
 * yang sama dengan GET /jadwal/group:
 * tanggal + waktu_mulai + waktu_selesai -> classes[]
 */
export function groupSchedulesByTime(schedules = []) {
  const map = new Map();

  schedules.forEach((schedule) => {
    const tanggal = getScheduleDate(schedule);
    const waktuMulai = getScheduleStartTime(schedule);
    const waktuSelesai = getScheduleEndTime(schedule);

    if (!tanggal) {
      return;
    }

    const key = `${tanggal}|${waktuMulai}|${waktuSelesai}`;

    if (!map.has(key)) {
      map.set(key, {
        id_jadwal: schedule.id_jadwal,
        tanggal,
        tanggal_efektif: tanggal,
        waktu_mulai: waktuMulai,
        waktu_selesai: waktuSelesai,
        waktu_mulai_efektif: waktuMulai,
        classes: [],
      });
    }

    map.get(key).classes.push(schedule);
  });

  return Array.from(map.values());
}
