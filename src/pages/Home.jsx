
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Ticket,
  Users,
  Music2,
  Palette,
  GraduationCap,
  Dumbbell,
  Utensils,
  BriefcaseBusiness,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const CATEGORIES = [
  { name: "All", icon: Compass },
  { name: "Music", icon: Music2 },
  { name: "Arts", icon: Palette },
  { name: "Sports", icon: Dumbbell },
  { name: "Food", icon: Utensils },
  { name: "Education", icon: GraduationCap },
  { name: "Business", icon: BriefcaseBusiness },
  { name: "Community", icon: Users }
];

const dateOf = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateLabel = value =>
  dateOf(value)?.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) || "Date TBA";

const monthLabel = value =>
  dateOf(value)
    ?.toLocaleDateString("en-PH", { month: "short" })
    .toUpperCase() || "TBA";

const dayLabel = value => dateOf(value)?.getDate() || "—";

const priceLabel = event =>
  event.isFree
    ? "FREE"
    : `₱${Number(event.ticketPrice || 0).toLocaleString("en-PH")}`;

const eventLocation = event =>
  event.venue || event.location || "Venue to be announced";

function Poster({ event, className = "", shade = false }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [event?._id, event?.image]);

  return (
    <div className={`relative overflow-hidden bg-[#234A38] ${className}`}>
      {event?.image && !failed ? (
        <img
          src={event.image}
          alt={event.title || "Event poster"}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_70%_30%,#4D906B_0%,#204C39_50%,#102C23_100%)]">
          <Sparkles className="text-[#B4E3C2]" size={48} />
          <span className="mt-4 text-[10px] font-bold tracking-[.3em] text-white/50">
            ANO G? / LIVE
          </span>
        </div>
      )}

      {shade && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091B15]/95 via-[#091B15]/30 to-transparent" />
      )}
    </div>
  );
}

function GlassSkeleton({ featured = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border border-white/20 bg-white/10 backdrop-blur-xl ${
        featured ? "h-[430px] sm:h-[560px]" : "h-[365px]"
      }`}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 via-white/15 to-white/5" />

      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/25" />
        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/25" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-white/20" />
      </div>
    </div>
  );
}

function EventTile({ event, index }) {
  return (
    <Link
      to={`/events/${event._id}`}
      className="group block min-w-0 overflow-hidden rounded-[22px] border border-[#E3E9E0] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(18,48,35,.12)]"
    >
      <div className="relative h-52 overflow-hidden sm:h-56">
        <Poster event={event} className="h-full w-full" />

        <span className="absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-2 text-center shadow-sm backdrop-blur">
          <span className="block text-[10px] font-black uppercase text-[#397B53]">
            {monthLabel(event.startDate)}
          </span>
          <span className="block text-xl font-black leading-none text-[#153C2B]">
            {dayLabel(event.startDate)}
          </span>
        </span>

        <span className="absolute bottom-4 right-4 rounded-full bg-[#143B2B] px-3 py-1.5 text-[11px] font-extrabold text-white">
          {priceLabel(event)}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-extrabold uppercase tracking-[.15em] text-[#46845D]">
            {event.category || "Experience"}
          </span>

          <span className="text-[10px] font-bold text-[#A4B0A3]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 min-h-[56px] text-xl font-black leading-7 tracking-tight text-[#173B2F]">
          {event.title}
        </h3>

        <p className="mt-3 flex items-center gap-2 truncate text-xs text-[#7D8F80]">
          <MapPin size={14} className="shrink-0" />
          {eventLocation(event)}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-[#E8EEE6] pt-4">
          <span className="text-xs font-bold text-[#173B2F]">
            {dateLabel(event.startDate)}
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3E9] text-[#245D3C] transition group-hover:bg-[#173B2F] group-hover:text-white">
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [retry, setRetry] = useState(0);

  const role =
    user?.role === "user"
      ? "attendee"
      : user?.role || "attendee";

  useEffect(() => {
    const controller = new AbortController();

    const loadEvents = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/events/public`, {
          signal: controller.signal
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Unable to load events.");
        }

        setEvents(
          Array.isArray(data)
            ? data
            : Array.isArray(data.events)
              ? data.events
              : []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load events.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => controller.abort();
  }, [retry]);

  const upcoming = useMemo(() => {
    return events
      .filter(event => {
        const date = dateOf(event.startDate);

        return (
          event.status === "published" &&
          !event.isDeleted &&
          date &&
          date.getTime() >= Date.now()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() -
          new Date(b.startDate).getTime()
      );
  }, [events]);

  const featured = upcoming[0] || null;

  const filtered = useMemo(() => {
    if (category === "All") return upcoming;

    return upcoming.filter(event =>
      String(event.category || "")
        .toLowerCase()
        .includes(category.toLowerCase())
    );
  }, [upcoming, category]);

  const pages = Math.max(1, Math.ceil(filtered.length / 3));
  const visible = filtered.slice(page * 3, page * 3 + 3);

  const handleSearch = event => {
    event.preventDefault();

    navigate(
      query.trim()
        ? `/events?search=${encodeURIComponent(query.trim())}`
        : "/events"
    );
  };

  const organizerPath =
    role === "organizer"
      ? "/organizer/events/create"
      : role === "admin"
        ? "/admin/events"
        : user
          ? "/apply-organizer"
          : "/login";

  const organizerLabel =
    role === "organizer"
      ? "Create an Event"
      : role === "admin"
        ? "Manage Events"
        : user
          ? "Apply as Organizer"
          : "Get Started";

  return (
    <div className="min-h-screen bg-[#F5F5EF] text-[#153A2B]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#102E23] text-white">
        <div className="pointer-events-none absolute -right-40 top-0 h-[650px] w-[650px] rounded-full bg-[#2C6C4A]/25 blur-[100px]" />

        <div className="relative mx-auto max-w-[1320px] px-5 pb-16 pt-10 sm:px-8 lg:pb-24 lg:pt-16">
          <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.25em] text-[#9CD2AC]">
              <span className="h-2 w-2 rounded-full bg-[#91D5A8]" />
              THE CITY IS CALLING
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-white/35">
              Discover / Connect / Experience
            </span>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-9 bg-[#8AD6A1]" />
                <span className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9CD2AC]">
                  Your event discovery space
                </span>
              </div>

              <h1 className="text-[clamp(4rem,8.5vw,8.5rem)] font-black leading-[.86] tracking-[-.09em]">
                GO
                <br />
                <span className="text-[#A8D8B2]">WHERE</span>
                <br />
                IT HAPPENS<span className="text-[#9CD2AC]">.</span>
              </h1>

              <p className="mt-8 max-w-md text-sm leading-8 text-white/60 sm:text-base">
                The best moments don't happen on your feed. Find concerts,
                creative spaces, meetups, and experiences worth showing up for.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-9 flex max-w-lg items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-xl"
              >
                <Search
                  size={19}
                  className="ml-3 shrink-0 text-[#A6D9B6]"
                />

                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="What are you in the mood for?"
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/45"
                />

                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-[#B9E7BC] px-4 py-3 text-xs font-black text-[#123525] transition hover:bg-white"
                >
                  Find it
                  <ArrowRight size={15} />
                </button>
              </form>

              <div className="mt-7 flex flex-wrap items-center gap-5">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 text-xs font-black text-[#B8E6C0] hover:text-white"
                >
                  Explore all events
                  <ArrowUpRight size={16} />
                </Link>

                <span className="h-4 w-px bg-white/20" />

                <span className="text-xs text-white/40">
                  Made for people who show up.
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-3 -top-3 z-10 hidden rounded-full border border-white/30 bg-[#173B2F]/80 px-5 py-3 text-[10px] font-black uppercase tracking-[.2em] text-[#B9E7BC] backdrop-blur-xl sm:block">
                THE NEXT BIG THING ↗
              </div>

              {loading ? (
                <GlassSkeleton featured />
              ) : featured ? (
                <Link
                  to={`/events/${featured._id}`}
                  className="group relative block h-[430px] overflow-hidden rounded-[26px] border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,.3)] sm:h-[560px]"
                >
                  <Poster
                    event={featured}
                    className="absolute inset-0"
                    shade
                  />

                  <div className="absolute left-6 top-6 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[.15em] backdrop-blur-xl">
                    Featured Event
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-10">
                    <span className="text-[11px] font-black uppercase tracking-[.2em] text-[#A8E6BB]">
                      {featured.category || "Upcoming Experience"}
                    </span>

                    <h2 className="mt-3 max-w-lg text-3xl font-black leading-tight tracking-[-.05em] sm:text-5xl">
                      {featured.title}
                    </h2>

                    <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/75">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} />
                        {dateLabel(featured.startDate)}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <MapPin size={15} />
                        {eventLocation(featured)}
                      </span>
                    </div>

                    <div className="mt-7 flex items-center justify-between border-t border-white/25 pt-5">
                      <span className="text-sm font-black">
                        {priceLabel(featured)}
                      </span>

                      <span className="inline-flex items-center gap-2 text-xs font-black">
                        See the experience
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex h-[430px] flex-col justify-between overflow-hidden rounded-[26px] border border-white/15 bg-[radial-gradient(circle_at_80%_20%,#4A8560,#173B2F_60%,#102E23)] p-8 sm:h-[560px]">
                  <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#B9E7BC]">
                    ANO G? / EVENT DISCOVERY
                  </span>

                  <div>
                    <Sparkles
                      size={44}
                      className="text-[#B9E7BC]"
                    />

                    <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                      Something good
                      <br />
                      is coming.
                    </h2>

                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
                      New events will appear here when organizers publish them.
                    </p>

                    <Link
                      to="/events"
                      className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#B9E7BC] px-5 py-3 text-xs font-black text-[#123525]"
                    >
                      Explore Events
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* EVENT LINEUP */}
      <section className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.23em] text-[#4B9162]">
              THE UPCOMING LINEUP / 01
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-.06em] sm:text-5xl">
              Make some <span className="text-[#559C6B]">plans.</span>
            </h2>

            <p className="mt-3 text-sm text-[#7B8B7D]">
              The next experiences worth adding to your calendar.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-full border border-[#C9D9C9] px-5 py-3 text-xs font-black transition hover:bg-[#E8F0E5]"
          >
            All Events
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-9 flex flex-wrap gap-2">
          {CATEGORIES.map(item => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.name}
                onClick={() => {
                  setCategory(item.name);
                  setPage(0);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${
                  category === item.name
                    ? "border-[#173B2F] bg-[#173B2F] text-white"
                    : "border-[#DDE7DA] bg-white text-[#617767] hover:border-[#9CBD9F]"
                }`}
              >
                <Icon size={14} />
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              <GlassSkeleton />
              <GlassSkeleton />
              <GlassSkeleton />
            </div>
          ) : error ? (
            <div className="rounded-[22px] border border-[#E7D7D0] bg-white p-12 text-center">
              <p className="font-bold text-[#8C4B3E]">{error}</p>

              <button
                type="button"
                onClick={() => setRetry(value => value + 1)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#173B2F] px-5 py-3 text-xs font-bold text-white"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {visible.map((event, index) => (
                <EventTile
                  key={event._id}
                  event={event}
                  index={page * 3 + index}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#C9D9C9] bg-white px-6 py-16 text-center">
              <CalendarDays
                size={35}
                className="mx-auto text-[#679575]"
              />

              <h3 className="mt-4 text-xl font-black">
                No upcoming events in this category
              </h3>

              <p className="mt-2 text-sm text-[#7B8B7D]">
                New published events will show up here.
              </p>

              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setPage(0);
                }}
                className="mt-5 text-xs font-black text-[#397B53] underline"
              >
                Show All Categories
              </button>
            </div>
          )}
        </div>

        {!loading && filtered.length > 3 && (
          <div className="mt-7 flex items-center justify-between">
            <span className="text-xs font-bold text-[#8A9B8B]">
              {page + 1} / {pages}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage(value => Math.max(0, value - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D7E1D4] bg-white disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                disabled={page >= pages - 1}
                onClick={() =>
                  setPage(value => Math.min(pages - 1, value + 1))
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D7E1D4] bg-white disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DISCOVER CATEGORIES */}
      <section className="bg-[#E9EFE5]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:py-24">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.23em] text-[#4B9162]">
              YOUR VIBE / 02
            </p>

            <h2 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-.065em] sm:text-5xl">
              Not sure
              <br />
              what's <span className="text-[#559C6B]">next?</span>
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#738876]">
              Start with what you love. Explore events across music,
              culture, food, learning, and more.
            </p>

            <Link
              to="/events"
              className="mt-7 inline-flex items-center gap-2 text-xs font-black text-[#27653F]"
            >
              Explore the Full Directory
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIES.filter(item => item.name !== "All")
              .slice(0, 6)
              .map((item, index) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={`/events?category=${encodeURIComponent(item.name)}`}
                    className={`group flex min-h-[150px] flex-col justify-between rounded-[20px] border p-5 transition hover:-translate-y-1 ${
                      index === 0
                        ? "border-[#173B2F] bg-[#173B2F] text-white"
                        : "border-[#DCE6D8] bg-white text-[#173B2F] hover:border-[#9DC6A6]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <Icon
                        size={24}
                        className={
                          index === 0
                            ? "text-[#B9E7BC]"
                            : "text-[#528D63]"
                        }
                      />

                      <ArrowUpRight
                        size={15}
                        className={
                          index === 0
                            ? "text-white/50"
                            : "text-[#A1B2A0]"
                        }
                      />
                    </div>

                    <span className="text-sm font-black">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* ORGANIZER SECTION */}
      <section className="overflow-hidden bg-[#173B2F] text-white">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[.25em] text-[#A3DBB4]">
              FOR THE PEOPLE WHO MAKE IT HAPPEN / 03
            </span>

            <h2 className="mt-6 text-5xl font-black leading-[.98] tracking-[-.07em] sm:text-6xl">
              THE NEXT
              <br />
              BIG THING
              <br />
              <span className="text-[#A7DDB5]">
                COULD BE YOURS.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-8 text-white/60">
              Have an idea worth gathering people for? Bring it to life
              with ANO G?'s event creation and management tools.
            </p>

            <Link
              to={organizerPath}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#B9E7BC] px-6 py-4 text-xs font-black text-[#153A2B] transition hover:bg-white"
            >
              {organizerLabel}
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                number: "01",
                title: "Build Your Event",
                description:
                  "Give your idea a name, date, place, and identity.",
                icon: CalendarDays
              },
              {
                number: "02",
                title: "Go Live",
                description:
                  "Publish your event for the community to discover.",
                icon: Sparkles
              },
              {
                number: "03",
                title: "Stay Organized",
                description:
                  "Manage event details from your organizer workspace.",
                icon: Users
              },
              {
                number: "04",
                title: "Make It Memorable",
                description:
                  "Create experiences people want to be part of.",
                icon: Ticket
              }
            ].map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className={`rounded-[22px] border border-white/10 p-6 backdrop-blur-xl ${
                    index === 0
                      ? "bg-white/15"
                      : "bg-white/[.055]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={22} className="text-[#B9E7BC]" />

                    <span className="text-[10px] font-bold text-white/30">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-10 text-lg font-black">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-white/50">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#F5F5EF]">
        <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-7 px-5 py-16 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#5C946C]">
              ANO G? / YOUR NEXT STORY
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-.06em] sm:text-4xl">
              Less scrolling.{" "}
              <span className="text-[#559C6B]">
                More living.
              </span>
            </h2>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-full bg-[#173B2F] px-6 py-4 text-xs font-black text-white transition hover:bg-[#285B40]"
          >
            Find Your Next Event
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}