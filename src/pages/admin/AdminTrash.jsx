
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Trash2,
  Search,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  X,
  Mail,
  CalendarDays,
  UserRound,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock3
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const API = `${API_URL}/api/admin`;
const PAGE_SIZE = 8;

const getToken = () =>
  sessionStorage.getItem("anoGToken") || "";

const request = async (path, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Session expired. Please log in again."
    );
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      throw new Error(
        data.message ||
        "Your administrator session is invalid. Please log in again."
      );
    }

    throw new Error(
      data.message ||
      "Unable to complete the request."
    );
  }

  return data;
};

const formatDate = value => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const formatRole = role =>
  ({
    admin: "Administrator",
    organizer: "Organizer",
    attendee: "Attendee"
  })[role] || "Attendee";

const getName = user =>
  user?.fullName?.trim() ||
  user?.username ||
  "Unknown User";

const getInitials = user =>
  getName(user)
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase();

const Avatar = ({ user, size = "md" }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [user?.profilePicture]);

  const dimensions =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : "h-12 w-12 text-sm";

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E7F1E9] font-bold text-[#173B2F]`}
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

const EmailBadge = ({ status }) => {
  const settings = {
    sent: {
      label: "Email Submitted",
      Icon: CheckCircle2,
      color: "bg-green-50 text-green-700"
    },
    failed: {
      label: "Email Failed",
      Icon: XCircle,
      color: "bg-red-50 text-red-700"
    },
    pending: {
      label: "Email Pending",
      Icon: Clock3,
      color: "bg-amber-50 text-amber-700"
    },
    not_required: {
      label: "Not Required",
      Icon: Mail,
      color: "bg-gray-100 text-gray-600"
    }
  };

  const current =
    settings[status] || settings.not_required;

  const Icon = current.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${current.color}`}
    >
      <Icon size={13} />
      {current.label}
    </span>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "green"
}) => {
  const iconColor =
    color === "red"
      ? "bg-red-50 text-red-600"
      : color === "amber"
      ? "bg-amber-50 text-amber-600"
      : "bg-[#E8F2EA] text-[#318254]";

  return (
    <div className="rounded-2xl border border-[#E4EAE3] bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColor}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <p className="text-3xl font-black text-[#173B2F]">
        {value}
      </p>

      <p className="mt-1 text-sm text-[#778C7D]">
        {title}
      </p>
    </div>
  );
};

export default function AdminTrash() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadUsers = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await request("/trash/users");

      setUsers(
        Array.isArray(data.users)
          ? data.users
          : []
      );
    } catch (err) {
      setError(
        err.message ||
        "Unable to load deleted users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === "Escape" && !processing) {
        setModal(null);
        setSelectedUser(null);
        setReason("");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [processing]);

  const stats = useMemo(
    () => ({
      total: users.length,
      submitted: users.filter(
        user => user.deletionEmailStatus === "sent"
      ).length,
      failed: users.filter(
        user => user.deletionEmailStatus === "failed"
      ).length,
      pending: users.filter(
        user => user.deletionEmailStatus === "pending"
      ).length
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter(user =>
      [
        user.fullName,
        user.username,
        user.email,
        user.role,
        user.deletionReason,
        user.deletedBy?.fullName,
        user.deletedBy?.username
      ].some(value =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [users, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openModal = (type, user) => {
    setError("");
    setSuccess("");
    setReason("");
    setModal({ type, user });
  };

  const closeModal = () => {
    if (processing) return;

    setModal(null);
    setReason("");
  };

  const handleConfirm = async () => {
    if (!modal || processing) return;

    const { type, user } = modal;

    const deletionReason = reason.trim();

    if (
      type === "permanent" &&
      (
        deletionReason.length < 10 ||
        deletionReason.length > 1000
      )
    ) {
      setError(
        "Permanent deletion reason must contain 10 to 1000 characters."
      );
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      let data;

      if (type === "restore") {
        data = await request(
          `/trash/users/${user._id}/restore`,
          {
            method: "PATCH",
            body: JSON.stringify({})
          }
        );
      } else {
        data = await request(
          `/trash/users/${user._id}/permanent`,
          {
            method: "DELETE",
            body: JSON.stringify({
              reason: deletionReason
            })
          }
        );
      }

      setSuccess(
        data.message ||
        (
          type === "restore"
            ? "User account restored successfully."
            : "User account permanently deleted."
        )
      );

      setModal(null);
      setSelectedUser(null);
      setReason("");

      setUsers(previous =>
        previous.filter(
          item => item._id !== user._id
        )
      );

      await loadUsers(true);
    } catch (err) {
      setError(
        err.message ||
        "Unable to complete the operation."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2F7953]">
            ANO G? ADMINISTRATION
          </p>

          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-[#173B2F]">
            <Trash2 size={30} />
            Trash / Archive
          </h1>

          <p className="mt-2 text-sm text-[#849488]">
            Review deleted accounts, restore users, or permanently remove records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadUsers(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E0E8DF] bg-white px-5 py-3 text-sm font-semibold text-[#173B2F] transition hover:bg-[#F2F5EF] disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "animate-spin" : ""
            }
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />
            <span>{success}</span>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Deleted Accounts"
          value={stats.total}
          icon={Trash2}
        />

        <StatCard
          title="Email Submitted"
          value={stats.submitted}
          icon={Mail}
        />

        <StatCard
          title="Email Failed"
          value={stats.failed}
          icon={XCircle}
          color="red"
        />

        <StatCard
          title="Email Pending"
          value={stats.pending}
          icon={Clock3}
          color="amber"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E3EAE2] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#E8EEE7] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#173B2F]">
              Deleted Users
            </h2>

            <p className="mt-1 text-xs text-[#849488]">
              {filteredUsers.length} account(s) found
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A79B]"
            />

            <input
              type="search"
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder="Search deleted users..."
              className="w-full rounded-xl border border-[#E1E8E0] bg-[#F8FAF7] py-3 pl-12 pr-4 text-sm outline-none focus:border-[#318254]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#F7F9F6]">
              <tr className="text-xs font-bold uppercase text-[#7B9081]">
                <th className="px-6 py-4">
                  User
                </th>
                <th className="px-5 py-4">
                  Role
                </th>
                <th className="px-5 py-4">
                  Deleted At
                </th>
                <th className="px-5 py-4">
                  Email Status
                </th>
                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEF1ED]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center"
                  >
                    <Loader2
                      size={30}
                      className="mx-auto animate-spin text-[#318254]"
                    />
                    <p className="mt-3 text-sm text-[#819287]">
                      Loading deleted users...
                    </p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center"
                  >
                    <Trash2
                      size={35}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-4 font-bold text-[#173B2F]">
                      {error
                        ? "Unable to load deleted users"
                        : search
                        ? "No matching users"
                        : "Trash is empty"}
                    </p>

                    <p className="mt-2 text-sm text-[#819287]">
                      {error
                        ? "Check your administrator session and try refreshing."
                        : search
                        ? "Try another search keyword."
                        : "Soft-deleted users will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => (
                  <tr
                    key={user._id}
                    className="transition hover:bg-[#FAFCF9]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-bold text-[#173B2F]">
                            {getName(user)}
                          </p>

                          <p className="max-w-[220px] truncate text-xs text-[#849488]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {formatRole(user.role)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#617568]">
                      {formatDate(user.deletedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <EmailBadge
                        status={user.deletionEmailStatus}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedUser(user)
                          }
                          className="rounded-xl border border-[#E0E8DF] px-3 py-2.5 text-xs font-semibold text-[#173B2F] transition hover:bg-[#F2F5EF]"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openModal("restore", user)
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                        >
                          <RotateCcw size={15} />
                          Restore
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openModal("permanent", user)
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#E8EEE7] px-6 py-5">
          <p className="text-xs text-[#819287]">
            Showing{" "}
            {filteredUsers.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            {" – "}
            {Math.min(
              currentPage * PAGE_SIZE,
              filteredUsers.length
            )}
            {" of "}
            {filteredUsers.length}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setPage(currentPage - 1)
              }
              className="rounded-lg border p-2 disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="text-sm font-semibold">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage(currentPage + 1)
              }
              className="rounded-lg border p-2 disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trash-details-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b p-6">
              <div>
                <h2
                  id="trash-details-title"
                  className="text-xl font-black text-[#173B2F]"
                >
                  Deleted Account Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review this account's deletion information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-center gap-4">
                <Avatar
                  user={selectedUser}
                  size="lg"
                />

                <div>
                  <h3 className="text-lg font-black text-[#173B2F]">
                    {getName(selectedUser)}
                  </h3>

                  <p className="text-sm text-gray-500">
                    @{selectedUser.username}
                  </p>

                  <div className="mt-2">
                    <EmailBadge
                      status={
                        selectedUser.deletionEmailStatus
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5 rounded-xl bg-[#F7F9F6] p-5">
                <div className="flex items-start gap-3">
                  <Mail
                    size={18}
                    className="mt-1 text-[#71907B]"
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Email Address
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-[#173B2F]">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users
                    size={18}
                    className="mt-1 text-[#71907B]"
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Account Role
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#173B2F]">
                      {formatRole(selectedUser.role)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={18}
                    className="mt-1 text-[#71907B]"
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Deleted At
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#173B2F]">
                      {formatDate(selectedUser.deletedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserRound
                    size={18}
                    className="mt-1 text-[#71907B]"
                  />

                  <div>
                    <p className="text-xs text-gray-500">
                      Deleted By
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#173B2F]">
                      {selectedUser.deletedBy?.fullName ||
                        selectedUser.deletedBy?.username ||
                        "Administrator"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Deletion Reason
                  </p>

                  <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm leading-6 text-[#173B2F]">
                    {selectedUser.deletionReason ||
                      "No reason recorded."}
                  </p>
                </div>

                {selectedUser.deletionEmailSentAt && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Email Submitted At
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#173B2F]">
                      {formatDate(
                        selectedUser.deletionEmailSentAt
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t p-6">
              <button
                type="button"
                onClick={() => {
                  const user = selectedUser;
                  setSelectedUser(null);
                  openModal("restore", user);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-sm font-semibold text-white"
              >
                <RotateCcw size={16} />
                Restore
              </button>

              <button
                type="button"
                onClick={() => {
                  const user = selectedUser;
                  setSelectedUser(null);
                  openModal("permanent", user);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
              >
                <Trash2 size={16} />
                Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="trash-confirm-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
          >
            <div
              className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                modal.type === "restore"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {modal.type === "restore" ? (
                <RotateCcw size={26} />
              ) : (
                <ShieldAlert size={26} />
              )}
            </div>

            <h2
              id="trash-confirm-title"
              className="text-xl font-black text-[#173B2F]"
            >
              {modal.type === "restore"
                ? "Restore User Account"
                : "Permanently Delete Account"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {modal.type === "restore" ? (
                <>
                  Restore{" "}
                  <strong>
                    {getName(modal.user)}
                  </strong>
                  ? Their account will be reactivated
                  and they will be able to log in again.
                </>
              ) : (
                <>
                  You are about to permanently delete{" "}
                  <strong>
                    {getName(modal.user)}
                  </strong>
                  . This action cannot be undone.
                </>
              )}
            </p>

            {modal.type === "permanent" && (
              <>
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                  <AlertTriangle
                    size={19}
                    className="shrink-0"
                  />

                  <p>
                    The backend will attempt to submit
                    a final deletion email before removing
                    the account. If email submission fails,
                    the account will remain in Trash.
                    Related records may also prevent deletion.
                  </p>
                </div>

                <label
                  htmlFor="permanent-reason"
                  className="mt-6 block text-sm font-bold text-[#173B2F]"
                >
                  Reason for Permanent Deletion
                  <span className="text-red-600">
                    {" "}*
                  </span>
                </label>

                <textarea
                  id="permanent-reason"
                  value={reason}
                  onChange={event =>
                    setReason(
                      event.target.value.slice(0, 1000)
                    )
                  }
                  rows={5}
                  disabled={processing}
                  placeholder="Explain why this account must be permanently deleted..."
                  className="mt-2 w-full resize-none rounded-xl border border-[#DDE6DD] p-4 text-sm outline-none focus:border-[#318254]"
                />

                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>
                    Minimum 10 characters
                  </span>
                  <span>
                    {reason.trim().length}/1000
                  </span>
                </div>
              </>
            )}

            {modal.type === "restore" && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-xs leading-5 text-green-800">
                <CheckCircle2
                  size={19}
                  className="shrink-0"
                />

                <p>
                  This user will be removed from Trash
                  and returned to User Management.
                </p>
              </div>
            )}

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={processing}
                onClick={closeModal}
                className="rounded-xl border border-[#E0E8DF] px-5 py-3 text-sm font-semibold text-[#173B2F] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  processing ||
                  (
                    modal.type === "permanent" &&
                    reason.trim().length < 10
                  )
                }
                onClick={handleConfirm}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                  modal.type === "restore"
                    ? "bg-[#173B2F] hover:bg-[#285742]"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : modal.type === "restore" ? (
                  <RotateCcw size={17} />
                ) : (
                  <Trash2 size={17} />
                )}

                {processing
                  ? "Processing..."
                  : modal.type === "restore"
                  ? "Restore Account"
                  : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
