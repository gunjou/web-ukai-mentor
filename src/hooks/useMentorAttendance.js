import { useCallback, useEffect, useMemo, useState } from "react";

import { useToast } from "../context/ToastContext";

import { getSchedules } from "../services/scheduleService";
import {
  mentorCheckIn,
  mentorCheckOut,
  getMentorAttendanceStatus,
} from "../services/attendanceService";

import { getScheduleStartTime, getScheduleEndTime } from "../utils/schedule";
import { getWibNow } from "../utils/time";

// Batas akurasi sama dengan backend; > APPROXIMATE biasanya izin "lokasi perkiraan".
const MAX_GPS_ACCURACY = 300;
const APPROXIMATE_GPS_ACCURACY = 500;
const GOOD_GPS_ACCURACY = 20;
const GPS_SAMPLING_MS = 12000;

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

  const [now, setNow] = useState(() => getWibNow());

  /*
   * ==========================================
   * CLOCK
   * ==========================================
   */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getWibNow());
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

      if (!isOnline && location) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
        payload.accuracy = location.accuracy;
      }

      if (!isOnline && evidence) {
        payload.evidence = evidence;
      }

      console.log("MENTOR CHECK-IN PAYLOAD:", payload);

      const response = await mentorCheckIn(payload);

      setCheckInData(response);
      setEvidence(null);
      // Check-out wajib mengambil lokasi baru, bukan koordinat check-in.
      setLocation(null);

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
   * GROUP CHECK IN
   * ==========================================
   *
   * Fungsi baru.
   *
   * Fungsi handleCheckIn() existing tidak
   * diubah karena mungkin digunakan di tempat lain.
   *
   * Setiap jadwal tetap menggunakan endpoint
   * mentorCheckIn() yang sudah ada.
   */

  const handleCheckInGroup = useCallback(
    async (groupSchedules = []) => {
      if (!groupSchedules.length) {
        toast.error("Tidak ada jadwal yang dipilih.");
        return;
      }

      if (!scheduleTimeStatus.canCheckIn) {
        toast.error(getTimeRestrictionMessage(scheduleTimeStatus.status));
        return;
      }

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

        for (const schedule of groupSchedules) {
          // Saat percobaan ulang, jadwal yang sudah berhasil dilewati.
          const status = await getMentorAttendanceStatus(schedule.id_jadwal);

          if (status?.data?.check_in_at) {
            continue;
          }

          const payload = {
            id_jadwal: schedule.id_jadwal,
          };

          if (!isOnline && location) {
            payload.latitude = location.latitude;
            payload.longitude = location.longitude;
            payload.accuracy = location.accuracy;
          }

          if (!isOnline && evidence) {
            payload.evidence = evidence;
          }

          console.log("MENTOR GROUP CHECK-IN PAYLOAD:", payload);

          await mentorCheckIn(payload);
        }

        setEvidence(null);
        // Check-out wajib mengambil lokasi baru, bukan koordinat check-in.
        setLocation(null);

        await loadAttendanceStatus(selectedSchedule);

        toast.success(
          `Check-in berhasil untuk ${groupSchedules.length} jadwal.`,
        );
      } catch (err) {
        console.error("GROUP CHECK-IN ERROR:", err);

        toast.error(err?.message || "Gagal melakukan check-in.");
      } finally {
        setSubmitting(false);
      }
    },
    [
      selectedSchedule,
      scheduleTimeStatus,
      location,
      evidence,
      toast,
      loadAttendanceStatus,
    ],
  );

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

      if (!isOnline && location) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
        payload.accuracy = location.accuracy;
      }

      if (!isOnline && evidence) {
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
   * GROUP CHECK OUT
   * ==========================================
   *
   * Fungsi baru.
   *
   * Fungsi handleCheckOut() existing tidak
   * diubah.
   */

  const handleCheckOutGroup = useCallback(
    async (groupSchedules = []) => {
      if (!groupSchedules.length) {
        toast.error("Tidak ada jadwal yang dipilih.");
        return;
      }

      if (attendanceStatus !== "checked-in") {
        toast.error("Anda belum melakukan check-in.");
        return;
      }

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

        let notCheckedIn = 0;

        for (const schedule of groupSchedules) {
          // Saat percobaan ulang, jadwal yang sudah selesai dilewati.
          const status = await getMentorAttendanceStatus(schedule.id_jadwal);

          if (status?.data?.check_out_at) {
            continue;
          }

          if (!status?.data?.check_in_at) {
            notCheckedIn += 1;
            continue;
          }

          const payload = {
            id_jadwal: schedule.id_jadwal,
          };

          if (!isOnline && location) {
            payload.latitude = location.latitude;
            payload.longitude = location.longitude;
            payload.accuracy = location.accuracy;
          }

          if (!isOnline && evidence) {
            payload.evidence = evidence;
          }

          console.log("MENTOR GROUP CHECK-OUT PAYLOAD:", payload);

          await mentorCheckOut(payload);
        }

        setEvidence(null);

        await loadAttendanceStatus(selectedSchedule);

        if (notCheckedIn > 0) {
          toast.warning(
            `${notCheckedIn} jadwal dilewati karena belum check-in. Hubungi admin.`,
          );
        } else {
          toast.success(
            `Check-out berhasil untuk ${groupSchedules.length} jadwal.`,
          );
        }
      } catch (err) {
        console.error("GROUP CHECK-OUT ERROR:", err);

        toast.error(err?.message || "Gagal melakukan check-out.");
      } finally {
        setSubmitting(false);
      }
    },
    [
      selectedSchedule,
      attendanceStatus,
      location,
      evidence,
      toast,
      loadAttendanceStatus,
    ],
  );

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
    setLocation(null);

    /*
     * Titik mentor menjadi acuan semua peserta, jadi pantau GPS beberapa
     * detik dan pakai pembacaan paling presisi, bukan pembacaan pertama.
     */
    let best = null;
    let watchId = null;
    let timer = null;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      setLocationLoading(false);

      if (!best) {
        toast.error("Lokasi tidak terbaca. Aktifkan GPS lalu coba lagi.");
        return;
      }

      if (best.accuracy > MAX_GPS_ACCURACY) {
        setLocation(null);
        toast.error(
          best.accuracy > APPROXIMATE_GPS_ACCURACY
            ? "Browser hanya memberi lokasi perkiraan. Aktifkan 'Lokasi akurat/Precise Location' untuk browser ini lalu ambil ulang."
            : "Akurasi GPS terlalu rendah. Pindah ke dekat jendela/area terbuka lalu ambil ulang.",
        );
        return;
      }

      toast.success(`Lokasi diperoleh (akurasi ±${Math.round(best.accuracy)} m).`);
    };

    timer = setTimeout(finish, GPS_SAMPLING_MS);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const reading = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        if (best && reading.accuracy >= best.accuracy) return;

        best = reading;
        setLocation(reading);

        if (reading.accuracy <= GOOD_GPS_ACCURACY) finish();
      },
      (error) => {
        // Error setelah ada pembacaan bagus tidak perlu menggagalkan pengambilan.
        if (done || (best && error.code !== 1)) return;

        done = true;
        console.error("GPS ERROR:", error);

        navigator.geolocation.clearWatch(watchId);
        clearTimeout(timer);
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

    /*
     * Existing handlers
     */
    handleCheckIn,
    handleCheckOut,

    /*
     * New group handlers
     */
    handleCheckInGroup,
    handleCheckOutGroup,
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

  const [year, month, day] = date.split("-").map(Number);

  const [hour = 0, minute = 0, second = 0] = String(time)
    .split(":")
    .map(Number);

  const parsed = new Date(year, month - 1, day, hour, minute, second);

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
