import { cn } from "../../utils/cn";

export default function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  className,
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4",
        "sm:flex-row sm:items-center",
        "sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}

        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-foreground-secondary">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      )}
    </div>
  );
}
