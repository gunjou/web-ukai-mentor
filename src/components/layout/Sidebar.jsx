import { ChevronLeft, ChevronRight } from "lucide-react";

import { mainNavigation, bottomNavigation } from "../../config/navigation";
import SidebarItem from "./SidebarItem";

import { cn } from "../../utils/cn";

export default function Sidebar({ collapsed = false, onToggle }) {
  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col",
        "border-r border-sidebar-border",
        "bg-sidebar",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[250px]"
      )}
    >
      {/* ========================================
          LOGO
      ======================================== */}

      <div
        className={cn(
          "flex h-16 shrink-0 items-center",
          "border-b border-sidebar-border",
          collapsed ? " px-2" : "px-2"
        )}
      >
        <img
          src="/logo_horizontal.svg"
          alt="Logo"
          className={cn(
            "h-auto w-auto object-contain",
            "transition-all duration-300",
            collapsed ? "max-w-[52px]" : "h-10 max-w-[120px]"
          )}
        />
      </div>

      {/* ========================================
          MAIN NAVIGATION
      ======================================== */}

      <nav
        className="
          flex-1
          overflow-y-auto
          px-3
          py-5
        "
      >
        <p
          className={cn(
            "mb-3 px-3",
            "text-[10px]",
            "font-semibold uppercase",
            "tracking-[0.12em]",
            "text-sidebar-foreground",
            collapsed && "sr-only"
          )}
        >
          Menu Utama
        </p>

        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <SidebarItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* ========================================
          BOTTOM NAVIGATION
      ======================================== */}

      <div
        className="
          shrink-0
          border-t
          border-sidebar-border
          p-3
        "
      >
        <div className="space-y-1">
          {bottomNavigation.map((item) => (
            <SidebarItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>
      </div>

      {/* ========================================
          COLLAPSE BUTTON
      ======================================== */}

      <button
        type="button"
        onClick={onToggle}
        className="
          absolute
          -right-3
          top-[72px]
          z-10

          hidden
          lg:flex

          h-6
          w-6
          items-center
          justify-center

          rounded-full

          border
          border-sidebar-border

          bg-sidebar

          text-sidebar-foreground

          shadow-sm

          transition-all
          duration-200

          hover:border-brand-gold
          hover:bg-sidebar-hover
          hover:text-brand-gold

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-brand-gold/30
        "
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
