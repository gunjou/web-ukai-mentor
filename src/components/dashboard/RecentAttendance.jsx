import { ArrowRight, Clock3, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import Card from "../ui/Card";
import Badge from "../ui/Badge";

const statusConfig = {
  HADIR: {
    label: "Hadir",
    variant: "success",
  },

  IZIN: {
    label: "Izin",
    variant: "warning",
  },

  SAKIT: {
    label: "Sakit",
    variant: "info",
  },

  ALPHA: {
    label: "Alpha",
    variant: "danger",
  },
};

export default function RecentAttendance({ participants = [] }) {
  /*
   * ==========================================
   * AMBIL 5 ABSENSI TERBARU
   * ==========================================
   *
   * Hanya ambil peserta yang benar-benar sudah
   * melakukan absensi.
   */

  const recentAttendance = [...participants]
    .filter(
      (participant) =>
        participant?.id_absensi_peserta && participant?.check_in_at
    )
    .sort(
      (a, b) =>
        new Date(b.check_in_at).getTime() - new Date(a.check_in_at).getTime()
    )
    .slice(0, 5);

  return (
    <Card className="overflow-hidden p-0">
      {/* ======================================
          HEADER
          ====================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-border
          px-5
          py-4
        "
      >
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Absensi Terbaru
          </h3>

          <p className="mt-1 text-xs text-foreground-muted">
            5 aktivitas absensi terbaru.
          </p>
        </div>

        <Link
          to="/attendance"
          className="
    flex
    items-center
    gap-1
    text-xs
    font-medium
    text-primary-600
    hover:text-primary-700
    dark:text-primary-400
  "
        >
          Lihat semua
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ======================================
          EMPTY
          ====================================== */}

      {recentAttendance.length === 0 ? (
        <div
          className="
            flex
            min-h-[220px]
            flex-col
            items-center
            justify-center
            px-5
            text-center
          "
        >
          <UserRound size={30} className="text-foreground-muted" />

          <p className="mt-3 text-sm font-medium text-foreground">
            Belum ada absensi
          </p>

          <p className="mt-1 text-xs text-foreground-muted">
            Belum ada peserta yang melakukan absensi.
          </p>
        </div>
      ) : (
        /* ====================================
           TABLE
           ==================================== */

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary">
                <th className="px-5 py-3 text-left text-xs font-medium text-foreground-muted">
                  Peserta
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium text-foreground-muted">
                  Kelas
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium text-foreground-muted">
                  Waktu
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium text-foreground-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {recentAttendance.map((attendance) => (
                <AttendanceRow
                  key={attendance.id_absensi_peserta}
                  attendance={attendance}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/*
 * ==========================================
 * ROW
 * ==========================================
 */

function AttendanceRow({ attendance }) {
  const status = statusConfig[normalizeStatus(attendance.status_kehadiran)] || {
    label: attendance.status_kehadiran || "-",
    variant: "default",
  };

  const initials = getInitials(attendance.nickname || attendance.nama);

  return (
    <tr className="border-b border-border last:border-0">
      {/* PESERTA */}

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary-100
              text-[10px]
              font-semibold
              text-primary-700
              dark:bg-primary-900/40
              dark:text-primary-300
            "
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {attendance.nama || "-"}
            </p>

            {attendance.nickname && (
              <p className="truncate text-[11px] text-foreground-muted">
                @{attendance.nickname}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* KELAS */}

      <td className="px-5 py-3.5">
        <span className="text-sm text-foreground-secondary">
          {attendance.nama_kelas || "-"}
        </span>
      </td>

      {/* WAKTU */}

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
          <Clock3 size={14} />

          <div>
            <p>{formatDate(attendance.check_in_at)}</p>

            <p className="text-[11px] text-foreground-muted">
              {formatTime(attendance.check_in_at)}
            </p>
          </div>
        </div>
      </td>

      {/* STATUS */}

      <td className="px-5 py-3.5">
        <Badge variant={status.variant}>{status.label}</Badge>
      </td>
    </tr>
  );
}

/*
 * ==========================================
 * HELPERS
 * ==========================================
 */

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toUpperCase();
}

function getInitials(name) {
  if (!name) {
    return "?";
  }

  return String(name)
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
