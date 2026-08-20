import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Registration", path: "/registration" },
    { name: "Budget", path: "/budget" },
    { name: "Attendance", path: "/attendance" },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#173B2F]/10 bg-[#F2F5EF]/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="flex h-20 items-center justify-between">

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#173B2F] text-white shadow-sm transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(82,183,136,0.25)]">
              <span className="text-lg font-bold transition-transform duration-300 group-hover:rotate-3">
                G
              </span>
            </div>

            <span className="text-xl font-bold tracking-tight text-[#173B2F] transition-opacity duration-300 group-hover:opacity-75">
              ANO G?
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">

            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-[#173B2F]"
                      : "text-[#173B2F]/55 hover:text-[#173B2F]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}

                    {/* Active underline */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#52B788] transition-transform duration-300 ${
                        isActive
                          ? "scale-x-100"
                          : "scale-x-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

          </div>

          <div className="hidden md:block">

            <Link
              to="/login"
              className="group flex items-center gap-2 rounded-lg bg-[#173B2F] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-[#245542] hover:shadow-[0_6px_20px_rgba(23,59,47,0.2)]"
            >
              Sign In

              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>

          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#173B2F]/10 text-[#173B2F] transition hover:bg-[#173B2F]/5 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

        </div>

        {menuOpen && (
          <div className="border-t border-[#173B2F]/10 py-5 md:hidden">

            <div className="flex flex-col">

              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-[#173B2F]/10 py-4 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#173B2F]"
                        : "text-[#173B2F]/55"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#173B2F] px-5 py-3 text-sm font-medium text-white"
              >
                Sign In
                <ArrowUpRight size={16} />
              </Link>

            </div>

          </div>
        )}

      </nav>
    </header>
  );
};

export default Navbar;