import { useCallback, useEffect, useState } from "react";

import { useToast } from "../context/ToastContext";

import { getSchedules } from "../services/scheduleService";
import {
  getParticipantAttendance,
  createParticipantAttendance,
  updateParticipantAttendance,
  deleteParticipantAttendance,
} from "../services/attendanceService";

export default function useAttendance() {
  const toast = useToast();

  /*
   * ==========================================
   * SCHEDULE
   * ==========================================
   */

  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [scheduleLoading, setScheduleLoading] = useState(true);

  /*
   * ==========================================
   * PARTICIPANTS
   * ==========================================
   */

  const [participants, setParticipants] = useState([]);

  const [meta, setMeta] = useState({
    total: 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
  });

  const [loading, setLoading] = useState(false);

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  const [error, setError] = useState("");

  /*
   * ==========================================
   * LOAD SCHEDULES
   * ==========================================
   */

  const loadSchedules = useCallback(async () => {
    try {
      setScheduleLoading(true);
      setError("");

      const response = await getSchedules();

      const result = response?.data ?? response;

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];

      setSchedules(data);

      /*
       * Jika belum ada jadwal terpilih,
       * pilih jadwal pertama.
       */
      if (data.length > 0) {
        setSelectedSchedule((current) => current || data[0]);
      } else {
        setSelectedSchedule(null);
      }
    } catch (err) {
      console.error("Failed to load schedules:", err);

      const message = err?.message || "Gagal memuat jadwal.";

      setError(message);
      toast.error(message);

      setSchedules([]);
      setSelectedSchedule(null);
    } finally {
      setScheduleLoading(false);
    }
  }, [toast]);

  /*
   * ==========================================
   * LOAD PARTICIPANT ATTENDANCE
   * ==========================================
   */

  const loadParticipantAttendance = useCallback(async (idJadwal) => {
    if (!idJadwal) {
      setParticipants([]);

      setMeta({
        total: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getParticipantAttendance(idJadwal);

      const data = response?.data;

      setParticipants(Array.isArray(data) ? data : []);

      setMeta({
        total: Number(response?.meta?.total ?? 0),
        hadir: Number(response?.meta?.hadir ?? 0),
        izin: Number(response?.meta?.izin ?? 0),
        sakit: Number(response?.meta?.sakit ?? 0),
        alpha: Number(response?.meta?.alpha ?? 0),
      });
    } catch (err) {
      console.error("Failed to load participant attendance:", err);

      const message = err?.message || "Gagal memuat data kehadiran peserta.";

      setError(message);

      setParticipants([]);

      setMeta({
        total: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  /*
   * ==========================================
   * LOAD ATTENDANCE WHEN SCHEDULE CHANGES
   * ==========================================
   */

  useEffect(() => {
    if (!selectedSchedule?.id_jadwal) {
      setParticipants([]);

      setMeta({
        total: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
      });

      return;
    }

    loadParticipantAttendance(selectedSchedule.id_jadwal);
  }, [selectedSchedule, loadParticipantAttendance]);

  /*
   * ==========================================
   * CHANGE SCHEDULE
   * ==========================================
   */

  const handleScheduleChange = useCallback((schedule) => {
    setSelectedSchedule(schedule);
  }, []);

  /*
   * ==========================================
   * REFRESH
   * ==========================================
   */

  const handleRefresh = useCallback(async () => {
    await loadSchedules();

    /*
     * Setelah jadwal direfresh, data attendance
     * akan mengikuti selectedSchedule melalui effect.
     */
  }, [loadSchedules]);

  /*
   * ==========================================
   * CREATE ATTENDANCE
   * ==========================================
   */

  const handleCreateAttendance = useCallback(
    async ({ id_peserta, status_kehadiran }) => {
      if (!selectedSchedule?.id_jadwal) {
        toast.error("Silakan pilih jadwal terlebih dahulu.");
        return false;
      }

      try {
        await createParticipantAttendance({
          id_jadwal: selectedSchedule.id_jadwal,
          id_peserta,
          status_kehadiran,
        });

        toast.success("Absensi peserta berhasil ditambahkan.");

        await loadParticipantAttendance(selectedSchedule.id_jadwal);

        return true;
      } catch (err) {
        console.error("CREATE ATTENDANCE ERROR:", err);

        toast.error(err?.message || "Gagal menambahkan absensi peserta.");

        return false;
      }
    },
    [selectedSchedule, loadParticipantAttendance, toast]
  );

  /*
   * ==========================================
   * UPDATE ATTENDANCE
   * ==========================================
   */

  const handleUpdateAttendance = useCallback(
    async (idAbsensi, status_kehadiran) => {
      try {
        await updateParticipantAttendance(idAbsensi, {
          status_kehadiran,
        });

        toast.success("Absensi peserta berhasil diperbarui.");

        if (selectedSchedule?.id_jadwal) {
          await loadParticipantAttendance(selectedSchedule.id_jadwal);
        }

        return true;
      } catch (err) {
        console.error("UPDATE ATTENDANCE ERROR:", err);

        toast.error(err?.message || "Gagal memperbarui absensi peserta.");

        return false;
      }
    },
    [selectedSchedule, loadParticipantAttendance, toast]
  );

  /*
   * ==========================================
   * DELETE ATTENDANCE
   * ==========================================
   */

  const handleDeleteAttendance = useCallback(
    async (idAbsensi) => {
      try {
        await deleteParticipantAttendance(idAbsensi);

        toast.success("Absensi peserta berhasil dihapus.");

        if (selectedSchedule?.id_jadwal) {
          await loadParticipantAttendance(selectedSchedule.id_jadwal);
        }

        return true;
      } catch (err) {
        console.error("DELETE ATTENDANCE ERROR:", err);

        toast.error(err?.message || "Gagal menghapus absensi peserta.");

        return false;
      }
    },
    [selectedSchedule, loadParticipantAttendance, toast]
  );

  /*
   * ==========================================
   * RETURN
   * ==========================================
   */

  return {
    schedules,
    selectedSchedule,

    participants,
    meta,

    scheduleLoading,
    loading,
    error,

    loadSchedules,
    loadParticipantAttendance,

    handleScheduleChange,
    handleRefresh,

    handleCreateAttendance,
    handleUpdateAttendance,
    handleDeleteAttendance,
  };
}
