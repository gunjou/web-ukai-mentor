import { getSchedules } from "./scheduleService";
import { getParticipantAttendance } from "./attendanceService";

/*
 * ==========================================
 * LOAD DASHBOARD DATA
 * ==========================================
 */

export async function getDashboardData() {
  const schedulesResponse = await getSchedules();

  const schedulesResult = schedulesResponse?.data ?? schedulesResponse;

  const schedules = Array.isArray(schedulesResult)
    ? schedulesResult
    : Array.isArray(schedulesResult?.data)
    ? schedulesResult.data
    : [];

  /*
   * Ambil jadwal aktif.
   *
   * Prioritas:
   * 1. Jadwal hari ini
   * 2. Jadwal terdekat setelah hari ini
   */

  const today = new Date().toISOString().slice(0, 10);

  const activeSchedules = schedules
    .filter((schedule) => Number(schedule.status) === 1)
    .sort((a, b) => {
      const dateA = a.tanggal_efektif || a.tanggal;
      const dateB = b.tanggal_efektif || b.tanggal;

      const timeA = a.waktu_mulai_efektif || a.waktu_mulai || "00:00:00";

      const timeB = b.waktu_mulai_efektif || b.waktu_mulai || "00:00:00";

      return `${dateA} ${timeA}`.localeCompare(`${dateB} ${timeB}`);
    });

  const todaySchedules = activeSchedules.filter((schedule) => {
    const effectiveDate = schedule.tanggal_efektif || schedule.tanggal;

    return effectiveDate === today;
  });

  /*
   * Gunakan jadwal hari ini.
   * Jika tidak ada, gunakan jadwal pertama.
   */

  const selectedSchedule = todaySchedules[0] || activeSchedules[0] || null;

  /*
   * Ambil attendance untuk jadwal yang dipilih.
   */

  let attendance = [];
  let attendanceMeta = {
    total: 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
  };

  if (selectedSchedule?.id_jadwal) {
    const attendanceResponse = await getParticipantAttendance(
      selectedSchedule.id_jadwal
    );

    attendance = Array.isArray(attendanceResponse?.data)
      ? attendanceResponse.data
      : [];

    attendanceMeta = {
      total: Number(attendanceResponse?.meta?.total ?? attendance.length),
      hadir: Number(attendanceResponse?.meta?.hadir ?? 0),
      izin: Number(attendanceResponse?.meta?.izin ?? 0),
      sakit: Number(attendanceResponse?.meta?.sakit ?? 0),
      alpha: Number(attendanceResponse?.meta?.alpha ?? 0),
    };
  }

  /*
   * Jadwal hari ini.
   */

  return {
    schedules,
    todaySchedules,
    selectedSchedule,

    attendance,
    attendanceMeta,

    totalSchedules: activeSchedules.length,
  };
}
