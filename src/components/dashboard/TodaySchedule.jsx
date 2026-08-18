import { Clock3, Users, ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

import Card from "../ui/Card";

export default function TodaySchedule({ schedules = [] }) {
  /*
   * Ambil maksimal 2 jadwal terdekat.
   *
   * Prioritas:
   * 1. Jadwal yang tanggalnya paling dekat dengan hari ini
   * 2. Jika tanggal sama, waktu mulai paling awal
   */

  const nearestSchedules = getNearestSchedules(schedules, 2);

  return (
    <Card className="p-4">
      {/* ======================================
          HEADER
          ====================================== */}

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Jadwal Terdekat
          </h3>

          <p className="mt-1 text-xs text-foreground-muted">
            Jadwal yang paling dekat dengan waktu sekarang.
          </p>
        </div>

        <Link
          type="button"
          to={"/schedules"}
          className="
            flex
            items-center
            gap-1
            text-xs
            font-medium
            text-primary-600
            hover:text-primary-700
            dark:text-primary-400
          "
        >
          Lihat semua
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ======================================
          EMPTY
          ====================================== */}

      {nearestSchedules.length === 0 ? (
        <div
          className="
            flex
            min-h-[160px]
            flex-col
            items-center
            justify-center
            rounded-xl
            border
            border-dashed
            border-border
            text-center
          "
        >
          <CalendarDays size={28} className="text-foreground-muted" />

          <p className="mt-3 text-sm font-medium text-foreground">
            Tidak ada jadwal
          </p>

          <p className="mt-1 text-xs text-foreground-muted">
            Belum tersedia jadwal terdekat.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {nearestSchedules.map((schedule) => (
            <ScheduleItem key={schedule.id_jadwal} schedule={schedule} />
          ))}
        </div>
      )}
    </Card>
  );
}

/*
 * ==========================================
 * SCHEDULE ITEM
 * ==========================================
 */

function ScheduleItem({ schedule }) {
  const date = getEffectiveDate(schedule);

  const startTime = getEffectiveStartTime(schedule);

  const endTime = getEffectiveEndTime(schedule);

  const isToday = date === getTodayDate();

  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-border
        p-3
        transition-colors
        hover:bg-background-tertiary
      "
    >
      {/* ICON */}

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-primary-50
          text-primary-600
          dark:bg-primary-900/30
          dark:text-primary-400
        "
      >
        <Clock3 size={18} />
      </div>

      {/* CONTENT */}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {schedule.nama_kelas || "-"}
          </p>

          {isToday && (
            <span
              className="
                shrink-0
                rounded-full
                bg-success-light
                px-2
                py-0.5
                text-[10px]
                font-medium
                text-success
              "
            >
              Hari ini
            </span>
          )}
        </div>

        {/* DATE + TIME */}

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs text-foreground-muted">
            {formatDate(date)}
          </span>

          <span className="text-xs text-foreground-muted">
            {formatTime(startTime)} - {formatTime(endTime)}
          </span>
        </div>

        {/* MENTOR + TYPE */}

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs text-foreground-muted">
            {schedule.nickname_mentor || schedule.nama_mentor || "-"}
          </span>

          <span className="flex items-center gap-1 text-xs text-foreground-muted">
            <Users size={12} />

            {schedule.nama_kelas ? "Peserta" : "-"}
          </span>

          <span className="text-[10px] font-medium text-foreground-muted">
            {schedule.type_pertemuan || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * GET NEAREST SCHEDULES
 * ==========================================
 */

function getNearestSchedules(schedules, limit = 2) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return [];
  }

  const today = getTodayDate();

  const normalized = schedules
    .filter((schedule) => schedule?.id_jadwal && getEffectiveDate(schedule))
    .map((schedule) => ({
      ...schedule,

      _date: getEffectiveDate(schedule),

      _dateTime: getScheduleDateTime(schedule),
    }))
    .filter(
      (schedule) =>
        schedule._dateTime && !Number.isNaN(schedule._dateTime.getTime())
    );

  /*
   * ==========================================
   * JADWAL HARI INI
   * ==========================================
   */

  const todaySchedules = normalized
    .filter((schedule) => schedule._date === today)
    .sort((a, b) => a._dateTime.getTime() - b._dateTime.getTime());

  /*
   * ==========================================
   * JADWAL SETELAH HARI INI
   * ==========================================
   */

  const upcomingSchedules = normalized
    .filter((schedule) => schedule._date > today)
    .sort((a, b) => a._dateTime.getTime() - b._dateTime.getTime());

  /*
   * ==========================================
   * PRIORITAS
   * ==========================================
   *
   * Contoh:
   *
   * Hari ini:
   * - Jadwal A
   *
   * Besok:
   * - Jadwal B
   * - Jadwal C
   *
   * Hasil:
   * A
   * B
   *
   *
   * Jika hari ini:
   * - A
   * - B
   * - C
   *
   * Hasil:
   * A
   * B
   */

  return [...todaySchedules, ...upcomingSchedules].slice(0, limit);
}

/*
 * ==========================================
 * EFFECTIVE DATE
 * ==========================================
 */

function getEffectiveDate(schedule) {
  return schedule?.tanggal_efektif || schedule?.tanggal || null;
}

/*
 * ==========================================
 * EFFECTIVE TIME
 * ==========================================
 */

function getEffectiveStartTime(schedule) {
  return schedule?.waktu_mulai_efektif || schedule?.waktu_mulai || null;
}

function getEffectiveEndTime(schedule) {
  return schedule?.waktu_selesai_efektif || schedule?.waktu_selesai || null;
}

/*
 * ==========================================
 * SCHEDULE DATETIME
 * ==========================================
 */

function getScheduleDateTime(schedule) {
  const date = getEffectiveDate(schedule);

  const time = getEffectiveStartTime(schedule) || "00:00:00";

  if (!date) {
    return null;
  }

  const value = new Date(`${date}T${time}`);

  return value;
}

/*
 * ==========================================
 * TODAY
 * ==========================================
 */

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * ==========================================
 * FORMAT DATE
 * ==========================================
 */

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const value = new Date(`${date}T00:00:00`);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/*
 * ==========================================
 * FORMAT TIME
 * ==========================================
 */

function formatTime(time) {
  if (!time) {
    return "-";
  }

  return String(time).slice(0, 5);
}
