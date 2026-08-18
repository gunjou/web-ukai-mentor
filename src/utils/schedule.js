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
  return schedule?.tanggal_efektif || schedule?.tanggal || null;
}

export function getScheduleStartTime(schedule) {
  return schedule?.waktu_mulai_efektif || schedule?.waktu_mulai || null;
}

export function getScheduleEndTime(schedule) {
  return schedule?.waktu_selesai_efektif || schedule?.waktu_selesai || null;
}

export function isRescheduled(schedule) {
  if (!schedule) {
    return false;
  }

  return Boolean(
    schedule.tanggal_reschedule ||
      schedule.waktu_mulai_reschedule ||
      schedule.waktu_selesai_reschedule
  );
}
