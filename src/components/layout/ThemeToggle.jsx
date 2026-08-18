import { Moon, Sun } from "lucide-react";

import useTheme from "../../hooks/useTheme";
import { cn } from "../../utils/cn";

export default function ThemeToggle({ size = "md", className }) {
  const { isDark, toggleTheme } = useTheme();

  const sizes = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center justify-center",
        "rounded-lg",
        "border border-border",
        "bg-card",
        "text-foreground-secondary",
        "transition-all duration-200",

        "hover:bg-background-tertiary",
        "hover:text-foreground",

        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-primary-500/30",

        sizes[size],
        className
      )}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
    >
      {isDark ? (
        <Sun size={18} className="transition-transform duration-200" />
      ) : (
        <Moon size={18} className="transition-transform duration-200" />
      )}
    </button>
  );
}
