import Label from "./Label";
import { cn } from "../../utils/cn";

export default function FormField({
  label,
  htmlFor,
  required = false,
  optional = false,
  error,
  hint,
  children,
  className,
}) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required} optional={optional}>
          {label}
        </Label>
      )}

      {children}

      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}

      {!error && hint && (
        <p className="mt-1.5 text-xs text-foreground-muted">{hint}</p>
      )}
    </div>
  );
}
