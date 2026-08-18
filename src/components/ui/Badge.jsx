import { cn } from "../../utils/cn";

const variants = {
  primary: `
    bg-primary-100
    text-primary-700
    dark:bg-primary-900/30
    dark:text-primary-300
  `,

  success: `
    bg-success-light
    text-success
  `,

  warning: `
    bg-warning-light
    text-warning
  `,

  danger: `
    bg-danger-light
    text-danger
  `,

  info: `
    bg-info-light
    text-info
  `,

  neutral: `
    bg-background-tertiary
    text-foreground-secondary
  `,
};

export default function Badge({ children, variant = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "rounded-full",
        "px-2.5 py-1",
        "text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
