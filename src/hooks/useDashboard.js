import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "../context/ToastContext";

import { getSchedules } from "../services/scheduleService";
import { getParticipantAttendance } from "../services/attendanceService";

export default function useDashboard() {
  const toast = useToast();

  /*
   * ==========================================
   * STATE
   * ==========================================
   */

  const [schedules, setSchedules] = useState([]);

  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [attendance, setAttendance] = useState([]);

  const [attendanceMeta, setAttendanceMeta] = useState({
    total: 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
  });

  /*
   * Data attendance seluruh jadwal.
   *
   * Digunakan khusus untuk grafik dashboard.
   */
  const [attendanceBySchedule, setAttendanceBySchedule] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * ==========================================
   * LOAD DASHBOARD
   * ==========================================
   */

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * ========================================
       * 1. AMBIL SEMUA JADWAL
       * ========================================
       */

      const scheduleResponse = await getSchedules();

      const scheduleResult = scheduleResponse?.data ?? scheduleResponse;

      const scheduleData = Array.isArray(scheduleResult)
        ? scheduleResult
        : Array.isArray(scheduleResult?.data)
        ? scheduleResult.data
        : [];

      setSchedules(scheduleData);

      if (scheduleData.length === 0) {
        setSelectedSchedule(null);
        setAttendance([]);
        setAttendanceMeta(emptyMeta());
        setAttendanceBySchedule([]);

        return;
      }

      /*
       * ========================================
       * 2. TENTUKAN JADWAL HARI INI
       * ========================================
       */

      const today = getTodayDate();

      const todayData = scheduleData
        .filter((schedule) => {
          const effectiveDate = schedule.tanggal_efektif || schedule.tanggal;

          return effectiveDate === today;
        })
        .sort((a, b) => {
          const timeA = a.waktu_mulai_efektif || a.waktu_mulai || "";

          const timeB = b.waktu_mulai_efektif || b.waktu_mulai || "";

          return timeA.localeCompare(timeB);
        });

      /*
       * Kalau ada jadwal hari ini,
       * gunakan jadwal pertama.
       *
       * Kalau tidak ada, gunakan jadwal pertama
       * dari endpoint.
       */

      const currentSchedule = todayData[0] || scheduleData[0];

      setSelectedSchedule(currentSchedule);

      /*
       * ========================================
       * 3. AMBIL ABSENSI SEMUA JADWAL
       * ========================================
       *
       * Endpoint hanya bisa menerima satu
       * id_jadwal, jadi kita request semuanya
       * secara paralel.
       */

      const attendanceRequests = scheduleData
        .filter((schedule) => schedule?.id_jadwal)
        .map(async (schedule) => {
          try {
            const response = await getParticipantAttendance(schedule.id_jadwal);

            const participants = Array.isArray(response?.data)
              ? response.data
              : [];

            const meta = normalizeMeta(response?.meta);

            return {
              schedule,
              participants,
              meta,
              error: null,
            };
          } catch (err) {
            console.error(
              `Failed attendance schedule ${schedule.id_jadwal}:`,
              err
            );

            return {
              schedule,
              participants: [],
              meta: emptyMeta(),
              error: err,
            };
          }
        });

      const attendanceResults = await Promise.all(attendanceRequests);

      setAttendanceBySchedule(attendanceResults);

      /*
       * ========================================
       * 4. AMBIL DATA JADWAL TERPILIH
       * ========================================
       */

      const selectedResult = attendanceResults.find(
        (item) => item.schedule.id_jadwal === currentSchedule.id_jadwal
      );

      if (selectedResult) {
        setAttendance(selectedResult.participants);

        setAttendanceMeta(selectedResult.meta);
      } else {
        setAttendance([]);
        setAttendanceMeta(emptyMeta());
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);

      const message = err?.message || "Gagal memuat dashboard.";

      setError(message);

      setSchedules([]);
      setSelectedSchedule(null);
      setAttendance([]);
      setAttendanceMeta(emptyMeta());
      setAttendanceBySchedule([]);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
   * ==========================================
   * TODAY SCHEDULES
   * ==========================================
   */

  const todaySchedules = useMemo(() => {
    const today = getTodayDate();

    return schedules
      .filter((schedule) => {
        const effectiveDate = schedule.tanggal_efektif || schedule.tanggal;

        return effectiveDate === today;
      })
      .sort((a, b) => {
        const timeA = a.waktu_mulai_efektif || a.waktu_mulai || "";

        const timeB = b.waktu_mulai_efektif || b.waktu_mulai || "";

        return timeA.localeCompare(timeB);
      });
  }, [schedules]);

  /*
   * ==========================================
   * TODAY ATTENDANCE META
   * ==========================================
   *
   * Agregasi data attendance hanya untuk
   * jadwal hari ini.
   */

  const todayAttendanceMeta = useMemo(() => {
    const today = getTodayDate();

    const todayResults = attendanceBySchedule.filter((item) => {
      const effectiveDate =
        item.schedule.tanggal_efektif || item.schedule.tanggal;

      return effectiveDate === today;
    });

    if (todayResults.length === 0) {
      return emptyMeta();
    }

    // Agregasi semua meta dari jadwal hari ini
    return todayResults.reduce((acc, item) => {
      return {
        total: acc.total + item.meta.total,
        hadir: acc.hadir + item.meta.hadir,
        izin: acc.izin + item.meta.izin,
        sakit: acc.sakit + item.meta.sakit,
        alpha: acc.alpha + item.meta.alpha,
      };
    }, emptyMeta());
  }, [attendanceBySchedule]);

  /*
   * ==========================================
   * ATTENDANCE TREND
   * ==========================================
   *
   * Satu bar = satu jadwal.
   *
   * Contoh:
   *
   * 21 Aug
   *  ├── Hadir
   *  ├── Izin
   *  ├── Sakit
   *  └── Alpha
   *
   */

  const attendanceTrend = useMemo(() => {
    return attendanceBySchedule
      .filter((item) => item?.schedule?.id_jadwal)
      .sort((a, b) => {
        const dateA = a.schedule.tanggal_efektif || a.schedule.tanggal || "";

        const dateB = b.schedule.tanggal_efektif || b.schedule.tanggal || "";

        if (dateA !== dateB) {
          return dateA.localeCompare(dateB);
        }

        const timeA =
          a.schedule.waktu_mulai_efektif || a.schedule.waktu_mulai || "";

        const timeB =
          b.schedule.waktu_mulai_efektif || b.schedule.waktu_mulai || "";

        return timeA.localeCompare(timeB);
      })
      .map((item) => {
        const schedule = item.schedule;
        const meta = item.meta;

        return {
          id_jadwal: schedule.id_jadwal,

          day: formatChartDate(schedule.tanggal_efektif || schedule.tanggal),

          tanggal: schedule.tanggal_efektif || schedule.tanggal,

          waktu_mulai: schedule.waktu_mulai_efektif || schedule.waktu_mulai,

          nama_kelas: schedule.nama_kelas || "-",

          nama_mentor: schedule.nickname_mentor || schedule.nama_mentor || "-",

          hadir: meta.hadir,
          izin: meta.izin,
          sakit: meta.sakit,
          alpha: meta.alpha,
        };
      });
  }, [attendanceBySchedule]);

  /*
   * ==========================================
   * REFRESH
   * ==========================================
   */

  const refresh = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  /*
   * ==========================================
   * RETURN
   * ==========================================
   */

  return {
    schedules,
    todaySchedules,

    selectedSchedule,

    attendance,
    attendanceMeta,

    attendanceBySchedule,
    attendanceTrend,

    todayAttendanceMeta,
    hasScheduleToday: todaySchedules.length > 0,

    loading,
    error,

    refresh,
  };
}

/*
 * ==========================================
 * HELPERS
 * ==========================================
 */

function emptyMeta() {
  return {
    total: 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
  };
}

function normalizeMeta(meta) {
  return {
    total: Number(meta?.total ?? 0),
    hadir: Number(meta?.hadir ?? 0),
    izin: Number(meta?.izin ?? 0),
    sakit: Number(meta?.sakit ?? 0),
    alpha: Number(meta?.alpha ?? 0),
  };
}

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatChartDate(date) {
  if (!date) {
    return "-";
  }

  const value = new Date(`${date}T00:00:00`);

  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}
