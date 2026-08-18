import { BarChart3 } from "lucide-react";

import {
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
} from "recharts";

import Card from "../ui/Card";

export default function AttendanceOverview({ data = [], loading = false }) {
  return (
    <Card className="min-w-0 p-4">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Kehadiran Jadwal
          </h3>

          <p className="mt-1 text-xs text-foreground-muted">
            Ringkasan kehadiran peserta berdasarkan seluruh jadwal.
          </p>
        </div>

        <div
          className="
            flex
            h-9
            w-9
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
          <BarChart3 size={18} />
        </div>
      </div>

      {loading ? (
        <div className="flex h-[280px] items-center justify-center">
          <span className="text-sm text-foreground-muted">
            Memuat data kehadiran...
          </span>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <span className="text-sm text-foreground-muted">
            Belum ada data kehadiran.
          </span>
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-border"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={35}
                allowDecimals={false}
                className="text-xs"
              />

              <Tooltip
                cursor={{
                  fill: "var(--background-tertiary)",
                }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                }}
                formatter={(value, name) => [value, name]}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;

                  if (!item) {
                    return label;
                  }

                  return `${label} • ${item.nama_kelas}`;
                }}
              />

              <Bar
                dataKey="hadir"
                name="Hadir"
                fill="var(--success)"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="izin"
                name="Izin"
                fill="var(--warning)"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="sakit"
                name="Sakit"
                fill="var(--info)"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="alpha"
                name="Alpha"
                fill="var(--danger)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <LegendItem color="bg-success" label="Hadir" />

        <LegendItem color="bg-warning" label="Izin" />

        <LegendItem color="bg-info" label="Sakit" />

        <LegendItem color="bg-danger" label="Alpha" />
      </div>
    </Card>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />

      <span className="text-xs text-foreground-secondary">{label}</span>
    </div>
  );
}
