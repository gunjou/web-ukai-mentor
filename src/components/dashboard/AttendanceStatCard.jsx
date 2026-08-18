import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import Card from "../ui/Card";
import { cn } from "../../utils/cn";

const colorStyles = {
  primary: {
    icon: "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400",
    accent: "text-primary-600 dark:text-primary-400",
  },

  success: {
    icon: "bg-success/10 text-success",
    accent: "text-success",
  },

  warning: {
    icon: "bg-warning/10 text-warning",
    accent: "text-warning",
  },

  danger: {
    icon: "bg-danger/10 text-danger",
    accent: "text-danger",
  },
};

export default function AttendanceStatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "primary",
  trend,
  trendLabel,
}) {
  const styles = colorStyles[color] || colorStyles.primary;

  const positive = trend >= 0;

  return (
    <Card className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground-muted">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-foreground-muted">{description}</p>
          )}
        </div>

        <div
          className={cn(
            "flex h-10 w-10 shrink-0",
            "items-center justify-center",
            "rounded-xl",
            styles.icon
          )}
        >
          <Icon size={20} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1 text-xs">
          {positive ? (
            <ArrowUpRight size={14} className="text-success" />
          ) : (
            <ArrowDownRight size={14} className="text-danger" />
          )}

          <span
            className={cn(
              "font-semibold",
              positive ? "text-success" : "text-danger"
            )}
          >
            {Math.abs(trend)}%
          </span>

          {trendLabel && (
            <span className="text-foreground-muted">{trendLabel}</span>
          )}
        </div>
      )}
    </Card>
  );
}
