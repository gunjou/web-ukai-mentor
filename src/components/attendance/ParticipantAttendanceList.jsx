import { CheckCircle2, Clock3, User } from "lucide-react";

import Card from "../ui/Card";

import { formatDateTime } from "../../utils/date";

export default function ParticipantAttendanceList({ participants }) {
  if (!participants?.length) {
    return (
      <Card className="p-8 text-center">
        <User size={32} className="mx-auto text-foreground-muted" />

        <p className="mt-3 text-sm font-medium text-foreground">
          Belum ada peserta
        </p>

        <p className="mt-1 text-xs text-foreground-muted">
          Tidak ada data peserta pada jadwal ini.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div
        className="
          border-b
          border-border
          px-4
          py-4
        "
      >
        <h2 className="text-sm font-semibold text-foreground">
          Daftar Peserta
        </h2>

        <p className="mt-1 text-xs text-foreground-muted">
          Status kehadiran peserta pada jadwal ini.
        </p>
      </div>

      <div className="divide-y divide-border">
        {participants.map((participant) => (
          <ParticipantRow
            key={participant.id_peserta}
            participant={participant}
          />
        ))}
      </div>
    </Card>
  );
}

function ParticipantRow({ participant }) {
  const status = participant.status_kehadiran;

  const statusConfig = getStatusConfig(status);

  const StatusIcon = statusConfig.icon;

  const displayName = participant.nickname || participant.nama || "Tanpa nama";

  return (
    <div
      className="
        flex
        flex-col
        gap-3
        px-4
        py-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-background-tertiary
            text-foreground-muted
          "
        >
          <User size={16} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>

          <p className="mt-0.5 text-[11px] text-foreground-muted">
            ID Peserta: {participant.id_peserta}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {participant.check_in_at && (
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <Clock3 size={13} />

            <span>{formatDateTime(participant.check_in_at)}</span>
          </div>
        )}

        <div
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-[11px]
            font-medium
            ${statusConfig.className}
          `}
        >
          <StatusIcon size={13} />

          {statusConfig.label}
        </div>
      </div>
    </div>
  );
}

function getStatusConfig(status) {
  switch (status) {
    case "HADIR":
      return {
        label: "Hadir",
        icon: CheckCircle2,
        className: "bg-success-light text-success",
      };

    case "IZIN":
      return {
        label: "Izin",
        icon: Clock3,
        className: "bg-warning-light text-warning",
      };

    case "SAKIT":
      return {
        label: "Sakit",
        icon: Clock3,
        className: "bg-info-light text-info",
      };

    case "ALPHA":
    default:
      return {
        label: "Alpha",
        icon: Clock3,
        className: "bg-background-tertiary text-foreground-muted",
      };
  }
}
