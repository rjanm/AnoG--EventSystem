
import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarDays,
  ChartNoAxesColumn,
  Trash2,
  ArrowLeft,
  X
} from "lucide-react";

const menuItems = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
    end: true
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users
  },
  {
    label: "Organizer Applications",
    path: "/admin/applications",
    icon: ClipboardList
  },
  {
    label: "Events",
    path: "/admin/events",
    icon: CalendarDays
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: ChartNoAxesColumn
  },
  {
    label: "Trash / Archive",
    path: "/admin/trash",
    icon: Trash2
  }
];

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen
}) {
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-x-0 bottom-0 top-20 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-20 z-40 flex w-64 flex-col bg-[#173B2F] text-white transition-transform duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-7">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
            Menu
          </p>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {menuItems.map(item => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-[#173B2F] shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Website
          </Link>
        </div>
      </aside>
    </>
  );
}
