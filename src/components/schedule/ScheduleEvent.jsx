import { MapPin, Video, CalendarClock } from "lucide-react";

import {
  formatTime,
  getMeetingType,
  getScheduleStartTime,
  getScheduleEndTime,
  isRescheduled,
} from "../../utils/schedule";

export default function ScheduleEvent({ schedule, onClick }) {
  const type = getMeetingType(schedule);
  const online = type === "ONLINE";
  const rescheduled = isRescheduled(schedule);

  const startTime = getScheduleStartTime(schedule);
  const endTime = getScheduleEndTime(schedule);

  return (
    <button
      type="button"
      onClick={() => onClick?.(schedule)}
      title={
        rescheduled
          ? `${schedule.nama_kelas || "Jadwal"} • Jadwal di-reschedule`
          : schedule.nama_kelas || "Detail jadwal"
      }
      className={`
        group
        relative
        w-full
        rounded-lg
        border
        p-2
        text-left
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500/30

        ${
          online
            ? `
              border-info/30
              bg-info-light
              text-info
              dark:border-info/20
            `
            : `
              border-primary-500/30
              bg-primary-100
              text-primary-700
              dark:bg-primary-900/30
              dark:text-primary-500
            `
        }
      `}
    >
      {/* =====================================
          RESCHEDULE INDICATOR
          ===================================== */}

      {rescheduled && (
        <span
          className="
    absolute
    right-1.5
    top-1.5
    flex
    h-4
    w-4
    items-center
    justify-center
    rounded-full
    bg-warning/15
    text-[9px]
    font-bold
    text-warning
  "
          title="Jadwal telah di-reschedule"
        >
          <CalendarClock size={11} />
        </span>
      )}

      <div className="flex items-start gap-1.5">
        {/* Meeting Type Icon */}

        {online ? (
          <Video size={13} className="mt-0.5 shrink-0" />
        ) : (
          <MapPin size={13} className="mt-0.5 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          {/* =====================================
              CLASS NAME
              ===================================== */}

          <div className="pr-3">
            <p
              className="
                truncate
                text-[11px]
                font-semibold
                leading-tight
              "
            >
              {schedule.nama_kelas || "Tanpa kelas"}
            </p>
          </div>

          {/* =====================================
              TIME
              ===================================== */}

          <p
            className="
              mt-1
              text-[10px]
              font-medium
              opacity-80
            "
          >
            {formatTime(startTime)}
            {" - "}
            {formatTime(endTime)}
          </p>

          {/* =====================================
              TOPIC AND NOTES
              ===================================== */}

          <p
            className="
              mt-1
              truncate
              text-[9px]
              font-medium
              opacity-70
            "
          >
            Topik: {schedule.topik || "-"}
          </p>

          <p
            className="
              mt-1
              truncate
              text-[9px]
              opacity-70
            "
          >
            Catatan: {schedule.catatan || "-"}
          </p>
        </div>
      </div>
    </button>
  );
}
