import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";

const Home = () => {
  const modules = [
    {
      number: "01",
      title: "Registration",
      description:
        "Create and organize events while managing attendee registration.",
      icon: Ticket,
      path: "/registration",
    },
    {
      number: "02",
      title: "Security",
      description:
        "Validate credentials and check password strength with clear rules.",
      icon: ShieldCheck,
      path: "/password",
    },
    {
      number: "03",
      title: "Budget",
      description:
        "Plan event expenses and calculate costs using tiered event rates.",
      icon: Wallet,
      path: "/budget",
    },
    {
      number: "04",
      title: "Attendance",
      description:
        "Track arrivals and determine attendee status during your event.",
      icon: Users,
      path: "/attendance",
    },
  ];

  return (
    <div className="bg-[#F2F5EF] text-[#07140F]">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-[#07140F]/10">

        {/* Large Background Typography */}
        <div className="pointer-events-none absolute -left-[3vw] top-[9vh] select-none text-[30vw] font-black uppercase leading-[0.68] tracking-[-0.12em] text-[#0D3B2E]/[0.045]">
          ANO
          <br />
          G
        </div>

        {/* Technical Lines */}
        <div className="pointer-events-none absolute left-[8vw] top-0 hidden h-full w-px bg-[#07140F]/[0.07] lg:block" />

        <div className="pointer-events-none absolute left-0 right-0 top-[43%] h-px bg-[#07140F]/[0.07]" />

        <div className="relative mx-auto max-w-[1600px] px-5 pb-20 pt-8 sm:px-8 md:px-[7vw] md:pt-12 lg:px-[8vw] lg:pb-28">

          {/* Top Metadata */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#0D3B2E]" />

              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#07140F]/50">
                Ano G
              </p>
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#07140F]/35">
              Event System / 01
            </p>
          </div>

          {/* Main Hero */}
          <div className="mt-16 grid items-end gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-20">

            {/* Hero Text */}
            <div>

              <p className="mb-6 text-[10px] font-black uppercase tracking-[0.35em] text-[#07140F]/40">
                Modern Event Management
              </p>

              <h1 className="max-w-5xl text-[clamp(4.5rem,11vw,11rem)] font-black uppercase leading-[0.73] tracking-[-0.095em]">
                Plan
                <br />
                The
                <br />
                Event.
              </h1>

              <div className="mt-10 flex max-w-xl items-start gap-5">

                <span className="mt-2 h-px w-12 shrink-0 bg-[#0D3B2E]" />

                <p className="text-sm font-medium leading-7 text-[#07140F]/55 md:text-base">
                  Ano G is a modern event management system designed to
                  bring registration, security, budgeting, and attendance
                  into one organized workspace.
                </p>

              </div>

              {/* CTA */}
              <div className="mt-10 flex flex-wrap items-center gap-4">

                <Link
                  to="/registration"
                  className="group inline-flex items-center gap-3 bg-[#0D3B2E] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#12513E]"
                >
                  Start an Event

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 border border-[#07140F]/15 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#07140F] transition-all duration-300 hover:border-[#0D3B2E] hover:bg-white"
                >
                  Sign In
                </Link>

              </div>
            </div>

            {/* Hero Event Preview */}
            <div className="relative">

              {/* Corner Marks */}
              <div className="absolute -right-3 -top-3 h-10 w-10 border-r border-t border-[#0D3B2E]/40" />

              <div className="absolute -bottom-3 -left-3 h-10 w-10 border-b border-l border-[#0D3B2E]/40" />

              <div className="relative overflow-hidden bg-[#0D3B2E] text-white">

                {/* Preview Header */}
                <div className="border-b border-white/10 px-6 py-5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <CalendarDays
                        size={18}
                        className="text-[#52B788]"
                      />

                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">
                        Upcoming Event
                      </p>

                    </div>

                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">
                      01—26
                    </p>

                  </div>
                </div>

                {/* Event */}
                <div className="px-6 pb-8 pt-8">

                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#52B788]">
                    Ano G / Event Preview
                  </p>

                  <h2 className="mt-5 text-4xl font-black uppercase leading-[0.85] tracking-[-0.06em] sm:text-5xl">
                    Creative
                    <br />
                    Summit
                  </h2>

                  <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">

                    <CalendarDays
                      size={15}
                      className="text-white/40"
                    />

                    <p className="text-xs text-white/55">
                      September 24, 2026
                    </p>

                  </div>

                  {/* Stats */}
                  <div className="mt-7 grid grid-cols-3 border-t border-white/10">

                    <div className="border-r border-white/10 py-5">
                      <p className="text-2xl font-black">
                        248
                      </p>

                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/35">
                        Guests
                      </p>
                    </div>

                    <div className="border-r border-white/10 px-4 py-5">
                      <p className="text-2xl font-black">
                        ₱85K
                      </p>

                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/35">
                        Budget
                      </p>
                    </div>

                    <div className="px-4 py-5">
                      <p className="text-2xl font-black">
                        78%
                      </p>

                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/35">
                        Ready
                      </p>
                    </div>

                  </div>

                  {/* Progress */}
                  <div className="mt-5">

                    <div className="flex justify-between">

                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
                        Preparation
                      </p>

                      <p className="text-[9px] font-black text-[#52B788]">
                        78%
                      </p>

                    </div>

                    <div className="mt-3 h-1 bg-white/10">

                      <div className="h-full w-[78%] bg-[#52B788]" />

                    </div>

                  </div>

                  {/* Activity */}
                  <div className="mt-7 border-t border-white/10 pt-6">

                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35">
                      Latest Activity
                    </p>

                    <div className="mt-4 space-y-4">

                      <div className="flex items-center gap-3">

                        <CheckCircle2
                          size={15}
                          className="text-[#52B788]"
                        />

                        <p className="text-xs text-white/55">
                          Registration confirmed
                        </p>

                        <span className="ml-auto text-[9px] text-white/20">
                          02m
                        </span>

                      </div>

                      <div className="flex items-center gap-3">

                        <Ticket
                          size={15}
                          className="text-[#52B788]"
                        />

                        <p className="text-xs text-white/55">
                          New attendee registered
                        </p>

                        <span className="ml-auto text-[9px] text-white/20">
                          08m
                        </span>

                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO / STATEMENT
      ========================================================= */}
      <section className="border-b border-[#07140F]/10 bg-white">

        <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 md:px-[7vw] md:py-28 lg:px-[8vw] lg:py-36">

          <div className="grid gap-12 lg:grid-cols-[0.25fr_1fr] lg:gap-20">

            {/* Number */}
            <div className="flex items-start gap-4">

              <span className="text-[11px] font-black tracking-[0.3em] text-[#07140F]/35">
                01
              </span>

              <div className="mt-1 h-px w-10 bg-[#07140F]/30" />

            </div>

            {/* Statement */}
            <div>

              <p className="max-w-6xl text-[clamp(2.4rem,6vw,6.5rem)] font-black uppercase leading-[0.86] tracking-[-0.07em]">

                Less chaos.
                <br />

                More control.
                <br />

                <span className="text-[#0D3B2E]/20">
                  Better events.
                </span>

              </p>

              <div className="mt-12 grid max-w-4xl gap-8 md:grid-cols-2">

                <p className="text-sm leading-7 text-[#07140F]/55 md:text-base">
                  Ano G brings the essential parts of event management
                  together. Instead of moving between different tools,
                  manage your event workflow from one focused system.
                </p>

                <p className="text-sm leading-7 text-[#07140F]/55 md:text-base">
                  From the first registration to the final attendee check,
                  every module is designed to keep your event organized,
                  understandable, and ready.
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          MODULES
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#07140F] text-white">

        {/* Giant Background Number */}
        <div className="pointer-events-none absolute -right-[3vw] top-[-5vw] select-none text-[28vw] font-black leading-none tracking-[-0.12em] text-white/[0.035]">
          02
        </div>

        <div className="relative mx-auto max-w-[1600px] px-5 py-20 sm:px-8 md:px-[7vw] md:py-28 lg:px-[8vw] lg:py-36">

          <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">

            {/* Left Metadata */}
            <div>

              <div className="mb-6 flex items-center gap-3">

                <span className="h-px w-10 bg-[#52B788]" />

                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                  System Modules
                </p>

              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
                Ano G / 02
              </p>

            </div>

            {/* Right Content */}
            <div>

              <h2 className="max-w-5xl text-[clamp(3rem,7vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.08em]">

                Everything
                <br />

                <span className="text-white/20">
                  in one place.
                </span>

              </h2>

              <p className="mt-10 max-w-2xl text-sm leading-7 text-white/45 md:text-base md:leading-8">
                Four focused modules cover the core workflow of your
                event management system — from registration and
                security to budget planning and attendance.
              </p>

              {/* Module List */}
              <div className="mt-14 border-t border-white/10">

                {modules.map((module) => {
                  const Icon = module.icon;

                  return (
                    <Link
                      key={module.path}
                      to={module.path}
                      className="group grid grid-cols-[55px_1fr_auto] items-center gap-5 border-b border-white/10 py-7 transition-all duration-300 hover:bg-white/[0.025] md:grid-cols-[70px_1fr_1fr_auto]"
                    >

                      {/* Number */}
                      <span className="text-[10px] font-black tracking-[0.25em] text-white/25">
                        {module.number}
                      </span>

                      {/* Icon + Title */}
                      <div className="flex items-center gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 transition-colors duration-300 group-hover:border-[#52B788]/50">

                          <Icon
                            size={17}
                            className="text-[#52B788]"
                          />

                        </div>

                        <h3 className="text-lg font-black uppercase tracking-[-0.03em] md:text-xl">
                          {module.title}
                        </h3>

                      </div>

                      {/* Description */}
                      <p className="hidden text-xs leading-6 text-white/30 md:block">
                        {module.description}
                      </p>

                      {/* Arrow */}
                      <ArrowUpRight
                        size={19}
                        className="text-white/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#52B788]"
                      />

                    </Link>
                  );
                })}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EVENT WORKFLOW
      ========================================================= */}
      <section className="border-b border-[#07140F]/10 bg-[#F2F5EF]">

        <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 md:px-[7vw] md:py-28 lg:px-[8vw] lg:py-36">

          <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">

            {/* Left */}
            <div>

              <div className="mb-6 flex items-center gap-3">

                <span className="h-px w-10 bg-[#0D3B2E]" />

                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#07140F]/40">
                  Workflow
                </p>

              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#07140F]/25">
                Ano G / 03
              </p>

            </div>

            {/* Right */}
            <div>

              <h2 className="max-w-5xl text-[clamp(3rem,7vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.08em]">

                From idea
                <br />

                <span className="text-[#0D3B2E]/20">
                  to event day.
                </span>

              </h2>

              <div className="mt-14 grid border-t border-[#07140F]/10 md:grid-cols-3">

                {/* Step 1 */}
                <div className="border-b border-[#07140F]/10 py-8 md:border-b-0 md:border-r md:px-7 md:first:pl-0">

                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#07140F]/30">
                    01 / Start
                  </p>

                  <h3 className="mt-5 text-xl font-black uppercase tracking-[-0.03em]">
                    Create
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-[#07140F]/45">
                    Define your event and establish the basic
                    information needed to get started.
                  </p>

                </div>

                {/* Step 2 */}
                <div className="border-b border-[#07140F]/10 py-8 md:border-b-0 md:border-r md:px-7">

                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#07140F]/30">
                    02 / Manage
                  </p>

                  <h3 className="mt-5 text-xl font-black uppercase tracking-[-0.03em]">
                    Organize
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-[#07140F]/45">
                    Handle registrations, security checks, budgets,
                    and attendee information.
                  </p>

                </div>

                {/* Step 3 */}
                <div className="py-8 md:px-7 md:pr-0">

                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#07140F]/30">
                    03 / Deliver
                  </p>

                  <h3 className="mt-5 text-xl font-black uppercase tracking-[-0.03em]">
                    Execute
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-[#07140F]/45">
                    Keep track of attendance and make sure everything
                    is ready for event day.
                  </p>

                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="border-b border-white/10 bg-[#0D3B2E] text-white">

        <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 md:px-[7vw] md:py-28 lg:px-[8vw] lg:py-36">

          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="mb-6 text-[9px] font-black uppercase tracking-[0.4em] text-[#52B788]">
                The Ano G Direction
              </p>

              <h2 className="max-w-5xl text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-[0.8] tracking-[-0.085em]">

                Make it
                <br />

                organized.
                <br />

                <span className="text-white/20">
                  Make it happen.
                </span>

              </h2>

            </div>

            <div className="max-w-xs md:pb-2">

              <p className="text-[10px] font-black uppercase leading-6 tracking-[0.22em] text-white/35">
                Ano G
                <br />
                Event Management System
                <br />
                Since 2026
              </p>

              <Link
                to="/registration"
                className="group mt-7 inline-flex items-center gap-3 border border-white/20 px-5 py-3 text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:border-[#52B788] hover:bg-[#52B788] hover:text-[#07140F]"
              >
                Start Managing

                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;