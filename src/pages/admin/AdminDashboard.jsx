
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const colors = {
  dark: "#173B2F",
  green: "#347B54",
  lightGreen: "#8BB79A",
  gold: "#D7A84A",
  cream: "#F6F8F4",
  muted: "#718579",
  border: "#E5ECE5"
};

const numberFormat = new Intl.NumberFormat("en-PH");

const initialStats = {
  totalUsers: null,
  totalAttendees: null,
  totalOrganizers: null,
  totalAdmins: null,
  totalEvents: null,
  pendingApplications: null,
  approvedApplications: null,
  rejectedApplications: null
};

const getNumber = value => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatNumber = value =>
  value === null || value === undefined
    ? "—"
    : numberFormat.format(value);

const formatDate = value => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const formatDateTime = value => {
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

const getStatusStyle = status => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";
    case "draft":
      return "bg-yellow-100 text-yellow-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

function DashboardIcon({
  name,
  size = 22,
  color = "currentColor"
}) {
  const paths = {
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
        <path d="M16 5a3 3 0 0 1 0 6" />
        <path d="M17 14a5 5 0 0 1 4 5v1" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
        <path d="M8 15h3M8 18h6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    close: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V4M4 20h17" />
        <rect x="8" y="12" width="3" height="5" rx="1" />
        <rect x="13" y="8" width="3" height="9" rx="1" />
        <rect x="18" y="5" width="3" height="12" rx="1" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.5 9A7 7 0 0 1 18 7l2 5" />
        <path d="M18.5 15A7 7 0 0 1 6 17l-2-5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    )
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.chart}
    </svg>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = colors.dark,
  large = false,
  loading = false,
  onClick
}) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#E5ECE5] bg-white p-6 shadow-sm ${
        large ? "min-h-[240px]" : "min-h-[175px]"
      } ${
        onClick
          ? "cursor-pointer transition hover:-translate-y-1 hover:shadow-md"
          : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? event => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-[#718579]">
          {title}
        </span>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${color}15`
          }}
        >
          <DashboardIcon
            name={icon}
            color={color}
          />
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="h-12 w-28 animate-pulse rounded-xl bg-[#EDF2EC]" />
        ) : (
          <div
            className={`font-bold tracking-tight ${
              large ? "text-5xl" : "text-4xl"
            }`}
            style={{ color }}
          >
            {formatNumber(value)}
          </div>
        )}

        <p className="mt-2 text-xs leading-5 text-[#8A9A8E]">
          {subtitle}
        </p>
      </div>

      {large && (
        <div
          className="pointer-events-none absolute -bottom-16 -right-14 h-44 w-44 rounded-full opacity-[0.07]"
          style={{
            backgroundColor: color
          }}
        />
      )}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  action,
  className = ""
}) {
  return (
    <div
      className={`rounded-[24px] border border-[#E5ECE5] bg-white p-6 shadow-sm ${className}`}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#173B2F]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-xs text-[#8A9A8E]">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}

function ComparisonChart({
  stats,
  loading,
  error
}) {
  const items = [
    {
      label: "Registered users",
      value: getNumber(stats.totalUsers),
      color: colors.dark
    },
    {
      label: "Organizers",
      value: getNumber(stats.totalOrganizers),
      color: colors.green
    },
    {
      label: "Events",
      value: getNumber(stats.totalEvents),
      color: colors.lightGreen
    },
    {
      label: "Pending requests",
      value: getNumber(stats.pendingApplications),
      color: colors.gold
    }
  ];

  const maximum = Math.max(
    1,
    ...items.map(item => item.value ?? 0)
  );

  if (loading) {
    return (
      <div className="space-y-8 py-4">
        {items.map(item => (
          <div
            key={item.label}
            className="animate-pulse"
          >
            <div className="mb-3 h-4 w-32 rounded bg-[#EDF2EC]" />
            <div className="h-4 rounded-full bg-[#EDF2EC]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-center text-sm text-red-500">
        Unable to load platform statistics.
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {items.map(item => {
        const hasData = item.value !== null;

        const percentage = hasData
          ? (item.value / maximum) * 100
          : 0;

        return (
          <div key={item.label}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#687F70]">
                {item.label}
              </span>

              <span className="text-sm font-bold text-[#173B2F]">
                {formatNumber(item.value)}
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-[#EFF4EE]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        );
      })}

      <div className="border-t border-[#E5ECE5] pt-4">
        <p className="text-xs text-[#91A194]">
          Comparison based on current platform totals.
        </p>
      </div>
    </div>
  );
}

function DonutChart({
  stats,
  loading,
  error
}) {
  const items = [
    {
      label: "Attendees",
      value: getNumber(stats.totalAttendees),
      color: colors.dark
    },
    {
      label: "Organizers",
      value: getNumber(stats.totalOrganizers),
      color: colors.green
    },
    {
      label: "Admins",
      value: getNumber(stats.totalAdmins),
      color: colors.gold
    }
  ];

  const hasAllData = items.every(
    item => item.value !== null
  );

  const total = hasAllData
    ? items.reduce(
        (sum, item) => sum + item.value,
        0
      )
    : 0;

  let runningPercentage = 0;

  const segments = items.map(item => {
    const percentage =
      total > 0
        ? (item.value / total) * 100
        : 0;

    const start = runningPercentage;
    runningPercentage += percentage;

    return {
      ...item,
      percentage,
      start,
      end: runningPercentage
    };
  });

  const gradient =
    total > 0
      ? `conic-gradient(${segments
          .map(
            item =>
              `${item.color} ${item.start}% ${item.end}%`
          )
          .join(", ")})`
      : "#EAF0E9";

  if (loading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="h-44 w-44 animate-pulse rounded-full bg-[#EDF2EC]" />
      </div>
    );
  }

  if (error || !hasAllData) {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-sm text-[#8A9A8E]">
        Account distribution is unavailable.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-7">
      <div
        className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full"
        style={{
          background: gradient
        }}
        role="img"
        aria-label="Account distribution chart"
      >
        <div className="flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full bg-white">
          <span className="text-3xl font-bold text-[#173B2F]">
            {numberFormat.format(total)}
          </span>

          <span className="mt-1 text-xs text-[#8A9A8E]">
            Accounts by role
          </span>
        </div>
      </div>

      <div className="w-full space-y-4">
        {segments.map(item => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: item.color
                }}
              />

              <span className="text-sm text-[#718579]">
                {item.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#9AAA9D]">
                {item.percentage.toFixed(1)}%
              </span>

              <span className="min-w-8 text-right text-sm font-bold text-[#173B2F]">
                {numberFormat.format(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationSummary({
  stats,
  loading
}) {
  const items = [
    {
      label: "Pending",
      value: stats.pendingApplications,
      color: colors.gold,
      icon: "clock"
    },
    {
      label: "Approved",
      value: stats.approvedApplications,
      color: colors.green,
      icon: "check"
    },
    {
      label: "Rejected",
      value: stats.rejectedApplications,
      color: "#C66B63",
      icon: "close"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map(item => (
        <div
          key={item.label}
          className="rounded-2xl border border-[#E5ECE5] bg-[#FAFBF9] p-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium text-[#718579]">
              {item.label}
            </span>

            <DashboardIcon
              name={item.icon}
              size={20}
              color={item.color}
            />
          </div>

          <div
            className="text-3xl font-bold"
            style={{
              color: item.color
            }}
          >
            {loading
              ? "..."
              : formatNumber(item.value)}
          </div>

          <p className="mt-2 text-xs text-[#9AAA9D]">
            Organizer applications
          </p>
        </div>
      ))}
    </div>
  );
}

function RecentApplications({
  applications,
  loading,
  onViewAll
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(item => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-2xl bg-[#EDF2EC]"
          />
        ))}
      </div>
    );
  }

  if (!applications.length) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF4EE]">
          <DashboardIcon
            name="check"
            size={26}
            color={colors.green}
          />
        </div>

        <h3 className="text-sm font-semibold text-[#173B2F]">
          No pending applications
        </h3>

        <p className="mt-2 text-xs text-[#8A9A8E]">
          New organizer applications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((application, index) => {
        const name =
          application.fullName ||
          application.username ||
          "Unknown applicant";

        return (
          <div
            key={
              application.applicationId ||
              application._id ||
              index
            }
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8EEE7] bg-[#FAFBF9] p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6EFE7] text-sm font-bold text-[#347B54]">
                {name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#173B2F]">
                  {name}
                </p>

                <p className="mt-1 truncate text-xs text-[#8A9A8E]">
                  {application.organizationName ||
                    "Individual organizer"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8A9A8E]">
                {formatDate(
                  application.organizerAppliedAt ||
                  application.createdAt
                )}
              </span>

              <span className="rounded-full bg-[#FFF4DB] px-3 py-1.5 text-[11px] font-semibold text-[#9C762D]">
                Pending
              </span>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onViewAll}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5ECE5] px-4 py-3 text-sm font-semibold text-[#347B54] transition hover:bg-[#F2F7F1]"
      >
        View all applications
        <DashboardIcon
          name="arrow"
          size={16}
        />
      </button>
    </div>
  );
}

function RecentEvents({
  events,
  loading,
  error,
  onViewAll
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(item => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-2xl bg-[#EDF2EC]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-500">
          Unable to load recent events.
        </p>
        <p className="mt-2 text-xs text-[#8A9A8E]">
          Check the event API and try refreshing.
        </p>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF4EE]">
          <DashboardIcon
            name="calendar"
            size={26}
            color={colors.green}
          />
        </div>

        <h3 className="text-sm font-semibold text-[#173B2F]">
          No events found
        </h3>

        <p className="mt-2 text-xs text-[#8A9A8E]">
          Created events will appear here,
          including events saved as drafts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map(event => (
        <div
          key={event._id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#E8EEE7] bg-[#FAFBF9] p-4"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E6EFE7]">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <DashboardIcon
                name="calendar"
                size={25}
                color={colors.green}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#173B2F]">
              {event.title}
            </p>

            <p className="mt-1 truncate text-xs text-[#718579]">
              {event.venue || "No venue"}
            </p>

            <p className="mt-1 text-xs text-[#9AAA9D]">
              {formatDateTime(event.startDate)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize ${getStatusStyle(
                event.status
              )}`}
            >
              {event.status || "draft"}
            </span>

            <span className="text-[11px] text-[#9AAA9D]">
              {event.category || "Event"}
            </span>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onViewAll}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5ECE5] px-4 py-3 text-sm font-semibold text-[#347B54] transition hover:bg-[#F2F7F1]"
      >
        Manage all events
        <DashboardIcon
          name="arrow"
          size={16}
        />
      </button>
    </div>
  );
}

function QuickAction({
  title,
  description,
  icon,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#E5ECE5] bg-[#FAFBF9] p-4 text-left transition hover:border-[#8BB79A] hover:bg-[#F2F7F1]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6EFE7]">
          <DashboardIcon
            name={icon}
            size={20}
            color={colors.green}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#173B2F]">
            {title}
          </p>

          <p className="mt-1 text-xs text-[#8A9A8E]">
            {description}
          </p>
        </div>
      </div>

      <DashboardIcon
        name="arrow"
        size={18}
        color={colors.green}
      />
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(initialStats);
  const [recentApplications, setRecentApplications] =
    useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setEventsError("");

      try {
        const [
          dashboardResult,
          eventsResult
        ] = await Promise.allSettled([
          api.get("/api/admin/dashboard"),
          api.get("/api/events/admin/all")
        ]);

        let dashboard = {};
        let applications = [];
        let events = [];
        let dashboardError = "";
        let eventLoadError = "";

        if (dashboardResult.status === "fulfilled") {
          const data = dashboardResult.value.data;

          if (data?.success) {
            dashboard = data.dashboard || {};

            applications = Array.isArray(
              data.recentApplications
            )
              ? data.recentApplications
              : [];
          } else {
            dashboardError =
              data?.message ||
              "Unable to load dashboard statistics.";
          }
        } else {
          const err = dashboardResult.reason;

          console.error(
            "Dashboard statistics error:",
            err
          );

          dashboardError =
            err.response?.data?.message ||
            err.message ||
            "Unable to load dashboard statistics.";
        }

        if (eventsResult.status === "fulfilled") {
          const data = eventsResult.value.data;

          if (data?.success) {
            events = Array.isArray(data.events)
              ? data.events
              : [];
          } else {
            eventLoadError =
              data?.message ||
              "Unable to load events.";
          }
        } else {
          const err = eventsResult.reason;

          console.error(
            "Dashboard events error:",
            err
          );

          eventLoadError =
            err.response?.data?.message ||
            err.message ||
            "Unable to load events.";
        }

        const sortedEvents = [...events].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        setStats({
          totalUsers: dashboardError
            ? null
            : getNumber(dashboard.totalUsers),

          totalAttendees: dashboardError
            ? null
            : getNumber(dashboard.totalAttendees),

          totalOrganizers: dashboardError
            ? null
            : getNumber(dashboard.totalOrganizers),

          totalAdmins: dashboardError
            ? null
            : getNumber(dashboard.totalAdmins),

          totalEvents: eventLoadError
            ? null
            : events.length,

          pendingApplications: dashboardError
            ? null
            : getNumber(dashboard.pendingApplications),

          approvedApplications: dashboardError
            ? null
            : getNumber(dashboard.approvedApplications),

          rejectedApplications: dashboardError
            ? null
            : getNumber(dashboard.rejectedApplications)
        });

        setRecentApplications(applications);
        setRecentEvents(sortedEvents.slice(0, 5));

        setError(dashboardError);
        setEventsError(eventLoadError);

        if (!dashboardError && !eventLoadError) {
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err.message ||
          "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalApplications = useMemo(() => {
    const values = [
      stats.pendingApplications,
      stats.approvedApplications,
      stats.rejectedApplications
    ];

    if (
      values.some(value => value === null)
    ) {
      return null;
    }

    return values.reduce(
      (sum, value) => sum + value,
      0
    );
  }, [stats]);

  const formattedUpdate = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit"
      })
    : "Not updated yet";

  const eventStats = useMemo(() => {
    return {
      draft: recentEvents.filter(
        event => event.status === "draft"
      ).length,

      published: recentEvents.filter(
        event => event.status === "published"
      ).length
    };
  }, [recentEvents]);

  return (
    <div className="min-h-screen bg-[#F6F8F4] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E7F0E8] px-3 py-1.5 text-xs font-semibold text-[#347B54]">
              <span className="h-2 w-2 rounded-full bg-[#347B54]" />
              ANO G? ADMIN PANEL
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#173B2F] sm:text-4xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 text-sm text-[#718579]">
              Monitor platform activity, users,
              events, and organizer applications.
            </p>
          </div>

          <button
            type="button"
            disabled={loading || refreshing}
            onClick={() => loadDashboard(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285A42] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <DashboardIcon
              name="refresh"
              size={17}
              color="white"
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Dashboard"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            Dashboard: {error}
          </div>
        )}

        {eventsError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            Events: {eventsError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <StatCard
              title="Total Registered Users"
              value={stats.totalUsers}
              subtitle="All active platform records, excluding deleted accounts"
              icon="users"
              color={colors.dark}
              large
              loading={loading}
            />
          </div>

          <div className="xl:col-span-4">
            <StatCard
              title="Total Events"
              value={stats.totalEvents}
              subtitle="All non-deleted events, including drafts"
              icon="calendar"
              color={colors.green}
              large
              loading={loading}
              onClick={() =>
                navigate("/admin/events")
              }
            />
          </div>

          <div className="xl:col-span-3">
            <StatCard
              title="Pending Applications"
              value={stats.pendingApplications}
              subtitle="Organizer requests awaiting review"
              icon="clock"
              color={colors.gold}
              large
              loading={loading}
            />
          </div>

          <div className="xl:col-span-3">
            <StatCard
              title="Attendees"
              value={stats.totalAttendees}
              subtitle="Registered attendee accounts"
              icon="users"
              color={colors.dark}
              loading={loading}
            />
          </div>

          <div className="xl:col-span-3">
            <StatCard
              title="Organizers"
              value={stats.totalOrganizers}
              subtitle="Approved organizer accounts"
              icon="check"
              color={colors.green}
              loading={loading}
            />
          </div>

          <div className="xl:col-span-3">
            <StatCard
              title="Administrators"
              value={stats.totalAdmins}
              subtitle="Platform administrator accounts"
              icon="shield"
              color={colors.dark}
              loading={loading}
            />
          </div>

          <div className="xl:col-span-3">
            <StatCard
              title="Total Applications"
              value={totalApplications}
              subtitle="All submitted organizer requests"
              icon="chart"
              color={colors.green}
              loading={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <Panel
            title="Platform Statistics"
            subtitle="Comparison of users, organizers, events, and pending requests"
            className="xl:col-span-7"
          >
            <ComparisonChart
              stats={stats}
              loading={loading}
              error={error || eventsError}
            />
          </Panel>

          <Panel
            title="Account Distribution"
            subtitle="Breakdown of registered user roles"
            className="xl:col-span-5"
          >
            <DonutChart
              stats={stats}
              loading={loading}
              error={error}
            />
          </Panel>
        </div>

        <Panel
          title="Recent Events"
          subtitle="Latest events created by organizers, including drafts and published events"
          action={
            <button
              type="button"
              onClick={() =>
                navigate("/admin/events")
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#E7F0E8] px-4 py-2.5 text-xs font-semibold text-[#347B54] transition hover:bg-[#DCEBDD]"
            >
              View All Events

              <DashboardIcon
                name="arrow"
                size={15}
              />
            </button>
          }
        >
          <RecentEvents
            events={recentEvents}
            loading={loading}
            error={eventsError}
            onViewAll={() =>
              navigate("/admin/events")
            }
          />
        </Panel>

        <Panel
          title="Organizer Application Overview"
          subtitle="Current application status from MongoDB"
        >
          <ApplicationSummary
            stats={stats}
            loading={loading}
          />
        </Panel>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <Panel
            title="Recent Organizer Applications"
            subtitle="Latest applications awaiting administrator review"
            className="xl:col-span-8"
          >
            <RecentApplications
              applications={recentApplications}
              loading={loading}
              onViewAll={() =>
                navigate(
                  "/admin/organizer-applications"
                )
              }
            />
          </Panel>

          <div className="space-y-5 xl:col-span-4">
            <Panel
              title="Quick Management"
              subtitle="Access frequently used sections"
            >
              <div className="space-y-3">
                <QuickAction
                  title="Manage Users"
                  description="View and manage accounts"
                  icon="users"
                  onClick={() =>
                    navigate("/admin/users")
                  }
                />

                <QuickAction
                  title="Manage Events"
                  description="Review platform events"
                  icon="calendar"
                  onClick={() =>
                    navigate("/admin/events")
                  }
                />

                <QuickAction
                  title="Organizer Requests"
                  description="Review pending applications"
                  icon="clock"
                  onClick={() =>
                    navigate(
                      "/admin/organizer-applications"
                    )
                  }
                />
              </div>
            </Panel>

            <div className="rounded-[24px] bg-[#173B2F] p-6 text-white shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <DashboardIcon
                  name="chart"
                  size={25}
                  color="white"
                />
              </div>

              <h3 className="text-lg font-bold">
                Platform Status
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Dashboard information is retrieved
                from your existing backend.
              </p>

              <div className="mt-6 border-t border-white/15 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/60">
                    Last updated
                  </span>

                  <span className="text-xs font-semibold text-white">
                    {formattedUpdate}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/60">
                    Dashboard data
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      error || eventsError
                        ? "bg-red-500/20 text-red-200"
                        : loading
                          ? "bg-white/10 text-white/80"
                          : "bg-green-400/15 text-green-200"
                    }`}
                  >
                    {error || eventsError
                      ? "Error"
                      : loading
                        ? "Loading"
                        : "Loaded"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/60">
                    Events API
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      eventsError
                        ? "bg-red-500/20 text-red-200"
                        : loading
                          ? "bg-white/10 text-white/80"
                          : "bg-green-400/15 text-green-200"
                    }`}
                  >
                    {eventsError
                      ? "Unavailable"
                      : loading
                        ? "Loading"
                        : "Connected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5ECE5] py-5 text-center">
          <p className="text-xs text-[#9AAA9D]">
            ANO G? Event Management System ·
            Administrator Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
