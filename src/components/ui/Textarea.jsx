import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Textarea = forwardRef(
  (
    {
      size = "md",
      error = false,
      success = false,
      disabled = false,
      resize = "vertical",
      className,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: "min-h-[80px] text-sm px-3 py-2",
      md: "min-h-[100px] text-sm px-3 py-2.5",
      lg: "min-h-[140px] text-base px-4 py-3",
    };

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border",
          "bg-input",
          "text-foreground",
          "placeholder:text-input-placeholder",
          "outline-none",
          "transition-all duration-200",

          "focus:border-primary-500",
          "focus:ring-2 focus:ring-primary-500/20",

          "disabled:cursor-not-allowed",
          "disabled:bg-background-tertiary",
          "disabled:opacity-60",

          sizes[size],
          resizeClasses[resize],

          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : success
            ? "border-success focus:border-success focus:ring-success/20"
            : "border-input-border",

          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
