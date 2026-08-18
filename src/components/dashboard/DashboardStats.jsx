import { Users, UserCheck, Clock3, UserX } from "lucide-react";
import AttendanceStatCard from "./AttendanceStatCard";
export default function DashboardStats({ statistics }) {
  const stats = [
    {
      title: "Total Peserta",
      value: statistics.totalParticipants,
      description: "Peserta pada jadwal hari ini",
      icon: Users,
      color: "primary",
    },
    {
      title: "Hadir",
      value: statistics.present,
      description: "Kehadiran hari ini",
      icon: UserCheck,
      color: "success",
    },
    {
      title: "Terlambat",
      value: statistics.late,
      description: "Belum tersedia dari API",
      icon: Clock3,
      color: "warning",
    },
    {
      title: "Tidak Hadir",
      value: statistics.absent,
      description: "Status alpha hari ini",
      icon: UserX,
      color: "danger",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {" "}
      {stats.map((stat) => (
        <AttendanceStatCard key={stat.title} {...stat} />
      ))}{" "}
    </div>
  );
}
