import {
  Users,
  CheckCircle2,
  FileCheck2,
  HeartPulse,
  XCircle,
} from "lucide-react";

import Card from "../ui/Card";

export default function AttendanceSummary({ meta }) {
  const items = [
    {
      label: "Total",
      value: meta?.total ?? 0,
      icon: Users,
      iconClass: "text-blue-500",
      bgClass: "bg-blue-50",
    },
    {
      label: "Hadir",
      value: meta?.hadir ?? 0,
      icon: CheckCircle2,
      iconClass: "text-green-500",
      bgClass: "bg-green-50",
    },
    {
      label: "Izin",
      value: meta?.izin ?? 0,
      icon: FileCheck2,
      iconClass: "text-yellow-500",
      bgClass: "bg-yellow-50",
    },
    {
      label: "Sakit",
      value: meta?.sakit ?? 0,
      icon: HeartPulse,
      iconClass: "text-orange-500",
      bgClass: "bg-orange-50",
    },
    {
      label: "Alpha",
      value: meta?.alpha ?? 0,
      icon: XCircle,
      iconClass: "text-red-500",
      bgClass: "bg-red-50",
    },
  ];

  return (
    <div
      className="
        grid
        grid-cols-2
        gap-3
        sm:grid-cols-3
        lg:grid-cols-5
      "
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  ${item.bgClass}
                  ${item.iconClass}
                `}
              >
                <Icon size={17} strokeWidth={2.2} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-foreground-muted">{item.label}</p>

                <p className="mt-0.5 text-lg font-bold text-foreground">
                  {item.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
