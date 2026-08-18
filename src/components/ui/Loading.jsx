import Spinner from "./Spinner";
import { cn } from "../../utils/cn";

export default function Loading({
  text = "Memuat...",
  fullScreen = false,
  className,
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3",
        "text-sm text-foreground-secondary",

        fullScreen
          ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          : "min-h-[200px] w-full",

        className
      )}
    >
      <Spinner size="md" />

      {text && <span>{text}</span>}
    </div>
  );
}
