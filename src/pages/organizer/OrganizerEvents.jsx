
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FilePenLine,
  FileText,
  Filter,
  ImageIcon,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Ticket,
  Trash2,
  Users,
  X
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () => sessionStorage.getItem("anoGToken") || "";

const formatDate = value => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const formatShortDate = value => {
  if (!value) return { month: "TBA", day: "—" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { month: "TBA", day: "—" };
  }

  return {
    month: date.toLocaleString("en-PH", { month: "short" }),
    day: date.getDate()
  };
};

const formatPrice = event =>
  event.isFree
    ? "FREE"
    : `₱${Number(event.ticketPrice || 0).toLocaleString("en-PH")}`;

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    classes: "bg-[#F0F2EF] text-[#66776A] border-[#DFE5DE]",
    dot: "bg-[#91A094]"
  },
  published: {
    label: "Published",
    classes: "bg-[#E8F5E9] text-[#287747] border-[#CFE9D2]",
    dot: "bg-[#38A66A]"
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-[#FFF0EE] text-[#C34F46] border-[#F5D6D1]",
    dot: "bg-[#E46B61]"
  },
  completed: {
    label: "Completed",
    classes: "bg-[#EAF1FF] text-[#4969A8] border-[#D4E2F8]",
    dot: "bg-[#648BCA]"
  }
};

const FILTERS = [
  { value: "all", label: "All Events" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function EventPoster({ event, className = "" }) {
  const [failed, setFailed] = useState(false);
  const date = formatShortDate(event.startDate);

  return (
    <div
      className={`relative overflow-hidden bg-[#173B2F] ${className}`}
    >
      {event.image && !failed ? (
        <img
          src={event.image}
          alt={event.title}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top_right,#347B54,#173B2F_65%)] text-white">
          <CalendarDays size={35} className="text-[#B2DFC0]" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4E8D7]">
            ANO G? EVENT
          </span>
        </div>
      )}

      <div className="absolute left-3 top-3 rounded-xl border border-white/60 bg-white/95 px-3 py-2 text-center shadow-sm backdrop-blur-lg">
        <p className="text-[9px] font-black uppercase tracking-wide text-[#43865C]">
          {date.month}
        </p>
        <p className="text-xl font-black leading-tight text-[#173B2F]">
          {date.day}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, dark = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] border p-5 transition hover:-translate-y-0.5 ${
        dark
          ? "border-[#173B2F] bg-[#173B2F] text-white"
          : "border-[#DEE8DC] bg-white text-[#173B2F]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-[11px] font-bold ${
            dark ? "text-[#B8D3C0]" : "text-[#849689]"
          }`}
        >
          {label}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            dark
              ? "bg-white/10 text-[#B0E3BD]"
              : "bg-[#EDF5EB] text-[#43865C]"
          }`}
        >
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight">{value}</p>

      {dark && (
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full border-[25px] border-white/5" />
      )}
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[22px] border border-white/80 bg-white/50 shadow-sm backdrop-blur-xl"
        >
          <div className="h-44 animate-pulse bg-gradient-to-r from-[#E3EBE0]/80 via-white/90 to-[#E3EBE0]/80 bg-[length:200%_100%]" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-[#E1E9DF]" />
            <div className="h-6 w-4/5 animate-pulse rounded-lg bg-[#E1E9DF]" />
            <div className="h-4 w-3/5 animate-pulse rounded-lg bg-[#E8EEE6]" />
            <div className="h-px bg-[#E7EDE5]" />
            <div className="flex gap-2">
              <div className="h-9 flex-1 animate-pulse rounded-lg bg-[#E1E9DF]" />
              <div className="h-9 w-12 animate-pulse rounded-lg bg-[#E1E9DF]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventActions({ event, onView, onAction, compact = false }) {
  const editable = ["draft", "published"].includes(event.status);
  const noRegistrations = Number(event.registeredCount || 0) === 0;

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDE8DB] bg-white px-3 py-2.5 text-xs font-bold text-[#345A41] transition hover:border-[#A8CCAE] hover:bg-[#F0F7EE]";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "justify-end" : ""}`}>
      <button
        type="button"
        onClick={() => onView(event)}
        className={buttonClass}
        title="View event details"
      >
        <Eye size={15} />
        {!compact && "Details"}
      </button>

      {editable && (
        <Link
          to={`/organizer/events/${event._id}/edit`}
          className={buttonClass}
          title="Edit event"
        >
          <FilePenLine size={15} />
          {!compact && "Edit"}
        </Link>
      )}

      {event.status === "draft" && (
        <button
          type="button"
          onClick={() => onAction(event, "publish")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#286043]"
          title="Publish event"
        >
          <Send size={14} />
          {!compact && "Publish"}
        </button>
      )}

      {event.status === "published" && (
        <>
          {noRegistrations && (
            <button
              type="button"
              onClick={() => onAction(event, "unpublish")}
              className={buttonClass}
              title="Unpublish event"
            >
              <RotateCcw size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onAction(event, "cancel")}
            className="inline-flex items-center justify-center rounded-xl border border-[#F1D9D4] bg-[#FFF7F5] px-3 py-2.5 text-[#C35A50] transition hover:bg-[#FFEBE7]"
            title="Cancel event"
          >
            <Ban size={15} />
          </button>
        </>
      )}

      {noRegistrations && (
        <button
          type="button"
          onClick={() => onAction(event, "delete")}
          className="inline-flex items-center justify-center rounded-xl border border-[#F1D9D4] bg-white px-3 py-2.5 text-[#C35A50] transition hover:bg-[#FFF0ED]"
          title="Move event to Trash"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

function EventCard({ event, onView, onAction }) {
  const registered = Number(event.registeredCount || 0);
  const capacity = Number(event.capacity || 0);
  const percent = capacity > 0
    ? Math.min(100, Math.max(0, (registered / capacity) * 100))
    : 0;

  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#DFE9DD] bg-white shadow-[0_8px_30px_rgba(23,59,47,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,59,47,0.1)]">
      <div className="relative">
        <EventPoster event={event} className="h-[190px] w-full" />

        <div className="absolute bottom-3 right-3 rounded-lg bg-[#173B2F]/90 px-3 py-2 text-[11px] font-black text-white backdrop-blur-lg">
          {formatPrice(event)}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="max-w-[60%] truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#43865C]">
            {event.category || "Event"}
          </span>
          <StatusBadge status={event.status} />
        </div>

        <h3 className="mt-4 line-clamp-2 min-h-[52px] text-xl font-black leading-[1.35] tracking-tight text-[#173B2F]">
          {event.title}
        </h3>

        <div className="mt-4 space-y-3">
          <p className="flex items-start gap-2.5 text-xs text-[#738777]">
            <Clock3 size={15} className="mt-0.5 shrink-0 text-[#43865C]" />
            <span>{formatDate(event.startDate)}</span>
          </p>

          <p className="flex items-start gap-2.5 text-xs text-[#738777]">
            <MapPin size={15} className="mt-0.5 shrink-0 text-[#43865C]" />
            <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
          </p>
        </div>

        <div className="mt-5 rounded-xl bg-[#F5F8F3] p-3.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-[#69816F]">
              <Users size={14} />
              Registrations
            </span>
            <span className="font-black text-[#173B2F]">
              {registered} / {capacity}
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#DCE9DB]">
            <div
              className="h-full rounded-full bg-[#438D62] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="mt-5 border-t border-[#EDF1EB] pt-4">
          <EventActions
            event={event}
            onView={onView}
            onAction={onAction}
          />
        </div>
      </div>
    </article>
  );
}

function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(async (path, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Your session was not found. Please log in again.");
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || `Request failed with status ${response.status}.`
      );
    }

    return data;
  }, []);

  const loadEvents = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const data = await request("/api/events/mine");
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const stats = useMemo(() => ({
    total: events.length,
    published: events.filter(e => e.status === "published").length,
    draft: events.filter(e => e.status === "draft").length,
    completed: events.filter(e => e.status === "completed").length,
    cancelled: events.filter(e => e.status === "cancelled").length
  }), [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = events.filter(event => {
      const text = [
        event.title,
        event.category,
        event.venue,
        event.location
      ].filter(Boolean).join(" ").toLowerCase();

      return (
        (!query || text.includes(query)) &&
        (filter === "all" || event.status === filter)
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }

      if (sort === "upcoming") {
        return new Date(a.startDate || 0) - new Date(b.startDate || 0);
      }

      if (sort === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [events, search, filter, sort]);

  const openAction = (event, action) => {
    setError("");
    setModalError("");
    setReason("");
    setConfirmAction({ event, action });
  };

  const runAction = async () => {
    if (!confirmAction || busyId) return;

    const { event, action } = confirmAction;

    if (action === "cancel" && reason.trim().length < 10) {
      setModalError("Cancellation reason must contain at least 10 characters.");
      return;
    }

    const routes = {
      publish: {
        method: "PATCH",
        path: `/api/events/${event._id}/publish`
      },
      unpublish: {
        method: "PATCH",
        path: `/api/events/${event._id}/unpublish`
      },
      cancel: {
        method: "PATCH",
        path: `/api/events/${event._id}/cancel`,
        body: JSON.stringify({ reason: reason.trim() })
      },
      delete: {
        method: "DELETE",
        path: `/api/events/${event._id}`
      }
    };

    const config = routes[action];
    if (!config) return;

    try {
      setBusyId(event._id);
      setModalError("");
      setError("");
      setNotice("");

      const data = await request(config.path, {
        method: config.method,
        ...(config.body ? { body: config.body } : {})
      });

      setNotice(data.message || "Event updated successfully.");
      setConfirmAction(null);
      setReason("");
      setSelected(null);

      await loadEvents(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const cards = [
    { label: "Total Events", value: stats.total, icon: CalendarDays, dark: true },
    { label: "Published", value: stats.published, icon: CheckCircle2 },
    { label: "Drafts", value: stats.draft, icon: FileText },
    { label: "Completed", value: stats.completed, icon: Activity },
    { label: "Cancelled", value: stats.cancelled, icon: Ban }
  ];

  return (
    <div className="min-h-screen bg-[#F2F5EF] pb-20 text-[#173B2F]">
      <header className="relative overflow-hidden border-b border-[#DDE8DB] bg-[#EAF2E8]">
        <div className="pointer-events-none absolute -right-20 -top-32 h-[400px] w-[400px] rounded-full border-[65px] border-white/40" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#347B54]" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#347B54]">
                  ANO G? / ORGANIZER STUDIO
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                My <span className="text-[#4E9C70]">Events.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#718575]">
                Your workspace for creating, organizing, and managing
                memorable event experiences.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => loadEvents()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D3E2D1] bg-white/80 px-4 py-3 text-xs font-bold text-[#345A41] transition hover:bg-white disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <Link
                to="/organizer/events/create"
                className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white shadow-[0_10px_25px_rgba(23,59,47,0.13)] transition hover:bg-[#286043]"
              >
                <Plus size={18} />
                Create Event
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 px-5 pt-8 sm:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {cards.map(card => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {notice && (
          <div className="flex items-center gap-3 rounded-xl border border-[#CFE8D2] bg-[#EDF8EE] p-4 text-sm font-semibold text-[#287747]">
            <CheckCircle2 size={19} />
            <span className="flex-1">{notice}</span>
            <button onClick={() => setNotice("")} type="button">
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} type="button">
              <X size={17} />
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-[22px] border border-[#DEE8DC] bg-white shadow-[0_8px_35px_rgba(23,59,47,0.035)]">
          <div className="border-b border-[#EDF1EB] px-5 pt-6 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <LayoutGrid size={19} className="text-[#43865C]" />
                  <h2 className="text-lg font-black tracking-tight">
                    Event Management
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#8B9B8E]">
                  Manage your events, statuses, and attendee capacity.
                </p>
              </div>

              <span className="rounded-full bg-[#EFF5ED] px-3 py-2 text-[11px] font-bold text-[#43865C]">
                {filteredEvents.length} events
              </span>
            </div>

            <div className="mt-6 flex gap-1 overflow-x-auto">
              {FILTERS.map(item => {
                const count = item.value === "all"
                  ? stats.total
                  : stats[item.value] || 0;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`flex shrink-0 items-center gap-2 border-b-[3px] px-4 py-3 text-xs font-bold transition ${
                      filter === item.value
                        ? "border-[#347B54] text-[#173B2F]"
                        : "border-transparent text-[#8B9B8E] hover:text-[#347B54]"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] ${
                        filter === item.value
                          ? "bg-[#E5F3E7] text-[#347B54]"
                          : "bg-[#F1F4F0] text-[#9BAA9E]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-5 sm:p-7">
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9C8F]"
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search events by title, category, or venue..."
                className="w-full rounded-xl border border-[#DDE8DB] bg-[#F8FAF7] py-3 pl-11 pr-4 text-xs text-[#173B2F] outline-none transition focus:border-[#438D62] focus:ring-4 focus:ring-[#438D62]/10"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none rounded-xl border border-[#DDE8DB] bg-[#F8FAF7] py-3 pl-4 pr-10 text-xs font-bold text-[#496A53] outline-none"
              >
                <option value="newest">Newest Created</option>
                <option value="oldest">Oldest Created</option>
                <option value="upcoming">Event Date</option>
                <option value="title">Event Title</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#819287]"
              />
            </div>

            <div className="flex rounded-xl border border-[#DDE8DB] bg-[#F8FAF7] p-1">
              <button
                type="button"
                title="Grid view"
                onClick={() => setView("grid")}
                className={`rounded-lg p-2.5 transition ${
                  view === "grid"
                    ? "bg-[#173B2F] text-white"
                    : "text-[#849688] hover:bg-white"
                }`}
              >
                <LayoutGrid size={17} />
              </button>
              <button
                type="button"
                title="List view"
                onClick={() => setView("list")}
                className={`rounded-lg p-2.5 transition ${
                  view === "list"
                    ? "bg-[#173B2F] text-white"
                    : "text-[#849688] hover:bg-white"
                }`}
              >
                <List size={17} />
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <EventSkeleton />
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-[24px] border border-[#DEE8DC] bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#EAF3E9] text-[#43865C]">
              <CalendarDays size={35} />
            </div>

            <h3 className="mt-6 text-2xl font-black tracking-tight">
              {events.length === 0
                ? "Your event journey starts here."
                : "No matching events found."}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#859588]">
              {events.length === 0
                ? "Create your first event and start building memorable experiences for your attendees."
                : "Try changing your search, status filter, or sorting options."}
            </p>

            {events.length === 0 ? (
              <Link
                to="/organizer/events/create"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#286043]"
              >
                <Plus size={18} />
                Create Your First Event
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-7 rounded-xl border border-[#DDE8DB] px-6 py-3 text-sm font-bold text-[#347B54] hover:bg-[#F2F8F0]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map(event => (
              <EventCard
                key={event._id}
                event={event}
                onView={setSelected}
                onAction={openAction}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-[#DEE8DC] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F7FAF6]">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-[#879A8B]">
                    <th className="px-5 py-5">Event</th>
                    <th className="px-5 py-5">Schedule</th>
                    <th className="px-5 py-5">Attendees</th>
                    <th className="px-5 py-5">Status</th>
                    <th className="px-5 py-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF1EB]">
                  {filteredEvents.map(event => (
                    <tr
                      key={event._id}
                      className="transition hover:bg-[#F9FBF8]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <EventPoster
                            event={event}
                            className="h-16 w-20 shrink-0 rounded-xl"
                          />
                          <div className="min-w-0">
                            <p className="max-w-[230px] truncate text-sm font-black">
                              {event.title}
                            </p>
                            <p className="mt-1 text-[11px] text-[#8B9B8E]">
                              {event.category}
                            </p>
                            <p className="mt-1 max-w-[230px] truncate text-[11px] text-[#8B9B8E]">
                              {event.venue}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-[#617967]">
                        {formatDate(event.startDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-xs font-bold">
                          <Users size={15} className="text-[#43865C]" />
                          {event.registeredCount || 0}/{event.capacity}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={event.status} />
                      </td>

                      <td className="px-5 py-4">
                        <EventActions
                          event={event}
                          onView={setSelected}
                          onAction={openAction}
                          compact
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07140F]/65 p-4 backdrop-blur-sm"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Event details"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#EDF1EB] px-6 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#43865C]">
                  EVENT OVERVIEW
                </p>
                <h2 className="mt-1 text-xl font-black">
                  Event Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl bg-[#F2F5EF] p-2 text-[#496A53] hover:bg-[#E7EEE5]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <EventPoster
                event={selected}
                className="h-60 w-full rounded-[18px]"
              />

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <StatusBadge status={selected.status} />
                <span className="text-xs font-bold text-[#43865C]">
                  {selected.category}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-black tracking-tight">
                {selected.title}
              </h3>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#738777]">
                {selected.description}
              </p>

              <div className="mt-6 grid gap-4 rounded-2xl bg-[#F5F8F3] p-5 sm:grid-cols-2">
                {[
                  { icon: CalendarDays, label: "Starts", value: formatDate(selected.startDate) },
                  { icon: Clock3, label: "Ends", value: formatDate(selected.endDate) },
                  { icon: MapPin, label: "Venue", value: selected.venue },
                  { icon: MapPin, label: "Location", value: selected.location },
                  { icon: Users, label: "Capacity", value: `${selected.registeredCount || 0} / ${selected.capacity}` },
                  { icon: Ticket, label: "Admission", value: formatPrice(selected) },
                  {
                    icon: CalendarDays,
                    label: "Registration Deadline",
                    value: selected.registrationDeadline
                      ? formatDate(selected.registrationDeadline)
                      : "Not specified"
                  }
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon
                      size={17}
                      className="mt-0.5 shrink-0 text-[#43865C]"
                    />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#91A194]">
                        {item.label}
                      </p>
                      <p className="mt-1 break-words text-xs font-bold leading-5 text-[#244936]">
                        {item.value || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-[#DDE8DB] px-5 py-3 text-xs font-bold text-[#496A53]"
                >
                  Close
                </button>

                {["draft", "published"].includes(selected.status) && (
                  <Link
                    to={`/organizer/events/${selected._id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white"
                  >
                    <FilePenLine size={16} />
                    Edit Event
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#07140F]/65 p-4 backdrop-blur-sm"
          onMouseDown={e => {
            if (e.target === e.currentTarget && !busyId) {
              setConfirmAction(null);
              setModalError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm event action"
            className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl"
          >
            <div className="p-6 sm:p-7">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  ["cancel", "delete"].includes(confirmAction.action)
                    ? "bg-[#FFF0ED] text-[#C35A50]"
                    : "bg-[#EAF5ED] text-[#347B54]"
                }`}
              >
                {["cancel", "delete"].includes(confirmAction.action)
                  ? <AlertCircle size={26} />
                  : <CheckCircle2 size={26} />}
              </div>

              <h2 className="mt-5 text-xl font-black tracking-tight">
                {confirmAction.action === "delete"
                  ? "Move Event to Trash?"
                  : confirmAction.action === "publish"
                    ? "Publish this Event?"
                    : confirmAction.action === "unpublish"
                      ? "Unpublish this Event?"
                      : "Cancel this Event?"}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#758979]">
                {confirmAction.action === "delete"
                  ? "This event will be moved to Trash."
                  : confirmAction.action === "publish"
                    ? "This event will become visible to attendees in Browse Events."
                    : confirmAction.action === "unpublish"
                      ? "This event will be returned to draft and hidden from public browsing."
                      : "This event will be marked as cancelled."}
              </p>

              <div className="mt-4 rounded-xl bg-[#F5F8F3] p-4">
                <p className="text-xs font-black">
                  {confirmAction.event.title}
                </p>
                <p className="mt-1 text-[11px] text-[#849688]">
                  {formatDate(confirmAction.event.startDate)}
                </p>
              </div>

              {confirmAction.action === "cancel" && (
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-black">
                    Cancellation Reason
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => {
                      setReason(e.target.value);
                      setModalError("");
                    }}
                    placeholder="Explain why this event is being cancelled..."
                    rows={4}
                    maxLength={1000}
                    className="w-full resize-y rounded-xl border border-[#DDE8DB] bg-[#FAFCF9] p-4 text-sm outline-none focus:border-[#438D62]"
                  />
                  <p className="mt-2 text-[11px] text-[#91A194]">
                    Minimum 10 characters
                  </p>
                </div>
              )}

              {modalError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  {modalError}
                </div>
              )}

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={Boolean(busyId)}
                  onClick={() => {
                    setConfirmAction(null);
                    setModalError("");
                  }}
                  className="rounded-xl border border-[#DDE8DB] px-5 py-3 text-xs font-bold text-[#496A53] disabled:opacity-50"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  disabled={Boolean(busyId)}
                  onClick={runAction}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white disabled:opacity-50 ${
                    ["cancel", "delete"].includes(confirmAction.action)
                      ? "bg-[#C35A50] hover:bg-[#A7463D]"
                      : "bg-[#173B2F] hover:bg-[#286043]"
                  }`}
                >
                  {busyId && <Loader2 size={16} className="animate-spin" />}
                  {busyId ? "Processing..." : "Confirm Action"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizerEvents;
