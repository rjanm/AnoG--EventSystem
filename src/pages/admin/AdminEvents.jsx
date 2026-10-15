
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CalendarDays,
  Search,
  RefreshCw,
  MapPin,
  Users,
  Eye,
  Send,
  RotateCcw,
  Ban,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Ticket,
  UserRound,
  ExternalLink
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () =>
  sessionStorage.getItem("anoGToken") || "";

const PAGE_SIZE = 8;

const formatDate = value => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short"
    });
};

const formatShortDate = value => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
};

const formatNumber = value =>
  Number(value || 0).toLocaleString("en-PH");

const statusStyles = {
  draft: {
    label: "Draft",
    className: "bg-[#F2F3F0] text-[#66766C]",
    dot: "bg-[#8A988D]"
  },
  published: {
    label: "Published",
    className: "bg-[#E7F5E9] text-[#237647]",
    dot: "bg-[#36A765]"
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-[#FDECEB] text-[#B94E48]",
    dot: "bg-[#DB615A]"
  },
  completed: {
    label: "Completed",
    className: "bg-[#EAF0FD] text-[#4A70B5]",
    dot: "bg-[#5D83C7]"
  }
};

function StatusBadge({ status }) {
  const config =
    statusStyles[status] ||
    statusStyles.draft;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />
      {config.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
  description
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[22px] border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${active
          ? "border-[#173B2F] bg-[#173B2F] text-white shadow-lg"
          : "border-[#E0E9DE] bg-white text-[#173B2F] shadow-sm"
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`text-[11px] font-bold uppercase tracking-[0.08em] ${active
              ? "text-white/65"
              : "text-[#849487]"
            }`}
        >
          {label}
        </span>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${active
              ? "bg-white/10 text-[#B6E8C7]"
              : "bg-[#EEF5EC] text-[#347B54]"
            }`}
        >
          <Icon size={19} />
        </span>
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight">
        {formatNumber(value)}
      </p>

      <p
        className={`mt-1.5 text-[11px] ${active
            ? "text-white/60"
            : "text-[#91A194]"
          }`}
      >
        {description}
      </p>
    </button>
  );
}

function ActionButton({
  title,
  icon: Icon,
  onClick,
  disabled,
  variant = "neutral"
}) {
  const variants = {
    neutral:
      "border-[#E0E8DF] bg-white text-[#657A69] hover:bg-[#F0F5EF]",
    green:
      "border-[#D8EADD] bg-[#F0F8F1] text-[#347B54] hover:bg-[#E0F1E4]",
    amber:
      "border-[#F1E4CA] bg-[#FFFAEE] text-[#A57B35] hover:bg-[#F9EED6]",
    red:
      "border-[#F3DAD7] bg-[#FFF3F1] text-[#BC6259] hover:bg-[#FBE5E2]"
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]}`}
    >
      <Icon size={15} />
    </button>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 border-b border-[#EFF3EC] py-3.5 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF4EB] text-[#347B54]">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#93A296]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[#294A37]">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function EventActions({
  event,
  onView,
  onAction,
  disabled
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ActionButton
        title="View event details"
        icon={Eye}
        onClick={() => onView(event)}
        disabled={disabled}
      />

      {event.status === "draft" && (
        <ActionButton
          title="Publish event"
          icon={Send}
          variant="green"
          onClick={() =>
            onAction(event, "publish")
          }
          disabled={disabled}
        />
      )}

      {event.status === "published" && (
        <>
          {Number(event.registeredCount || 0) === 0 && (
            <ActionButton
              title="Unpublish event"
              icon={RotateCcw}
              variant="amber"
              onClick={() =>
                onAction(event, "unpublish")
              }
              disabled={disabled}
            />
          )}

          <ActionButton
            title="Cancel event"
            icon={Ban}
            variant="red"
            onClick={() =>
              onAction(event, "cancel")
            }
            disabled={disabled}
          />
        </>
      )}

      {Number(event.registeredCount || 0) === 0 && (
        <ActionButton
          title="Move event to Trash"
          icon={Trash2}
          variant="red"
          onClick={() =>
            onAction(event, "delete")
          }
          disabled={disabled}
        />
      )}
    </div>
  );
}

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reason, setReason] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(
    async (path, options = {}) => {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Your login session was not found. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}${path}`,
        {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
          `Request failed with status ${response.status}.`
        );
      }

      return data;
    },
    []
  );

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await request(
        "/api/events/admin/all"
      );

      setEvents(
        Array.isArray(data.events)
          ? data.events
          : []
      );

      setStats(data.stats || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        events
          .map(event => event.category)
          .filter(Boolean)
      )
    ].sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();

    const result = events.filter(event => {
      const searchable = [
        event.title,
        event.category,
        event.venue,
        event.location,
        event.organizer?.fullName,
        event.organizer?.username,
        event.organizer?.email
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (filter === "all" ||
          event.status === filter) &&
        (category === "all" ||
          event.category === category)
      );
    });

    result.sort((a, b) => {
      if (sort === "oldest") {
        return (
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
        );
      }

      if (sort === "upcoming") {
        return (
          new Date(a.startDate || 0) -
          new Date(b.startDate || 0)
        );
      }

      if (sort === "title") {
        return String(a.title || "").localeCompare(
          String(b.title || "")
        );
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

    return result;
  }, [events, search, filter, category, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleEvents = filteredEvents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const updateFilter = setter => value => {
    setter(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setCategory("all");
    setSort("newest");
    setPage(1);
  };

  const openAction = (event, action) => {
    setError("");
    setReason("");
    setConfirmAction({ event, action });
  };

  const runAction = async () => {
    if (!confirmAction) return;

    const { event, action } = confirmAction;

    if (
      action === "cancel" &&
      reason.trim().length < 10
    ) {
      setError(
        "Cancellation reason must contain at least 10 characters."
      );
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
        body: JSON.stringify({
          reason: reason.trim()
        })
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
      setError("");
      setNotice("");

      const data = await request(
        config.path,
        {
          method: config.method,
          ...(config.body
            ? { body: config.body }
            : {})
        }
      );

      setNotice(
        data.message ||
        "Event updated successfully."
      );

      setConfirmAction(null);
      setReason("");
      setSelected(null);

      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const cards = [
    {
      key: "all",
      label: "Total Events",
      value: stats.total ?? events.length,
      icon: CalendarDays,
      description: "All event records"
    },
    {
      key: "published",
      label: "Published",
      value:
        stats.published ??
        events.filter(
          event => event.status === "published"
        ).length,
      icon: CheckCircle2,
      description: "Live on the platform"
    },
    {
      key: "draft",
      label: "Draft",
      value:
        stats.draft ??
        events.filter(
          event => event.status === "draft"
        ).length,
      icon: FileText,
      description: "Not yet published"
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value:
        stats.cancelled ??
        events.filter(
          event => event.status === "cancelled"
        ).length,
      icon: Ban,
      description: "Cancelled events"
    },
    {
      key: "completed",
      label: "Completed",
      value:
        stats.completed ??
        events.filter(
          event => event.status === "completed"
        ).length,
      icon: CalendarCheck,
      description: "Finished events"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F5EF] px-4 pb-16 pt-7 sm:px-7 lg:px-9">
      <div className="mx-auto max-w-[1450px] space-y-6">

        {/* HEADER */}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#347B54]">
              ANO G? / ADMINISTRATION
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#173B2F] sm:text-4xl">
              Event{" "}
              <span className="text-[#4E9C70]">
                Management.
              </span>
            </h1>

            <p className="mt-2 text-sm text-[#849688]">
              Oversee events, organizers, and publishing
              activity across the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={loadEvents}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE7D9] bg-white px-5 py-3 text-xs font-bold text-[#173B2F] shadow-sm transition hover:bg-[#EDF5EC] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading ? "animate-spin" : ""
              }
            />
            Refresh Events
          </button>
        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {cards.map(({ key, ...card }) => (
            <StatCard
              key={key}
              {...card}
              active={filter === key}
              onClick={() => {
                setFilter(key);
                setPage(1);
              }}
            />
          ))}
        </div>

        {/* NOTICES */}

        {notice && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-[#CBE8D1] bg-[#ECF8EE] p-4 text-sm font-medium text-[#277245]"
          >
            <CheckCircle2
              size={18}
              className="shrink-0"
            />
            <span className="flex-1">{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle
              size={18}
              className="shrink-0"
            />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}

        <section className="overflow-hidden rounded-[24px] border border-[#E0E9DE] bg-white shadow-sm">

          {/* SECTION HEADER */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9EFE7] px-5 py-5 sm:px-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black tracking-tight text-[#173B2F]">
                  All Events
                </h2>

                <span className="rounded-full bg-[#EAF3E8] px-3 py-1 text-[11px] font-black text-[#347B54]">
                  {formatNumber(filteredEvents.length)}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#90A093]">
                Browse and manage event records
              </p>
            </div>

            <div className="flex rounded-xl border border-[#E0E9DE] bg-[#F7FAF6] p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table view"
                aria-label="Table view"
                className={`rounded-lg p-2.5 transition ${viewMode === "table"
                    ? "bg-[#173B2F] text-white"
                    : "text-[#819284]"
                  }`}
              >
                <List size={17} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid view"
                aria-label="Grid view"
                className={`rounded-lg p-2.5 transition ${viewMode === "grid"
                    ? "bg-[#173B2F] text-white"
                    : "text-[#819284]"
                  }`}
              >
                <LayoutGrid size={17} />
              </button>
            </div>
          </div>

          {/* FILTERS */}

          <div className="grid gap-3 border-b border-[#E9EFE7] p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-[minmax(220px,1fr)_180px_180px_170px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9D8E]"
              />

              <input
                value={search}
                onChange={event =>
                  updateFilter(setSearch)(
                    event.target.value
                  )
                }
                placeholder="Search events, venues, organizers..."
                className="w-full rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-11 pr-4 text-xs text-[#173B2F] outline-none transition focus:border-[#347B54]"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9D8E]"
              />

              <select
                value={filter}
                onChange={event =>
                  updateFilter(setFilter)(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-9 pr-3 text-xs font-semibold text-[#486451] outline-none"
              >
                <option value="all">
                  All Statuses
                </option>
                <option value="draft">Draft</option>
                <option value="published">
                  Published
                </option>
                <option value="cancelled">
                  Cancelled
                </option>
                <option value="completed">
                  Completed
                </option>
              </select>
            </div>

            <select
              value={category}
              onChange={event =>
                updateFilter(setCategory)(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] px-4 py-3.5 text-xs font-semibold text-[#486451] outline-none"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map(item => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <div className="relative">
              <ArrowUpDown
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9D8E]"
              />

              <select
                value={sort}
                onChange={event =>
                  updateFilter(setSort)(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-9 pr-3 text-xs font-semibold text-[#486451] outline-none"
              >
                <option value="newest">
                  Newest Created
                </option>
                <option value="oldest">
                  Oldest Created
                </option>
                <option value="upcoming">
                  Event Date
                </option>
                <option value="title">
                  Event Name
                </option>
              </select>
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-xl bg-[#EDF3EB]"
                  />
                )
              )}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#347B54]">
                <CalendarDays size={28} />
              </div>

              <h3 className="mt-5 text-lg font-black text-[#173B2F]">
                No events found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#8A9A8D]">
                No event records match your current filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === "table" ? (

            /* TABLE VIEW */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left">
                <thead className="bg-[#F8FAF7]">
                  <tr className="text-[10px] font-black uppercase tracking-[0.12em] text-[#829586]">
                    <th className="px-6 py-4">
                      Event Details
                    </th>
                    <th className="px-4 py-4">
                      Organizer
                    </th>
                    <th className="px-4 py-4">
                      Schedule
                    </th>
                    <th className="px-4 py-4">
                      Capacity
                    </th>
                    <th className="px-4 py-4">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EFF3ED]">
                  {visibleEvents.map(event => (
                    <tr
                      key={event._id}
                      className="transition hover:bg-[#FAFCF9]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="h-16 w-16 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#EAF3E8] text-[#347B54]">
                              <CalendarDays size={23} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="max-w-[230px] truncate text-sm font-black text-[#173B2F]">
                              {event.title}
                            </p>

                            <p className="mt-1 text-[11px] font-medium text-[#4E9C70]">
                              {event.category || "Uncategorized"}
                            </p>

                            <p className="mt-1 flex max-w-[230px] items-center gap-1 truncate text-[11px] text-[#95A497]">
                              <MapPin
                                size={12}
                                className="shrink-0"
                              />
                              {event.venue || "Venue not set"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-[180px] truncate text-xs font-bold text-[#294A37]">
                          {event.organizer?.fullName ||
                            event.organizer?.username ||
                            "Unknown"}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-[11px] text-[#96A497]">
                          {event.organizer?.email || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs font-bold text-[#294A37]">
                          {formatShortDate(event.startDate)}
                        </p>

                        <p className="mt-1 text-[11px] text-[#96A497]">
                          {event.startDate
                            ? new Date(
                              event.startDate
                            ).toLocaleTimeString(
                              "en-PH",
                              {
                                hour: "numeric",
                                minute: "2-digit"
                              }
                            )
                            : "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Users
                            size={15}
                            className="text-[#72927C]"
                          />

                          <span className="text-xs font-bold text-[#294A37]">
                            {formatNumber(
                              event.registeredCount
                            )}
                            <span className="font-normal text-[#A0ADA2]">
                              {" / "}
                              {formatNumber(event.capacity)}
                            </span>
                          </span>
                        </div>

                        {Number(event.capacity) > 0 && (
                          <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-[#EAF1E8]">
                            <div
                              className="h-full rounded-full bg-[#5BA776]"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    (
                                      Number(
                                        event.registeredCount || 0
                                      ) /
                                      Number(event.capacity)
                                    ) * 100
                                  )
                                )}%`
                              }}
                            />
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={event.status}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <EventActions
                            event={event}
                            onView={setSelected}
                            onAction={openAction}
                            disabled={Boolean(busyId)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (

            /* GRID VIEW */

            <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleEvents.map(event => (
                <article
                  key={event._id}
                  className="overflow-hidden rounded-[20px] border border-[#E2E9DF] bg-white transition hover:shadow-md"
                >
                  <div className="relative h-44 bg-[#E7F0E5]">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#5E9871]">
                        <CalendarDays size={42} />
                      </div>
                    )}

                    <div className="absolute right-3 top-3">
                      <StatusBadge
                        status={event.status}
                      />
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#4E9C70]">
                      {event.category || "Event"}
                    </p>

                    <h3 className="mt-2 line-clamp-2 min-h-[44px] text-base font-black leading-snug text-[#173B2F]">
                      {event.title}
                    </h3>

                    <div className="mt-4 space-y-2 text-xs text-[#778B7D]">
                      <p className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        {formatShortDate(event.startDate)}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span className="truncate">
                          {event.venue || "Venue not set"}
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <UserRound size={14} />
                        <span className="truncate">
                          {event.organizer?.fullName ||
                            event.organizer?.username ||
                            "Unknown"}
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <Users size={14} />
                        {formatNumber(event.registeredCount)}
                        {" / "}
                        {formatNumber(event.capacity)}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-[#EAF0E7] pt-4">
                      <EventActions
                        event={event}
                        onView={setSelected}
                        onAction={openAction}
                        disabled={Boolean(busyId)}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* PAGINATION */}

          {!loading &&
            filteredEvents.length > PAGE_SIZE && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E9EFE7] px-5 py-5 sm:px-6">
                <p className="text-xs text-[#87998A]">
                  Showing{" "}
                  <strong className="text-[#173B2F]">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                    {"–"}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredEvents.length
                    )}
                  </strong>
                  {" of "}
                  {formatNumber(filteredEvents.length)}
                  {" events"}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPage(currentPage - 1)
                    }
                    className="rounded-xl border border-[#DDE7D9] p-2.5 text-[#173B2F] disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-3 text-xs font-bold text-[#173B2F]">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setPage(currentPage + 1)
                    }
                    className="rounded-xl border border-[#DDE7D9] p-2.5 text-[#173B2F] disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
        </section>

        {/* EVENT DETAILS MODAL */}

        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B2119]/70 p-3 backdrop-blur-sm sm:p-6">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Event details"
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[26px] bg-white shadow-2xl"
            >
              <div className="relative h-48 bg-[#E7F0E5] sm:h-60">
                {selected.image ? (
                  <img
                    src={selected.image}
                    alt={selected.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#5E9871]">
                    <CalendarDays size={54} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close event details"
                  className="absolute right-4 top-4 rounded-full bg-white p-2.5 text-[#173B2F] shadow-md"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={selected.status}
                  />

                  <span className="rounded-full bg-[#EFF5EC] px-3 py-1.5 text-[11px] font-bold text-[#347B54]">
                    {selected.category || "Event"}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-[#173B2F]">
                  {selected.title}
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#718475]">
                  {selected.description ||
                    "No description provided."}
                </p>

                <div className="mt-7 grid gap-x-6 sm:grid-cols-2">
                  <DetailRow
                    icon={UserRound}
                    label="Organizer"
                    value={
                      selected.organizer?.fullName ||
                      selected.organizer?.username ||
                      "Unknown"
                    }
                  />

                  <DetailRow
                    icon={CalendarDays}
                    label="Start Date"
                    value={formatDate(selected.startDate)}
                  />

                  <DetailRow
                    icon={Clock3}
                    label="End Date"
                    value={formatDate(selected.endDate)}
                  />

                  <DetailRow
                    icon={MapPin}
                    label="Venue"
                    value={selected.venue}
                  />

                  <DetailRow
                    icon={MapPin}
                    label="Location"
                    value={selected.location}
                  />

                  <DetailRow
                    icon={Users}
                    label="Registered / Capacity"
                    value={`${formatNumber(
                      selected.registeredCount
                    )} / ${formatNumber(
                      selected.capacity
                    )}`}
                  />

                  <DetailRow
                    icon={Ticket}
                    label="Ticket Price"
                    value={
                      selected.isFree
                        ? "Free Event"
                        : `₱${formatNumber(
                          selected.ticketPrice
                        )}`
                    }
                  />

                  <DetailRow
                    icon={CalendarCheck}
                    label="Registration Deadline"
                    value={formatDate(
                      selected.registrationDeadline
                    )}
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E9EFE7] pt-5">
                  <p className="text-xs text-[#91A194]">
                    Event information
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-xl bg-[#173B2F] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#285541]"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTION CONFIRMATION MODAL */}

        {confirmAction && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0B2119]/70 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Confirm event action"
              className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl sm:p-8"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${["delete", "cancel"].includes(
                  confirmAction.action
                )
                    ? "bg-[#FFF0EE] text-[#C35F56]"
                    : "bg-[#EAF5EB] text-[#347B54]"
                  }`}
              >
                {["delete", "cancel"].includes(
                  confirmAction.action
                ) ? (
                  <AlertCircle size={27} />
                ) : (
                  <CheckCircle2 size={27} />
                )}
              </div>

              <h2 className="mt-5 text-xl font-black tracking-tight text-[#173B2F]">
                {confirmAction.action === "delete"
                  ? "Move Event to Trash?"
                  : `${confirmAction.action
                    .charAt(0)
                    .toUpperCase() +
                  confirmAction.action.slice(1)
                  } Event?`}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#788A7C]">
                Are you sure you want to{" "}
                {confirmAction.action === "delete"
                  ? "move"
                  : confirmAction.action}{" "}
                <strong className="text-[#173B2F]">
                  {confirmAction.event.title}
                </strong>
                {confirmAction.action === "delete"
                  ? " to Trash"
                  : ""}
                ?
              </p>

              {confirmAction.action === "cancel" && (
                <div className="mt-5">
                  <label
                    htmlFor="cancel-reason"
                    className="mb-2 block text-xs font-bold text-[#294A37]"
                  >
                    Cancellation Reason
                  </label>

                  <textarea
                    id="cancel-reason"
                    value={reason}
                    onChange={event =>
                      setReason(event.target.value)
                    }
                    placeholder="Explain why this event is being cancelled..."
                    rows={4}
                    maxLength={1000}
                    className="w-full resize-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] p-4 text-sm outline-none focus:border-[#347B54]"
                  />

                  <p className="mt-2 text-[11px] text-[#91A194]">
                    Minimum 10 characters · {reason.length}/1000
                  </p>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700"
                >
                  {error}
                </p>
              )}

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  disabled={Boolean(busyId)}
                  onClick={() => {
                    setConfirmAction(null);
                    setError("");
                  }}
                  className="flex-1 rounded-xl border border-[#DEE8DB] bg-white px-4 py-3 text-xs font-bold text-[#294A37] disabled:opacity-50"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  disabled={Boolean(busyId)}
                  onClick={runAction}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold text-white disabled:opacity-50 ${["delete", "cancel"].includes(
                    confirmAction.action
                  )
                      ? "bg-[#BD554D] hover:bg-[#A7433B]"
                      : "bg-[#173B2F] hover:bg-[#285541]"
                    }`}
                >
                  {busyId
                    ? "Processing..."
                    : "Confirm Action"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
