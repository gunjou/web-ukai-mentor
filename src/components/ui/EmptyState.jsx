import { Inbox, Search } from "lucide-react";

import Button from "./Button";

const icons = {
  default: Inbox,
  search: Search,
};

export default function EmptyState({
  title = "Tidak ada data",
  description = "Belum ada data yang tersedia.",
  icon = "default",
  actionLabel,
  onAction,
}) {
  const Icon = icons[icon] || icons.default;

  return (
    <div
      className="
        flex
        min-h-[280px]
        flex-col
        items-center
        justify-center
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-background-tertiary
          text-foreground-muted
        "
      >
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-foreground-muted">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
