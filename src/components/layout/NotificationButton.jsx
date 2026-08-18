import { Bell } from "lucide-react";

export default function NotificationButton({ count = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        relative
        flex h-9 w-9
        items-center justify-center
        rounded-lg
        text-foreground-secondary
        transition-colors
        hover:bg-background-tertiary
        hover:text-foreground
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500/20
      "
      aria-label={count > 0 ? `${count} notifikasi` : "Notifikasi"}
    >
      <Bell size={19} />

      {count > 0 && (
        <span
          className="
            absolute right-1.5 top-1.5
            flex h-4 min-w-4
            items-center justify-center
            rounded-full
            bg-danger
            px-1
            text-[9px]
            font-bold
            text-white
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
