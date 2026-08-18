import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Card = forwardRef(
  (
    { children, className, padding = "md", hoverable = false, ...props },
    ref
  ) => {
    const paddings = {
      none: "p-0",
      sm: "p-2",
      md: "p-2",
      lg: "p-2",
      xl: "p-2",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          "border border-border",
          "bg-card text-card-foreground",
          "shadow-sm",
          "transition-all duration-200",

          hoverable && "hover:-translate-y-0.5 hover:shadow-md",

          paddings[padding],

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
