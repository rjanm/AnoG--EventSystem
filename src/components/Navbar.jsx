
import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate
} from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Compass,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  UserPlus,
  UserRound,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const {
    user,
    isAuthenticated,
    loading,
    logout
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const role =
    user?.role === "user"
      ? "attendee"
      : user?.role || "attendee";

  const isAdmin =
    isAuthenticated && role === "admin";

  const isOrganizer =
    isAuthenticated && role === "organizer";

  const isAttendee =
    isAuthenticated && role === "attendee";

  const canManageEvents = isAdmin || isOrganizer;

  const isAdminPage = isAdmin;

  const displayName =
    user?.fullName?.trim() ||
    user?.username ||
    "My Account";

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase();

  const roleLabel =
    role === "admin"
      ? "Administrator"
      : role === "organizer"
      ? "Organizer"
      : "Attendee";

  const links = [
    {
      name: "Home",
      path: "/",
      icon: Compass,
      visible: true
    },
    {
      name: "Browse Events",
      path: "/events",
      icon: CalendarDays,
      visible: true
    },
    {
      name: "Dashboard",
      path: "/admin",
      icon: ShieldCheck,
      visible: isAdmin
    },
    {
      name: "Dashboard",
      path: "/organizer",
      icon: LayoutDashboard,
      visible: isOrganizer
    }
  ].filter(link => link.visible);

  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen && !profileMenuOpen) return;

    const handleEscape = event => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, profileMenuOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center gap-2 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-[#173B2F]"
        : "text-[#173B2F]/55 hover:text-[#173B2F]"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
      isActive
        ? "bg-[#E5F1E8] text-[#173B2F]"
        : "text-[#526A5B] hover:bg-[#EDF3EB] hover:text-[#173B2F]"
    }`;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#173B2F]/10 bg-[#F2F5EF]/95 shadow-[0_2px_16px_rgba(23,59,47,0.04)] backdrop-blur-xl">
      <nav
        className={
          isAdminPage
            ? "w-full px-4 sm:px-6 lg:px-8"
            : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        }
      >
        <div className="flex h-20 items-center justify-between gap-4">
          <Link
            to={isAdminPage ? "/admin" : "/"}
            onClick={closeMenus}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173B2F] text-white shadow-sm transition duration-300 group-hover:-rotate-3">
              <span className="text-xl font-black tracking-tight">
                G
              </span>
            </div>

            <div>
              <p className="text-xl font-black tracking-[-0.05em] text-[#173B2F]">
                ANO G
                <span className="text-[#52B788]">
                  ?
                </span>
              </p>

              <p className="hidden text-[9px] font-semibold uppercase tracking-[0.13em] text-[#819287] sm:block">
                {isAdminPage
                  ? "Admin Panel"
                  : "Event Management"}
              </p>
            </div>
          </Link>

          {!isAdminPage && (
            <div className="hidden items-center gap-6 lg:flex xl:gap-8">
              {links.map(link => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={navLinkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={16}
                          strokeWidth={1.9}
                        />

                        <span>
                          {link.name}
                        </span>

                        <span
                          className={`absolute bottom-0 left-0 h-[2px] w-full origin-left rounded-full bg-[#52B788] transition-transform duration-300 ${
                            isActive
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}

          <div
            className={
              isAdminPage
                ? "flex items-center gap-3"
                : "hidden items-center gap-3 lg:flex"
            }
          >
            {loading ? (
              <div className="h-11 w-32 animate-pulse rounded-xl bg-[#DFE9DE]" />
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setProfileMenuOpen(
                      previous => !previous
                    )
                  }
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    profileMenuOpen
                      ? "border-[#B6D4BC] bg-[#EAF3EA]"
                      : "border-[#D9E5D9] bg-white hover:border-[#B6D4BC] hover:bg-[#F8FBF7]"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#173B2F] text-xs font-bold text-white">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials || "A"
                    )}
                  </div>

                  <div className="hidden max-w-40 text-left sm:block">
                    <p className="truncate text-xs font-bold text-[#173B2F]">
                      {displayName}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-[#839488]">
                      {roleLabel}
                    </p>
                  </div>

                  <ChevronDown
                    size={15}
                    className={`text-[#819287] transition-transform ${
                      profileMenuOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {profileMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close account menu"
                      onClick={() =>
                        setProfileMenuOpen(false)
                      }
                      className="fixed inset-0 z-[-1] cursor-default"
                    />

                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 overflow-hidden rounded-2xl border border-[#E1E9DF] bg-white p-2 shadow-[0_16px_45px_rgba(23,59,47,0.14)]"
                    >
                      <div className="border-b border-[#EDF1EB] px-3 py-3">
                        <p className="truncate text-sm font-bold text-[#173B2F]">
                          {displayName}
                        </p>

                        <p className="mt-1 truncate text-xs text-[#87978A]">
                          @{user?.username}
                        </p>

                        <span className="mt-3 inline-flex rounded-full bg-[#EAF5ED] px-3 py-1 text-[10px] font-bold text-[#347B54]">
                          {roleLabel}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        role="menuitem"
                        onClick={closeMenus}
                        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#173B2F] hover:bg-[#F0F5EF]"
                      >
                        <UserRound size={17} />
                        My Profile
                      </Link>

                      {isAttendee && (
                        <Link
                          to="/apply-organizer"
                          role="menuitem"
                          onClick={closeMenus}
                          className="group mt-1 flex items-center gap-3 rounded-xl bg-[#EAF5ED] px-3 py-3 text-sm font-semibold text-[#173B2F] transition hover:bg-[#DDEEE1]"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#347B54]">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">
                              Become an Organizer
                            </p>

                            <p className="mt-0.5 text-[11px] font-normal text-[#668775]">
                              Apply or check your status
                            </p>
                          </div>

                          <ArrowUpRight
                            size={16}
                            className="text-[#347B54] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </Link>
                      )}

                      {canManageEvents && (
                        <Link
                          to={
                            isAdmin
                              ? "/admin"
                              : "/organizer"
                          }
                          role="menuitem"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#173B2F] hover:bg-[#F0F5EF]"
                        >
                          <LayoutDashboard size={17} />
                          My Dashboard
                        </Link>
                      )}

                      <div className="my-2 h-px bg-[#EDF1EB]" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={17} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#173B2F] hover:bg-[#E5EDE4]"
                >
                  <LogIn size={17} />
                  Sign In
                </Link>

                {!isAdminPage && (
                  <Link
                    to="/login?mode=register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#285742]"
                  >
                    <UserPlus size={17} />
                    Create Account
                    <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
            )}
          </div>

          {!isAdminPage && (
            <button
              type="button"
              onClick={() =>
                setMenuOpen(previous => !previous)
              }
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D9E5D9] bg-white text-[#173B2F] lg:hidden"
            >
              {menuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          )}
        </div>

        {!isAdminPage && menuOpen && (
          <div
            id="mobile-navigation"
            className="max-h-[calc(100vh-80px)] overflow-y-auto border-t border-[#DFE8DD] pb-6 pt-5 lg:hidden"
          >
            {isAuthenticated && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#E6F0E5] p-4">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#173B2F] text-sm font-bold text-white">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || "A"
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#173B2F]">
                    {displayName}
                  </p>

                  <p className="mt-1 text-xs text-[#7D9283]">
                    {roleLabel} Account
                  </p>
                </div>
              </div>
            )}

            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9AAA9D]">
              Navigation
            </p>

            <div className="space-y-1">
              {links.map(link => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={closeMenus}
                    className={mobileLinkClass}
                  >
                    <Icon size={18} />
                    {link.name}
                  </NavLink>
                );
              })}

              {isAuthenticated && (
                <NavLink
                  to="/profile"
                  onClick={closeMenus}
                  className={mobileLinkClass}
                >
                  <UserRound size={18} />
                  My Profile
                </NavLink>
              )}

              {isAttendee && (
                <NavLink
                  to="/apply-organizer"
                  onClick={closeMenus}
                  className={mobileLinkClass}
                >
                  <FileText size={18} />
                  Apply to Become an Organizer
                </NavLink>
              )}
            </div>

            <div className="mt-5 border-t border-[#DFE8DD] pt-5">
              {loading ? (
                <div className="h-12 animate-pulse rounded-xl bg-[#DFE9DE]" />
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 px-5 py-3.5 text-sm font-semibold text-red-700"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#D4E2D4] bg-white px-3 py-3.5 text-sm font-semibold text-[#173B2F]"
                  >
                    <LogIn size={16} />
                    Sign In
                  </Link>

                  <Link
                    to="/login?mode=register"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-3 py-3.5 text-sm font-semibold text-white"
                  >
                    <UserPlus size={16} />
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
