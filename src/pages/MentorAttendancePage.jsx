import { AlertCircle, RefreshCw } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageHeader from "../components/ui/AppPageHeader";

import MentorScheduleList from "../components/attendance/MentorScheduleList";
import MentorAttendancePanel from "../components/attendance/MentorAttendancePanel";

import useMentorAttendance from "../hooks/useMentorAttendance";

export default function MentorAttendancePage() {
  const attendance = useMentorAttendance();

  const {
    todaySchedules,
    loading,
    error,
    now,

    selectedSchedule,
    attendanceStatus,
    attendanceDetail,
    attendanceLoading,
    scheduleTimeStatus,

    location,
    locationLoading,

    evidence,
    submitting,

    loadSchedules,
    handleScheduleChange,

    handleGetLocation,
    handleEvidenceChange,

    handleCheckIn,
    handleCheckOut,
  } = attendance;

  return (
    <div className="space-y-5">
      {/* ======================================
          PAGE HEADER
          ====================================== */}

      <PageHeader
        title="Absensi Mentor"
        description="Lakukan check-in dan check-out untuk jadwal mengajar Anda."
        action={
          <Button
            type="button"
            variant="outline"
            onClick={loadSchedules}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      {/* ======================================
          CONTENT
          ====================================== */}

      {loading ? (
        <Card
          className="
            flex
            min-h-[400px]
            items-center
            justify-center
          "
        >
          <LoadingSpinner size="lg" label="Memuat jadwal..." />
        </Card>
      ) : error ? (
        <Card
          className="
            flex
            min-h-[300px]
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
            Gagal memuat jadwal
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

          <Button className="mt-4" onClick={loadSchedules} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Coba Lagi
          </Button>
        </Card>
      ) : (
        <div
          className="
            grid
            min-w-0
            gap-5
            lg:grid-cols-[minmax(0,1fr)_380px]
          "
        >
          {/* ==================================
              SCHEDULE LIST
              ================================== */}

          <MentorScheduleList
            schedules={todaySchedules}
            selectedSchedule={selectedSchedule}
            now={now}
            attendanceStatus={attendanceStatus}
            onScheduleChange={handleScheduleChange}
          />

          {/* ==================================
              ATTENDANCE PANEL
              ================================== */}

          <MentorAttendancePanel
            schedule={selectedSchedule}
            timeStatus={scheduleTimeStatus}
            location={location}
            locationLoading={locationLoading}
            evidence={evidence}
            submitting={submitting}
            attendanceStatus={attendanceStatus}
            attendanceDetail={attendanceDetail}
            attendanceLoading={attendanceLoading}
            onGetLocation={handleGetLocation}
            onEvidenceChange={handleEvidenceChange}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </div>
      )}
    </div>
  );
}
