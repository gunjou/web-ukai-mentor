import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

import { cn } from "../../utils/cn";

const variants = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-success",
    barClass: "bg-success",
    title: "Berhasil",
  },

  error: {
    icon: XCircle,
    iconClass: "text-danger",
    barClass: "bg-danger",
    title: "Terjadi Kesalahan",
  },

  warning: {
    icon: AlertTriangle,
    iconClass: "text-warning",
    barClass: "bg-warning",
    title: "Perhatian",
  },

  info: {
    icon: Info,
    iconClass: "text-info",
    barClass: "bg-info",
    title: "Informasi",
  },
};

export default function Toast({
  open,
  type = "success",
  title,
  message,
  onClose,
}) {
  if (!open) {
    return null;
  }

  const variant = variants[type] || variants.success;

  const Icon = variant.icon;

  return (
    <div
      className="
        fixed
        right-4
        top-4
        z-[10000]
        w-[calc(100%-2rem)]
        max-w-sm
        animate-[toast-in_250ms_ease-out]
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-xl
          border
          border-border
          bg-card
          shadow-lg
        "
      >
        <div className="flex items-start gap-3 p-4">
          <div className="shrink-0 pt-0.5">
            <Icon size={20} className={cn(variant.iconClass)} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {title || variant.title}
            </p>

            {message && (
              <p className="mt-1 text-sm leading-5 text-foreground-secondary">
                {message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-7 w-7
              shrink-0
              items-center justify-center
              rounded-lg
              text-foreground-muted
              transition-colors
              hover:bg-background-tertiary
              hover:text-foreground
            "
            aria-label="Tutup notifikasi"
          >
            <X size={16} />
          </button>
        </div>

        <div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 w-full",
            variant.barClass
          )}
        />
      </div>
    </div>
  );
}
