
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  Check,
  X,
  Building2,
  CalendarDays,
  Mail,
  UserRound,
  FileText,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ClipboardList
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const PAGE_SIZE = 8;

const getToken = () =>
  sessionStorage.getItem("anoGToken") || "";

const formatDate = value => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const formatNumber = value =>
  Number(value || 0).toLocaleString("en-PH");

const getApplicationId = application =>
  application.applicationId ||
  application._id;

const getStatus = application =>
  application.organizerApplicationStatus ||
  application.status ||
  "pending";

const getApplicantName = application =>
  application.fullName ||
  application.username ||
  "Unknown Applicant";

const getReviewerName = application => {
  const reviewer = application?.reviewedBy;

  if (!reviewer) {
    return "Not available";
  }

  if (typeof reviewer === "string") {
    return "Administrator";
  }

  return (
    reviewer.fullName ||
    reviewer.username ||
    reviewer.email ||
    "Administrator"
  );
};

const statusConfig = {
  pending: {
    label: "Pending Review",
    style: "bg-[#FFF4E2] text-[#A9792D]",
    dot: "bg-[#D9A24B]"
  },
  approved: {
    label: "Approved",
    style: "bg-[#E6F5E9] text-[#28784A]",
    dot: "bg-[#40A769]"
  },
  rejected: {
    label: "Rejected",
    style: "bg-[#FDECEB] text-[#B9554D]",
    dot: "bg-[#D66A61]"
  }
};

function StatusBadge({ status }) {
  const config =
    statusConfig[status] ||
    statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ${config.style}`}
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
  description,
  active,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-[#173B2F] bg-[#173B2F] text-white shadow-md"
          : "border-[#E0E9DE] bg-white text-[#173B2F] shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] font-bold uppercase tracking-wider ${
            active
              ? "text-white/65"
              : "text-[#849487]"
          }`}
        >
          {label}
        </p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active
              ? "bg-white/10 text-[#B9EAC9]"
              : "bg-[#EEF5EC] text-[#347B54]"
          }`}
        >
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-black">
        {formatNumber(value)}
      </p>

      <p
        className={`mt-1 text-[11px] ${
          active
            ? "text-white/60"
            : "text-[#91A194]"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#EDF2EA] py-3.5 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF4EB] text-[#347B54]">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#93A296]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[#294A37]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function AdminApplications() {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [busyId, setBusyId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [sort, setSort] =
    useState("newest");

  const [page, setPage] =
    useState(1);

  const [selected, setSelected] =
    useState(null);

  const [confirmAction, setConfirmAction] =
    useState(null);

  const [reviewNote, setReviewNote] =
    useState("");

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState("");

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

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ||
          `Request failed with status ${response.status}.`
        );
      }

      return data;
    },
    []
  );

  const loadApplications = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const data = await request(
          "/api/admin/applications"
        );

        setApplications(
          Array.isArray(data.applications)
            ? data.applications
            : []
        );
      } catch (err) {
        setError(
          err.message ||
          "Unable to load applications."
        );
      } finally {
        setLoading(false);
      }
    },
    [request]
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(
        item => getStatus(item) === "pending"
      ).length,
      approved: applications.filter(
        item => getStatus(item) === "approved"
      ).length,
      rejected: applications.filter(
        item => getStatus(item) === "rejected"
      ).length
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    const result = applications.filter(
      application => {
        const text = [
          application.fullName,
          application.username,
          application.email,
          application.organizationName,
          application.organizationType,
          application.reason,
          application.experience
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (!query || text.includes(query)) &&
          (filter === "all" ||
            getStatus(application) === filter)
        );
      }
    );

    result.sort((a, b) => {
      if (sort === "oldest") {
        return (
          new Date(a.createdAt || a.organizerAppliedAt || 0) -
          new Date(b.createdAt || b.organizerAppliedAt || 0)
        );
      }

      if (sort === "name") {
        return getApplicantName(a).localeCompare(
          getApplicantName(b)
        );
      }

      return (
        new Date(b.createdAt || b.organizerAppliedAt || 0) -
        new Date(a.createdAt || a.organizerAppliedAt || 0)
      );
    });

    return result;
  }, [applications, search, filter, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredApplications.length / PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const visibleApplications =
    filteredApplications.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );

  const openReview = (application, action) => {
    setError("");
    setReviewNote("");
    setConfirmAction({
      application,
      action
    });
  };

  const submitReview = async () => {
    if (!confirmAction || busyId) return;

    const { application, action } =
      confirmAction;

    const applicationId =
      getApplicationId(application);

    if (!applicationId) {
      setError(
        "Application ID is missing."
      );
      return;
    }

    try {
      setBusyId(applicationId);
      setError("");
      setNotice("");

      const data = await request(
        `/api/admin/applications/${applicationId}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({
            action,
            reviewNote: reviewNote.trim()
          })
        }
      );

      setNotice(
        data.message ||
        `Application ${
          action === "approve"
            ? "approved"
            : "rejected"
        } successfully.`
      );

      setConfirmAction(null);
      setSelected(null);
      setReviewNote("");

      await loadApplications();
    } catch (err) {
      setError(
        err.message ||
        "Unable to review application."
      );
    } finally {
      setBusyId(null);
    }
  };

  const cards = [
    {
      key: "all",
      label: "Total Applications",
      value: stats.total,
      icon: ClipboardList,
      description: "All submitted applications"
    },
    {
      key: "pending",
      label: "Pending Review",
      value: stats.pending,
      icon: Clock3,
      description: "Waiting for a decision"
    },
    {
      key: "approved",
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      description: "Accepted applications"
    },
    {
      key: "rejected",
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      description: "Declined applications"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F5EF] px-4 pb-16 pt-7 sm:px-7 lg:px-9">
      <div className="mx-auto max-w-[1450px] space-y-6">

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#347B54]">
              ANO G? / ADMINISTRATION
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#173B2F] sm:text-4xl">
              Organizer{" "}
              <span className="text-[#4E9C70]">
                Applications.
              </span>
            </h1>

            <p className="mt-2 text-sm text-[#849688]">
              Review organizer requests and manage
              application decisions.
            </p>
          </div>

          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE7D9] bg-white px-5 py-3 text-xs font-bold text-[#173B2F] shadow-sm transition hover:bg-[#EDF5EC] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading ? "animate-spin" : ""
              }
            />
            Refresh Applications
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map(card => (
            <StatCard
              key={card.key}
              {...card}
              active={filter === card.key}
              onClick={() => {
                setFilter(card.key);
                setPage(1);
              }}
            />
          ))}
        </div>

        {notice && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-[#CBE8D1] bg-[#ECF8EE] p-4 text-sm font-medium text-[#277245]"
          >
            <CheckCircle2
              size={18}
              className="shrink-0"
            />

            <span className="flex-1">
              {notice}
            </span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && !confirmAction && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle
              size={18}
              className="shrink-0"
            />

            <span className="flex-1">
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-[24px] border border-[#E0E9DE] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9EFE7] px-5 py-5 sm:px-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black tracking-tight text-[#173B2F]">
                  Application Records
                </h2>

                <span className="rounded-full bg-[#EAF3E8] px-3 py-1 text-[11px] font-black text-[#347B54]">
                  {formatNumber(
                    filteredApplications.length
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#90A093]">
                Manage all organizer applications
                in one place.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#849688]">
              <ShieldCheck
                size={16}
                className="text-[#347B54]"
              />
              Administrator Access
            </div>
          </div>

          <div className="grid gap-3 border-b border-[#E9EFE7] p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-[minmax(240px,1fr)_190px_190px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9D8E]"
              />

              <input
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search applicants or organizations..."
                className="w-full rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-11 pr-4 text-xs text-[#173B2F] outline-none focus:border-[#347B54]"
              />
            </div>

            <select
              value={filter}
              onChange={event => {
                setFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] px-4 py-3.5 text-xs font-semibold text-[#486451] outline-none"
            >
              <option value="all">
                All Statuses
              </option>
              <option value="pending">
                Pending Review
              </option>
              <option value="approved">
                Approved
              </option>
              <option value="rejected">
                Rejected
              </option>
            </select>

            <div className="relative">
              <ArrowUpDown
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9D8E]"
              />

              <select
                value={sort}
                onChange={event => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-9 pr-3 text-xs font-semibold text-[#486451] outline-none"
              >
                <option value="newest">
                  Newest First
                </option>
                <option value="oldest">
                  Oldest First
                </option>
                <option value="name">
                  Applicant Name
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({
                length: 5
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-[#EDF3EB]"
                />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#347B54]">
                <ClipboardList size={28} />
              </div>

              <h3 className="mt-5 text-lg font-black text-[#173B2F]">
                No applications found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#8A9A8D]">
                Applications matching your filters
                will appear here.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                  setSort("newest");
                  setPage(1);
                }}
                className="mt-5 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-[#F8FAF7]">
                  <tr className="text-[10px] font-black uppercase tracking-[0.12em] text-[#829586]">
                    <th className="px-6 py-4">
                      Applicant
                    </th>
                    <th className="px-4 py-4">
                      Organization
                    </th>
                    <th className="px-4 py-4">
                      Applied Date
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
                  {visibleApplications.map(
                    application => {
                      const id =
                        getApplicationId(
                          application
                        );

                      const status =
                        getStatus(application);

                      const isPending =
                        status === "pending";

                      return (
                        <tr
                          key={id}
                          className="transition hover:bg-[#FAFCF9]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3E8] text-[#347B54]">
                                <UserRound size={20} />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[200px] truncate text-xs font-black text-[#173B2F]">
                                  {getApplicantName(
                                    application
                                  )}
                                </p>

                                <p className="mt-1 max-w-[200px] truncate text-[11px] text-[#8C9E90]">
                                  {application.email ||
                                    "No email"}
                                </p>

                                {application.username && (
                                  <p className="mt-1 text-[10px] text-[#A1AFA3]">
                                    @{application.username}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p className="max-w-[210px] truncate text-xs font-bold text-[#294A37]">
                              {application.organizationName ||
                                "Individual Organizer"}
                            </p>

                            <p className="mt-1 text-[11px] capitalize text-[#96A497]">
                              {application.organizationType ||
                                "Individual"}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-xs font-semibold text-[#486452]">
                              {formatDate(
                                application.createdAt ||
                                application.organizerAppliedAt
                              )}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge
                              status={status}
                            />
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                title="View application"
                                aria-label="View application"
                                onClick={() =>
                                  setSelected(
                                    application
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E0E8DF] bg-white text-[#657A69] transition hover:bg-[#F0F5EF]"
                              >
                                <Eye size={16} />
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    title="Approve application"
                                    aria-label="Approve application"
                                    disabled={
                                      Boolean(busyId)
                                    }
                                    onClick={() =>
                                      openReview(
                                        application,
                                        "approve"
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8EADD] bg-[#F0F8F1] text-[#347B54] transition hover:bg-[#E0F1E4] disabled:opacity-40"
                                  >
                                    <Check size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Reject application"
                                    aria-label="Reject application"
                                    disabled={
                                      Boolean(busyId)
                                    }
                                    onClick={() =>
                                      openReview(
                                        application,
                                        "reject"
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#F3DAD7] bg-[#FFF3F1] text-[#BC6259] transition hover:bg-[#FBE5E2] disabled:opacity-40"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading &&
            filteredApplications.length >
              PAGE_SIZE && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E9EFE7] px-5 py-5 sm:px-6">
                <p className="text-xs text-[#87998A]">
                  Showing{" "}
                  <strong className="text-[#173B2F]">
                    {(currentPage - 1) *
                      PAGE_SIZE +
                      1}
                    {"–"}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredApplications.length
                    )}
                  </strong>
                  {" of "}
                  {formatNumber(
                    filteredApplications.length
                  )}
                  {" applications"}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setPage(
                        currentPage - 1
                      )
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
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setPage(
                        currentPage + 1
                      )
                    }
                    className="rounded-xl border border-[#DDE7D9] p-2.5 text-[#173B2F] disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
        </section>

        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B2119]/70 p-3 backdrop-blur-sm sm:p-6">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Organizer application details"
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[26px] bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#EAF0E8] p-6 sm:p-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#4E9C70]">
                    ORGANIZER APPLICATION
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#173B2F]">
                    Application Details
                  </h2>

                  <p className="mt-2 text-xs text-[#819385]">
                    Review the applicant's
                    submitted information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(null)
                  }
                  aria-label="Close details"
                  className="rounded-xl bg-[#F0F5EF] p-2.5 text-[#173B2F]"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#347B54]">
                    <UserRound size={28} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-[#173B2F]">
                      {getApplicantName(
                        selected
                      )}
                    </h3>

                    <p className="mt-1 break-all text-xs text-[#8B9D8F]">
                      {selected.email ||
                        "Email unavailable"}
                    </p>
                  </div>

                  <StatusBadge
                    status={getStatus(
                      selected
                    )}
                  />
                </div>

                <div className="mt-7 grid gap-x-6 sm:grid-cols-2">
                  <DetailItem
                    icon={UserRound}
                    label="Username"
                    value={
                      selected.username
                        ? `@${selected.username}`
                        : "—"
                    }
                  />

                  <DetailItem
                    icon={Mail}
                    label="Email Address"
                    value={selected.email}
                  />

                  <DetailItem
                    icon={Building2}
                    label="Organization Name"
                    value={
                      selected.organizationName ||
                      "Individual Organizer"
                    }
                  />

                  <DetailItem
                    icon={Users}
                    label="Organization Type"
                    value={
                      selected.organizationType
                    }
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Application Date"
                    value={formatDate(
                      selected.createdAt ||
                      selected.organizerAppliedAt
                    )}
                  />

                  <DetailItem
                    icon={ShieldCheck}
                    label="Review Date"
                    value={formatDate(
                      selected.organizerReviewedAt
                    )}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] p-5">
                  <div className="flex items-center gap-2 text-[#347B54]">
                    <FileText size={17} />

                    <h4 className="text-xs font-black uppercase tracking-wider">
                      Reason for Applying
                    </h4>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#486452]">
                    {selected.reason ||
                      "No reason provided."}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] p-5">
                  <div className="flex items-center gap-2 text-[#347B54]">
                    <ClipboardList size={17} />

                    <h4 className="text-xs font-black uppercase tracking-wider">
                      Previous Event Experience
                    </h4>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#486452]">
                    {selected.experience ||
                      "No previous experience provided."}
                  </p>
                </div>

                {getStatus(selected) !== "pending" && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-[#DCE8D9] bg-white">
                    <div className="flex items-center gap-3 border-b border-[#EAF0E8] bg-[#F5F9F3] px-5 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1E5] text-[#347B54]">
                        <ShieldCheck size={19} />
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-[#173B2F]">
                          Administrator Review History
                        </h4>

                        <p className="mt-1 text-[11px] text-[#819385]">
                          Review decision and administrator information
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#F7FAF5] p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#91A194]">
                          Review Decision
                        </p>

                        <div className="mt-3">
                          <StatusBadge
                            status={getStatus(selected)}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#F7FAF5] p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#91A194]">
                          Date Reviewed
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-sm font-bold text-[#173B2F]">
                          <CalendarDays
                            size={16}
                            className="shrink-0 text-[#347B54]"
                          />

                          {formatDate(
                            selected.organizerReviewedAt
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#F7FAF5] p-4 sm:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#91A194]">
                          Reviewed By
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1E5] text-[#347B54]">
                            <UserRound size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-[#173B2F]">
                              {getReviewerName(selected)}
                            </p>

                            <p className="mt-1 text-[11px] text-[#819385]">
                              Administrator
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selected.reviewNote && (
                      <div className="border-t border-[#EAF0E8] px-5 py-5">
                        <div className="flex items-center gap-2 text-[#347B54]">
                          <FileText size={16} />

                          <h5 className="text-[11px] font-black uppercase tracking-wider">
                            Administrator's Review Note
                          </h5>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#F5F9F3] p-4 text-sm leading-7 text-[#486452]">
                          {selected.reviewNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-[#EAF0E8] pt-6">
                  <button
                    type="button"
                    onClick={() =>
                      setSelected(null)
                    }
                    className="rounded-xl border border-[#DCE8D9] px-5 py-3 text-xs font-bold text-[#173B2F]"
                  >
                    Close Details
                  </button>

                  {getStatus(selected) ===
                    "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          openReview(
                            selected,
                            "reject"
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FFF0EE] px-5 py-3 text-xs font-bold text-[#BC5850]"
                      >
                        <X size={15} />
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openReview(
                            selected,
                            "approve"
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white"
                      >
                        <Check size={15} />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmAction && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0B2119]/70 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Confirm application review"
              className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl sm:p-8"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  confirmAction.action ===
                  "approve"
                    ? "bg-[#EAF5EB] text-[#347B54]"
                    : "bg-[#FFF0EE] text-[#BC5850]"
                }`}
              >
                {confirmAction.action ===
                "approve" ? (
                  <CheckCircle2 size={28} />
                ) : (
                  <XCircle size={28} />
                )}
              </div>

              <h2 className="mt-5 text-xl font-black text-[#173B2F]">
                {confirmAction.action ===
                "approve"
                  ? "Approve Application?"
                  : "Reject Application?"}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#788A7C]">
                Are you sure you want to{" "}
                <strong>
                  {confirmAction.action}
                </strong>{" "}
                the application of{" "}
                <strong className="text-[#173B2F]">
                  {getApplicantName(
                    confirmAction.application
                  )}
                </strong>
                ?
              </p>

              {confirmAction.action ===
                "approve" && (
                <p className="mt-3 rounded-xl bg-[#EFF7EE] p-3 text-xs leading-6 text-[#347B54]">
                  Approving this application
                  grants organizer access
                  to the applicant.
                </p>
              )}

              <div className="mt-5">
                <label
                  htmlFor="reviewNote"
                  className="mb-2 block text-xs font-bold text-[#294A37]"
                >
                  Administrator Review Note{" "}
                  <span className="font-normal text-[#94A396]">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="reviewNote"
                  value={reviewNote}
                  onChange={event =>
                    setReviewNote(
                      event.target.value
                    )
                  }
                  rows={4}
                  maxLength={1000}
                  placeholder="Write a note about your decision..."
                  className="w-full resize-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] p-4 text-sm leading-6 text-[#173B2F] outline-none focus:border-[#347B54]"
                />

                <p className="mt-2 text-right text-[11px] text-[#91A194]">
                  {reviewNote.length}/1000
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700"
                >
                  {error}
                </div>
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
                  onClick={submitReview}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold text-white disabled:opacity-50 ${
                    confirmAction.action ===
                    "approve"
                      ? "bg-[#173B2F] hover:bg-[#285541]"
                      : "bg-[#BD554D] hover:bg-[#A7433B]"
                  }`}
                >
                  {busyId
                    ? "Processing..."
                    : confirmAction.action ===
                        "approve"
                      ? "Approve"
                      : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
