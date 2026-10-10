import {
  CalendarDays,
  Clock3,
  MapPin,
  Video,
  CalendarClock,
  FileText,
  Layers3,
} from "lucide-react";

import {
  formatTime,
  formatScheduleDate,
  getMeetingType,
  getScheduleDate,
  getScheduleStartTime,
  getScheduleEndTime,
  isRescheduled,
} from "../../utils/schedule";

import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function ScheduleDetailModal({
  open,
  schedule,
  onClose,
  onReschedule,
}) {
  if (!schedule) {
    return null;
  }

  const classes = schedule.classes || [];

  if (!classes.length) {
    return null;
  }

  const groupDate = schedule.tanggal;
  const groupStartTime = schedule.waktu_mulai;
  const groupEndTime = schedule.waktu_selesai;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Jadwal"
      description={`${classes.length} kelas dalam satu waktu pertemuan`}
      icon={CalendarDays}
      size="md"
      contentClassName="max-h-[70vh]"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      {/* =====================================
          GROUP SUMMARY
          ===================================== */}

      <div
        className="
          rounded-xl
          border
          border-border
          bg-background-tertiary
          p-4
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-info-light
              text-info
            "
          >
            <Layers3 size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                text-[11px]
                font-medium
                uppercase
                tracking-wide
                text-foreground-muted
              "
            >
              Jadwal Pertemuan
            </p>

            <p
              className="
                mt-1
                text-sm
                font-semibold
                text-foreground
              "
            >
              {formatScheduleDate(groupDate)}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-foreground-secondary
              "
            >
              {formatTime(groupStartTime)}
              {" - "}
              {formatTime(groupEndTime)} WIB
            </p>
          </div>

          <span
            className="
              shrink-0
              rounded-full
              bg-background
              px-2.5
              py-1
              text-[10px]
              font-semibold
              text-foreground-secondary
            "
          >
            {classes.length} kelas
          </span>
        </div>
      </div>

      {/* =====================================
          CLASS LIST
          ===================================== */}

      <div className="mt-4 space-y-3">
        {classes.map((item, index) => (
          <ScheduleClassCard
            key={item.id_jadwal}
            schedule={item}
            index={index}
            onReschedule={onReschedule}
          />
        ))}
      </div>
    </Modal>
  );
}

/*
 * ==========================================
 * SCHEDULE CLASS CARD
 * ==========================================
 */

function ScheduleClassCard({ schedule, index, onReschedule }) {
  const meetingType = getMeetingType(schedule);
  const rescheduled = isRescheduled(schedule);

  const scheduleDate = getScheduleDate(schedule);
  const startTime = getScheduleStartTime(schedule);
  const endTime = getScheduleEndTime(schedule);

  return (
    <div
      className={`
          group
          rounded-xl
          border
          p-4
          transition-all
          duration-200
          hover:border-primary-500/30
          hover:shadow-sm

          ${
            rescheduled
              ? `
                border-warning/30
                bg-warning-light/30
              `
              : `
                border-border
                bg-card
              `
          }
        `}
    >
      {/* =====================================
          CLASS HEADER
          ===================================== */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-xs
              font-bold

              ${
                rescheduled
                  ? "bg-warning/10 text-warning"
                  : "bg-background-tertiary text-foreground-muted"
              }
            `}
          >
            {index + 1}
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[11px]
                font-medium
                uppercase
                tracking-wide
                text-foreground-muted
              "
            >
              Kelas
            </p>

            <h3
              className="
                mt-0.5
                truncate
                text-sm
                font-semibold
                text-foreground
              "
            >
              {schedule.nama_kelas || "Tanpa kelas"}
            </h3>
          </div>
        </div>

        <MeetingTypeBadge type={meetingType} />
      </div>

      {/* =====================================
          MAIN INFORMATION
          ===================================== */}

      <div className="mt-4 space-y-2">
        <InfoRow
          icon={CalendarDays}
          label="Tanggal efektif"
          value={formatScheduleDate(scheduleDate)}
        />

        <InfoRow
          icon={Clock3}
          label="Waktu efektif"
          value={`
            ${formatTime(startTime)}
            -
            ${formatTime(endTime)} WIB
          `}
        />

        <InfoRow icon={FileText} label="Topik" value={schedule.topik || "-"} />

        <InfoRow
          icon={FileText}
          label="Catatan"
          value={schedule.catatan || "-"}
        />
      </div>

      {/* =====================================
          RESCHEDULE INFORMATION
          ===================================== */}

      {rescheduled && (
        <div
          className="
            mt-4
            rounded-lg
            border
            border-warning/30
            bg-warning/5
            p-3
          "
        >
          <div className="flex items-start gap-2.5">
            <CalendarClock size={16} className="mt-0.5 shrink-0 text-warning" />

            <div className="min-w-0">
              <p
                className="
                  text-xs
                  font-semibold
                  text-warning
                "
              >
                Jadwal telah di-reschedule
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  leading-relaxed
                  text-foreground-secondary
                "
              >
                Jadwal efektif kelas ini berbeda dengan jadwal awal.
              </p>
            </div>
          </div>

          <div
            className="
              mt-3
              grid
              gap-2
              sm:grid-cols-2
            "
          >
            <ScheduleTimeBox
              title="Jadwal awal"
              date={schedule.tanggal}
              start={schedule.waktu_mulai}
              end={schedule.waktu_selesai}
            />

            <ScheduleTimeBox
              title="Jadwal reschedule"
              date={schedule.tanggal_reschedule}
              start={schedule.waktu_mulai_reschedule}
              end={schedule.waktu_selesai_reschedule}
            />
          </div>
        </div>
      )}

      {/* =====================================
          STATUS & ACTION
          ===================================== */}

      <div
        className="
          mt-4
          flex
          flex-col
          gap-3
          rounded-lg
          border
          border-border
          px-3
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <span
            className="
              text-xs
              text-foreground-secondary
            "
          >
            Status jadwal
          </span>

          <StatusBadge status={schedule.status} />
        </div>

        <Button
          type="button"
          size="sm"
          variant={rescheduled ? "outline" : "default"}
          onClick={() => onReschedule?.(schedule)}
        >
          <CalendarClock size={14} />
          {rescheduled ? "Ubah Reschedule" : "Reschedule"}
        </Button>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * INFO ROW
 * ==========================================
 */

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-lg
        border
        border-border
        px-3
        py-2.5
      "
    >
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-background-tertiary
          text-foreground-muted
        "
      >
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[10px]
            text-foreground-muted
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            text-xs
            font-medium
            text-foreground
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * MEETING TYPE
 * ==========================================
 */

function MeetingTypeBadge({ type }) {
  const isOffline = type === "OFFLINE";

  return (
    <div
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold

        ${
          isOffline
            ? `
              bg-primary-100
              text-primary-700
              dark:bg-primary-900/40
              dark:text-primary-300
            `
            : `
              bg-info-light
              text-info
            `
        }
      `}
    >
      {isOffline ? <MapPin size={12} /> : <Video size={12} />}

      {type}
    </div>
  );
}

/*
 * ==========================================
 * STATUS
 * ==========================================
 */

function StatusBadge({ status }) {
  const active = Number(status) === 1;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-xs
        font-medium

        ${
          active
            ? `
              bg-success-light
              text-success
            `
            : `
              bg-background-tertiary
              text-foreground-muted
            `
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${active ? "bg-success" : "bg-foreground-muted"}
        `}
      />

      {active ? "Aktif" : "Tidak aktif"}
    </span>
  );
}

/*
 * ==========================================
 * SCHEDULE TIME BOX
 * ==========================================
 */

function ScheduleTimeBox({ title, date, start, end }) {
  return (
    <div
      className="
        rounded-lg
        border
        border-warning/20
        bg-card
        p-3
      "
    >
      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-wide
          text-foreground-muted
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-[11px]
          font-medium
          text-foreground
        "
      >
        {formatScheduleDate(date)}
      </p>

      <p
        className="
          mt-0.5
          text-[11px]
          text-foreground-secondary
        "
      >
        {formatTime(start)}
        {" - "}
        {formatTime(end)} WIB
      </p>
    </div>
  );
}
