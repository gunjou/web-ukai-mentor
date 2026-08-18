import { useCallback, useEffect, useState } from "react";

import { getSchedules } from "../services/scheduleService";
import { getAttendanceBySchedules } from "../services/attendanceService";

export default function useDashboardAttendance() {
  const [schedules, setSchedules] = useState([]);

  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboardAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * ==========================================
       * 1. AMBIL SEMUA JADWAL
       * ==========================================
       */

      const scheduleResponse = await getSchedules();

      const scheduleResult = scheduleResponse?.data ?? scheduleResponse;

      const scheduleData = Array.isArray(scheduleResult)
        ? scheduleResult
        : Array.isArray(scheduleResult?.data)
        ? scheduleResult.data
        : [];

      setSchedules(scheduleData);

      /*
       * ==========================================
       * 2. AMBIL ABSENSI SEMUA JADWAL
       * ==========================================
       */

      if (scheduleData.length === 0) {
        setAttendance([]);
        return;
      }

      const attendanceResult = await getAttendanceBySchedules(scheduleData);

      /*
       * ==========================================
       * 3. SIMPAN HASIL
       * ==========================================
       */

      setAttendance(attendanceResult);
    } catch (err) {
      console.error("Failed to load dashboard attendance:", err);

      setError(err?.message || "Gagal memuat data dashboard.");

      setSchedules([]);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardAttendance();
  }, [loadDashboardAttendance]);

  return {
    schedules,
    attendance,
    loading,
    error,
    refresh: loadDashboardAttendance,
  };
}
