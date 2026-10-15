
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { Link } from "react-router-dom";

import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FilterX,
  LayoutDashboard,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  UserRoundCheck,
  ClipboardList
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const TABS = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays
  },
  {
    id: "users",
    label: "Users",
    icon: Users
  },
  {
    id: "organizers",
    label: "Organizers",
    icon: UserRoundCheck
  }
];

const PAGE_SIZE = 10;

const fmt = value =>
  Number(value || 0).toLocaleString("en-PH");

const dateLabel = value => {
  if (!value) return "—";

  const d = new Date(value);

  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
};

const getDate = value => {
  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? null : d;
};

const text = value =>
  String(value ?? "").toLowerCase();

const titleCase = value =>
  String(value || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

const escapeCsv = value =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const statusColors = {
  published: "bg-emerald-50 text-emerald-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-rose-50 text-rose-700",
  draft: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-rose-50 text-rose-700"
};

function Pill({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
        statusColors[value] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {titleCase(value)}
    </span>
  );
}

function Metric({ title, value, icon: Icon, note }) {
  return (
    <div className="rounded-[22px] border border-[#E2E9DF] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#7B8D80]">
          {title}
        </span>

        <span className="rounded-xl bg-[#EDF5EC] p-2.5 text-[#347B54]">
          <Icon size={18} />
        </span>
      </div>

      <div className="mt-5 text-3xl font-black tracking-tight text-[#173B2F]">
        {fmt(value)}
      </div>

      <p className="mt-2 text-xs text-[#91A093]">
        {note}
      </p>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-[24px] border border-[#E2E9DF] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-black tracking-tight text-[#173B2F]">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-xs leading-5 text-[#8A9A8E]">
          {subtitle}
        </p>
      )}

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function Bars({
  rows,
  empty = "No records to display."
}) {
  const max = Math.max(
    1,
    ...rows.map(r => r.count)
  );

  if (!rows.length) {
    return (
      <p className="py-10 text-center text-sm text-[#87978A]">
        {empty}
      </p>
    );
  }

  return (
    <div className="max-h-[320px] space-y-5 overflow-y-auto pr-1">
      {rows.map((row, i) => (
        <div key={`${row.name}-${i}`}>
          <div className="mb-2 flex justify-between gap-3 text-xs">
            <span className="font-bold text-[#294839]">
              {titleCase(row.name)}
            </span>

            <span className="font-semibold text-[#819486]">
              {fmt(row.count)}
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF3EC]">
            <div
              className="h-full rounded-full bg-[#4B9969] transition-all"
              style={{
                width: `${(row.count / max) * 100}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function countBy(rows, getKey) {
  const counts = new Map();

  rows.forEach(row => {
    const key = String(
      getKey(row) || "Unknown"
    );

    counts.set(
      key,
      (counts.get(key) || 0) + 1
    );
  });

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count);
}

function Table({
  columns,
  rows,
  empty,
  page,
  onPage
}) {
  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / PAGE_SIZE)
  );

  const current = Math.min(
    page,
    totalPages
  );

  const shown = rows.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-b border-[#E6ECE4] text-[10px] uppercase tracking-widest text-[#899A8D]">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-3 py-4 font-black first:pl-0"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shown.map((row, i) => (
              <tr
                key={
                  row._id ||
                  row.applicationId ||
                  i
                }
                className="border-b border-[#EFF3ED] last:border-0"
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className="px-3 py-4 text-[#5D7563] first:pl-0"
                  >
                    {col.render
                      ? col.render(row)
                      : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}

            {!shown.length && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-14 text-center text-sm text-[#8B9B8F]"
                >
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > PAGE_SIZE && (
        <div className="mt-5 flex items-center justify-between border-t border-[#E9EFE7] pt-5">
          <span className="text-xs text-[#7D8F80]">
            Page {current} of {totalPages} ·{" "}
            {fmt(rows.length)} records
          </span>

          <div className="flex gap-2">
            <button
              aria-label="Previous page"
              disabled={current === 1}
              onClick={() => onPage(current - 1)}
              className="rounded-xl border border-[#DDE7D9] p-2 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              aria-label="Next page"
              disabled={current === totalPages}
              onClick={() => onPage(current + 1)}
              className="rounded-xl border border-[#DDE7D9] p-2 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminReports() {
  const [tab, setTab] = useState("overview");

  const [data, setData] = useState({
    events: [],
    users: [],
    applications: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAll = async () => {
      setLoading(true);
      setErrors({});

      const token = sessionStorage.getItem(
        "anoGToken"
      );

      if (!token) {
        setErrors({
          all: "Please sign in as an administrator."
        });

        setLoading(false);
        return;
      }

      const endpoints = [
        [
          "events",
          "/api/events/admin/all"
        ],
        [
          "users",
          "/api/admin/users"
        ],
        [
          "applications",
          "/api/admin/applications"
        ]
      ];

      const results = await Promise.all(
        endpoints.map(async ([key, path]) => {
          try {
            const response = await fetch(
              `${API_URL}${path}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                },
                signal: controller.signal
              }
            );

            const json = await response
              .json()
              .catch(() => ({}));

            if (
              !response.ok ||
              json.success === false
            ) {
              throw new Error(
                json.message ||
                `HTTP ${response.status}`
              );
            }

            if (!Array.isArray(json[key])) {
              throw new Error(
                `Unexpected ${key} response format.`
              );
            }

            return {
              key,
              records: json[key]
            };
          } catch (error) {
            return {
              key,
              error:
                error.message ||
                "Unable to load data."
            };
          }
        })
      );

      if (controller.signal.aborted) {
        return;
      }

      const next = {
        events: [],
        users: [],
        applications: []
      };

      const failed = {};

      results.forEach(result => {
        if (result.error) {
          failed[result.key] = result.error;
        } else {
          next[result.key] = result.records;
        }
      });

      setData(next);
      setErrors(failed);
      setLoading(false);
    };

    fetchAll();

    return () => controller.abort();
  }, [reload]);

  const dateMatches = useCallback(
    value => {
      if (!from && !to) return true;

      const d = getDate(value);

      if (!d) return false;

      if (
        from &&
        d < new Date(`${from}T00:00:00`)
      ) {
        return false;
      }

      if (
        to &&
        d > new Date(`${to}T23:59:59`)
      ) {
        return false;
      }

      return true;
    },
    [from, to]
  );

  const records = useMemo(() => {
    const q = text(search).trim();

    const events = data.events.filter(
      e =>
        e.isDeleted !== true &&
        dateMatches(e.startDate) &&
        (
          !q ||
          text([
            e.title,
            e.category,
            e.venue,
            e.location,
            e.organizer?.fullName,
            e.organizer?.username
          ].join(" ")).includes(q)
        ) &&
        (
          status === "all" ||
          e.status === status
        )
    );

    const users = data.users.filter(
      u =>
        u.isDeleted !== true &&
        dateMatches(u.createdAt) &&
        (
          !q ||
          text([
            u.fullName,
            u.username,
            u.email,
            u.role
          ].join(" ")).includes(q)
        ) &&
        (
          status === "all" ||
          u.role === status ||
          u.accountStatus === status ||
          (
            status === "verified" &&
            u.emailVerified
          ) ||
          (
            status === "unverified" &&
            !u.emailVerified
          )
        )
    );

    const applications = data.applications.filter(
      a =>
        dateMatches(
          a.createdAt ||
          a.organizerAppliedAt
        ) &&
        (
          !q ||
          text([
            a.fullName,
            a.username,
            a.organizationName,
            a.organizationType
          ].join(" ")).includes(q)
        ) &&
        (
          status === "all" ||
          a.organizerApplicationStatus === status
        )
    );

    return {
      events,
      users,
      applications
    };
  }, [
    data,
    dateMatches,
    search,
    status
  ]);

  const baseRecords = useMemo(
    () => ({
      events: data.events.filter(
        e =>
          e.isDeleted !== true &&
          dateMatches(e.startDate)
      ),

      users: data.users.filter(
        u =>
          u.isDeleted !== true &&
          dateMatches(u.createdAt)
      ),

      applications: data.applications.filter(
        a =>
          dateMatches(
            a.createdAt ||
            a.organizerAppliedAt
          )
      )
    }),
    [data, dateMatches]
  );

  const statusOptions =
    tab === "events"
      ? [
          "draft",
          "published",
          "completed",
          "cancelled"
        ]
      : tab === "users"
        ? [
            "attendee",
            "organizer",
            "admin",
            "active",
            "suspended",
            "verified",
            "unverified"
          ]
        : tab === "organizers"
          ? [
              "pending",
              "approved",
              "rejected"
            ]
          : [];

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const changeTab = id => {
    setTab(id);
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const update = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const downloadCSV = () => {
    let headers = [];
    let rows = [];
    let name = tab;

    if (tab === "events") {
      headers = [
        "Title",
        "Category",
        "Organizer",
        "Status",
        "Start Date",
        "End Date",
        "Venue",
        "Location",
        "Capacity",
        "Registered Count",
        "Free",
        "Ticket Price"
      ];

      rows = records.events.map(e => [
        e.title,
        e.category,
        e.organizer?.fullName ||
          e.organizer?.username ||
          "",
        e.status,
        dateLabel(e.startDate),
        dateLabel(e.endDate),
        e.venue,
        e.location,
        e.capacity,
        e.registeredCount,
        e.isFree ? "Yes" : "No",
        e.isFree ? 0 : e.ticketPrice
      ]);
    } else if (tab === "users") {
      headers = [
        "Full Name",
        "Username",
        "Email",
        "Role",
        "Account Status",
        "Email Verified",
        "Created At"
      ];

      rows = records.users.map(u => [
        u.fullName,
        u.username,
        u.email,
        u.role,
        u.accountStatus,
        u.emailVerified ? "Yes" : "No",
        dateLabel(u.createdAt)
      ]);
    } else if (tab === "organizers") {
      headers = [
        "Applicant",
        "Username",
        "Organization",
        "Organization Type",
        "Status",
        "Applied At",
        "Reviewed At"
      ];

      rows = records.applications.map(a => [
        a.fullName,
        a.username,
        a.organizationName,
        a.organizationType,
        a.organizerApplicationStatus,
        dateLabel(
          a.createdAt ||
          a.organizerAppliedAt
        ),
        dateLabel(a.organizerReviewedAt)
      ]);
    } else {
      headers = [
        "Metric",
        "Count"
      ];

      rows = [
        [
          "Total Events",
          baseRecords.events.length
        ],
        [
          "Total Users",
          baseRecords.users.length
        ],
        [
          "Total Organizer Applications",
          baseRecords.applications.length
        ],
        [
          "Published Events",
          baseRecords.events.filter(
            e => e.status === "published"
          ).length
        ],
        [
          "Active Users",
          baseRecords.users.filter(
            u => u.accountStatus === "active"
          ).length
        ],
        [
          "Approved Applications",
          baseRecords.applications.filter(
            a =>
              a.organizerApplicationStatus ===
              "approved"
          ).length
        ]
      ];
    }

    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map(row =>
          row.map(escapeCsv).join(",")
        )
        .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], {
        type: "text/csv;charset=utf-8"
      })
    );

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `ano-g-${name}-report-` +
      `${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();
    link.remove();

    setTimeout(
      () => URL.revokeObjectURL(url),
      1000
    );
  };

  const eventColumns = [
    {
      key: "title",
      label: "Event",
      render: e => (
        <span className="font-bold text-[#173B2F]">
          {e.title || "Untitled"}
        </span>
      )
    },
    {
      key: "category",
      label: "Category"
    },
    {
      key: "organizer",
      label: "Organizer",
      render: e =>
        e.organizer?.fullName ||
        e.organizer?.username ||
        "—"
    },
    {
      key: "startDate",
      label: "Start Date",
      render: e => dateLabel(e.startDate)
    },
    {
      key: "status",
      label: "Status",
      render: e => (
        <Pill value={e.status} />
      )
    },
    {
      key: "capacity",
      label: "Capacity",
      render: e => fmt(e.capacity)
    },
    {
      key: "registeredCount",
      label: "Registered*",
      render: e => fmt(e.registeredCount)
    }
  ];

  const userColumns = [
    {
      key: "fullName",
      label: "Name",
      render: u => (
        <span className="font-bold text-[#173B2F]">
          {u.fullName || u.username || "—"}
        </span>
      )
    },
    {
      key: "username",
      label: "Username"
    },
    {
      key: "email",
      label: "Email"
    },
    {
      key: "role",
      label: "Role",
      render: u => titleCase(u.role)
    },
    {
      key: "accountStatus",
      label: "Account",
      render: u => (
        <Pill value={u.accountStatus} />
      )
    },
    {
      key: "emailVerified",
      label: "Verified",
      render: u =>
        u.emailVerified ? "Yes" : "No"
    },
    {
      key: "createdAt",
      label: "Joined",
      render: u => dateLabel(u.createdAt)
    }
  ];

  const applicationColumns = [
    {
      key: "fullName",
      label: "Applicant",
      render: a => (
        <span className="font-bold text-[#173B2F]">
          {a.fullName || a.username || "—"}
        </span>
      )
    },
    {
      key: "organizationName",
      label: "Organization",
      render: a =>
        a.organizationName || "Individual"
    },
    {
      key: "organizationType",
      label: "Type",
      render: a =>
        titleCase(a.organizationType)
    },
    {
      key: "organizerApplicationStatus",
      label: "Status",
      render: a => (
        <Pill
          value={a.organizerApplicationStatus}
        />
      )
    },
    {
      key: "createdAt",
      label: "Applied",
      render: a =>
        dateLabel(
          a.createdAt ||
          a.organizerAppliedAt
        )
    },
    {
      key: "organizerReviewedAt",
      label: "Reviewed",
      render: a =>
        dateLabel(a.organizerReviewedAt)
    }
  ];

  const tabError =
    tab === "overview"
      ? Object.keys(errors).length > 0
      : Boolean(
          errors[
            tab === "organizers"
              ? "applications"
              : tab
          ]
        );

  const exportDisabled =
    loading ||
    tabError ||
    (
      tab !== "overview" &&
      !records[
        tab === "organizers"
          ? "applications"
          : tab
      ].length
    );

  return (
    <div className="min-h-screen bg-[#F2F5EF] px-4 pb-16 pt-7 text-[#173B2F] sm:px-7 lg:px-9">
      <div className="mx-auto max-w-[1450px] space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#347B54]">
              ANO G? / ADMINISTRATION
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-4xl">
              Reports{" "}
              <span className="text-[#4E9C70]">
                & Analytics.
              </span>
            </h1>

            <p className="mt-2 text-sm text-[#849688]">
              System-wide insights from your
              existing records.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setReload(n => n + 1)
              }
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DCE7D9] bg-white px-4 py-3 text-xs font-bold disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <button
              onClick={downloadCSV}
              disabled={exportDisabled}
              className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {/* REPORT TABS */}

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#E0E9DD] bg-white p-2">
          {TABS.map(
            ({
              id,
              label,
              icon: Icon
            }) => (
              <button
                key={id}
                onClick={() =>
                  changeTab(id)
                }
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition ${
                  tab === id
                    ? "bg-[#173B2F] text-white"
                    : "text-[#78907D] hover:bg-[#F0F5EE]"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          )}
        </div>

        {/* API ERRORS */}

        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-6 text-rose-800"
          >
            <strong>
              Some report data could not
              be loaded.
            </strong>

            {Object.entries(errors).map(
              ([key, message]) => (
                <div key={key}>
                  {titleCase(key)}:{" "}
                  {message}
                </div>
              )
            )}
          </div>
        )}

        {/* FILTERS */}

        <div className="rounded-[22px] border border-[#E2E9DF] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black">
              Report Filters
            </h2>

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#347B54]"
            >
              <FilterX size={14} />
              Reset
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tab !== "overview" && (
              <label className="relative">
                <span className="mb-1.5 block text-[11px] font-bold text-[#849587]">
                  Search records
                </span>

                <Search
                  size={15}
                  className="absolute bottom-3.5 left-3 text-[#849587]"
                />

                <input
                  value={search}
                  onChange={e =>
                    update(
                      setSearch,
                      e.target.value
                    )
                  }
                  placeholder="Search..."
                  className="w-full rounded-xl border border-[#DEE9DC] bg-[#FBFCFA] py-3 pl-9 pr-3 text-xs outline-none focus:border-[#5D9C71]"
                />
              </label>
            )}

            {statusOptions.length > 0 && (
              <label>
                <span className="mb-1.5 block text-[11px] font-bold text-[#849587]">
                  Status / Type
                </span>

                <select
                  value={status}
                  onChange={e =>
                    update(
                      setStatus,
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#DEE9DC] bg-[#FBFCFA] px-3 py-3 text-xs outline-none focus:border-[#5D9C71]"
                >
                  <option value="all">
                    All
                  </option>

                  {statusOptions.map(s => (
                    <option
                      key={s}
                      value={s}
                    >
                      {titleCase(s)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              <span className="mb-1.5 block text-[11px] font-bold text-[#849587]">
                From
              </span>

              <input
                type="date"
                value={from}
                onChange={e =>
                  update(
                    setFrom,
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[#DEE9DC] bg-[#FBFCFA] px-3 py-3 text-xs outline-none focus:border-[#5D9C71]"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-bold text-[#849587]">
                To
              </span>

              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={e =>
                  update(
                    setTo,
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[#DEE9DC] bg-[#FBFCFA] px-3 py-3 text-xs outline-none focus:border-[#5D9C71]"
              />
            </label>
          </div>

          <p className="mt-3 text-[11px] text-[#8A9A8D]">
            Date range applies to event
            start dates, user join dates,
            and application submission dates.
          </p>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 8
            }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-[22px] bg-[#E5EDE2]"
              />
            ))}
          </div>
        ) : (
          <>
            {/* OVERVIEW */}

            {tab === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    title="Total Events"
                    value={
                      baseRecords.events.length
                    }
                    icon={CalendarDays}
                    note="Non-deleted events"
                  />

                  <Metric
                    title="Total Users"
                    value={
                      baseRecords.users.length
                    }
                    icon={Users}
                    note="Non-deleted accounts"
                  />

                  <Metric
                    title="Organizers"
                    value={
                      baseRecords.users.filter(
                        u =>
                          u.role ===
                          "organizer"
                      ).length
                    }
                    icon={UserRoundCheck}
                    note="Current organizer accounts"
                  />

                  <Metric
                    title="Applications"
                    value={
                      baseRecords.applications.length
                    }
                    icon={ClipboardList}
                    note="Organizer applications"
                  />

                  <Metric
                    title="Published Events"
                    value={
                      baseRecords.events.filter(
                        e =>
                          e.status ===
                          "published"
                      ).length
                    }
                    icon={Ticket}
                    note="Published event records"
                  />

                  <Metric
                    title="Completed Events"
                    value={
                      baseRecords.events.filter(
                        e =>
                          e.status ===
                          "completed"
                      ).length
                    }
                    icon={CheckCircle2}
                    note="Completed event records"
                  />

                  <Metric
                    title="Active Users"
                    value={
                      baseRecords.users.filter(
                        u =>
                          u.accountStatus ===
                          "active"
                      ).length
                    }
                    icon={Activity}
                    note="Active accounts"
                  />

                  <Metric
                    title="Verified Emails"
                    value={
                      baseRecords.users.filter(
                        u => u.emailVerified
                      ).length
                    }
                    icon={ShieldCheck}
                    note="Verified user accounts"
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel
                    title="Event Status"
                    subtitle="Distribution of events by their current status"
                  >
                    <Bars
                      rows={countBy(
                        baseRecords.events,
                        e => e.status
                      )}
                    />
                  </Panel>

                  <Panel
                    title="User Roles"
                    subtitle="Current role distribution"
                  >
                    <Bars
                      rows={countBy(
                        baseRecords.users,
                        u => u.role
                      )}
                    />
                  </Panel>

                  <Panel
                    title="Organizer Applications"
                    subtitle="Application review outcomes"
                  >
                    <Bars
                      rows={countBy(
                        baseRecords.applications,
                        a =>
                          a.organizerApplicationStatus
                      )}
                    />
                  </Panel>

                  <Panel
                    title="Event Categories"
                    subtitle="Most represented event categories"
                  >
                    <Bars
                      rows={countBy(
                        baseRecords.events,
                        e => e.category
                      )}
                    />
                  </Panel>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Link
                    to="/admin/events"
                    className="rounded-xl border border-[#DEE8DA] bg-white p-4 text-sm font-bold text-[#347B54] hover:bg-[#EDF5EC]"
                  >
                    Manage Events →
                  </Link>

                  <Link
                    to="/admin/users"
                    className="rounded-xl border border-[#DEE8DA] bg-white p-4 text-sm font-bold text-[#347B54] hover:bg-[#EDF5EC]"
                  >
                    Manage Users →
                  </Link>

                  <Link
                    to="/admin/applications"
                    className="rounded-xl border border-[#DEE8DA] bg-white p-4 text-sm font-bold text-[#347B54] hover:bg-[#EDF5EC]"
                  >
                    Review Applications →
                  </Link>
                </div>
              </>
            )}

            {/* EVENT REPORT */}

            {tab === "events" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    title="Matching Events"
                    value={
                      records.events.length
                    }
                    icon={CalendarDays}
                    note="Filtered records"
                  />

                  <Metric
                    title="Published"
                    value={
                      records.events.filter(
                        e =>
                          e.status ===
                          "published"
                      ).length
                    }
                    icon={Ticket}
                    note="Currently published"
                  />

                  <Metric
                    title="Completed"
                    value={
                      records.events.filter(
                        e =>
                          e.status ===
                          "completed"
                      ).length
                    }
                    icon={CheckCircle2}
                    note="Finished events"
                  />

                  <Metric
                    title="Registered*"
                    value={
                      records.events.reduce(
                        (sum, e) =>
                          sum +
                          Number(
                            e.registeredCount ||
                            0
                          ),
                        0
                      )
                    }
                    icon={Users}
                    note="Sum of event-record counters"
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel title="Event Status Breakdown">
                    <Bars
                      rows={countBy(
                        records.events,
                        e => e.status
                      )}
                    />
                  </Panel>

                  <Panel title="Event Categories">
                    <Bars
                      rows={countBy(
                        records.events,
                        e => e.category
                      )}
                    />
                  </Panel>
                </div>

                <Panel
                  title="Event Report"
                  subtitle={`${fmt(
                    records.events.length
                  )} matching event records`}
                >
                  <Table
                    columns={eventColumns}
                    rows={records.events}
                    empty="No events match your filters."
                    page={page}
                    onPage={setPage}
                  />
                </Panel>
              </>
            )}

            {/* USER REPORT */}

            {tab === "users" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    title="Matching Users"
                    value={
                      records.users.length
                    }
                    icon={Users}
                    note="Filtered accounts"
                  />

                  <Metric
                    title="Active"
                    value={
                      records.users.filter(
                        u =>
                          u.accountStatus ===
                          "active"
                      ).length
                    }
                    icon={Activity}
                    note="Active accounts"
                  />

                  <Metric
                    title="Verified"
                    value={
                      records.users.filter(
                        u => u.emailVerified
                      ).length
                    }
                    icon={ShieldCheck}
                    note="Verified email addresses"
                  />

                  <Metric
                    title="Organizers"
                    value={
                      records.users.filter(
                        u =>
                          u.role ===
                          "organizer"
                      ).length
                    }
                    icon={UserRoundCheck}
                    note="Organizer role"
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel title="Users by Role">
                    <Bars
                      rows={countBy(
                        records.users,
                        u => u.role
                      )}
                    />
                  </Panel>

                  <Panel title="Account Status">
                    <Bars
                      rows={countBy(
                        records.users,
                        u => u.accountStatus
                      )}
                    />
                  </Panel>
                </div>

                <Panel
                  title="User Report"
                  subtitle={`${fmt(
                    records.users.length
                  )} matching user records`}
                >
                  <Table
                    columns={userColumns}
                    rows={records.users}
                    empty="No users match your filters."
                    page={page}
                    onPage={setPage}
                  />
                </Panel>
              </>
            )}

            {/* ORGANIZER REPORT */}

            {tab === "organizers" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    title="Applications"
                    value={
                      records.applications.length
                    }
                    icon={ClipboardList}
                    note="Filtered applications"
                  />

                  <Metric
                    title="Pending"
                    value={
                      records.applications.filter(
                        a =>
                          a.organizerApplicationStatus ===
                          "pending"
                      ).length
                    }
                    icon={Activity}
                    note="Awaiting review"
                  />

                  <Metric
                    title="Approved"
                    value={
                      records.applications.filter(
                        a =>
                          a.organizerApplicationStatus ===
                          "approved"
                      ).length
                    }
                    icon={CheckCircle2}
                    note="Approved applications"
                  />

                  <Metric
                    title="Rejected"
                    value={
                      records.applications.filter(
                        a =>
                          a.organizerApplicationStatus ===
                          "rejected"
                      ).length
                    }
                    icon={ShieldCheck}
                    note="Rejected applications"
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel title="Application Status">
                    <Bars
                      rows={countBy(
                        records.applications,
                        a =>
                          a.organizerApplicationStatus
                      )}
                    />
                  </Panel>

                  <Panel title="Organization Types">
                    <Bars
                      rows={countBy(
                        records.applications,
                        a =>
                          a.organizationType
                      )}
                    />
                  </Panel>
                </div>

                <Panel
                  title="Organizer Application Report"
                  subtitle={`${fmt(
                    records.applications.length
                  )} application records · Multiple applications may belong to one user`}
                >
                  <Table
                    columns={
                      applicationColumns
                    }
                    rows={
                      records.applications
                    }
                    empty="No applications match your filters."
                    page={page}
                    onPage={setPage}
                  />
                </Panel>
              </>
            )}
          </>
        )}

        {/* REPORTING NOTES */}

        <div className="rounded-[20px] border border-[#D7E6D4] bg-[#EAF3E8] p-5 text-xs leading-6 text-[#57745F]">
          <strong className="text-[#173B2F]">
            Reporting notes:
          </strong>{" "}
          All statistics are derived from
          the current API records, not
          fabricated values. *Registered
          counts are stored on event
          records and are not independently
          verified against registration
          records. Date filters use the
          date associated with each report
          type. Revenue, attendance, and
          actual ticket sales require
          additional backend modules.
          CSV files can be opened in Excel.
        </div>
      </div>
    </div>
  );
}
