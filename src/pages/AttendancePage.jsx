import { AlertCircle, RefreshCw, FileDown } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageHeader from "../components/ui/AppPageHeader";

import AttendanceSchedulePicker from "../components/attendance/AttendanceSchedulePicker";
import AttendanceSummary from "../components/attendance/AttendanceSummary";
import AttendanceTable from "../components/attendance/AttendanceTable";

import useAttendance from "../hooks/useAttendance";

import { exportAttendancePdf } from "../utils/attendancePdf";

export default function AttendancePage() {
  const attendance = useAttendance();

  const {
    schedules,
    selectedSchedule,

    participants,
    meta,

    scheduleLoading,
    loading,
    error,

    loadParticipantAttendance,

    handleScheduleChange,
    handleRefresh,
  } = attendance;

  /*
   * ==========================================
   * REFRESH ATTENDANCE
   * ==========================================
   */

  async function handleAttendanceRefresh() {
    if (!selectedSchedule?.id_jadwal) {
      return;
    }

    await loadParticipantAttendance(selectedSchedule.id_jadwal);
  }

  /*
   * ==========================================
   * EXPORT PDF
   * ==========================================
   */

  function handleExportPdf() {
    if (!selectedSchedule) {
      return;
    }

    if (participants.length === 0) {
      return;
    }

    try {
      exportAttendancePdf({
        schedule: selectedSchedule,
        participants,
        meta,
      });
    } catch (err) {
      console.error("EXPORT ATTENDANCE PDF ERROR:", err);
    }
  }

  const exportDisabled =
    !selectedSchedule || loading || participants.length === 0;

  return (
    <div className="space-y-5">
      {/* ======================================
          PAGE HEADER
          ====================================== */}

      <PageHeader
        title="Kehadiran Peserta"
        description="Kelola kehadiran peserta berdasarkan jadwal."
        action={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportPdf}
              disabled={exportDisabled}
              className="w-full sm:w-auto"
            >
              <FileDown size={15} />
              Export PDF
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              disabled={scheduleLoading || loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                size={15}
                className={scheduleLoading || loading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          </>
        }
      />

      {/* ======================================
          SCHEDULE
          ====================================== */}

      {scheduleLoading ? (
        <Card
          className="
            flex
            min-h-[180px]
            items-center
            justify-center
          "
        >
          <LoadingSpinner size="lg" label="Memuat jadwal..." />
        </Card>
      ) : error && schedules.length === 0 ? (
        <Card
          className="
            flex
            min-h-[250px]
            flex-col
            items-center
            justify-center
            p-6
            text-center
          "
        >
          <AlertCircle size={32} className="text-danger" />

          <h2
            className="
              mt-3
              text-base
              font-semibold
              text-foreground
            "
          >
            Gagal memuat data
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-foreground-muted
            "
          >
            {error}
          </p>

          <Button className="mt-4" onClick={handleRefresh}>
            <RefreshCw size={15} />
            Coba Lagi
          </Button>
        </Card>
      ) : schedules.length === 0 ? (
        <Card
          className="
            flex
            min-h-[200px]
            flex-col
            items-center
            justify-center
            p-6
            text-center
          "
        >
          <AlertCircle size={30} className="text-foreground-muted" />

          <p className="mt-3 text-sm font-medium text-foreground">
            Belum ada jadwal
          </p>

          <p className="mt-1 text-xs text-foreground-muted">
            Tidak terdapat jadwal yang dapat dipilih.
          </p>
        </Card>
      ) : (
        <>
          {/* ==================================
              PICKER
              ================================== */}

          <AttendanceSchedulePicker
            schedules={schedules}
            selectedSchedule={selectedSchedule}
            onScheduleChange={handleScheduleChange}
          />

          {/* ==================================
              SUMMARY
              ================================== */}

          <AttendanceSummary meta={meta} />

          {/* ==================================
              ERROR ATTENDANCE
              ================================== */}

          {error && (
            <Card
              className="
                flex
                items-start
                gap-3
                border-danger/20
                bg-danger-light
                p-4
              "
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />

              <div>
                <p className="text-sm font-medium text-danger">
                  Gagal memuat kehadiran
                </p>

                <p className="mt-1 text-xs text-foreground-secondary">
                  {error}
                </p>
              </div>
            </Card>
          )}

          {/* ==================================
              TABLE
              ================================== */}

          <AttendanceTable
            participants={participants}
            loading={loading}
            onRefresh={handleAttendanceRefresh}
          />
        </>
      )}
    </div>
  );
}
