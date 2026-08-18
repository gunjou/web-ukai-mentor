import { AlertCircle, RefreshCcw } from "lucide-react";

import Button from "./Button";

export default function ErrorState({
  title = "Gagal memuat data",
  description = "Terjadi kesalahan saat mengambil data. Silakan coba lagi.",
  onRetry,
}) {
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
          bg-danger-light
          text-danger
        "
      >
        <AlertCircle size={22} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-foreground-muted">
        {description}
      </p>

      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCcw size={14} />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
