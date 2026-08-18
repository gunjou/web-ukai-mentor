import { useEffect, useState } from "react";
import { CalendarClock, CalendarDays, Clock3 } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

import {
  getScheduleDate,
  getScheduleStartTime,
  getScheduleEndTime,
} from "../../utils/schedule";

import { rescheduleSchedule } from "../../services/scheduleService";
import { useToast } from "../../context/ToastContext";

/*
 * ==========================================
 * HELPERS
 * ==========================================
 */

function formatDateInput(date) {
  if (!date) {
    return "";
  }

  return date;
}

function formatTimeInput(time) {
  if (!time) {
    return "";
  }

  /*
   * API:
   * 20:00:00
   *
   * input[type=time]:
   * 20:00
   */

  return String(time).slice(0, 5);
}

/*
 * ==========================================
 * COMPONENT
 * ==========================================
 */

export default function ScheduleRescheduleModal({
  open,
  schedule,
  onClose,
  onSuccess,
}) {
  const toast = useToast();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
   * ==========================================
   * INITIAL VALUE
   * ==========================================
   */

  useEffect(() => {
    if (!open || !schedule) {
      return;
    }

    /*
     * Jika sudah pernah reschedule,
     * gunakan jadwal reschedule sebagai
     * nilai awal.
     *
     * Jika belum, gunakan jadwal efektif.
     */

    const initialDate =
      schedule.tanggal_reschedule ||
      getScheduleDate(schedule) ||
      schedule.tanggal ||
      "";

    const initialStart =
      schedule.waktu_mulai_reschedule ||
      getScheduleStartTime(schedule) ||
      schedule.waktu_mulai ||
      "";

    const initialEnd =
      schedule.waktu_selesai_reschedule ||
      getScheduleEndTime(schedule) ||
      schedule.waktu_selesai ||
      "";

    setDate(formatDateInput(initialDate));

    setStartTime(formatTimeInput(initialStart));

    setEndTime(formatTimeInput(initialEnd));

    setError("");
  }, [open, schedule]);

  /*
   * ==========================================
   * CLOSE
   * ==========================================
   */

  function handleClose() {
    if (saving) {
      return;
    }

    onClose?.();
  }

  /*
   * ==========================================
   * SUBMIT
   * ==========================================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!schedule) {
      return;
    }

    setError("");

    /*
     * ========================================
     * VALIDATION
     * ========================================
     */

    if (!date) {
      setError("Tanggal reschedule wajib diisi.");

      return;
    }

    if (!startTime) {
      setError("Waktu mulai wajib diisi.");

      return;
    }

    if (!endTime) {
      setError("Waktu selesai wajib diisi.");

      return;
    }

    if (startTime >= endTime) {
      setError("Waktu selesai harus lebih besar dari waktu mulai.");

      return;
    }

    /*
     * ========================================
     * PAYLOAD
     * ========================================
     *
     * API membutuhkan:
     *
     * {
     *   tanggal_reschedule: "2026-08-22",
     *   waktu_mulai_reschedule: "20:00:00",
     *   waktu_selesai_reschedule: "22:00:00"
     * }
     *
     */

    const payload = {
      tanggal_reschedule: date,

      waktu_mulai_reschedule: `${startTime}:00`,

      waktu_selesai_reschedule: `${endTime}:00`,
    };

    console.log("RESCHEDULE PAYLOAD:", payload);

    try {
      setSaving(true);

      await rescheduleSchedule(schedule.id_jadwal, payload);

      toast.success("Jadwal berhasil di-reschedule.");

      /*
       * Parent akan melakukan refresh data.
       */

      onSuccess?.();

      onClose?.();
    } catch (err) {
      console.error("RESCHEDULE ERROR:", err);

      const message = err?.message || "Gagal melakukan reschedule jadwal.";

      setError(message);

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Reschedule Jadwal"
      description="Ubah tanggal dan waktu pertemuan."
      icon={CalendarClock}
      size="md"
      closeOnBackdrop={!saving}
      closeOnEscape={!saving}
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
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Batal
          </Button>

          <Button
            type="submit"
            form="schedule-reschedule-form"
            loading={saving}
            disabled={saving}
          >
            <CalendarClock size={16} />
            Simpan Reschedule
          </Button>
        </div>
      }
    >
      <form
        id="schedule-reschedule-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* ====================================
            SCHEDULE INFO
            ==================================== */}

        <div
          className="
            rounded-xl
            border
            border-border
            bg-background-tertiary
            p-4
          "
        >
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

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-foreground
            "
          >
            {schedule?.nama_kelas || "-"}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-foreground-muted
            "
          >
            {schedule?.nickname_mentor ||
              schedule?.nama_mentor ||
              "Tanpa mentor"}
          </p>
        </div>

        {/* ====================================
            CURRENT SCHEDULE
            ==================================== */}

        <div>
          <div
            className="
              mb-3
              flex
              items-center
              gap-2
            "
          >
            <Clock3 size={15} className="text-foreground-muted" />

            <p
              className="
                text-sm
                font-semibold
                text-foreground
              "
            >
              Jadwal baru
            </p>
          </div>

          <div
            className="
              grid
              gap-4
              sm:grid-cols-3
            "
          >
            {/* ==================================
                DATE
                ================================== */}

            <div className="sm:col-span-1">
              <label
                htmlFor="reschedule-date"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-medium
                  text-foreground-secondary
                "
              >
                Tanggal
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-foreground-muted
                  "
                />

                <input
                  id="reschedule-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  disabled={saving}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-input-border
                    bg-input
                    pl-9
                    pr-3
                    text-sm
                    text-foreground
                    outline-none
                    transition
                    focus:border-primary-500
                    focus:ring-2
                    focus:ring-primary-500/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />
              </div>
            </div>

            {/* ==================================
                START TIME
                ================================== */}

            <div>
              <label
                htmlFor="reschedule-start-time"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-medium
                  text-foreground-secondary
                "
              >
                Waktu mulai
              </label>

              <input
                id="reschedule-start-time"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                disabled={saving}
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-input-border
                  bg-input
                  px-3
                  text-sm
                  text-foreground
                  outline-none
                  transition
                  focus:border-primary-500
                  focus:ring-2
                  focus:ring-primary-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            {/* ==================================
                END TIME
                ================================== */}

            <div>
              <label
                htmlFor="reschedule-end-time"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-medium
                  text-foreground-secondary
                "
              >
                Waktu selesai
              </label>

              <input
                id="reschedule-end-time"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                disabled={saving}
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-input-border
                  bg-input
                  px-3
                  text-sm
                  text-foreground
                  outline-none
                  transition
                  focus:border-primary-500
                  focus:ring-2
                  focus:ring-primary-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>
          </div>
        </div>

        {/* ====================================
            ERROR
            ==================================== */}

        {error && (
          <div
            className="
              rounded-xl
              border
              border-danger/20
              bg-danger-light
              px-4
              py-3
              text-sm
              text-danger
            "
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ====================================
            INFORMATION
            ==================================== */}

        <div
          className="
            rounded-xl
            border
            border-info/20
            bg-info-light
            px-4
            py-3
          "
        >
          <p
            className="
              text-xs
              leading-relaxed
              text-info
            "
          >
            Setelah disimpan, jadwal baru akan menjadi jadwal efektif dan
            ditampilkan pada kalender.
          </p>
        </div>
      </form>
    </Modal>
  );
}
