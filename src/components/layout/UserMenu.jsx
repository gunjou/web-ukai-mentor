import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";

export default function UserMenu({ onProfile, onSettings, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  /*
   * Data user dari akun yang sedang login
   */
  const name = user?.nama || "User";
  const role = user?.role || "Mentor";
  const initials = getInitials(name);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    setOpen(false);

    if (onLogout) {
      onLogout();
      return;
    }

    logout();

    navigate("/", {
      replace: true,
    });
  }

  function handleProfile() {
    setOpen(false);

    onProfile?.();
  }

  function handleSettings() {
    setOpen(false);

    onSettings?.();
  }

  return (
    <div ref={menuRef} className="relative">
      {/* User Button */}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="
          flex items-center gap-2
          rounded-lg
          p-1.5
          transition-colors
          hover:bg-background-tertiary
        "
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {/* Avatar */}

        <div
          className="
            flex h-8 w-8
            items-center justify-center
            rounded-full
            bg-primary-100
            text-xs font-semibold
            text-primary-700
            dark:bg-primary-900
            dark:text-primary-300
          "
        >
          {initials}
        </div>

        {/* Name & Role */}

        <div className="hidden text-left md:block">
          <p className="max-w-[180px] truncate text-sm font-medium text-foreground">
            {name}
          </p>

          <p className="text-[11px] capitalize text-foreground-muted">{role}</p>
        </div>

        {/* Chevron */}

        <ChevronDown
          size={15}
          className={cn(
            "hidden text-foreground-muted transition-transform md:block",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}

      {open && (
        <div
          className="
            absolute right-0 top-full z-50
            mt-2 w-52
            overflow-hidden
            rounded-xl
            border border-border
            bg-card
            p-1.5
            shadow-lg
          "
          role="menu"
        >
          {/* User Info */}

          <div className="border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="mt-0.5 truncate text-xs capitalize text-foreground-muted">
              {role}
            </p>
            {user?.email && (
              <p className="mt-1 truncate text-[11px] text-foreground-muted">
                {user.email}
              </p>
            )}
          </div>

          {/* Menu */}
          <div className="py-1">
            <button
              type="button"
              onClick={handleProfile}
              className="
                flex w-full items-center gap-3
                rounded-lg
                px-3 py-2
                text-sm
                text-foreground-secondary
                transition-colors
                hover:bg-background-tertiary
                hover:text-foreground
              "
              role="menuitem"
            >
              <User size={17} />
              Profil
            </button>

            <button
              type="button"
              onClick={handleSettings}
              className="
                flex w-full items-center gap-3
                rounded-lg
                px-3 py-2
                text-sm
                text-foreground-secondary
                transition-colors
                hover:bg-background-tertiary
                hover:text-foreground
              "
              role="menuitem"
            >
              <Settings size={17} />
              Pengaturan
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-border pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="
                flex w-full items-center gap-3
                rounded-lg
                px-3 py-2
                text-sm
                text-danger
                transition-colors
                hover:bg-danger/10
              "
              role="menuitem"
            >
              <LogOut size={17} />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
