
import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Mail,
  MapPin,
  Heart
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#102D23] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-12 pt-16 md:grid-cols-3">
        <div>
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4E9C70]">
              <CalendarDays size={23} />
            </div>

            <span className="text-2xl font-black">
              ANO G?
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
            Your platform for discovering events,
            connecting communities, and creating
            memorable experiences.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold">
            Quick Links
          </h3>

          <div className="mt-5 flex flex-col gap-4 text-sm text-white/60">
            <Link to="/" className="hover:text-white">
              Home
            </Link>

            <Link to="/events" className="hover:text-white">
              Browse Events
            </Link>

            <Link to="/about" className="hover:text-white">
              About Us
            </Link>

            <Link to="/login" className="hover:text-white">
              Login
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold">
            Contact & Information
          </h3>

          <div className="mt-5 space-y-4 text-sm text-white/60">
            <p className="flex items-center gap-3">
              <MapPin size={17} />
              Philippines
            </p>

            <p className="flex items-center gap-3">
              <Mail size={17} />
              Contact information coming soon
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} ANO G?
            All rights reserved.
          </p>

          <p className="flex items-center gap-1.5">
            Made with
            <Heart size={13} className="text-[#80C99A]" />
            for the community
          </p>
        </div>
      </div>
    </footer>
  );
}
