import { Users, UserCheck, Clock3, UserX } from "lucide-react";

import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import AttendanceStatCard from "../components/dashboard/AttendanceStatCard";
import AttendanceOverview from "../components/dashboard/AttendanceOverview";
import TodaySchedule from "../components/dashboard/TodaySchedule";
import RecentAttendance from "../components/dashboard/RecentAttendance";
import QuickActions from "../components/dashboard/QuickActions";

import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";

import useDashboard from "../hooks/useDashboard";

export default function DashboardPage() {
  const {
    mentorName,
    schedules,
    todaySchedules,
    selectedSchedule,

    attendance,
    attendanceMeta,

    attendanceTrend,

    loading,
    error,

    refresh,
  } = useDashboard();

  const total = attendanceMeta.total;
  const hadir = attendanceMeta.hadir;
  const izin = attendanceMeta.izin;
  const sakit = attendanceMeta.sakit;
  const alpha = attendanceMeta.alpha;

  /*
   * Terlambat belum tersedia dari API.
   */
  const late = 0;

  return (
    <div className="space-y-4">
      <WelcomeHeader name={selectedSchedule?.nickname_mentor || "Mentor"} />{" "}
      {/* ======================================
          ERROR
          ====================================== */}
      {error && (
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            rounded-xl
            border
            border-danger/20
            bg-danger-light
            px-4
            py-3
          "
        >
          <p className="text-xs text-danger">{error}</p>

          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            Coba Lagi
          </Button>
        </div>
      )}
      {/* ======================================
          LOADING
          ====================================== */}
      {loading ? (
        <div
          className="
            flex
            min-h-[300px]
            items-center
            justify-center
          "
        >
          <LoadingSpinner size="lg" label="Memuat dashboard..." />
        </div>
      ) : (
        <>
          {/* ==================================
              STATISTICS
              ================================== */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AttendanceStatCard
              title="Total Peserta"
              value={total}
              description="Peserta pada jadwal"
              icon={Users}
              color="primary"
            />

            <AttendanceStatCard
              title="Hadir"
              value={hadir}
              description="Kehadiran peserta"
              icon={UserCheck}
              color="success"
            />

            <AttendanceStatCard
              title="Izin / Sakit"
              value={izin + sakit}
              description={`${izin} izin · ${sakit} sakit`}
              icon={Clock3}
              color="warning"
            />

            <AttendanceStatCard
              title="Tidak Hadir"
              value={alpha}
              description="Peserta alpha"
              icon={UserX}
              color="danger"
            />
          </div>

          {/* ==================================
              CHART + SCHEDULE
              ================================== */}

          <div
            className="
              grid
              gap-4
              xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]
            "
          >
            <AttendanceOverview data={attendanceTrend} loading={loading} />
            <TodaySchedule schedules={schedules} />
          </div>

          {/* ==================================
              RECENT + QUICK ACTION
              ================================== */}

          <div
            className="
              grid
              gap-4
              xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]
            "
          >
            <RecentAttendance
              participants={attendance}
              schedule={selectedSchedule}
            />

            <QuickActions />
          </div>
        </>
      )}
    </div>
  );
}
