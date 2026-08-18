import { useEffect, useState } from "react";
import { CalendarDays, Clock3, FileText } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

import { toInputDate, toDate } from "../../utils/date";

function formatTimeForInput(value) {
  if (!value) {
    return "";
  }

  const date = toDate(value);

  if (!date) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");

  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export default function AttendanceCorrectionModal({
  open,
  attendance,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    date: "",
    checkIn: "",
    checkOut: "",
    status: "present",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);

  /*
   * Populate form ketika attendance berubah.
   */
  useEffect(() => {
    if (!attendance) {
      return;
    }

    setForm({
      date: toInputDate(attendance.date),

      checkIn: formatTimeForInput(attendance.checkIn),

      checkOut: formatTimeForInput(attendance.checkOut),

      status: attendance.status || "present",

      reason: "",
    });

    setErrors({});
  }, [attendance]);

  function handleChange(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.date) {
      nextErrors.date = "Tanggal wajib diisi.";
    }

    if (form.status !== "absent" && !form.checkIn) {
      nextErrors.checkIn = "Jam masuk wajib diisi.";
    }

    if (form.status !== "absent" && !form.checkOut) {
      nextErrors.checkOut = "Jam pulang wajib diisi.";
    }

    if (!form.reason.trim()) {
      nextErrors.reason = "Alasan koreksi wajib diisi.";
    }

    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      nextErrors.checkOut = "Jam pulang harus lebih besar dari jam masuk.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,

        /*
         * Nanti payload ini bisa langsung
         * dikirim ke API.
         */
        attendanceId: attendance.id,

        employeeId: attendance.employeeId,
      };

      console.log("CORRECTION PAYLOAD:", payload);

      await new Promise((resolve) => setTimeout(resolve, 500));

      onSave?.(payload);
    } finally {
      setSaving(false);
    }
  }

  if (!attendance) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Koreksi Absensi"
      description={`Perbarui data absensi ${attendance.name}.`}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>

          <Button
            type="submit"
            form="attendance-correction-form"
            loading={saving}
          >
            Simpan Koreksi
          </Button>
        </>
      }
    >
      <form
        id="attendance-correction-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Employee info */}
        <div
          className="
            rounded-xl
            border
            border-border
            bg-background-tertiary/50
            p-4
          "
        >
          <p className="text-xs text-foreground-muted">Karyawan</p>

          <p className="mt-1 text-sm font-semibold text-foreground">
            {attendance.name}
          </p>

          <p className="mt-0.5 text-xs text-foreground-muted">
            {attendance.employeeId}
            {" · "}
            {attendance.role}
          </p>
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="attendance-date"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Tanggal
          </label>

          <div className="relative">
            <CalendarDays
              size={17}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-foreground-muted
              "
            />

            <Input
              id="attendance-date"
              type="date"
              value={form.date}
              onChange={(event) => handleChange("date", event.target.value)}
              className="pl-10"
              error={errors.date}
            />
          </div>

          {errors.date && (
            <p className="mt-1 text-xs text-danger">{errors.date}</p>
          )}
        </div>

        {/* Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="attendance-check-in"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Jam Masuk
            </label>

            <div className="relative">
              <Clock3
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-foreground-muted
                "
              />

              <Input
                id="attendance-check-in"
                type="time"
                value={form.checkIn}
                onChange={(event) =>
                  handleChange("checkIn", event.target.value)
                }
                className="pl-10"
                disabled={form.status === "absent"}
              />
            </div>

            {errors.checkIn && (
              <p className="mt-1 text-xs text-danger">{errors.checkIn}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="attendance-check-out"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Jam Pulang
            </label>

            <div className="relative">
              <Clock3
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-foreground-muted
                "
              />

              <Input
                id="attendance-check-out"
                type="time"
                value={form.checkOut}
                onChange={(event) =>
                  handleChange("checkOut", event.target.value)
                }
                className="pl-10"
                disabled={form.status === "absent"}
              />
            </div>

            {errors.checkOut && (
              <p className="mt-1 text-xs text-danger">{errors.checkOut}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="attendance-status"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Status
          </label>

          <Select
            id="attendance-status"
            value={form.status}
            onChange={(event) => handleChange("status", event.target.value)}
          >
            <option value="present">Hadir</option>

            <option value="late">Terlambat</option>

            <option value="absent">Tidak Hadir</option>
          </Select>
        </div>

        {/* Reason */}
        <div>
          <label
            htmlFor="attendance-reason"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Alasan Koreksi
          </label>

          <div className="relative">
            <FileText
              size={17}
              className="
                pointer-events-none
                absolute
                left-3
                top-3
                text-foreground-muted
              "
            />

            <textarea
              id="attendance-reason"
              value={form.reason}
              onChange={(event) => handleChange("reason", event.target.value)}
              rows={4}
              placeholder="Contoh: Karyawan lupa melakukan clock in."
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-input-border
                bg-input
                py-2.5
                pl-10
                pr-3
                text-sm
                text-foreground
                placeholder:text-input-placeholder
                outline-none
                transition
                focus:border-primary-500
                focus:ring-2
                focus:ring-primary-500/20
              "
            />
          </div>

          {errors.reason && (
            <p className="mt-1 text-xs text-danger">{errors.reason}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
