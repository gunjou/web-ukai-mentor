import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import ProfileSettingsModal from "./ProfileSettingsModal";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accountView, setAccountView] = useState(null);

  function openAccountView(view) {
    setMobileMenu(false);
    setAccountView(view);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* =========================
          DESKTOP SIDEBAR
      ========================== */}
      <div className="hidden h-full shrink-0 lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((current) => !current)}
          onSettings={() => openAccountView("settings")}
        />
      </div>

      {/* =========================
          MOBILE OVERLAY
      ========================== */}
      {mobileMenu && (
        <div
          className="
            fixed inset-0 z-40
            bg-black/50
            backdrop-blur-[1px]
            lg:hidden
          "
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* =========================
          MOBILE SIDEBAR
      ========================== */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          h-full
          transition-transform duration-300
          lg:hidden
          ${mobileMenu ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileMenu(false)}
          onSettings={() => openAccountView("settings")}
        />
      </div>

      {/* =========================
          MAIN APPLICATION
      ========================== */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header tidak ikut scroll */}
        <div className="shrink-0">
          <Header
            onMobileMenu={() => setMobileMenu(true)}
            onProfile={() => openAccountView("profile")}
            onSettings={() => openAccountView("settings")}
          />
        </div>

        {/* Hanya area ini yang scroll */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="min-h-full p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <ProfileSettingsModal
        open={Boolean(accountView)}
        view={accountView}
        onClose={() => setAccountView(null)}
      />
    </div>
  );
}
