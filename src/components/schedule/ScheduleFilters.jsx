import { RotateCcw } from "lucide-react";

import Button from "../ui/Button";

export default function ScheduleFilters({
  schedules = [],
  classFilter = "all",
  meetingType = "all",
  classOptions = [],

  onClassChange,
  onMeetingTypeChange,
  onResetFilters,
  trailingAction,
}) {
  /*
   * ==========================================
   * RESET STATE
   * ==========================================
   */

  const hasFilter = classFilter !== "all" || meetingType !== "all";

  /*
   * ==========================================
   * RESET
   * ==========================================
   */

  function handleReset() {
    onResetFilters?.();
  }

  return (
    <div
      className="
        flex
        flex-col
        gap-2
        sm:flex-row
        sm:items-center
      "
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <select
          value={classFilter}
          onChange={(event) => {
            onClassChange?.(event.target.value);
          }}
          className="
            h-8
            min-w-0
            rounded-lg
            border
            border-input-border
            bg-input
            px-3
            text-xs
            text-foreground
            outline-none
            transition-colors
            focus:border-primary-500
            focus:ring-2
            focus:ring-primary-500/20
            sm:w-[180px]
          "
        >
          <option value="all">Semua Kelas</option>

          {classOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={meetingType}
          onChange={(event) => {
            onMeetingTypeChange?.(event.target.value);
          }}
          className="
            h-8
            min-w-0
            rounded-lg
            border
            border-input-border
            bg-input
            px-3
            text-xs
            text-foreground
            outline-none
            transition-colors
            focus:border-primary-500
            focus:ring-2
            focus:ring-primary-500/20
            sm:w-[130px]
          "
        >
          <option value="all">Semua Tipe</option>

          <option value="ONLINE">Online</option>

          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      <div className="flex items-center gap-2 sm:ml-auto">
        {trailingAction}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!hasFilter}
          className="
            h-8
            shrink-0
            px-2.5
            text-xs
          "
          title="Reset filter"
        >
          <RotateCcw size={13} className={hasFilter ? "" : "opacity-50"} />

          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </div>
  );
}
