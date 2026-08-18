import { MapPin, Video, CalendarClock } from "lucide-react";

export default function ScheduleLegend() {
  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        gap-x-5
        gap-y-2
        border-t
        border-border
        bg-background-secondary
        px-4
        py-3
      "
    >
      <span
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-wide
          text-foreground-muted
        "
      >
        Keterangan
      </span>

      {/* Offline */}
      <div className="flex items-center gap-1.5">
        <span
          className="
            flex h-5 w-5
            items-center justify-center
            rounded-md
            bg-primary-100
            text-primary-600
            dark:bg-primary-900/30
            dark:text-primary-400
          "
        >
          <MapPin size={11} />
        </span>

        <span className="text-[11px] text-foreground-secondary">Offline</span>
      </div>

      {/* Online */}
      <div className="flex items-center gap-1.5">
        <span
          className="
            flex h-5 w-5
            items-center justify-center
            rounded-md
            bg-info-light
            text-info
          "
        >
          <Video size={11} />
        </span>

        <span className="text-[11px] text-foreground-secondary">Online</span>
      </div>

      {/* Reschedule */}
      <div className="flex items-center gap-1.5">
        <span
          className="
            relative
            flex h-5 w-5
            items-center justify-center
            rounded-md
            border
            border-warning/30
            bg-warning-light
            text-warning
          "
        >
          <CalendarClock size={11} />

          <span
            className="
              absolute
              -right-0.5
              -top-0.5
              h-1.5
              w-1.5
              rounded-full
              bg-warning
              ring-2
              ring-background-secondary
            "
          />
        </span>

        <span className="text-[11px] text-foreground-secondary">
          Reschedule
        </span>
      </div>

      {/* Today */}
      <div className="flex items-center gap-1.5">
        <span
          className="
            flex h-5 w-5
            items-center justify-center
            rounded-full
            bg-primary-500
            text-[9px]
            font-bold
            text-white
          "
        >
          17
        </span>

        <span className="text-[11px] text-foreground-secondary">Hari ini</span>
      </div>

      {/* Selected */}
      <div className="flex items-center gap-1.5">
        <span
          className="
            h-5 w-5
            rounded-md
            border
            border-primary-200
            bg-primary-50
            dark:border-primary-800
            dark:bg-primary-900/20
          "
        />

        <span className="text-[11px] text-foreground-secondary">Dipilih</span>
      </div>
    </div>
  );
}
