import { Search, RotateCcw } from "lucide-react";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

export default function AttendanceFilters({
  search,
  onSearchChange,
  date,
  onDateChange,
  status,
  onStatusChange,
  shift,
  onShiftChange,
  onReset,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_180px_180px_180px_auto]">
        {/* Search */}
        <div className="relative">
          <Search
            size={17}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-foreground-muted
            "
          />

          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari nama atau ID karyawan..."
            className="pl-10"
          />
        </div>

        {/* Date */}
        <Input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />

        {/* Status */}
        <Select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="all">Semua Status</option>

          <option value="present">Hadir</option>

          <option value="late">Terlambat</option>

          <option value="absent">Tidak Hadir</option>
        </Select>

        {/* Shift */}
        <Select
          value={shift}
          onChange={(event) => onShiftChange(event.target.value)}
        >
          <option value="all">Semua Shift</option>

          <option value="Shift Pagi">Shift Pagi</option>

          <option value="Shift Siang">Shift Siang</option>

          <option value="Shift Malam">Shift Malam</option>
        </Select>

        {/* Reset */}
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw size={16} />
          Reset
        </Button>
      </div>
    </div>
  );
}
