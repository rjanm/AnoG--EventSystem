
import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Users,
  ShieldCheck,
  ArrowRight,
  Heart,
  Target,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Discover Events",
    description:
      "Explore upcoming events, activities, and experiences in one convenient platform."
  },
  {
    icon: Users,
    title: "Connect Communities",
    description:
      "Bring attendees and event organizers together through meaningful experiences."
  },
  {
    icon: ShieldCheck,
    title: "Manage with Ease",
    description:
      "Help organizers create, publish, and manage their events efficiently."
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#F2F5EF] text-[#173B2F]">
      <section className="px-5 pb-20 pt-24 text-center">
        <div className="mx-auto max-w-4xl">
          <span className="rounded-full bg-[#E1EEE2] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#347B54]">
            Get to Know Us
          </span>

          <h1 className="mt-8 text-4xl font-black tracking-tight sm:text-6xl">
            About <span className="text-[#4E9C70]">ANO G?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#718579]">
            ANO G? is an event management platform designed to
            make discovering, organizing, and joining events
            easier and more accessible.
          </p>

          <Link
            to="/events"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#286043]"
          >
            Explore Events
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4E9C70]">
              What We Do
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Bringing Events and People Together
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-[#E0E9DE] bg-[#F8FAF7] p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E1EEE2] text-[#347B54]">
                  <Icon size={27} />
                </div>

                <h3 className="mt-6 text-xl font-black">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#718579]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-[#DDE8DB] bg-white p-9">
            <Target size={34} className="text-[#347B54]" />

            <h2 className="mt-6 text-2xl font-black">
              Our Mission
            </h2>

            <p className="mt-4 text-sm leading-8 text-[#718579]">
              To provide a simple and organized digital platform
              where people can discover events, register for
              activities, and connect with communities while
              helping organizers manage their events.
            </p>
          </div>

          <div className="rounded-3xl border border-[#DDE8DB] bg-white p-9">
            <Heart size={34} className="text-[#347B54]" />

            <h2 className="mt-6 text-2xl font-black">
              Our Vision
            </h2>

            <p className="mt-4 text-sm leading-8 text-[#718579]">
              To become a convenient and accessible event
              management platform that encourages participation,
              supports organizers, and creates opportunities
              for memorable experiences.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#173B2F] px-5 py-20 text-center text-white">
        <Sparkles
          size={35}
          className="mx-auto text-[#A6DDB8]"
        />

        <h2 className="mt-5 text-3xl font-black">
          Ready to Find Your Next Event?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70">
          Discover upcoming activities and be part of
          something exciting with ANO G?
        </p>

        <Link
          to="/events"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-[#173B2F] transition hover:bg-[#E1EEE2]"
        >
          Browse Events
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
