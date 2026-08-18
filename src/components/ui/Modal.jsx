import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "../../utils/cn";

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  size = "md",
  showClose = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  contentClassName,
}) {
  /*
   * ==========================================
   * ESC KEY
   * ==========================================
   */

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  /*
   * ==========================================
   * BODY SCROLL LOCK
   * ==========================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  /*
   * ==========================================
   * MODAL NOT OPEN
   * ==========================================
   */

  if (!open) {
    return null;
  }

  /*
   * ==========================================
   * SIZE
   * ==========================================
   */

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  /*
   * ==========================================
   * MODAL
   * ==========================================
   */

  const modal = (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        h-screen
        w-screen
      "
      aria-hidden={!open}
    >
      {/* ======================================
          BACKDROP
          ====================================== */}

      <div
        className="
          fixed
          inset-0
          h-screen
          w-screen
          bg-black/50
          backdrop-blur-sm
        "
        onMouseDown={() => {
          if (closeOnBackdrop) {
            onClose?.();
          }
        }}
      />

      {/* ======================================
          MODAL CONTAINER
          ====================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          w-full
          items-center
          justify-center
          overflow-y-auto
          p-4
          sm:p-6
        "
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* ====================================
            MODAL CARD
            ==================================== */}

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
          className={cn(
            `
              relative
              flex
              max-h-[calc(100vh-2rem)]
              w-full
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-card
              shadow-2xl
            `,
            sizeClasses[size] || sizeClasses.md,
            className
          )}
        >
          {/* ==================================
              HEADER
              ================================== */}

          {(title || description || Icon || showClose) && (
            <div
              className="
                flex
                shrink-0
                items-start
                justify-between
                gap-4
                border-b
                border-border
                px-5
                py-4
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-start
                  gap-3
                "
              >
                {Icon && (
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary-100
                      text-primary-600
                      dark:bg-primary-900/30
                      dark:text-primary-400
                    "
                  >
                    <Icon size={20} />
                  </div>
                )}

                {(title || description) && (
                  <div className="min-w-0">
                    {title && (
                      <h2
                        id="modal-title"
                        className="
                          text-base
                          font-semibold
                          text-foreground
                        "
                      >
                        {title}
                      </h2>
                    )}

                    {description && (
                      <p
                        id="modal-description"
                        className="
                          mt-0.5
                          text-xs
                          text-foreground-muted
                        "
                      >
                        {description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-foreground-muted
                    transition-colors
                    hover:bg-background-tertiary
                    hover:text-foreground
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary-500/30
                  "
                  aria-label="Tutup modal"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          {/* ==================================
              CONTENT
              ================================== */}

          <div
            className={cn(
              `
                min-h-0
                flex-1
                overflow-y-auto
                p-5
              `,
              contentClassName
            )}
          >
            {children}
          </div>

          {/* ==================================
              FOOTER
              ================================== */}

          {footer && (
            <div
              className="
                shrink-0
                border-t
                border-border
                px-5
                py-4
              "
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /*
   * ==========================================
   * PORTAL
   * ==========================================
   */

  return createPortal(modal, document.body);
}
