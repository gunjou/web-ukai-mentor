import { ShieldCheck, Clock3, CalendarDays } from "lucide-react";

import Card from "../components/ui/Card";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="
        min-h-screen
        bg-background
        text-foreground
      "
    >
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* BRANDING */}

        <div
          className="
            relative
            hidden
            overflow-hidden
            bg-primary-600
            lg:flex
          "
        >
          <div
            className="
              absolute
              -right-32
              -top-32
              h-96
              w-96
              rounded-full
              bg-white/10
            "
          />

          <div
            className="
              absolute
              -bottom-40
              -left-40
              h-[28rem]
              w-[28rem]
              rounded-full
              bg-black/10
            "
          />

          <div
            className="
              relative
              z-10
              flex
              w-full
              flex-col
              justify-between
              p-10
              xl:p-14
            "
          >
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-primary-600
                  "
                >
                  A
                </div>

                <div>
                  <p className="font-bold text-white">Attendly</p>

                  <p className="text-xs text-white/70">Attendance System</p>
                </div>
              </div>
            </div>

            <div className="max-w-lg">
              <h1
                className="
                  text-4xl
                  font-bold
                  leading-tight
                  text-white
                  xl:text-5xl
                "
              >
                Kelola absensi
                <br />
                lebih mudah.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-white/75">
                Pantau kehadiran, kelola jadwal, dan pastikan aktivitas mentor
                berjalan dengan lebih terorganisir.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-white/90">
                  <ShieldCheck size={18} />
                  Sistem terpusat
                </div>

                <div className="flex items-center gap-3 text-sm text-white/90">
                  <Clock3 size={18} />
                  Monitoring kehadiran
                </div>

                <div className="flex items-center gap-3 text-sm text-white/90">
                  <CalendarDays size={18} />
                  Pengaturan jadwal
                </div>
              </div>
            </div>

            <p className="text-xs text-white/50">
              © 2026 Attendly. All rights reserved.
            </p>
          </div>
        </div>

        {/* LOGIN */}

        <div
          className="
            flex
            items-center
            justify-center
            px-5
            py-10
            sm:px-8
            lg:px-12
          "
        >
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary-500
                    font-bold
                    text-white
                  "
                >
                  A
                </div>

                <div>
                  <p className="font-bold">Attendly</p>

                  <p className="text-xs text-foreground-muted">
                    Attendance System
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-6 sm:p-8">
              <div className="mb-7">
                <h2 className="text-2xl font-bold tracking-tight">
                  Selamat datang
                </h2>

                <p className="mt-2 text-sm text-foreground-muted">
                  Masuk untuk mengakses dashboard Anda.
                </p>
              </div>

              <LoginForm />
            </Card>

            <p className="mt-6 text-center text-xs text-foreground-muted">
              Akses hanya tersedia untuk akun mentor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
