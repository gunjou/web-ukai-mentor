import { cn } from "../../utils/cn";

export default function Label({
  children,
  htmlFor,
  required = false,
  optional = false,
  className,
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-sm font-medium",
        "text-foreground",
        className
      )}
    >
      {children}

      {required && (
        <span className="ml-1 text-danger" aria-hidden="true">
          *
        </span>
      )}

      {optional && (
        <span className="ml-1.5 text-xs font-normal text-foreground-muted">
          (opsional)
        </span>
      )}
    </label>
  );
}
