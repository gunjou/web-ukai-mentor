import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Input = forwardRef(
  (
    {
      type = "text",
      size = "md",
      error = false,
      success = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: "h-9 text-sm",
      md: "h-10 text-sm",
      lg: "h-11 text-base",
    };

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div
            className="
              pointer-events-none
              absolute left-3 top-1/2
              -translate-y-1/2
              text-foreground-muted
            "
          >
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border",
            "bg-input",
            "text-foreground",
            "placeholder:text-input-placeholder",
            "outline-none",
            "transition-all duration-200",

            "focus:ring-2 focus:ring-primary-500/20",
            "focus:border-primary-500",

            "disabled:cursor-not-allowed",
            "disabled:bg-background-tertiary",
            "disabled:opacity-60",

            sizes[size],

            leftIcon ? "pl-10" : "px-3",

            rightIcon ? "pr-10" : "pr-3",

            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : success
              ? "border-success focus:border-success focus:ring-success/20"
              : "border-input-border",

            className
          )}
          {...props}
        />

        {rightIcon && (
          <div
            className="
              absolute right-3 top-1/2
              -translate-y-1/2
              text-foreground-muted
            "
          >
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
