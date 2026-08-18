import { cn } from "../../utils/cn";

export default function AppPageHeader({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}) {
  return (
    <header className={cn("w-full min-w-0", "mb-4 sm:mb-5 lg:mb-6", className)}>
      <div
        className="
          flex
          w-full
          min-w-0
          flex-col
          gap-3
          sm:gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* =====================================
            LEFT
            ===================================== */}

        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* ICON */}

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
                bg-primary-50
                text-primary-600
                dark:bg-primary-900/30
                dark:text-primary-400
              "
            >
              <Icon size={20} />
            </div>
          )}

          {/* TITLE + DESCRIPTION */}

          <div className="min-w-0 flex-1">
            <h1
              className="
                break-words
                text-lg
                font-bold
                leading-tight
                tracking-tight
                text-foreground

                sm:text-xl
                lg:text-2xl
              "
            >
              {title}
            </h1>

            {description && (
              <p
                className="
                  mt-1
                  max-w-2xl
                  text-xs
                  leading-relaxed
                  text-foreground-secondary

                  sm:text-sm
                "
              >
                {description}
              </p>
            )}

            {children}
          </div>
        </div>

        {/* =====================================
            ACTION
            ===================================== */}

        {action && (
          <div
            className="
              flex
              w-full
              min-w-0
              flex-wrap
              items-center
              gap-2

              lg:w-auto
              lg:shrink-0
              lg:justify-end
            "
          >
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
