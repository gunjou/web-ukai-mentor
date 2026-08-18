import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

const Select = forwardRef(
  (
    {
      children,
      size = "md",
      error = false,
      disabled = false,
      placeholder,
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
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full appearance-none rounded-lg border",
            "bg-input",
            "text-foreground",
            "outline-none",
            "transition-all duration-200",

            "focus:border-primary-500",
            "focus:ring-2 focus:ring-primary-500/20",

            "disabled:cursor-not-allowed",
            "disabled:bg-background-tertiary",
            "disabled:opacity-60",

            sizes[size],

            "pl-3 pr-10",

            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-input-border",

            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}

          {children}
        </select>

        <ChevronDown
          size={18}
          className="
            pointer-events-none
            absolute right-3 top-1/2
            -translate-y-1/2
            text-foreground-muted
          "
        />
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
