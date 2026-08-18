import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

import { useMemo, useState } from "react";

import ScheduleEvent from "./ScheduleEvent";
import ScheduleFilters from "./ScheduleFilters";
import ScheduleLegend from "./ScheduleLegend";

import Button from "../ui/Button";

import {
  getCalendarDays,
  getMonthLabel,
  isSameDate,
  toDateKey,
} from "../../utils/calendar";

import { cn } from "../../utils/cn";

export default function ScheduleCalendar({
  schedules = [],
  allSchedules = [],

  classFilter = "all",
  meetingType = "all",

  onClassChange,
  onMeetingTypeChange,
  onResetFilters,

  onScheduleClick,
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const [selectedDate, setSelectedDate] = useState(null);

  /*
   * ==========================================
   * CALENDAR DAYS
   * ==========================================
   */

  const calendarDays = useMemo(() => {
    return getCalendarDays(currentDate);
  }, [currentDate]);

  /*
   * ==========================================
   * TODAY
   * ==========================================
   */

  const today = useMemo(() => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  /*
   * ==========================================
   * MONTH LABEL
   * ==========================================
   */

  const monthLabel = useMemo(() => {
    return getMonthLabel(currentDate);
  }, [currentDate]);

  /*
   * ==========================================
   * CLASS OPTIONS
   * ==========================================
   */

  const classOptions = useMemo(() => {
    const source = allSchedules.length > 0 ? allSchedules : schedules;

    const map = new Map();

    source.forEach((schedule) => {
      if (!schedule?.id_paketkelas) {
        return;
      }

      const id = String(schedule.id_paketkelas);

      if (!map.has(id)) {
        map.set(id, {
          value: id,
          label: schedule.nama_kelas || `Kelas ${id}`,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [allSchedules, schedules]);

  /*
   * ==========================================
   * SCHEDULE MAP
   * ==========================================
   */

  const scheduleMap = useMemo(() => {
    const map = {};

    schedules.forEach((schedule) => {
      /*
       * Gunakan tanggal efektif.
       *
       * Jika tidak tersedia, gunakan tanggal awal.
       */
      const date = schedule?.tanggal_efektif || schedule?.tanggal;

      if (!date) {
        return;
      }

      const key = toDateKey(date);

      if (!key) {
        return;
      }

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(schedule);
    });

    /*
     * Sort berdasarkan waktu efektif
     */

    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        const timeA = a?.waktu_mulai_efektif || a?.waktu_mulai || "";

        const timeB = b?.waktu_mulai_efektif || b?.waktu_mulai || "";

        return timeA.localeCompare(timeB);
      });
    });

    return map;
  }, [schedules]);

  /*
   * ==========================================
   * NAVIGATION
   * ==========================================
   */

  function goPreviousMonth() {
    setCurrentDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );

    setSelectedDate(null);
  }

  function goNextMonth() {
    setCurrentDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );

    setSelectedDate(null);
  }

  function goToday() {
    const now = new Date();

    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));

    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  /*
   * ==========================================
   * RESET FILTER
   * ==========================================
   *
   * Fallback lokal juga disediakan supaya
   * tombol reset tetap bekerja walaupun
   * parent tidak mengirim callback.
   */

  function handleResetFilters() {
    onClassChange?.("all");
    onMeetingTypeChange?.("all");

    onResetFilters?.();
  }

  /*
   * ==========================================
   * DATE CLICK
   * ==========================================
   */

  function handleDateClick(day) {
    setSelectedDate(day);
  }

  /*
   * ==========================================
   * WEEK DAYS
   * ==========================================
   */

  const weekDays = [
    {
      short: "Min",
      long: "Minggu",
    },
    {
      short: "Sen",
      long: "Senin",
    },
    {
      short: "Sel",
      long: "Selasa",
    },
    {
      short: "Rab",
      long: "Rabu",
    },
    {
      short: "Kam",
      long: "Kamis",
    },
    {
      short: "Jum",
      long: "Jumat",
    },
    {
      short: "Sab",
      long: "Sabtu",
    },
  ];

  return (
    <div className="w-full min-w-0">
      {/* =====================================
          CALENDAR HEADER
          ===================================== */}

      <div
        className="
          border-b
          border-border
          px-3
          py-2
          sm:px-4
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          {/* ==================================
              MONTH NAVIGATION
              ================================== */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-1.5
            "
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={goPreviousMonth}
              aria-label="Bulan sebelumnya"
              className="h-8 w-8"
            >
              <ChevronLeft size={16} />
            </Button>

            <div
              className="
                min-w-[150px]
                text-center
                sm:min-w-[180px]
              "
            >
              <h2
                className="
                  truncate
                  text-sm
                  font-semibold
                  capitalize
                  text-foreground
                  sm:text-base
                "
              >
                {monthLabel}
              </h2>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={goNextMonth}
              aria-label="Bulan berikutnya"
              className="h-8 w-8"
            >
              <ChevronRight size={16} />
            </Button>

            {/* Desktop Today */}

            <Button
              type="button"
              variant="outline"
              onClick={goToday}
              className="
                hidden
                h-8
                px-2.5
                text-xs
                sm:inline-flex
              "
            >
              <CalendarDays size={14} />
              Hari ini
            </Button>
          </div>

          {/* ==================================
              MOBILE TODAY
              ================================== */}

          <Button
            type="button"
            variant="outline"
            onClick={goToday}
            className="
              h-8
              w-full
              text-xs
              sm:hidden
            "
          >
            <CalendarDays size={14} />
            Hari ini
          </Button>

          {/* ==================================
              FILTER
              ================================== */}

          <div className="min-w-0">
            <ScheduleFilters
              schedules={allSchedules}
              classFilter={classFilter}
              meetingType={meetingType}
              classOptions={classOptions}
              onClassChange={onClassChange}
              onMeetingTypeChange={onMeetingTypeChange}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>
      </div>

      {/* =====================================
          CALENDAR
          ===================================== */}

      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[680px]">
          {/* ==================================
              WEEK HEADER
              ================================== */}

          <div
            className="
              grid
              grid-cols-7
              border-b
              border-border
              bg-background-tertiary
            "
          >
            {weekDays.map((day, index) => (
              <div
                key={day.short}
                className={cn(
                  "border-r border-border last:border-r-0",
                  "px-1.5 py-2",
                  "text-center",
                  "sm:px-2 sm:py-2.5",

                  index === 0 && "text-danger",

                  index === 6 && "text-primary-600 dark:text-primary-400"
                )}
              >
                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wide
                    sm:hidden
                  "
                >
                  {day.short}
                </span>

                <span
                  className="
                    hidden
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    sm:inline
                  "
                >
                  {day.long}
                </span>
              </div>
            ))}
          </div>

          {/* ==================================
              DAYS
              ================================== */}

          <div
            className="
              grid
              grid-cols-7
              divide-x
              divide-border
              divide-y
              border-b
              border-border
            "
          >
            {calendarDays.map((day) => {
              const dateKey = toDateKey(day);

              const daySchedules = scheduleMap[dateKey] || [];

              const isToday = isSameDate(day, today);

              const isSelected = selectedDate && isSameDate(day, selectedDate);

              const isCurrentMonth = day.getMonth() === currentDate.getMonth();

              return (
                <button
                  type="button"
                  key={dateKey}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "relative",
                    "min-w-0",
                    "min-h-[120px]",
                    "bg-card",
                    "p-1",
                    "text-left",
                    "transition-colors",
                    "hover:bg-background-tertiary",
                    "focus:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-inset",
                    "focus-visible:ring-primary-500",

                    "sm:min-h-[145px]",
                    "sm:p-1.5",

                    "lg:min-h-[165px]",
                    "lg:p-2",

                    !isCurrentMonth && "bg-background/60",

                    isSelected &&
                      "ring-1 ring-inset ring-primary-500/40 dark:ring-primary-400/30"
                  )}
                >
                  {/* =================================
                      DATE NUMBER
                      ================================= */}

                  <div
                    className="
                      mb-1
                      flex
                      items-center
                      justify-between
                      gap-1
                    "
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        "text-[11px] font-medium",
                        "sm:h-7 sm:w-7 sm:text-xs",

                        !isCurrentMonth && "text-foreground-muted",

                        isCurrentMonth && !isToday && "text-foreground",

                        isToday &&
                          "bg-primary-500 text-white font-bold shadow-sm",

                        isSelected &&
                          !isToday &&
                          "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                      )}
                    >
                      {day.getDate()}
                    </span>

                    {/* Schedule count */}

                    {daySchedules.length > 0 && (
                      <span
                        className="
                          rounded-full
                          bg-background-tertiary
                          px-1.5
                          py-0.5
                          text-[8px]
                          font-medium
                          text-foreground-muted
                          sm:text-[9px]
                        "
                      >
                        {daySchedules.length}
                      </span>
                    )}
                  </div>

                  {/* =================================
                      EVENTS
                      ================================= */}

                  <div
                    className="
                      space-y-1
                      sm:space-y-1.5
                    "
                  >
                    {daySchedules.slice(0, 4).map((schedule) => (
                      <ScheduleEvent
                        key={schedule.id_jadwal}
                        schedule={schedule}
                        onClick={onScheduleClick}
                      />
                    ))}
                  </div>

                  {/* =================================
                      MORE
                      ================================= */}

                  {daySchedules.length > 4 && (
                    <div
                      className="
                        mt-1
                        px-1
                        text-[9px]
                        font-medium
                        text-primary-600
                        dark:text-primary-400
                      "
                    >
                      + {daySchedules.length - 4} jadwal lainnya
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================
          LEGEND
          ===================================== */}

      <ScheduleLegend />

      {/* =====================================
          MOBILE SCROLL HINT
          ===================================== */}

      <div
        className="
          flex
          items-center
          justify-center
          gap-1.5
          border-t
          border-border
          px-4
          py-1.5
          text-[10px]
          text-foreground-muted
          sm:hidden
        "
      >
        <ChevronLeft size={12} />
        Geser kalender untuk melihat hari lainnya
        <ChevronRight size={12} />
      </div>
    </div>
  );
}
