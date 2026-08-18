import { Loader2 } from "lucide-react";

import { cn } from "../../utils/cn";

const variants = {
  primary: `
    bg-primary-500
    text-white
    hover:bg-primary-600
  `,

  outline: `
    border
    border-border
    bg-transparent
    text-foreground
    hover:bg-background-tertiary
  `,

  ghost: `
    bg-transparent
    text-foreground-secondary
    hover:bg-background-tertiary
  `,

  danger: `
    bg-danger
    text-white
    hover:opacity-90
  `,
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        `
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-lg
          font-medium
          transition-colors
          focus:outline-none
          focus:ring-2
          focus:ring-primary-500/30
          disabled:pointer-events-none
          disabled:opacity-50
        `,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}

      {children}
    </button>
  );
}
