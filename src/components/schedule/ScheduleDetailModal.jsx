import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  Video,
  CalendarClock,
} from "lucide-react";

import {
  formatTime,
  formatScheduleDate,
  getMeetingType,
  getScheduleDate,
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

  const meetingType = getMeetingType(schedule);

  const rescheduled = isRescheduled(schedule);

  const scheduleDate = getScheduleDate(schedule);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Jadwal"
      description="Informasi lengkap pertemuan"
      icon={CalendarDays}
      size="md"
      contentClassName="max-h-[70vh]"
      footer={
        <div
          className="
            flex
            flex-col-reverse
            gap-2
            sm:flex-row
            sm:justify-end
          "
        >
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>

          <Button type="button" onClick={() => onReschedule?.(schedule)}>
            <CalendarClock size={16} />
            Reschedule
          </Button>
        </div>
      }
    >
      {/* =====================================
          CLASS
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
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
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
                mt-1
                text-base
                font-semibold
                text-foreground
              "
            >
              {schedule.nama_kelas || "-"}
            </h3>
          </div>

          <MeetingTypeBadge type={meetingType} />
        </div>
      </div>

      {/* =====================================
          MAIN INFORMATION
          ===================================== */}

      <div className="mt-4 space-y-3">
        <InfoRow
          icon={CalendarDays}
          label="Tanggal efektif"
          value={formatScheduleDate(scheduleDate)}
        />

        <InfoRow
          icon={Clock3}
          label="Waktu efektif"
          value={`
            ${formatTime(schedule.waktu_mulai_efektif)}
            -
            ${formatTime(schedule.waktu_selesai_efektif)}
          `}
        />

        <InfoRow
          icon={UserRound}
          label="Nickname mentor"
          value={schedule.nickname_mentor || "-"}
        />
      </div>

      {/* =====================================
          RESCHEDULE INFORMATION
          ===================================== */}

      {rescheduled && (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-warning/30
            bg-warning-light
            p-4
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
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
                bg-warning/10
                text-warning
              "
            >
              <Clock3 size={16} />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-sm
                  font-semibold
                  text-warning
                "
              >
                Jadwal telah di-reschedule
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-relaxed
                  text-foreground-secondary
                "
              >
                Jadwal awal berbeda dengan jadwal yang berlaku saat ini.
              </p>
            </div>
          </div>

          <div
            className="
              mt-4
              grid
              gap-3
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
          STATUS
          ===================================== */}

      <div
        className="
          mt-5
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-border
          px-4
          py-3
        "
      >
        <span
          className="
            text-sm
            text-foreground-secondary
          "
        >
          Status jadwal
        </span>

        <StatusBadge status={schedule.status} />
      </div>
    </Modal>
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
        rounded-xl
        border
        border-border
        px-4
        py-3
      "
    >
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
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[11px]
            text-foreground-muted
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-sm
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
          text-[10px]
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
          text-xs
          font-medium
          text-foreground
        "
      >
        {formatDate(date)}
      </p>

      <p
        className="
          mt-0.5
          text-xs
          text-foreground-secondary
        "
      >
        {formatTime(start)}
        {" - "}
        {formatTime(end)}
      </p>
    </div>
  );
}

/*
 * ==========================================
 * DATE FORMATTER
 * ==========================================
 */

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
