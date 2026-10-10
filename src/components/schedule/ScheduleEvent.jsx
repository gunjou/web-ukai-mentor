import { MapPin, Video, CalendarClock, Layers3 } from "lucide-react";

import {
  formatTime,
  getMeetingType,
  getScheduleStartTime,
  getScheduleEndTime,
  isRescheduled,
} from "../../utils/schedule";

export default function ScheduleEvent({ schedule, onClick }) {
  const classes = schedule?.classes || [];

  if (!classes.length) {
    return null;
  }

  /*
   * Karena API sekarang mengembalikan group berdasarkan:
   * tanggal + waktu_mulai + waktu_selesai,
   * kita gunakan data group sebagai sumber utama.
   */

  const startTime = schedule.waktu_mulai || getScheduleStartTime(classes[0]);

  const endTime = schedule.waktu_selesai || getScheduleEndTime(classes[0]);

  /*
   * Ambil tipe meeting dari class pertama.
   *
   * Saat ini seluruh contoh data ONLINE.
   * Jika nantinya satu group bisa memiliki ONLINE + OFFLINE,
   * kita anggap mixed jika tipenya berbeda.
   */
  const meetingTypes = [
    ...new Set(classes.map((item) => getMeetingType(item))),
  ];

  const isOnline = meetingTypes.length === 1 && meetingTypes[0] === "ONLINE";
  const isMixed = meetingTypes.length > 1;

  /*
   * Reschedule cukup dicek dari seluruh classes.
   */
  const rescheduled = classes.some((item) => isRescheduled(item));

  /*
   * Jangan tampilkan semua kelas di calendar cell.
   * Cukup beberapa item + counter.
   */
  const visibleClasses = classes.slice(0, 3);
  const remainingCount = Math.max(classes.length - visibleClasses.length, 0);

  return (
    <button
      type="button"
      onClick={() => onClick?.(schedule)}
      title={`${formatTime(startTime)} - ${formatTime(endTime)} WIB • ${classes.length} kelas`}
      className={`
        group
        relative
        w-full
        rounded-lg
        border
        p-2
        text-left
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500/30

        ${
          isOnline
            ? `
              border-info/30
              bg-info-light
              text-info
              dark:border-info/20
            `
            : `
              border-primary-500/30
              bg-primary-100
              text-primary-700
              dark:bg-primary-900/30
              dark:text-primary-500
            `
        }
      `}
    >
      {/* =====================================
          RESCHEDULE INDICATOR
          ===================================== */}

      {rescheduled && (
        <span
          className="
            absolute
            right-2.5
            top-5.5
            flex
            h-4
            w-4
            items-center
            justify-center
            rounded-full
            bg-warning/15
            text-warning
          "
          title="Terdapat jadwal yang telah di-reschedule"
        >
          {/* <CalendarClock size={11} /> */}
        </span>
      )}

      {/* =====================================
          HEADER
          ===================================== */}

      <div className="flex items-start gap-1.5">
        {isMixed ? (
          <Layers3 size={13} className="mt-0.5 shrink-0" />
        ) : isOnline ? (
          <Video size={13} className="mt-0.5 shrink-0" />
        ) : (
          <MapPin size={13} className="mt-0.5 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          {/* TIME */}

          <div className="flex items-center justify-between gap-1 ">
            <p className="text-[10px] font-bold leading-tight">
              {formatTime(startTime)} - {formatTime(endTime)}
            </p>

            {/* COUNT */}

            <span
              className="
                shrink-0
                rounded-full
                bg-black/5
                px-1.5
                py-0.5
                text-[8px]
                font-bold
                dark:bg-white/10
              "
            >
              {classes.length}
            </span>
          </div>

          {/* =====================================
              CLASS LIST
              ===================================== */}

          <div className="mt-1.5 space-y-0.5">
            {visibleClasses.map((item) => (
              <p
                key={item.id_jadwal}
                className="
                  truncate
                  text-[9px]
                  font-semibold
                  leading-tight
                "
              >
                • {item.nama_kelas || "Tanpa kelas"}
              </p>
            ))}

            {/* REMAINING */}

            {remainingCount > 0 && (
              <p
                className="
                  mt-1
                  text-[8px]
                  font-bold
                  opacity-60
                "
              >
                +{remainingCount} kelas lainnya
              </p>
            )}
          </div>

          {/* =====================================
              TOPIC
              ===================================== */}

          <p
            className="
              mt-1.5
              truncate
              text-[8px]
              font-medium
              opacity-70
            "
            title={classes[0]?.topik || "-"}
          >
            {classes[0]?.topik || "-"}
          </p>
        </div>
      </div>
    </button>
  );
}
