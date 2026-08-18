import {
  Clock3,
  CalendarDays,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";

import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

import { formatDate, formatTime } from "../../utils/date";

const statusConfig = {
  present: {
    label: "Hadir",
    variant: "success",
  },

  late: {
    label: "Terlambat",
    variant: "warning",
  },

  absent: {
    label: "Tidak Hadir",
    variant: "danger",
  },
};

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="
          flex h-9 w-9
          shrink-0
          items-center justify-center
          rounded-lg
          bg-background-tertiary
          text-foreground-muted
        "
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-foreground-muted">{label}</p>

        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function AttendanceDetailModal({
  open,
  attendance,
  onClose,
  onEdit,
}) {
  if (!attendance) {
    return null;
  }

  const status = statusConfig[attendance.status] ?? statusConfig.absent;

  const initials = attendance.name
    ?.split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Detail Absensi"
      description="Informasi kehadiran karyawan."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>

          <Button onClick={() => onEdit?.(attendance)}>Koreksi Absensi</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Employee */}
        <div
          className="
            flex
            items-center
            gap-4
            rounded-xl
            border
            border-border
            bg-background-tertiary/50
            p-4
          "
        >
          <div
            className="
              flex h-12 w-12
              shrink-0
              items-center justify-center
              rounded-full
              bg-primary-100
              text-sm
              font-bold
              text-primary-700
              dark:bg-primary-900/30
              dark:text-primary-300
            "
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">{attendance.name}</h3>

            <p className="mt-0.5 text-xs text-foreground-muted">
              {attendance.employeeId}
              {" · "}
              {attendance.role}
            </p>
          </div>

          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Detail Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          <DetailItem
            icon={CalendarDays}
            label="Tanggal"
            value={formatDate(attendance.date)}
          />

          <DetailItem
            icon={BriefcaseBusiness}
            label="Shift"
            value={attendance.shift}
          />

          <DetailItem
            icon={Clock3}
            label="Jadwal"
            value={attendance.schedule}
          />

          <DetailItem
            icon={Clock3}
            label="Jam Masuk"
            value={attendance.checkIn ? formatTime(attendance.checkIn) : "-"}
          />

          <DetailItem
            icon={Clock3}
            label="Jam Pulang"
            value={attendance.checkOut ? formatTime(attendance.checkOut) : "-"}
          />

          <DetailItem icon={UserRound} label="Status" value={status.label} />
        </div>
      </div>
    </Modal>
  );
}
