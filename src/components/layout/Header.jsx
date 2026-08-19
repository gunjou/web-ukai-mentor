import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { getPageMeta } from "../../utils/navigation";

import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import NotificationButton from "./NotificationButton";

import Button from "../ui/Button";

const pageTitles = {
  "/": {
    title: "Dashboard",
    description: "Ringkasan aktivitas absensi hari ini",
  },
  "/attendance": {
    title: "Attendance",
    description: "Kelola dan pantau kehadiran peserta",
  },
  "/my-attendance": {
    title: "My Attendance",
    description: "Kelola dan pantau kehadiran peserta",
  },
  "/schedules": {
    title: "Schedules",
    description: "Lihat dan kelola jadwal",
  },
  "/shifts": {
    title: "Shift",
    description: "Kelola shift dan jam kerja",
  },
  "/participants": {
    title: "Participants",
    description: "Daftar peserta kelas",
  },
  "/leave": {
    title: "Izin & Cuti",
    description: "Kelola pengajuan izin dan cuti",
  },
  "/reports": {
    title: "Laporan",
    description: "Lihat laporan kehadiran",
  },
  "/settings": {
    title: "Pengaturan",
    description: "Kelola konfigurasi sistem",
  },
};

export default function Header({ onMobileMenu, onProfile, onSettings }) {
  const location = useLocation();

  const page = getPageMeta(location.pathname, pageTitles);
  return (
    <header
      className="
        flex h-16 shrink-0
        items-center justify-between
        border-b border-border
        bg-card
        px-4 lg:px-6
      "
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="
            h-10 w-10 shrink-0 p-0 border border-border
            lg:hidden
          "
          onClick={onMobileMenu}
          aria-label="Buka menu"
        >
          <Menu size={24} />
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1.5">
        <NotificationButton count={5} />

        <ThemeToggle size="sm" />

        <div className="ml-1">
          <UserMenu onProfile={onProfile} onSettings={onSettings} />
        </div>
      </div>
    </header>
  );
}
