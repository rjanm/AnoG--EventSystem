
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  FilterX,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  Users,
  X
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const dateValue = value => {
  const time = new Date(value || "").getTime();
  return Number.isFinite(time) ? time : null;
};

const formatDate = (value, options = {}) => {
  const time = dateValue(value);
  if (time === null) return "To be announced";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(time);
};

const formatTime = value => {
  const time = dateValue(value);
  if (time === null) return "Time TBA";

  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit"
  }).format(time);
};

const getAvailability = event => {
  const capacity = Number(event.capacity);
  const registered = Math.max(0, Number(event.registeredCount) || 0);

  if (!Number.isFinite(capacity) || capacity <= 0) {
    return {
      remaining: null,
      capacity: null,
      registered,
      percentage: 0,
      full: false
    };
  }

  const remaining = Math.max(0, capacity - registered);

  return {
    remaining,
    capacity,
    registered,
    percentage: Math.min(100, (registered / capacity) * 100),
    full: remaining === 0
  };
};

const getEventState = event => {
  const availability = getAvailability(event);
  const end = dateValue(event.endDate || event.startDate);
  const deadline = dateValue(event.registrationDeadline);
  const now = Date.now();

  if (end !== null && end < now) {
    return { label: "Event ended", type: "ended" };
  }

  if (deadline !== null && deadline < now) {
    return { label: "Registration closed", type: "closed" };
  }

  if (availability.full) {
    return { label: "Fully booked", type: "full" };
  }

  return { label: "Registration open", type: "open" };
};

const getPrice = event =>
  event.isFree
    ? "Free admission"
    : `₱${Number(event.ticketPrice || 0).toLocaleString("en-PH")}`;

const getLocation = event =>
  [event.venue, event.location]
    .filter(Boolean)
    .join(" · ") || "Venue to be announced";

const GlassSkeleton = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-xl bg-white/40 ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[anoGShimmer_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
  </div>
);

const FeaturedSkeleton = () => (
  <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/35 p-2 shadow-[0_18px_70px_rgba(23,59,47,0.08)] backdrop-blur-2xl">
    <div className="grid min-h-[360px] overflow-hidden rounded-[22px] bg-white/25 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-between p-7 sm:p-10">
        <div className="space-y-5">
          <GlassSkeleton className="h-7 w-32" />
          <GlassSkeleton className="h-12 w-4/5" />
          <GlassSkeleton className="h-12 w-3/5" />
          <GlassSkeleton className="h-4 w-full" />
          <GlassSkeleton className="h-4 w-3/4" />
        </div>

        <div className="mt-10 flex gap-3">
          <GlassSkeleton className="h-12 w-40" />
          <GlassSkeleton className="h-12 w-24" />
        </div>
      </div>

      <GlassSkeleton className="m-3 min-h-[280px] rounded-[18px]" />
    </div>
  </div>
);

const EventSkeleton = ({ index }) => (
  <div
    className="overflow-hidden rounded-[24px] border border-white/80 bg-white/40 p-2 shadow-[0_12px_50px_rgba(23,59,47,0.05)] backdrop-blur-2xl"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <GlassSkeleton className="h-52 rounded-[18px]" />

    <div className="space-y-4 px-4 pb-5 pt-5">
      <GlassSkeleton className="h-5 w-28" />
      <GlassSkeleton className="h-7 w-4/5" />
      <GlassSkeleton className="h-4 w-full" />
      <GlassSkeleton className="h-4 w-2/3" />

      <div className="space-y-3 pt-4">
        <GlassSkeleton className="h-4 w-3/4" />
        <GlassSkeleton className="h-4 w-4/5" />
      </div>

      <GlassSkeleton className="mt-5 h-12 w-full" />
    </div>
  </div>
);

const EventArtwork = ({ event, className = "", featured = false }) => {
  if (event.image) {
    return (
      <img
        src={event.image}
        alt={event.title || "Event poster"}
        loading={featured ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#153E30] ${className}`}>
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5" />
      <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full border-[35px] border-[#6EC49A]/10" />
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-white/10" />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
          <CalendarDays size={28} className="text-[#B6E7C6]" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-[0.35em] text-[#C6E8CF]">
          ANO G? / EVENTS
        </span>
      </div>
    </div>
  );
};

const EventCard = ({ event, index }) => {
  const availability = getAvailability(event);
  const state = getEventState(event);
  const start = dateValue(event.startDate);
  const month = start
    ? formatDate(event.startDate, { month: "short" }).split(" ")[0]
    : "TBA";
  const day = start
    ? new Date(start).getDate()
    : "—";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#DFE7DD] bg-white p-2 shadow-[0_8px_32px_rgba(23,59,47,0.035)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#AFCDB7] hover:shadow-[0_20px_55px_rgba(23,59,47,0.12)]">
      <div className="relative h-[220px] overflow-hidden rounded-[18px] bg-[#E6EDE5]">
        <EventArtwork
          event={event}
          className="transition-transform duration-700 group-hover:scale-[1.06]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />

        <div className="absolute left-4 top-4 flex h-[66px] w-[59px] flex-col items-center justify-center rounded-xl border border-white/70 bg-white/95 shadow-lg backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#43835D]">
            {month}
          </span>
          <span className="text-[27px] font-black leading-tight text-[#173B2F]">
            {day}
          </span>
        </div>

        <span className="absolute right-4 top-4 max-w-[55%] truncate rounded-full border border-white/40 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[#173B2F] shadow-sm backdrop-blur-lg">
          {event.category || "General"}
        </span>

        <div className="absolute bottom-4 left-4">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-bold backdrop-blur-lg ${
            state.type === "open"
              ? "bg-[#DDF5E5]/95 text-[#1C6941]"
              : "bg-white/95 text-[#6B5845]"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              state.type === "open"
                ? "bg-[#36A66C]"
                : "bg-amber-500"
            }`} />
            {state.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.17em] text-[#44805B]">
            EVENT / {String(index + 1).padStart(2, "0")}
          </span>

          <span className="text-sm font-black text-[#173B2F]">
            {getPrice(event)}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[58px] text-[21px] font-black leading-[1.35] tracking-tight text-[#102B20]">
          {event.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[44px] text-[13px] leading-[22px] text-[#718176]">
          {event.description ||
            "Explore the event details, schedule, and venue information."}
        </p>

        <div className="mt-5 space-y-3 border-t border-[#EAF0E8] pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F5EE] text-[#397552]">
              <Clock3 size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#97A69A]">
                Date & Time
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-[#244534]">
                {formatDate(event.startDate)} · {formatTime(event.startDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F5EE] text-[#397552]">
              <MapPin size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#97A69A]">
                Location
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-[#244534]">
                {getLocation(event)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-[#F5F8F3] p-3">
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-[#627768]">
              <Users size={14} />
              Availability
            </span>

            <span className="font-black text-[#214A33]">
              {availability.remaining === null
                ? "Contact organizer"
                : `${availability.remaining} slots left`}
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#DEE8DE]">
            <div
              className="h-full rounded-full bg-[#4DAE7C] transition-all duration-500"
              style={{ width: `${availability.percentage}%` }}
            />
          </div>
        </div>

        <Link
          to={`/events/${event._id}`}
          className="mt-4 flex items-center justify-between rounded-xl bg-[#173B2F] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#286043]"
        >
          Explore Event
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
};

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("soonest");

  const loadEvents = useCallback(async signal => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/events/public`, {
        signal
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load events.");
      }

      const items = Array.isArray(data.events)
        ? data.events
        : [];

      setEvents(
        items.filter(event =>
          event.status === "published" && !event.isDeleted
        )
      );
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load events.");
      setEvents([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadEvents(controller.signal);
    return () => controller.abort();
  }, [loadEvents]);

  const categories = useMemo(() => {
    return [...new Set(
      events.map(event => event.category).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = events.filter(event => {
      const content = [
        event.title,
        event.description,
        event.category,
        event.venue,
        event.location,
        event.organizer?.fullName,
        event.organizer?.username
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || content.includes(query);
      const matchesCategory =
        category === "all" || event.category === category;
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && event.isFree) ||
        (priceFilter === "paid" && !event.isFree);

      return matchesSearch && matchesCategory && matchesPrice;
    });

    result.sort((a, b) => {
      if (sortBy === "latest") {
        return (dateValue(b.createdAt) || 0) -
          (dateValue(a.createdAt) || 0);
      }

      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }

      const aDate = dateValue(a.startDate);
      const bDate = dateValue(b.startDate);

      if (aDate === null) return 1;
      if (bDate === null) return -1;

      return aDate - bDate;
    });

    return result;
  }, [events, search, category, priceFilter, sortBy]);

  const featuredEvent = useMemo(() => {
    const now = Date.now();

    return (
      [...events]
        .filter(event => {
          const end = dateValue(event.endDate || event.startDate);
          return end === null || end >= now;
        })
        .sort((a, b) =>
          (dateValue(a.startDate) || Infinity) -
          (dateValue(b.startDate) || Infinity)
        )[0] || null
    );
  }, [events]);

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    priceFilter !== "all" ||
    sortBy !== "soonest";

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setPriceFilter("all");
    setSortBy("soonest");
  };

  const upcomingCount = events.filter(event => {
    const end = dateValue(event.endDate || event.startDate);
    return end === null || end >= Date.now();
  }).length;

  return (
    <div className="min-h-screen overflow-hidden bg-[#F2F5EF] text-[#173B2F]">
      <style>{`
        @keyframes anoGShimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes anoGFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <section className="relative overflow-hidden border-b border-[#DDE8DB] bg-[#EDF3EB]">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[600px] w-[600px] rounded-full border-[90px] border-[#DDE9DC]/70" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[440px] w-[440px] rounded-full border-[60px] border-white/50" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 lg:pb-16 lg:pt-16">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-[#347B54]" />
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#347B54]">
                ANO G? / EVENT DISCOVERY
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#D6E5D5] bg-white/70 px-4 py-2 text-[11px] font-bold text-[#52745C] backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-[#52B788]" />
              Your event directory
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[#D4E4D1] bg-white/75 px-3 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-[#347B54]">
                <Sparkles size={15} />
                Explore · Connect · Experience
              </div>

              <h1 className="max-w-[590px] text-[clamp(3.5rem,6.7vw,6.5rem)] font-black leading-[0.91] tracking-[-0.075em] text-[#102D21]">
                FIND
                <br />
                YOUR NEXT
                <br />
                <span className="text-[#4B9870]">EVENT.</span>
              </h1>

              <p className="mt-7 max-w-md text-[15px] leading-8 text-[#687C6D]">
                Discover experiences worth showing up for.
                Explore upcoming events, find your community,
                and make every moment count.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#event-directory"
                  className="inline-flex items-center gap-3 rounded-xl bg-[#173B2F] px-6 py-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(23,59,47,0.14)] transition hover:-translate-y-0.5 hover:bg-[#286043]"
                >
                  Explore Events
                  <ArrowUpRight size={18} />
                </a>

                <div className="flex items-center gap-3 rounded-xl border border-[#D5E4D3] bg-white/70 px-5 py-3 backdrop-blur-lg">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E2F1E4] text-[#347B54]">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-lg font-black leading-none">
                      {loading ? "—" : upcomingCount}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-[#809083]">
                      Upcoming events
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-3 border-t border-[#D9E4D7] pt-5">
                <Compass size={18} className="text-[#4A9569]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#849789]">
                  Discover what is happening
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-5 rounded-[40px] bg-white/25 blur-2xl" />

              {loading ? (
                <FeaturedSkeleton />
              ) : featuredEvent ? (
                <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/60 p-2 shadow-[0_22px_70px_rgba(23,59,47,0.11)] backdrop-blur-2xl">
                  <div className="relative grid min-h-[385px] overflow-hidden rounded-[22px] bg-[#173B2F] lg:grid-cols-[1fr_0.9fr]">
                    <div className="relative z-10 flex flex-col justify-between p-7 text-white sm:p-9">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.17em] text-[#A7E5BD]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#63C58C]" />
                          Featured Event
                        </div>

                        <p className="mt-9 text-[10px] font-black uppercase tracking-[0.2em] text-[#87BCA0]">
                          {featuredEvent.category || "Upcoming experience"}
                        </p>

                        <h2 className="mt-3 line-clamp-3 text-3xl font-black leading-[1.08] tracking-[-0.045em] sm:text-4xl">
                          {featuredEvent.title}
                        </h2>

                        <p className="mt-4 line-clamp-2 text-[13px] leading-6 text-[#BCD2C4]">
                          {featuredEvent.description ||
                            "Discover everything you need to know about this event."}
                        </p>
                      </div>

                      <div className="mt-8">
                        <div className="mb-5 space-y-3 text-xs text-[#D0E3D5]">
                          <div className="flex items-center gap-2">
                            <CalendarDays size={15} className="text-[#8DD4A6]" />
                            {formatDate(featuredEvent.startDate)}
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-[#8DD4A6]" />
                            <span className="line-clamp-1">
                              {getLocation(featuredEvent)}
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/events/${featuredEvent._id}`}
                          className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-xs font-black text-[#173B2F] transition hover:bg-[#DCF3E3]"
                        >
                          View Featured Event
                          <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </div>

                    <div className="relative min-h-[250px] overflow-hidden lg:min-h-full">
                      <EventArtwork event={featuredEvent} featured />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#173B2F]/40 to-transparent lg:bg-gradient-to-r lg:from-[#173B2F]/25 lg:to-transparent" />

                      <div className="absolute bottom-5 right-5 rounded-xl border border-white/30 bg-white/85 px-4 py-3 text-[#173B2F] shadow-lg backdrop-blur-xl">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6B9178]">
                          Admission
                        </p>
                        <p className="mt-1 text-lg font-black">
                          {getPrice(featuredEvent)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/50 p-2 shadow-[0_22px_70px_rgba(23,59,47,0.08)] backdrop-blur-2xl">
                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[22px] bg-[#173B2F] p-10 text-center text-white">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                      <CalendarDays size={36} className="text-[#A7DDBA]" />
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8EC9A4]">
                      ANO G? / COMING SOON
                    </p>

                    <h2 className="mt-4 text-3xl font-black tracking-tight">
                      Something's coming.
                    </h2>

                    <p className="mt-4 max-w-xs text-sm leading-7 text-[#B6D0BF]">
                      New events will be featured here as soon as
                      organizers publish them.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main
        id="event-directory"
        className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-24 pt-12 sm:px-8 lg:pt-16"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#347B54]" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#347B54]">
                THE EVENT DIRECTORY
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-[-0.05em] text-[#102D21] sm:text-4xl">
              Explore Events<span className="text-[#58A877]">.</span>
            </h2>

            <p className="mt-2 text-sm text-[#788A7C]">
              Browse events curated by organizers across the platform.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#DCE6DA] bg-white px-4 py-3 text-xs font-semibold text-[#56715F]">
            <Ticket size={16} className="text-[#3C8D5E]" />
            {loading
              ? "Loading event directory"
              : `${filteredEvents.length} event${filteredEvents.length === 1 ? "" : "s"} found`}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[22px] border border-[#DDE7DB] bg-white p-4 shadow-[0_8px_35px_rgba(23,59,47,0.035)] sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={17} className="text-[#347B54]" />
              <span className="text-xs font-black uppercase tracking-[0.13em]">
                Refine your search
              </span>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-[#347B54] hover:underline"
              >
                <FilterX size={15} />
                Reset
              </button>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78907D]"
              />

              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search event names, locations, keywords..."
                className="h-12 w-full rounded-xl border border-[#E2EAE0] bg-[#F6F9F5] pl-11 pr-4 text-[13px] text-[#173B2F] outline-none transition focus:border-[#64AC7D] focus:bg-white"
              />
            </div>

            <div className="relative">
              <select
                value={priceFilter}
                onChange={event => setPriceFilter(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-[#E2EAE0] bg-[#F6F9F5] px-4 pr-10 text-[13px] font-semibold text-[#345542] outline-none focus:border-[#64AC7D]"
              >
                <option value="all">All admission types</option>
                <option value="free">Free events</option>
                <option value="paid">Paid events</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#718B77]"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-[#E2EAE0] bg-[#F6F9F5] px-4 pr-10 text-[13px] font-semibold text-[#345542] outline-none focus:border-[#64AC7D]"
              >
                <option value="soonest">Soonest date</option>
                <option value="latest">Recently added</option>
                <option value="title">Event name A–Z</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#718B77]"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#EDF1EA] pt-5">
            <span className="mr-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#93A297]">
              Categories
            </span>

            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`rounded-full border px-4 py-2 text-[11px] font-bold transition ${
                category === "all"
                  ? "border-[#173B2F] bg-[#173B2F] text-white"
                  : "border-[#DDE7DC] bg-[#F8FAF7] text-[#5C7562] hover:border-[#7CB28A]"
              }`}
            >
              All Events
            </button>

            {categories.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-[11px] font-bold transition ${
                  category === item
                    ? "border-[#173B2F] bg-[#173B2F] text-white"
                    : "border-[#DDE7DC] bg-[#F8FAF7] text-[#5C7562] hover:border-[#7CB28A]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 mt-9 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2EFE3] text-[#347B54]">
              <Compass size={20} />
            </span>

            <div>
              <h3 className="text-lg font-black tracking-tight">
                Available Experiences
              </h3>

              <p className="text-xs text-[#91A094]">
                Find the right event for you
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadEvents()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#568467] transition hover:bg-[#E6F0E5] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Events
          </button>
        </div>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadEvents()}
              className="rounded-lg bg-white px-4 py-2 text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/30 via-[#DCECDF]/30 to-white/30 blur-2xl" />

            <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <EventSkeleton key={index} index={index} />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-xs font-semibold text-[#7C9582]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#52B788]" />
              Preparing your event directory...
            </div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[26px] border border-[#DDE7DB] bg-white px-6 py-20 text-center shadow-sm">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[35px] border-[#F1F6F0]" />

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EAF3E9] text-[#397A52]">
              <CalendarDays size={34} />
            </div>

            <h3 className="relative mt-6 text-2xl font-black tracking-tight">
              {hasFilters
                ? "No matching events."
                : "The stage is getting ready."}
            </h3>

            <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-[#788B7C]">
              {hasFilters
                ? "We couldn't find an event matching your filters. Try a different search or explore all categories."
                : "There are no published events available yet. Once organizers publish their events, you'll discover them right here."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#286043]"
              >
                <X size={15} />
                Clear All Filters
              </button>
            )}
          </div>
        )}

        <div className="mt-14 flex flex-col gap-5 rounded-[24px] bg-[#173B2F] px-7 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#91CCA5]">
              ANO G? EVENT MANAGEMENT
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-tight">
              Every great event starts somewhere.
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#B6D0BF]">
              Discover upcoming experiences and connect with
              communities through events that matter.
            </p>
          </div>

          <a
            href="#event-directory"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/20"
          >
            Back to Events
            <ArrowRight size={16} />
          </a>
        </div>
      </main>
    </div>
  );
};

export default BrowseEvents;  