import { NavLink } from "react-router-dom";

import { cn } from "../../utils/cn";

export default function SidebarItem({ item, collapsed = false }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      end={item.href === "/"}
      onClick={(event) => {
        if (item.onClick) {
          event.preventDefault();
          item.onClick();
        }
      }}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          `
          group
          relative
          flex
          items-center
          gap-3
          rounded-lg
          px-3
          py-2.5

          text-sm
          font-medium

          transition-all
          duration-200
          `,
          collapsed && "justify-center px-2",

          /* ==================================
             ACTIVE
          ================================== */

          isActive && ["bg-brand-gold/10", "text-brand-gold", "font-semibold"],

          /* ==================================
             INACTIVE
          ================================== */

          !isActive && [
            "text-sidebar-foreground",
            "hover:bg-sidebar-hover",
            "hover:text-sidebar-foreground-active",
          ]
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active Indicator */}
          {isActive && (
            <span
              className="
                absolute
                left-0
                top-1/2
                h-6
                w-[3px]
                -translate-y-1/2
                rounded-r-full
                bg-[#d38c0e]
              "
            />
          )}

          {/* Icon */}
          <Icon
            size={19}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={cn(
              "shrink-0",
              "transition-colors",
              isActive
                ? "text-[#d38c0e]"
                : "text-sidebar-foreground group-hover:text-sidebar-foreground-active"
            )}
          />

          {/* Label */}
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}
