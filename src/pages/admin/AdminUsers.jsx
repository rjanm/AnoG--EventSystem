
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Search,
  RefreshCw,
  Users,
  UserRound,
  ShieldCheck,
  UserX,
  Eye,
  X,
  Mail,
  Phone,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Trash2,
  Archive,
  RotateCcw,
  ArrowUpDown,
  UserCheck,
  LockKeyhole
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const PAGE_SIZE = 8;

const formatDate = value => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const formatRole = role =>
  ({
    admin: "Administrator",
    organizer: "Organizer",
    attendee: "Attendee",
    user: "Attendee"
  })[role] || "Attendee";

const getInitials = user =>
  (user?.fullName || user?.username || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase();

const getName = user =>
  user?.fullName || user?.username || "Unknown User";

const Avatar = ({ user, size = "md" }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [user?.profilePicture]);

  const dimensions =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : "h-11 w-11 text-sm";

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#E6F2E8] font-black text-[#347B54]`}
    >
      {user?.profilePicture && !failed ? (
        <img
          src={user.profilePicture}
          alt={`${getName(user)} profile`}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(user)
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const active = status !== "suspended";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ${active
        ? "bg-[#E6F5E9] text-[#28784A]"
        : "bg-[#FDECEB] text-[#B9554D]"
        }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#40A769]" : "bg-[#D66A61]"
          }`}
      />

      {active ? "Active" : "Suspended"}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const style =
    role === "admin"
      ? "bg-[#E9EDF9] text-[#5365A2]"
      : role === "organizer"
        ? "bg-[#E6F5E9] text-[#28784A]"
        : "bg-[#F0F3EF] text-[#708375]";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ${style}`}
    >
      {formatRole(role)}
    </span>
  );
};

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  selected,
  onClick
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-[22px] border p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${selected
      ? "border-[#173B2F] bg-[#173B2F] text-white"
      : "border-[#E0E9DE] bg-white text-[#173B2F]"
      }`}
  >
    <div className="flex items-start justify-between gap-3">
      <p
        className={`text-[11px] font-black uppercase tracking-wider ${selected ? "text-white/65" : "text-[#849487]"
          }`}
      >
        {title}
      </p>

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected
          ? "bg-white/10 text-[#B9EAC9]"
          : "bg-[#EEF5EC] text-[#347B54]"
          }`}
      >
        <Icon size={19} />
      </div>
    </div>

    <p className="mt-4 text-3xl font-black">
      {Number(value).toLocaleString("en-PH")}
    </p>

    <p
      className={`mt-1 text-[11px] ${selected ? "text-white/60" : "text-[#91A194]"
        }`}
    >
      {description}
    </p>
  </button>
);

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 border-b border-[#EDF2EA] py-4 last:border-0">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF4EB] text-[#347B54]">
      <Icon size={17} />
    </div>

    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#93A296]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#294A37]">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updating, setUpdating] = useState(false);

  const request = useCallback(async (path, options = {}) => {
    const token = sessionStorage.getItem("anoGToken");

    if (!token) {
      throw new Error("Session expired. Please log in again.");
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || `Request failed (${response.status}).`
      );
    }

    return data;
  }, []);

  const loadUsers = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const data = await request("/api/admin/users");

        setUsers(
          Array.isArray(data.users)
            ? data.users.filter(user => !user.isDeleted)
            : []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [request]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, sort]);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === "Escape" && !updating) {
        setDeleteTarget(null);
        setConfirmAction(null);
        setSelectedUser(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, [updating]);

  const stats = useMemo(
    () => ({
      total: users.length,
      attendees: users.filter(
        user =>
          user.role === "attendee" ||
          user.role === "user"
      ).length,
      organizers: users.filter(
        user => user.role === "organizer"
      ).length,
      suspended: users.filter(
        user => user.accountStatus === "suspended"
      ).length
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = users.filter(user => {
      const matchesSearch =
        !query ||
        [user.fullName, user.username, user.email].some(value =>
          String(value || "").toLowerCase().includes(query)
        );

      const normalizedRole =
        user.role === "user" ? "attendee" : user.role;

      const matchesRole =
        roleFilter === "all" ||
        normalizedRole === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? user.accountStatus !== "suspended"
          : user.accountStatus === "suspended");

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });

    result.sort((a, b) => {
      const aIsAdmin = a.role === "admin";
      const bIsAdmin = b.role === "admin";

      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;

      if (sort === "name") {
        return getName(a).localeCompare(getName(b));
      }

      if (sort === "oldest") {
        return (
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
        );
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

    return result;
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    sort
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const selectStat = type => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);

    if (type === "attendees") {
      setRoleFilter("attendee");
    }

    if (type === "organizers") {
      setRoleFilter("organizer");
    }

    if (type === "suspended") {
      setStatusFilter("suspended");
    }
  };

  const activeStat =
    !search &&
      statusFilter === "suspended" &&
      roleFilter === "all"
      ? "suspended"
      : !search &&
        roleFilter === "attendee" &&
        statusFilter === "all"
        ? "attendees"
        : !search &&
          roleFilter === "organizer" &&
          statusFilter === "all"
          ? "organizers"
          : !search &&
            roleFilter === "all" &&
            statusFilter === "all"
            ? "total"
            : "";

  const openDetails = async user => {
    setSelectedUser(user);
    setDetailsLoading(true);
    setError("");

    try {
      const data = await request(
        `/api/admin/users/${user._id}`
      );

      if (data.user) {
        setSelectedUser(data.user);
      }
    } catch (err) {
      setError(err.message);
      setSelectedUser(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!confirmAction || updating) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const { user, accountStatus } = confirmAction;

      if (user.role === "admin") {
        throw new Error(
          "Administrator accounts cannot be modified."
        );
      }

      const data = await request(
        `/api/admin/users/${user._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ accountStatus })
        }
      );

      const updatedUser = data.user || {
        ...user,
        accountStatus
      };

      setUsers(previous =>
        previous.map(item =>
          item._id === user._id
            ? updatedUser
            : item
        )
      );

      setSelectedUser(previous =>
        previous?._id === user._id
          ? updatedUser
          : previous
      );

      setSuccess(
        data.message ||
        "Account status updated successfully."
      );

      setConfirmAction(null);
    } catch (err) {
      setError(err.message);
      setConfirmAction(null);
    } finally {
      setUpdating(false);
    }
  };

  const openDelete = user => {
    if (!user || user.role === "admin" || updating) {
      return;
    }

    setDeleteTarget(user);
    setError("");
    setSuccess("");
  };

  const moveToTrash = async () => {
    if (!deleteTarget || updating) return;

    const target = deleteTarget;

    if (target.role === "admin") {
      setError(
        "Administrator accounts cannot be moved to Trash."
      );
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const data = await request(
        `/api/admin/users/${target._id}`,
        {
          method: "DELETE",
          body: JSON.stringify({ reason: "" })
        }
      );

      setUsers(previous =>
        previous.filter(
          user => user._id !== target._id
        )
      );

      setSelectedUser(null);
      setDeleteTarget(null);

      setSuccess(
        data.message ||
        "Account moved to Trash successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const statCards = [
    {
      key: "total",
      title: "Total Users",
      value: stats.total,
      description: "Registered accounts",
      icon: Users
    },
    {
      key: "attendees",
      title: "Attendees",
      value: stats.attendees,
      description: "Event participants",
      icon: UserRound
    },
    {
      key: "organizers",
      title: "Organizers",
      value: stats.organizers,
      description: "Approved organizers",
      icon: ShieldCheck
    },
    {
      key: "suspended",
      title: "Suspended",
      value: stats.suspended,
      description: "Restricted accounts",
      icon: UserX
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
              User{" "}
              <span className="text-[#4E9C70]">
                Management.
              </span>
            </h1>

            <p className="mt-2 text-sm text-[#849688]">
              Manage registered accounts, monitor user access,
              and organize account records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadUsers(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE7D9] bg-white px-5 py-3 text-xs font-bold text-[#173B2F] shadow-sm transition hover:bg-[#EDF5EC] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            Refresh Users
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map(({ key, ...card }) => (
            <StatCard
              key={key}
              {...card}
              selected={activeStat === key}
              onClick={() => selectStat(key)}
            />
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertTriangle
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

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-[#CBE8D1] bg-[#ECF8EE] p-4 text-sm font-medium text-[#277245]"
          >
            <CheckCircle2
              size={18}
              className="shrink-0"
            />

            <span className="flex-1">
              {success}
            </span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss message"
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
                  User Directory
                </h2>

                <span className="rounded-full bg-[#EAF3E8] px-3 py-1 text-[11px] font-black text-[#347B54]">
                  {filteredUsers.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#90A093]">
                View and manage account records.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#849688]">
              <LockKeyhole
                size={15}
                className="text-[#347B54]"
              />
              Secure Administration
            </div>
          </div>

          <div className="grid gap-3 border-b border-[#E9EFE7] p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-[minmax(220px,1fr)_170px_170px_170px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9D8E]"
              />

              <input
                value={search}
                onChange={event =>
                  setSearch(event.target.value)
                }
                placeholder="Search name, username or email..."
                className="w-full rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-11 pr-4 text-xs text-[#173B2F] outline-none focus:border-[#347B54]"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9D8E]"
              />

              <select
                value={roleFilter}
                onChange={event =>
                  setRoleFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-9 pr-3 text-xs font-semibold text-[#486451] outline-none"
              >
                <option value="all">
                  All Roles
                </option>
                <option value="attendee">
                  Attendees
                </option>
                <option value="organizer">
                  Organizers
                </option>
                <option value="admin">
                  Administrators
                </option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={event =>
                setStatusFilter(event.target.value)
              }
              className="w-full rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] px-4 py-3.5 text-xs font-semibold text-[#486451] outline-none"
            >
              <option value="all">
                All Statuses
              </option>
              <option value="active">
                Active
              </option>
              <option value="suspended">
                Suspended
              </option>
            </select>

            <div className="relative">
              <ArrowUpDown
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9D8E]"
              />

              <select
                value={sort}
                onChange={event =>
                  setSort(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-9 pr-3 text-xs font-semibold text-[#486451] outline-none"
              >
                <option value="newest">
                  Newest First
                </option>
                <option value="oldest">
                  Oldest First
                </option>
                <option value="name">
                  Name A–Z
                </option>
              </select>
            </div>
          </div>

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
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#347B54]">
                <Users size={28} />
              </div>

              <h3 className="mt-5 text-lg font-black text-[#173B2F]">
                No users found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#8A9A8D]">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                  setSort("newest");
                }}
                className="mt-5 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead className="bg-[#F8FAF7]">
                  <tr className="text-[10px] font-black uppercase tracking-[0.12em] text-[#829586]">
                    <th className="px-6 py-4">
                      User
                    </th>
                    <th className="px-4 py-4">
                      Role
                    </th>
                    <th className="px-4 py-4">
                      Joined
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
                  {paginatedUsers.map(user => (
                    <tr
                      key={user._id}
                      className={`transition ${user.role === "admin"
                        ? "bg-[#DDEEDD] hover:bg-[#CDE5CD]"
                        : "hover:bg-[#FAFCF9]"
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="max-w-[230px] truncate text-xs font-black text-[#173B2F]">
                                {getName(user)}
                              </p>

                              {user.role === "admin" && (
                                <ShieldCheck
                                  size={14}
                                  className="shrink-0 text-[#347B54]"
                                />
                              )}
                            </div>

                            <p className="mt-1 max-w-[230px] truncate text-[11px] text-[#8C9E90]">
                              {user.email || "No email"}
                            </p>

                            {user.username && (
                              <p className="mt-1 text-[10px] text-[#A1AFA3]">
                                @{user.username}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-[#486452]">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={user.accountStatus}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openDetails(user)
                            }
                            title="View user details"
                            className="inline-flex items-center gap-2 rounded-xl border border-[#E0E8DF] bg-white px-3 py-2.5 text-xs font-bold text-[#173B2F] transition hover:bg-[#F0F5EF]"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          {user.role !== "admin" && (
                            <button
                              type="button"
                              onClick={() =>
                                openDelete(user)
                              }
                              disabled={updating}
                              title="Move account to Trash"
                              className="inline-flex items-center gap-2 rounded-xl border border-[#F3DAD7] bg-[#FFF3F1] px-3 py-2.5 text-xs font-bold text-[#BC6259] transition hover:bg-[#FBE5E2] disabled:opacity-40"
                            >
                              <Trash2 size={15} />
                              Trash
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E9EFE7] px-5 py-5 sm:px-6">
              <p className="text-xs text-[#87998A]">
                Showing{" "}
                <strong className="text-[#173B2F]">
                  {filteredUsers.length === 0
                    ? 0
                    : (currentPage - 1) *
                    PAGE_SIZE +
                    1}
                  {"–"}
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredUsers.length
                  )}
                </strong>
                {" of "}
                {filteredUsers.length} users
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
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
                    currentPage >= totalPages
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

        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B2119]/70 p-3 backdrop-blur-sm sm:p-6">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Account details"
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[26px] bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#EAF0E8] p-6 sm:p-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#4E9C70]">
                    USER MANAGEMENT
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#173B2F]">
                    Account Details
                  </h2>

                  <p className="mt-2 text-xs text-[#819385]">
                    Review account information and access.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    setSelectedUser(null)
                  }
                  aria-label="Close details"
                  className="rounded-xl bg-[#F0F5EF] p-2.5 text-[#173B2F] disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-16">
                  <Loader2
                    size={28}
                    className="animate-spin text-[#347B54]"
                  />

                  <p className="text-xs text-[#819385]">
                    Loading account details...
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-4">
                      <Avatar
                        user={selectedUser}
                        size="lg"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-[#173B2F]">
                          {getName(selectedUser)}
                        </h3>

                        <p className="mt-1 text-xs text-[#8B9D8F]">
                          @{selectedUser.username || "unknown"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <RoleBadge
                            role={selectedUser.role}
                          />

                          <StatusBadge
                            status={
                              selectedUser.accountStatus
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] px-5">
                      <DetailItem
                        icon={Mail}
                        label="Email Address"
                        value={selectedUser.email}
                      />

                      <DetailItem
                        icon={Phone}
                        label="Phone Number"
                        value={
                          selectedUser.phoneNumber ||
                          "Not provided"
                        }
                      />

                      <DetailItem
                        icon={CalendarDays}
                        label="Date Registered"
                        value={formatDate(
                          selectedUser.createdAt
                        )}
                      />

                      <DetailItem
                        icon={
                          selectedUser.emailVerified
                            ? UserCheck
                            : AlertTriangle
                        }
                        label="Email Verification"
                        value={
                          selectedUser.emailVerified
                            ? "Verified"
                            : "Not Verified"
                        }
                      />
                    </div>

                    {selectedUser.role === "admin" && (
                      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#DCE8D9] bg-[#F0F7EF] p-4">
                        <ShieldCheck
                          size={19}
                          className="shrink-0 text-[#347B54]"
                        />

                        <div>
                          <p className="text-xs font-black text-[#173B2F]">
                            Protected Administrator Account
                          </p>

                          <p className="mt-1 text-xs leading-6 text-[#718876]">
                            Administrator accounts cannot be suspended
                            or moved to Trash from this page.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 border-t border-[#EAF0E8] p-6 sm:px-8">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUser(null)
                      }
                      disabled={updating}
                      className="rounded-xl border border-[#DCE8D9] px-5 py-3 text-xs font-bold text-[#173B2F] disabled:opacity-50"
                    >
                      Close
                    </button>

                    {selectedUser.role !== "admin" && (
                      <>
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            setConfirmAction({
                              user: selectedUser,
                              accountStatus:
                                selectedUser.accountStatus ===
                                  "suspended"
                                  ? "active"
                                  : "suspended"
                            })
                          }
                          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white disabled:opacity-50 ${selectedUser.accountStatus ===
                            "suspended"
                            ? "bg-[#347B54]"
                            : "bg-[#BC6259]"
                            }`}
                        >
                          {selectedUser.accountStatus ===
                            "suspended" ? (
                            <RotateCcw size={15} />
                          ) : (
                            <UserX size={15} />
                          )}

                          {selectedUser.accountStatus ===
                            "suspended"
                            ? "Reactivate"
                            : "Suspend"}
                        </button>

                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            openDelete(selectedUser)
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                          Move to Trash
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {confirmAction && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0B2119]/70 p-4 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="status-title"
              className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl sm:p-8"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${confirmAction.accountStatus ===
                  "suspended"
                  ? "bg-[#FFF0EE] text-[#BC5850]"
                  : "bg-[#EAF5EB] text-[#347B54]"
                  }`}
              >
                {confirmAction.accountStatus ===
                  "suspended" ? (
                  <UserX size={27} />
                ) : (
                  <UserCheck size={27} />
                )}
              </div>

              <h2
                id="status-title"
                className="mt-5 text-xl font-black text-[#173B2F]"
              >
                {confirmAction.accountStatus ===
                  "suspended"
                  ? "Suspend Account?"
                  : "Reactivate Account?"}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#788A7C]">
                Are you sure you want to{" "}
                <strong>
                  {confirmAction.accountStatus ===
                    "suspended"
                    ? "suspend"
                    : "reactivate"}
                </strong>{" "}
                the account of{" "}
                <strong className="text-[#173B2F]">
                  {getName(confirmAction.user)}
                </strong>
                ?
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#E5ECE2] bg-[#FAFCF9] p-4">
                <Avatar
                  user={confirmAction.user}
                />

                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-[#173B2F]">
                    {getName(confirmAction.user)}
                  </p>

                  <p className="mt-1 truncate text-[11px] text-[#819385]">
                    {confirmAction.user.email}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    setConfirmAction(null)
                  }
                  className="flex-1 rounded-xl border border-[#DEE8DB] bg-white px-4 py-3 text-xs font-bold text-[#294A37] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={updateStatus}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold text-white disabled:opacity-50 ${confirmAction.accountStatus ===
                    "suspended"
                    ? "bg-[#BD554D]"
                    : "bg-[#173B2F]"
                    }`}
                >
                  {updating
                    ? "Updating..."
                    : confirmAction.accountStatus ===
                      "suspended"
                      ? "Suspend Account"
                      : "Reactivate Account"}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B2119]/70 p-4 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[26px] bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#347B54]">
                <Archive size={27} />
              </div>

              <h2
                id="delete-title"
                className="mt-5 text-xl font-black text-[#173B2F]"
              >
                Move Account to Trash?
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#788A7C]">
                You are about to move{" "}
                <strong className="text-[#173B2F]">
                  {getName(deleteTarget)}
                </strong>{" "}
                to Trash.
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#E5ECE2] bg-[#FAFCF9] p-4">
                <Avatar user={deleteTarget} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#173B2F]">
                    {getName(deleteTarget)}
                  </p>

                  <p className="mt-1 break-all text-xs text-[#819385]">
                    {deleteTarget.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4 rounded-2xl border border-[#DCE9DD] bg-[#F2F8F2] p-5">
                <div className="flex items-start gap-3">
                  <UserX
                    size={18}
                    className="mt-0.5 shrink-0 text-[#347B54]"
                  />

                  <p className="text-xs leading-6 text-[#365847]">
                    The account will be removed from the active
                    user list and its access will be disabled.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <RotateCcw
                    size={18}
                    className="mt-0.5 shrink-0 text-[#347B54]"
                  />

                  <p className="text-xs leading-6 text-[#365847]">
                    The account can be restored later from
                    the Trash or Archive section.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-6 text-[#819287]">
                This action uses soft deletion. The account
                record is retained, and no deletion reason
                is required.
              </p>

              <div className="mt-7 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  className="rounded-xl border border-[#DEE8DB] px-5 py-3 text-xs font-bold text-[#294A37] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={moveToTrash}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Archive size={16} />
                  )}

                  {updating
                    ? "Moving..."
                    : "Move to Trash"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
