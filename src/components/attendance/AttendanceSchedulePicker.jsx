import { CalendarDays, Clock3, ChevronDown } from "lucide-react";

import Card from "../ui/Card";

import {
  formatTime,
  getScheduleStartTime,
  getScheduleEndTime,
} from "../../utils/schedule";

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getScheduleDisplay(schedule) {
  const isRescheduled =
    schedule?.tanggal_reschedule != null &&
    schedule?.waktu_mulai_reschedule != null &&
    schedule?.waktu_selesai_reschedule != null;

  return {
    date: isRescheduled ? schedule.tanggal_reschedule : schedule?.tanggal,

    startTime: isRescheduled
      ? schedule.waktu_mulai_reschedule
      : getScheduleStartTime(schedule),

    endTime: isRescheduled
      ? schedule.waktu_selesai_reschedule
      : getScheduleEndTime(schedule),

    isRescheduled,
  };
}

export default function AttendanceSchedulePicker({
  schedules,
  selectedSchedule,
  onScheduleChange,
}) {
  return (
    <Card className="p-4">
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
            bg-background-tertiary
            text-foreground-muted
          "
        >
          <CalendarDays size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-foreground-muted">Pilih Jadwal</p>

          <p className="mt-0.5 text-sm font-semibold text-foreground">
            Jadwal Pertemuan
          </p>
        </div>
      </div>

      <div className="relative mt-4">
        <select
          value={selectedSchedule?.id_jadwal || ""}
          onChange={(event) => {
            const schedule = schedules.find(
              (item) => String(item.id_jadwal) === event.target.value
            );

            onScheduleChange(schedule || null);
          }}
          className="
            w-full
            appearance-none
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
            pr-10
            text-sm
            text-foreground
            outline-none
            transition
            focus:border-primary
            focus:ring-2
            focus:ring-primary/10
          "
        >
          <option value="">Pilih jadwal...</option>

          {schedules.map((schedule) => {
            const display = getScheduleDisplay(schedule);

            return (
              <option key={schedule.id_jadwal} value={schedule.id_jadwal}>
                {schedule.nama_kelas || "Tanpa nama kelas"} -{" "}
                {formatDate(display.date)} - {formatTime(display.startTime)} -{" "}
                {formatTime(display.endTime)}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={16}
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-foreground-muted
          "
        />
      </div>

      {selectedSchedule && (
        <div
          className="
            mt-3
            flex
            items-center
            gap-3
            text-xs
            text-foreground-secondary
          "
        >
          <CalendarDays size={14} />

          <span>{formatDate(getScheduleDisplay(selectedSchedule).date)}</span>

          <span className="text-foreground-muted">•</span>

          <Clock3 size={14} />

          <span>
            {formatTime(getScheduleDisplay(selectedSchedule).startTime)} -{" "}
            {formatTime(getScheduleDisplay(selectedSchedule).endTime)}
          </span>
        </div>
      )}
    </Card>
  );
}
