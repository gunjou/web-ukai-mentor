import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  Monitor,
  MapPin,
} from "lucide-react";

import Card from "../ui/Card";

import {
  formatTime,
  getScheduleStartTime,
  getScheduleEndTime,
} from "../../utils/schedule";

export default function MentorScheduleList({
  schedules,
  selectedSchedule,
  now,
  attendanceStatus,
  onScheduleChange,
}) {
  return (
    <Card className="overflow-hidden p-0">
      {/* HEADER */}
      <div
        className="
          border-b
          border-border
          px-4
          py-4
          sm:px-5
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-primary-100
              text-primary-600
              dark:bg-primary-900/20
              dark:text-primary-400
            "
          >
            <CalendarDays size={18} />
          </div>

          <div className="min-w-0">
            <h2
              className="
                text-sm
                font-semibold
                text-foreground
              "
            >
              Jadwal Hari Ini
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-foreground-muted
              "
            >
              Pilih jadwal untuk melakukan absensi
            </p>
          </div>
        </div>
      </div>

      {schedules.length === 0 ? (
        <EmptySchedule />
      ) : (
        <div className="divide-y divide-border">
          {schedules.map((schedule) => {
            const selected = selectedSchedule?.id_jadwal === schedule.id_jadwal;

            return (
              <ScheduleItem
                key={schedule.id_jadwal}
                schedule={schedule}
                selected={selected}
                now={now}
                attendanceStatus={selected ? attendanceStatus : "idle"}
                onClick={() => onScheduleChange(schedule)}
              />
            );
          })}
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

function ScheduleItem({ schedule, selected, now, attendanceStatus, onClick }) {
  const start = createDateTime(schedule, getScheduleStartTime(schedule));

  const end = createDateTime(schedule, getScheduleEndTime(schedule));

  let timeStatus = "upcoming";

  if (start && end) {
    if (now >= start && now <= end) {
      timeStatus = "active";
    }

    if (now > end) {
      timeStatus = "finished";
    }
  }

  const isOnline =
    String(schedule.type_pertemuan || "").toUpperCase() === "ONLINE";

  const isFinishedAttendance = attendanceStatus === "checked-out";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        border-l-2
        px-4
        py-4
        text-left
        transition-colors
        focus:outline-none
        sm:px-5

        ${
          selected
            ? `
              border-l-primary-500
              bg-primary-50
              dark:bg-gray-900
            `
            : `
              border-l-transparent
              hover:bg-background-tertiary
            `
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* TYPE ICON */}
        <div
          className={`
            mt-0.5
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg

            ${
              isOnline
                ? `
                  bg-info-light
                  text-info
                `
                : `
                  bg-success-light
                  text-success
                `
            }
          `}
        >
          {isOnline ? <Monitor size={18} /> : <MapPin size={18} />}
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* CLASS NAME */}
            <p
              className={`
                truncate
                text-sm
                font-semibold

                ${
                  selected
                    ? `
                      text-primary-700
                      dark:text-primary-300
                    `
                    : "text-foreground"
                }
              `}
            >
              {schedule.nama_kelas || "Tanpa nama kelas"}
            </p>

            {/* CHECK-IN BADGE */}
            {selected && attendanceStatus === "checked-in" && (
              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1
                  rounded-full
                  bg-success-light
                  px-2
                  py-0.5
                  text-[10px]
                  font-medium
                  text-success
                "
              >
                <CheckCircle2 size={11} />
                Check-in
              </span>
            )}

            {/* FINISHED ATTENDANCE BADGE */}
            {selected && isFinishedAttendance && (
              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1
                  rounded-full
                  bg-background-tertiary
                  px-2
                  py-0.5
                  text-[10px]
                  font-medium
                  text-foreground-muted
                "
              >
                <CheckCircle2 size={11} />
                Selesai
              </span>
            )}
          </div>

          {/* TIME */}
          <div
            className={`
              mt-1
              flex
              items-center
              gap-1.5
              text-xs

              ${
                selected
                  ? `
                    text-primary-600
                    dark:text-primary-400
                  `
                  : "text-foreground-secondary"
              }
            `}
          >
            <Clock3 size={13} />

            <span>
              {formatTime(getScheduleStartTime(schedule))} -{" "}
              {formatTime(getScheduleEndTime(schedule))}
            </span>
          </div>

          {/* TYPE */}
          <div
            className="
              mt-1.5
              flex
              items-center
              gap-1.5
              text-[11px]
              font-medium
              text-foreground-muted
            "
          >
            {isOnline ? (
              <>
                <Monitor size={12} />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin size={12} />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* MENTOR */}
          <p
            className="
              mt-1
              truncate
              text-[11px]
              text-foreground-muted
            "
          >
            {schedule.nickname_mentor || schedule.nama_mentor || "Tanpa mentor"}
          </p>
        </div>

        {/* TIME STATUS */}
        <TimeStatusBadge status={timeStatus} />
      </div>
    </button>
  );
}

/*
 * ==========================================
 * STATUS BADGE
 * ==========================================
 */

function TimeStatusBadge({ status }) {
  if (status === "active") {
    return (
      <span
        className="
          shrink-0
          rounded-full
          bg-success-light
          px-2
          py-1
          text-[10px]
          font-medium
          text-success
        "
      >
        Berlangsung
      </span>
    );
  }

  if (status === "finished") {
    return (
      <span
        className="
          shrink-0
          rounded-full
          bg-background-tertiary
          px-2
          py-1
          text-[10px]
          font-medium
          text-foreground-muted
        "
      >
        Selesai
      </span>
    );
  }

  return (
    <span
      className="
        shrink-0
        rounded-full
        bg-warning-light
        px-2
        py-1
        text-[10px]
        font-medium
        text-warning
      "
    >
      Belum mulai
    </span>
  );
}

/*
 * ==========================================
 * EMPTY
 * ==========================================
 */

function EmptySchedule() {
  return (
    <div
      className="
        flex
        min-h-[280px]
        flex-col
        items-center
        justify-center
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-background-tertiary
          text-foreground-muted
        "
      >
        <CalendarDays size={22} />
      </div>

      <h3
        className="
          mt-3
          text-sm
          font-semibold
          text-foreground
        "
      >
        Tidak ada jadwal hari ini
      </h3>

      <p
        className="
          mt-1
          max-w-xs
          text-xs
          leading-relaxed
          text-foreground-muted
        "
      >
        Tidak terdapat jadwal aktif yang dapat digunakan untuk absensi hari ini.
      </p>
    </div>
  );
}

/*
 * ==========================================
 * DATE
 * ==========================================
 */

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
