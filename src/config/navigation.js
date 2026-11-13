import {
  LayoutDashboard,
  CalendarDays,
  ArrowLeftRight,
  Clock3,
  Users,
  UserCheck,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  BookOpenCheck,
  FileBarChart,
  Settings,
} from "lucide-react";

export const mainNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Attendance",
    href: "/my-attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Schedules",
    href: "/schedules",
    icon: CalendarDays,
  },
  {
    label: "Tukar Jadwal",
    href: "/schedule-swaps",
    icon: ArrowLeftRight,
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: UserCheck,
  },
  {
    label: "Rekap Kelas",
    href: "/class-recap",
    icon: FileBarChart,
    // Hanya tampil untuk mentor yang menjadi wali kelas
    waliKelasOnly: true,
  },
  {
    label: "Participants",
    href: "/participants",
    icon: Users,
  },
  {
    label: "Materi Progress",
    href: "/materi-progress",
    icon: BookOpenCheck,
  },
  {
    label: "Tryout Arrears",
    href: "/tryout-arrears",
    icon: ClipboardList,
  },
  // {
  //   label: "Izin & Cuti",
  //   href: "/leave",
  //   icon: CalendarCheck,
  // },
  // {
  //   label: "Laporan",
  //   href: "/reports",
  //   icon: FileBarChart,
  // },
];

export const bottomNavigation = [
  {
    label: "Pengaturan",
    href: "/settings",
    icon: Settings,
  },
];
