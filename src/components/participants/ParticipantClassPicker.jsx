import { BookOpen, ChevronDown } from "lucide-react";

import Card from "../ui/Card";

export default function ParticipantClassPicker({
  classes = [],
  selectedClass,
  onClassChange,
}) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-primary-50
              text-primary-600
              dark:bg-primary-900/30
              dark:text-primary-400
            "
          >
            <BookOpen size={18} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Pilih Kelas
            </h3>

            <p className="mt-1 text-xs text-foreground-muted">
              Pilih kelas untuk melihat daftar peserta.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-[320px]">
          <select
            value={selectedClass?.id_paketkelas || ""}
            onChange={(event) => onClassChange(event.target.value)}
            className="
              h-10
              w-full
              appearance-none
              rounded-lg
              border
              border-border
              bg-card
              px-3
              pr-9
              text-sm
              text-foreground
              outline-none
              transition-colors
              focus:border-primary-500
              focus:ring-2
              focus:ring-primary-500/20
            "
          >
            {classes.length === 0 ? (
              <option value="">Tidak ada kelas</option>
            ) : (
              classes.map((item) => (
                <option key={item.id_paketkelas} value={item.id_paketkelas}>
                  {item.nama_kelas || `Kelas ${item.id_paketkelas}`}
                </option>
              ))
            )}
          </select>

          <ChevronDown
            size={16}
            className="
              pointer-events-none
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-foreground-muted
            "
          />
        </div>
      </div>
    </Card>
  );
}
