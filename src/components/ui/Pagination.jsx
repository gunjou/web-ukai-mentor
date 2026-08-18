import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../utils/cn";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-foreground-muted">
        Halaman {page} dari {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "flex h-8 w-8 items-center justify-center",
            "rounded-lg border border-border",
            "text-foreground-secondary",
            "transition-colors",
            "hover:bg-background-tertiary",
            "disabled:pointer-events-none",
            "disabled:opacity-40"
          )}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                "flex h-8 min-w-8 items-center justify-center",
                "rounded-lg px-2 text-xs font-medium",
                "transition-colors",

                item === page
                  ? "bg-primary-500 text-white"
                  : "text-foreground-secondary hover:bg-background-tertiary"
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "flex h-8 w-8 items-center justify-center",
            "rounded-lg border border-border",
            "text-foreground-secondary",
            "transition-colors",
            "hover:bg-background-tertiary",
            "disabled:pointer-events-none",
            "disabled:opacity-40"
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
