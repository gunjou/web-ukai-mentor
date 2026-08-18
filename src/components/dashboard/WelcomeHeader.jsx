import { CalendarDays } from "lucide-react";

export default function WelcomeHeader({ name = "Mentor" }) {
  const now = new Date();

  const hour = now.getHours();

  const greeting = getGreeting(hour);

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="mb-6">
      <div
        className="
          flex
          flex-col
          gap-2
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        {/* GREETING */}

        <div>
          <h2
            className="
              text-2xl
              font-bold
              tracking-tight
              text-foreground
            "
          >
            {greeting}, {name} 👋
          </h2>

          <p className="mt-1 text-sm text-foreground-secondary">
            Berikut ringkasan aktivitas absensi hari ini.
          </p>
        </div>

        {/* DATE */}

        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            text-foreground-muted
          "
        >
          <CalendarDays size={16} />

          <span>{today}</span>
        </div>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * GREETING
 * ==========================================
 */

function getGreeting(hour) {
  if (hour >= 5 && hour < 11) {
    return "Selamat pagi";
  }

  if (hour >= 11 && hour < 15) {
    return "Selamat siang";
  }

  if (hour >= 15 && hour < 18) {
    return "Selamat sore";
  }

  return "Selamat malam";
}
