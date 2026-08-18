import { CalendarDays, RefreshCw } from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import Card from "../components/ui/Card";
import AppPageHeader from "../components/ui/AppPageHeader";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";

import ScheduleCalendar from "../components/schedule/ScheduleCalendar";
import ScheduleDetailModal from "../components/schedule/ScheduleDetailModal";
import ScheduleRescheduleModal from "../components/schedule/ScheduleRescheduleModal";

import { useToast } from "../context/ToastContext";

import { getSchedules } from "../services/scheduleService";

import { getMeetingType } from "../utils/schedule";

export default function SchedulePage() {
  const toast = useToast();

  /*
   * ==========================================
   * STATE
   * ==========================================
   */

  const [schedules, setSchedules] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [classFilter, setClassFilter] = useState("all");

  const [meetingType, setMeetingType] = useState("all");

  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  /*
   * ==========================================
   * LOAD DATA
   * ==========================================
   */

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSchedules();

      console.log("SCHEDULE API RESPONSE:", response);

      /*
       * Bisa menangani:
       *
       * fetch:
       * {
       *   status: "success",
       *   data: [...]
       * }
       *
       * axios:
       * {
       *   data: {
       *     status: "success",
       *     data: [...]
       *   }
       * }
       */

      const result = response?.data ?? response;

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];

      console.log("SCHEDULE DATA:", data);

      setSchedules(data);
    } catch (err) {
      console.error("Failed to load schedules:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat data jadwal.";

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
  }, [loadSchedules]);

  /*
   * ==========================================
   * FILTERED DATA
   * ==========================================
   */

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesClass =
        classFilter === "all" ||
        String(schedule.id_paketkelas) === String(classFilter);

      const matchesMeetingType =
        meetingType === "all" || getMeetingType(schedule) === meetingType;

      return matchesClass && matchesMeetingType;
    });
  }, [schedules, classFilter, meetingType]);

  /*
   * ==========================================
   * FILTER RESET
   * ==========================================
   */

  function handleResetFilters() {
    setClassFilter("all");
    setMeetingType("all");
  }

  /*
   * ==========================================
   * DETAIL
   * ==========================================
   */

  function handleScheduleClick(schedule) {
    setSelectedSchedule(schedule);
    setDetailModalOpen(true);
  }

  function handleCloseDetail() {
    setDetailModalOpen(false);
    setSelectedSchedule(null);
  }

  /*
   * ==========================================
   * RESCHEDULE
   * ==========================================
   */

  function handleReschedule(schedule) {
    setSelectedSchedule(schedule);

    setDetailModalOpen(false);

    setRescheduleModalOpen(true);
  }

  function handleCloseReschedule() {
    setRescheduleModalOpen(false);
  }

  /*
   * ==========================================
   * RESCHEDULE SUCCESS
   * ==========================================
   *
   * Setelah PATCH berhasil:
   *
   * 1. Modal ditutup oleh modal
   * 2. GET /jadwal dipanggil kembali
   * 3. Kalender menggunakan data terbaru
   *
   * ==========================================
   */

  async function handleRescheduleSuccess() {
    await loadSchedules();

    setSelectedSchedule(null);

    setRescheduleModalOpen(false);
  }

  /*
   * ==========================================
   * REFRESH
   * ==========================================
   */

  async function handleRefresh() {
    await loadSchedules();

    toast.success("Data jadwal berhasil diperbarui.");
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="space-y-5">
      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <AppPageHeader
        icon={CalendarDays}
        title="Jadwal Pertemuan"
        description="Kelola dan pantau jadwal pertemuan kelas."
        action={
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      {/* =====================================
          CALENDAR
          ===================================== */}

      {loading ? (
        <Card
          className="
            flex
            min-h-[500px]
            items-center
            justify-center
          "
        >
          <LoadingSpinner size="lg" label="Memuat jadwal..." />
        </Card>
      ) : error ? (
        <Card
          className="
            flex
            min-h-[400px]
            flex-col
            items-center
            justify-center
            p-8
            text-center
          "
        >
          <div
            className="
              mb-4
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-danger-light
              text-danger
            "
          >
            <CalendarDays size={22} />
          </div>

          <h2
            className="
              text-base
              font-semibold
              text-foreground
            "
          >
            Gagal memuat jadwal
          </h2>

          <p
            className="
              mt-1
              max-w-md
              text-sm
              text-foreground-muted
            "
          >
            {error}
          </p>

          <Button className="mt-4" onClick={loadSchedules}>
            Coba Lagi
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ScheduleCalendar
            schedules={filteredSchedules}
            allSchedules={schedules}
            classFilter={classFilter}
            meetingType={meetingType}
            onClassChange={setClassFilter}
            onMeetingTypeChange={setMeetingType}
            onResetFilters={handleResetFilters}
            onScheduleClick={handleScheduleClick}
          />
        </Card>
      )}

      {/* =====================================
          DETAIL MODAL
          ===================================== */}

      <ScheduleDetailModal
        open={detailModalOpen}
        schedule={selectedSchedule}
        onClose={handleCloseDetail}
        onReschedule={handleReschedule}
      />

      {/* =====================================
          RESCHEDULE MODAL
          ===================================== */}

      <ScheduleRescheduleModal
        open={rescheduleModalOpen}
        schedule={selectedSchedule}
        onClose={handleCloseReschedule}
        onSuccess={handleRescheduleSuccess}
      />
    </div>
  );
}
