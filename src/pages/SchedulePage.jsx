import { CalendarDays, FileDown, RefreshCw } from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import Card from "../components/ui/Card";
import AppPageHeader from "../components/ui/AppPageHeader";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";

import ScheduleCalendar from "../components/schedule/ScheduleCalendar";
import ScheduleDetailModal from "../components/schedule/ScheduleDetailModal";
import ScheduleRescheduleModal from "../components/schedule/ScheduleRescheduleModal";

import { useToast } from "../context/ToastContext";

import {
  getSchedulesGroup,
  getSchedulesWaliKelas,
} from "../services/scheduleService";
import { getWaliKelasStatus } from "../services/profileService";

import { getMeetingType, groupSchedulesByTime } from "../utils/schedule";
import { toDateKey } from "../utils/calendar";
import { exportWaliKelasSchedulePdf } from "../utils/schedulePdf";

/*
 * Opsi filter kelas wali kelas diambil dari
 * GET /profile/wali-kelas -> data.kelas
 */
function toWaliKelasClassOptions(kelas = []) {
  return kelas
    .filter((item) => item?.id_paketkelas)
    .map((item) => ({
      value: String(item.id_paketkelas),
      label:
        item.nama_kelas || item.nama_kelompok || `Kelas ${item.id_paketkelas}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function getFirstDayOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

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
   * null  = status wali kelas belum dicek
   * true  = gunakan GET /jadwal/wali-kelas
   * false = alur lama GET /jadwal/group
   */
  const [isWaliKelas, setIsWaliKelas] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(() =>
    getFirstDayOfMonth(),
  );

  const [waliKelasMeta, setWaliKelasMeta] = useState(null);

  const [waliKelasClassOptions, setWaliKelasClassOptions] = useState([]);

  const [exporting, setExporting] = useState(false);

  /*
   * ==========================================
   * CEK STATUS WALI KELAS
   * ==========================================
   *
   * Jika gagal dicek, fallback ke alur lama.
   */

  useEffect(() => {
    let active = true;

    getWaliKelasStatus()
      .then((result) => {
        if (active) {
          setWaliKelasClassOptions(
            result.isWaliKelas ? toWaliKelasClassOptions(result.kelas) : [],
          );
          setIsWaliKelas(result.isWaliKelas);
        }
      })
      .catch((err) => {
        console.error("Failed to check wali kelas status:", err);

        if (active) {
          setIsWaliKelas(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  /*
   * ==========================================
   * LOAD DATA
   * ==========================================
   */

  const loadGroupSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSchedulesGroup();

      console.log("SCHEDULE API RESPONSE:", response);

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
   * LOAD DATA WALI KELAS
   * ==========================================
   *
   * - Semua kelas  : hanya ringkasan per tanggal (meta.per_tanggal)
   * - Kelas dipilih: daftar jadwal kelas tersebut
   */

  const loadWaliKelasSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const idPaketkelas = classFilter === "all" ? null : classFilter;

      const response = await getSchedulesWaliKelas({
        bulan: toDateKey(currentMonth).slice(0, 7),
        idPaketkelas,
      });

      if (idPaketkelas) {
        setWaliKelasMeta(null);
        setSchedules(groupSchedulesByTime(response.data));
      } else {
        setWaliKelasMeta(response.meta);
        setSchedules([]);
      }
    } catch (err) {
      console.error("Failed to load wali kelas schedules:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memuat data jadwal.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [classFilter, currentMonth, toast]);

  const loadSchedules =
    isWaliKelas === true ? loadWaliKelasSchedules : loadGroupSchedules;

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    if (isWaliKelas === false) {
      loadGroupSchedules();
    }
  }, [isWaliKelas, loadGroupSchedules]);

  useEffect(() => {
    if (isWaliKelas === true) {
      loadWaliKelasSchedules();
    }
  }, [isWaliKelas, loadWaliKelasSchedules]);

  /*
   * ==========================================
   * SUMMARY PER TANGGAL (WALI KELAS)
   * ==========================================
   */

  const summaryByDate = useMemo(() => {
    if (!isWaliKelas || !waliKelasMeta) {
      return null;
    }

    const map = {};

    (waliKelasMeta.per_tanggal || []).forEach((item) => {
      const key = toDateKey(item?.tanggal);

      if (key) {
        map[key] = item;
      }
    });

    return map;
  }, [isWaliKelas, waliKelasMeta]);

  /*
   * ==========================================
   * FILTERED DATA
   * ==========================================
   */

  const filteredSchedules = useMemo(() => {
    /*
     * Mode wali kelas: filter kelas sudah dilakukan di backend,
     * tipe pertemuan difilter per kelas di dalam group.
     */
    if (isWaliKelas) {
      if (meetingType === "all") {
        return schedules;
      }

      return schedules
        .map((group) => ({
          ...group,
          classes: group.classes.filter(
            (item) => getMeetingType(item) === meetingType,
          ),
        }))
        .filter((group) => group.classes.length > 0);
    }

    return schedules.filter((schedule) => {
      const matchesClass =
        classFilter === "all" ||
        String(schedule.id_paketkelas) === String(classFilter);

      const matchesMeetingType =
        meetingType === "all" || getMeetingType(schedule) === meetingType;

      return matchesClass && matchesMeetingType;
    });
  }, [isWaliKelas, schedules, classFilter, meetingType]);

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
   * EXPORT PDF (WALI KELAS)
   * ==========================================
   *
   * - Kelas dipilih: ambil jadwal kelas tersebut
   * - Semua kelas  : API hanya mengirim ringkasan, jadi jadwal
   *                  diambil per kelas wali lalu digabung
   *
   * Filter tipe pertemuan ikut diterapkan.
   */

  async function handleExportPdf() {
    const bulan = toDateKey(currentMonth).slice(0, 7);

    const classIds =
      classFilter === "all"
        ? waliKelasClassOptions.map((option) => option.value)
        : [classFilter];

    if (!classIds.length) {
      toast.error("Tidak ada kelas wali yang dapat diexport.");
      return;
    }

    try {
      setExporting(true);

      const responses = await Promise.all(
        classIds.map((idPaketkelas) =>
          getSchedulesWaliKelas({ bulan, idPaketkelas }),
        ),
      );

      const exportSchedules = responses
        .flatMap((response) => response.data)
        .filter(
          (item) =>
            meetingType === "all" || getMeetingType(item) === meetingType,
        );

      if (!exportSchedules.length) {
        toast.error("Tidak ada jadwal untuk diexport pada periode ini.");
        return;
      }

      const className =
        classFilter === "all"
          ? null
          : waliKelasClassOptions.find(
              (option) => option.value === String(classFilter),
            )?.label;

      exportWaliKelasSchedulePdf({
        schedules: exportSchedules,
        bulan,
        className,
        meetingType,
      });

      toast.success("PDF jadwal berhasil dibuat.");
    } catch (err) {
      console.error("Failed to export wali kelas schedules:", err);

      toast.error(err?.message || "Gagal export PDF jadwal.");
    } finally {
      setExporting(false);
    }
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
        title="Jadwal Pertemuan"
        description="Kelola dan pantau jadwal pertemuan kelas."
        action={
          <div className="flex items-center gap-2">
            {isWaliKelas && (
              <Button
                variant="outline"
                onClick={handleExportPdf}
                disabled={loading || exporting}
              >
                <FileDown size={16} />
                {exporting ? "Mengexport..." : "Export PDF"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
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
          {summaryByDate && (
            <div
              className="
                border-b
                border-border
                bg-background-tertiary
                px-3
                py-2
                text-xs
                text-foreground-muted
                sm:px-4
              "
            >
              Total{" "}
              <span className="font-semibold text-foreground">
                {waliKelasMeta?.total ?? 0} jadwal
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-foreground">
                {waliKelasMeta?.total_kelas ?? 0} kelas
              </span>{" "}
              bulan ini. Pilih kelas untuk melihat detail jadwal.
            </div>
          )}

          <ScheduleCalendar
            schedules={filteredSchedules}
            allSchedules={schedules}
            month={isWaliKelas ? currentMonth : undefined}
            onMonthChange={isWaliKelas ? setCurrentMonth : undefined}
            classOptions={isWaliKelas ? waliKelasClassOptions : undefined}
            summaryByDate={summaryByDate}
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
        onReschedule={isWaliKelas ? undefined : handleReschedule}
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
