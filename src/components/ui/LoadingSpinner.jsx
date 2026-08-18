import { Loader2 } from "lucide-react";

import { cn } from "../../utils/cn";

const sizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28,
  xl: 36,
};

export default function LoadingSpinner({
  size = "md",
  className,
  label = "Memuat...",
}) {
  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <Loader2
        size={sizes[size] || sizes.md}
        className="animate-spin text-primary-500"
      />

      <span className="sr-only">{label}</span>
    </div>
  );
}
