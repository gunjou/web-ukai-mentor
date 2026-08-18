import { Users } from "lucide-react";

import Card from "../ui/Card";

export default function ParticipantSummary({ meta, selectedClass }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary-50
            text-primary-600
            dark:bg-primary-900/30
            dark:text-primary-400
          "
        >
          <Users size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-foreground-muted">Total Peserta</p>

          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {meta.total}
            </span>

            {selectedClass?.nama_kelas && (
              <span className="truncate text-xs text-foreground-muted">
                {selectedClass.nama_kelas}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
