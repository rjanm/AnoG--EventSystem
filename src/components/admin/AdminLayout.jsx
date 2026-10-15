
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-[#F2F5EF]">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="min-w-0 flex-1">
        <div className="border-b border-[#173B2F]/10 bg-white px-5 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin sidebar"
            className="inline-flex items-center gap-2 rounded-xl border border-[#173B2F]/10 px-4 py-2.5 text-sm font-semibold text-[#173B2F]"
          >
            <Menu size={19} />
            Menu
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
