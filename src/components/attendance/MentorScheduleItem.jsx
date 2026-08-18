import { CheckCircle2, Clock3 } from "lucide-react";

import {
  getScheduleStartTime,
  getScheduleEndTime,
  formatTime,
} from "../../utils/schedule";

export default function MentorScheduleItem({
  schedule,
  selected,
  onClick,
  now,
  attendanceStatus,
}) {
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

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        px-4
        py-4
        text-left
        transition-colors
        hover:bg-background-tertiary
        focus:outline-none
        sm:px-5
      "
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            mt-0.5
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg

            ${
              timeStatus === "active"
                ? "bg-success-light text-success"
                : timeStatus === "finished"
                ? "bg-background-tertiary text-foreground-muted"
                : "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
            }
          `}
        >
          <Clock3 size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {schedule.nama_kelas || "Tanpa nama kelas"}
            </p>

            {attendanceStatus === "checked-in" && selected && (
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

            {attendanceStatus === "checked-out" && selected && (
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

          <p className="mt-1 text-xs text-foreground-secondary">
            {formatTime(getScheduleStartTime(schedule))} -{" "}
            {formatTime(getScheduleEndTime(schedule))}
          </p>

          <p className="mt-1 truncate text-[11px] text-foreground-muted">
            {schedule.nickname_mentor || schedule.nama_mentor || "Tanpa mentor"}
          </p>
        </div>

        <TimeStatusBadge status={timeStatus} />
      </div>
    </button>
  );
}

function TimeStatusBadge({ status }) {
  if (status === "active") {
    return (
      <span className="shrink-0 rounded-full bg-success-light px-2 py-1 text-[10px] font-medium text-success">
        Berlangsung
      </span>
    );
  }

  if (status === "finished") {
    return (
      <span className="shrink-0 rounded-full bg-background-tertiary px-2 py-1 text-[10px] font-medium text-foreground-muted">
        Selesai
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-warning-light px-2 py-1 text-[10px] font-medium text-warning">
      Belum mulai
    </span>
  );
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

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
