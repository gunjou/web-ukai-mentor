import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "../context/ToastContext";

import { getSchedules } from "../services/scheduleService";
import {
  mentorCheckIn,
  mentorCheckOut,
  getMentorAttendanceStatus,
} from "../services/attendanceService";

import { getScheduleStartTime, getScheduleEndTime } from "../utils/schedule";

export default function useMentorAttendance() {
  const toast = useToast();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [evidence, setEvidence] = useState(null);

  const [attendanceStatus, setAttendanceStatus] = useState("idle");
  const [attendanceDetail, setAttendanceDetail] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [checkInData, setCheckInData] = useState(null);
  const [checkOutData, setCheckOutData] = useState(null);

  const [now, setNow] = useState(() => new Date());

  /*
   * ==========================================
   * CLOCK
   * ==========================================
   */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * ==========================================
   * LOAD SCHEDULES
   * ==========================================
   */

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSchedules();

      const result = response?.data ?? response;

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setSchedules(data);
    } catch (err) {
      console.error("Failed to load schedules:", err);

      const message = err?.message || "Gagal memuat jadwal.";

      setError(message);

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
    loadSchedules();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * ==========================================
   * TODAY SCHEDULES
   * ==========================================
   */

  const todaySchedules = useMemo(() => {
    const today = formatDateKey(now);

    return schedules
      .filter((schedule) => {
        const date =
          schedule?.tanggal_efektif ||
          schedule?.tanggal_reschedule ||
          schedule?.tanggal;

        return date === today && Number(schedule?.status) === 1;
      })
      .sort((a, b) => {
        const timeA = getScheduleStartTime(a) || "";
        const timeB = getScheduleStartTime(b) || "";

        return timeA.localeCompare(timeB);
      });
  }, [schedules, now]);

  /*
   * ==========================================
   * DEFAULT SCHEDULE
   * ==========================================
   */

  useEffect(() => {
    if (!selectedSchedule && todaySchedules.length > 0) {
      setSelectedSchedule(todaySchedules[0]);
    }
  }, [todaySchedules, selectedSchedule]);

  /*
   * ==========================================
   * LOAD ATTENDANCE STATUS
   * ==========================================
   */

  const loadAttendanceStatus = useCallback(async (schedule) => {
    if (!schedule?.id_jadwal) {
      setAttendanceStatus("idle");
      setAttendanceDetail(null);
      return;
    }

    try {
      setAttendanceLoading(true);

      const response = await getMentorAttendanceStatus(schedule.id_jadwal);

      console.log("MENTOR ATTENDANCE STATUS RESPONSE:", response);

      const data = response?.data ?? null;

      console.log("MENTOR ATTENDANCE DETAIL:", data);
      console.log("STATUS ABSENSI:", data?.status_absensi);

      setAttendanceDetail(data);

      switch (data?.status_absensi) {
        case "CHECK_IN":
          setAttendanceStatus("checked-in");
          break;

        case "CHECK_OUT":
          setAttendanceStatus("checked-out");
          break;

        case "SELESAI":
          setAttendanceStatus("completed");
          break;

        default:
          setAttendanceStatus("idle");
      }
    } catch (err) {
      console.error("FAILED LOAD MENTOR ATTENDANCE STATUS:", err);

      setAttendanceStatus("idle");
      setAttendanceDetail(null);
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  /*
   * ==========================================
   * LOAD STATUS WHEN SCHEDULE CHANGES
   * ==========================================
   */

  useEffect(() => {
    if (!selectedSchedule?.id_jadwal) {
      setAttendanceStatus("idle");
      setAttendanceDetail(null);
      return;
    }

    loadAttendanceStatus(selectedSchedule);
  }, [selectedSchedule, loadAttendanceStatus]);

  /*
   * ==========================================
   * TIME STATUS
   * ==========================================
   */

  const scheduleTimeStatus = useMemo(() => {
    if (!selectedSchedule) {
      return {
        status: "none",
        label: "Tidak ada jadwal",
        canCheckIn: false,
        canCheckOut: false,
      };
    }

    const start = createDateTime(
      selectedSchedule,
      getScheduleStartTime(selectedSchedule),
    );

    const end = createDateTime(
      selectedSchedule,
      getScheduleEndTime(selectedSchedule),
    );

    if (!start || !end) {
      return {
        status: "invalid",
        label: "Waktu jadwal tidak valid",
        canCheckIn: false,
        canCheckOut: false,
      };
    }

    /*
     * ABSENSI SUDAH SELESAI
     */

    if (attendanceStatus === "checked-out") {
      return {
        status: "completed",
        label: "Absensi selesai",
        canCheckIn: false,
        canCheckOut: false,
        start,
        end,
      };
    }

    /*
     * BELUM WAKTUNYA
     */

    if (now < start) {
      return {
        status: "upcoming",
        label: "Belum waktunya",
        canCheckIn: false,
        canCheckOut: false,
        start,
        end,
      };
    }

    /*
     * JADWAL SEDANG BERLANGSUNG
     */

    if (now >= start && now <= end) {
      return {
        status: "active",
        label: "Jadwal sedang berlangsung",
        canCheckIn: attendanceStatus === "idle",
        canCheckOut: attendanceStatus === "checked-in",
        start,
        end,
      };
    }

    /*
     * JADWAL SUDAH SELESAI
     */

    return {
      status: "finished",
      label: "Jadwal telah selesai",
      canCheckIn: false,
      canCheckOut: attendanceStatus === "checked-in",
      start,
      end,
    };
  }, [selectedSchedule, now, attendanceStatus]);

  /*
   * ==========================================
   * EVIDENCE
   * ==========================================
   */

  const handleEvidenceChange = useCallback((event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setEvidence(null);
      return;
    }

    setEvidence(file);
  }, []);

  /*
   * ==========================================
   * CHECK IN
   * ==========================================
   */

  const handleCheckIn = useCallback(async () => {
    if (!selectedSchedule) {
      toast.error("Silakan pilih jadwal terlebih dahulu.");
      return;
    }

    if (!scheduleTimeStatus.canCheckIn) {
      toast.error(getTimeRestrictionMessage(scheduleTimeStatus.status));
      return;
    }

    /*
     * ========================================
     * CEK TIPE PERTEMUAN
     * ========================================
     *
     * ONLINE:
     * - lokasi optional
     * - evidence optional
     *
     * OFFLINE:
     * - lokasi required
     * - evidence required
     */

    const isOnline = isOnlineSchedule(selectedSchedule);

    if (!isOnline && !location) {
      toast.error("Silakan ambil lokasi terlebih dahulu.");
      return;
    }

    if (!isOnline && !evidence) {
      toast.error("Silakan upload foto evidence check-in.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * ========================================
       * BUILD PAYLOAD
       * ========================================
       *
       * Jangan mengirim latitude/longitude
       * jika lokasi memang tidak tersedia.
       */

      const payload = {
        id_jadwal: selectedSchedule.id_jadwal,
      };

      if (location) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
        payload.accuracy = location.accuracy;
      }

      if (evidence) {
        payload.evidence = evidence;
      }

      console.log("MENTOR CHECK-IN PAYLOAD:", payload);

      const response = await mentorCheckIn(payload);

      setCheckInData(response);

      await loadAttendanceStatus(selectedSchedule);

      toast.success(response?.message || "Check-in berhasil.");
    } catch (err) {
      console.error("CHECK-IN ERROR:", err);

      toast.error(err?.message || "Gagal melakukan check-in.");
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedSchedule,
    scheduleTimeStatus,
    location,
    evidence,
    toast,
    loadAttendanceStatus,
  ]);

  /*
   * ==========================================
   * CHECK OUT
   * ==========================================
   */

  const handleCheckOut = useCallback(async () => {
    if (!selectedSchedule) {
      return;
    }

    if (attendanceStatus !== "checked-in") {
      toast.error("Anda belum melakukan check-in.");
      return;
    }

    /*
     * ========================================
     * CEK TIPE PERTEMUAN
     * ========================================
     */

    const isOnline = isOnlineSchedule(selectedSchedule);

    if (!isOnline && !location) {
      toast.error("Silakan ambil lokasi terlebih dahulu.");
      return;
    }

    if (!isOnline && !evidence) {
      toast.error("Silakan upload foto evidence check-out.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * ========================================
       * BUILD PAYLOAD
       * ========================================
       */

      const payload = {
        id_jadwal: selectedSchedule.id_jadwal,
      };

      if (location) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
        payload.accuracy = location.accuracy;
      }

      if (evidence) {
        payload.evidence = evidence;
      }

      console.log("MENTOR CHECK-OUT PAYLOAD:", payload);

      const response = await mentorCheckOut(payload);

      setCheckOutData(response);

      await loadAttendanceStatus(selectedSchedule);

      toast.success(response?.message || "Check-out berhasil.");
    } catch (err) {
      console.error("CHECK-OUT ERROR:", err);

      toast.error(err?.message || "Gagal melakukan check-out.");
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedSchedule,
    attendanceStatus,
    location,
    evidence,
    toast,
    loadAttendanceStatus,
  ]);

  /*
   * ==========================================
   * LOCATION
   * ==========================================
   */

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung GPS.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationLoading(false);

        toast.success("Lokasi berhasil diperoleh.");
      },
      (error) => {
        console.error("GPS ERROR:", error);

        setLocationLoading(false);

        let message = "Gagal mendapatkan lokasi.";

        if (error.code === 1) {
          message = "Izin lokasi ditolak. Silakan izinkan akses lokasi.";
        }

        if (error.code === 2) {
          message = "Lokasi tidak tersedia.";
        }

        if (error.code === 3) {
          message = "Pengambilan lokasi terlalu lama.";
        }

        toast.error(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }, [toast]);

  /*
   * ==========================================
   * CHANGE SCHEDULE
   * ==========================================
   */

  const handleScheduleChange = useCallback((schedule) => {
    setSelectedSchedule(schedule);

    setLocation(null);
    setEvidence(null);

    setAttendanceStatus("idle");
    setAttendanceDetail(null);

    setCheckInData(null);
    setCheckOutData(null);
  }, []);

  /*
   * ==========================================
   * RETURN
   * ==========================================
   */

  return {
    schedules,
    todaySchedules,

    loading,
    submitting,
    error,

    now,

    selectedSchedule,
    attendanceStatus,
    attendanceDetail,
    attendanceLoading,

    scheduleTimeStatus,

    location,
    locationLoading,

    evidence,

    checkInData,
    checkOutData,

    loadSchedules,
    handleScheduleChange,

    handleGetLocation,
    handleEvidenceChange,

    handleCheckIn,
    handleCheckOut,
  };
}

/*
 * ==========================================
 * HELPERS
 * ==========================================
 */

function isOnlineSchedule(schedule) {
  return (
    String(schedule?.type_pertemuan || "")
      .trim()
      .toUpperCase() === "ONLINE"
  );
}

function formatDateKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDateTime(schedule, time) {
  const date =
    schedule?.tanggal_efektif ||
    schedule?.tanggal_reschedule ||
    schedule?.tanggal;

  if (!date || !time) {
    return null;
  }

  const parsed = new Date(`${date}T${time}`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function getTimeRestrictionMessage(status) {
  if (status === "upcoming") {
    return "Belum waktunya check-in.";
  }

  if (status === "finished") {
    return "Jadwal sudah selesai.";
  }

  return "Check-in tidak dapat dilakukan.";
}
