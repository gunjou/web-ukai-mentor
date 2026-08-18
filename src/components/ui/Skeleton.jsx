import { cn } from "../../utils/cn";

export default function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        `
          animate-pulse
          rounded-md
          bg-background-tertiary
        `,
        className
      )}
    />
  );
}
