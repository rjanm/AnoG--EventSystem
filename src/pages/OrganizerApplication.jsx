
import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  Send,
  CalendarDays,
  Sparkles,
  Users,
  CalendarCheck,
  ClipboardCheck,
  ChevronRight,
  UserRound,
  Info,
  PartyPopper,
  BriefcaseBusiness
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const initialForm = {
  organizationName: "",
  organizationType: "individual",
  reason: "",
  experience: ""
};

const organizationTypes = [
  {
    value: "individual",
    label: "Individual Organizer"
  },
  {
    value: "school",
    label: "School / University"
  },
  {
    value: "business",
    label: "Business"
  },
  {
    value: "organization",
    label: "Organization / Group"
  },
  {
    value: "other",
    label: "Other"
  }
];

const formatDate = value => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const steps = [
  {
    number: "01",
    title: "Submit Application",
    description:
      "Share your organizer information and event plans.",
    icon: FileText
  },
  {
    number: "02",
    title: "Administrator Review",
    description:
      "Our administration team reviews your application.",
    icon: ShieldCheck
  },
  {
    number: "03",
    title: "Application Decision",
    description:
      "Return to this page to check your application status.",
    icon: ClipboardCheck
  },
  {
    number: "04",
    title: "Start Organizing",
    description:
      "Approved applicants can access organizer features.",
    icon: PartyPopper
  }
];

function SectionHeading({
  number,
  title,
  description
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F3E8] text-xs font-black text-[#347B54]">
        {number}
      </span>

      <div>
        <h3 className="text-base font-black text-[#173B2F]">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-6 text-[#8B9D8F]">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending:
      "bg-[#FFF5E4] text-[#A87B32]",
    approved:
      "bg-[#E6F5E9] text-[#28784A]",
    rejected:
      "bg-[#FDECEB] text-[#BC5850]"
  };

  const labels = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Not Approved"
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black ${
        styles[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
}

function ApplicationInfo({
  label,
  value,
  icon: Icon
}) {
  return (
    <div className="rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] p-5">
      <div className="flex items-center gap-2 text-[#8C9D8F]">
        <Icon size={15} />

        <p className="text-[10px] font-black uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 break-words text-sm font-bold text-[#173B2F]">
        {value || "—"}
      </p>
    </div>
  );
}

export default function OrganizerApplication() {
  const [form, setForm] = useState(initialForm);

  const [application, setApplication] =
    useState(null);

  const [userRole, setUserRole] =
    useState("");

  const [
    applicationStatus,
    setApplicationStatus
  ] = useState("none");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    showReapplication,
    setShowReapplication
  ] = useState(false);

  const loadApplication = useCallback(
    async signal => {
      setLoading(true);
      setError("");

      try {
        const token =
          sessionStorage.getItem("anoGToken");

        if (!token) {
          throw new Error(
            "Please log in to continue."
          );
        }

        const response = await fetch(
          `${API_URL}/api/organizer/my-application`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Unable to load your application."
          );
        }

        if (signal?.aborted) return;

        setApplication(
          data.application || null
        );

        setUserRole(
          data.userRole || ""
        );

        setApplicationStatus(
          data.applicationStatus || "none"
        );
      } catch (err) {
        if (
          err.name === "AbortError" ||
          signal?.aborted
        ) {
          return;
        }

        setError(
          err.message ||
          "Unable to load your application."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadApplication(controller.signal);

    return () => controller.abort();
  }, [loadApplication]);

  const updateField = event => {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  };

  const submitApplication = async event => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    const reason = form.reason.trim();

    if (reason.length < 20) {
      setError(
        "Please provide a reason with at least 20 characters."
      );
      return;
    }

    if (reason.length > 2000) {
      setError(
        "Your reason must not exceed 2000 characters."
      );
      return;
    }

    if (
      form.experience.trim().length > 2000
    ) {
      setError(
        "Experience must not exceed 2000 characters."
      );
      return;
    }

    setSubmitting(true);

    try {
      const token =
        sessionStorage.getItem("anoGToken");

      if (!token) {
        throw new Error(
          "Please log in to continue."
        );
      }

      const response = await fetch(
        `${API_URL}/api/organizer/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            organizationName:
              form.organizationName.trim(),
            organizationType:
              form.organizationType,
            reason,
            experience:
              form.experience.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Unable to submit your application."
        );
      }

      setSuccess(
        "Your organizer application was submitted successfully."
      );

      setApplication(
        data.application || null
      );

      setApplicationStatus("pending");

      setForm(initialForm);

      await loadApplication();
    } catch (err) {
      setError(
        err.message ||
        "Unable to submit your application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const status =
    application?.status ||
    applicationStatus;

  const isOrganizer =
    userRole === "organizer";

  const isAdmin =
    userRole === "admin";

  const showApplicationForm =
    !application &&
    status === "none" &&
    userRole === "attendee";

  const canReapply =
    userRole === "attendee" &&
    status === "rejected";

  const showForm =
    showApplicationForm ||
    (
      canReapply &&
      showReapplication
    );

  const statusConfig = {
    pending: {
      icon: Clock3,
      title: "Application Under Review",
      description:
        "Your application has been successfully submitted. Our administration team will review your information and event plans.",
      color: "text-[#AD7E36]",
      background: "bg-[#FFF5E5]"
    },
    approved: {
      icon: CheckCircle2,
      title: "Application Approved",
      description:
        "Your application has been approved. You now have access to the organizer dashboard and event management features.",
      color: "text-[#347B54]",
      background: "bg-[#E9F5E9]"
    },
    rejected: {
      icon: XCircle,
      title: "Application Not Approved",
      description:
        "Your application has been reviewed but was not approved. You can review the details below and submit another application.",
      color: "text-[#BC5850]",
      background: "bg-[#FDECEB]"
    }
  };

  const currentStatus =
    statusConfig[status];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F2F5EF] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">

        {/* PAGE HEADER */}

        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D5E7D5] bg-[#EAF4E9] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#347B54]">
            <Sparkles size={14} />
            ANO G? / ORGANIZER PROGRAM
          </div>

          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-[-0.045em] text-[#173B2F] sm:text-4xl lg:text-5xl">
            Bring Your{" "}
            <span className="text-[#4E9C70]">
              Events to Life.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#819385]">
            Join the ANO G? organizer community.
            Apply to create, publish, and manage
            your own events through our platform.
          </p>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-[#F1D1CD] bg-[#FFF0EE] p-4 text-sm text-[#B8544C]"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span className="flex-1">
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <XCircle size={17} />
            </button>
          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-[#CFE9D2] bg-[#EAF8ED] p-4 text-sm text-[#28784A]"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            {success}
          </div>
        )}

        {/* LOADING STATE */}

        {loading ? (
          <div className="space-y-5">
            <div className="h-44 animate-pulse rounded-[26px] bg-[#E4EDE1]" />

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="h-64 animate-pulse rounded-[26px] bg-[#E4EDE1]" />
              <div className="h-64 animate-pulse rounded-[26px] bg-[#E4EDE1]" />
            </div>
          </div>
        ) : isAdmin ? (

          /* ADMIN STATE */

          <div className="overflow-hidden rounded-[26px] border border-[#E0E9DE] bg-white shadow-sm">
            <div className="h-2 bg-[#173B2F]" />

            <div className="px-6 py-12 text-center sm:px-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#E8F3E8] text-[#347B54]">
                <ShieldCheck size={36} />
              </div>

              <h2 className="mt-6 text-2xl font-black text-[#173B2F]">
                Administrator Account
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#819385]">
                Your account already has
                administrator access. You can
                manage organizer applications
                through the admin dashboard.
              </p>

              <Link
                to="/admin/applications"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-6 py-3.5 text-xs font-bold text-white transition hover:bg-[#285541]"
              >
                Manage Applications
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : isOrganizer ? (

          /* APPROVED ORGANIZER STATE */

          <div className="overflow-hidden rounded-[26px] border border-[#D7E9D6] bg-white shadow-sm">
            <div className="h-2 bg-[#4E9C70]" />

            <div className="px-6 py-12 text-center sm:px-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#E9F6EA] text-[#347B54]">
                <PartyPopper size={36} />
              </div>

              <div className="mt-6 flex justify-center">
                <StatusBadge status="approved" />
              </div>

              <h2 className="mt-4 text-2xl font-black text-[#173B2F]">
                You're an Approved Organizer!
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#819385]">
                Your organizer access is active.
                You're ready to create and manage
                events on ANO G?.
              </p>

              <Link
                to="/organizer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-6 py-3.5 text-xs font-bold text-white transition hover:bg-[#285541]"
              >
                Open Organizer Dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : currentStatus && !showForm ? (

          /* APPLICATION STATUS */

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

            <section className="overflow-hidden rounded-[26px] border border-[#E0E9DE] bg-white shadow-sm">
              <div className="border-b border-[#EAF0E8] p-6 sm:p-9">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-[20px] ${currentStatus.background} ${currentStatus.color}`}
                >
                  <currentStatus.icon size={30} />
                </div>

                <div className="mt-6">
                  <StatusBadge status={status} />
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-[#173B2F]">
                  {currentStatus.title}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-[#819385]">
                  {currentStatus.description}
                </p>
              </div>

              <div className="p-6 sm:p-9">
                <h3 className="mb-5 text-sm font-black text-[#173B2F]">
                  Application Information
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ApplicationInfo
                    icon={Building2}
                    label="Organization"
                    value={
                      application?.organizationName ||
                      "Individual"
                    }
                  />

                  <ApplicationInfo
                    icon={BriefcaseBusiness}
                    label="Organization Type"
                    value={
                      organizationTypes.find(
                        item =>
                          item.value ===
                          application?.organizationType
                      )?.label ||
                      application?.organizationType ||
                      "Not specified"
                    }
                  />

                  <ApplicationInfo
                    icon={CalendarDays}
                    label="Application Date"
                    value={formatDate(
                      application?.createdAt
                    )}
                  />

                  <ApplicationInfo
                    icon={ShieldCheck}
                    label="Review Status"
                    value={
                      status === "pending"
                        ? "Awaiting Review"
                        : status === "approved"
                          ? "Approved"
                          : "Not Approved"
                    }
                  />
                </div>

                {application?.reviewNote && (
                  <div className="mt-5 rounded-2xl border border-[#DCE8D9] bg-[#F5F9F3] p-5">
                    <div className="flex items-center gap-2 text-[#347B54]">
                      <FileText size={17} />

                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Administrator's Note
                      </h4>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#486452]">
                      {application.reviewNote}
                    </p>
                  </div>
                )}

                <div className="mt-7 flex flex-wrap gap-3 border-t border-[#EAF0E8] pt-6">
                  <button
                    type="button"
                    onClick={() =>
                      loadApplication()
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8D9] bg-white px-5 py-3 text-xs font-bold text-[#173B2F] transition hover:bg-[#F2F7F0]"
                  >
                    <RefreshCw size={16} />
                    Check Status
                  </button>

                  {canReapply && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowReapplication(true)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#285541]"
                    >
                      Apply Again
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </section>

            <aside className="h-fit rounded-[26px] bg-[#173B2F] p-7 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#B9EAC9]">
                <Info size={23} />
              </div>

              <h3 className="mt-6 text-lg font-black">
                Your Application
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/65">
                You can check the latest status
                of your application here.
                Administrator decisions will
                appear once the review is complete.
              </p>

              <div className="mt-7 border-t border-white/15 pt-6">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/45">
                  Current Status
                </p>

                <p className="mt-2 text-lg font-black">
                  {status === "pending"
                    ? "Under Review"
                    : status === "approved"
                      ? "Approved"
                      : "Not Approved"}
                </p>
              </div>
            </aside>
          </div>
        ) : showForm ? (

          /* APPLICATION FORM */

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">

            <form
              onSubmit={submitApplication}
              className="overflow-hidden rounded-[26px] border border-[#E0E9DE] bg-white shadow-sm"
            >
              <div className="border-b border-[#EAF0E8] px-6 py-7 sm:px-9">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#4E9C70]">
                      APPLICATION FORM
                    </p>

                    <h2 className="mt-2 text-xl font-black text-[#173B2F] sm:text-2xl">
                      Tell Us About Your Plans.
                    </h2>

                    <p className="mt-2 text-xs leading-6 text-[#819385]">
                      Complete the information below
                      to apply for organizer access.
                    </p>
                  </div>

                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4E9] text-[#347B54] sm:flex">
                    <FileText size={23} />
                  </div>
                </div>
              </div>

              <div className="space-y-9 p-6 sm:p-9">

                {/* ORGANIZATION SECTION */}

                <section>
                  <SectionHeading
                    number="01"
                    title="Organization Details"
                    description="Tell us who will be organizing your events."
                  />

                  <div className="mt-6 space-y-5">
                    <div>
                      <label
                        htmlFor="organizationName"
                        className="mb-2 block text-xs font-bold text-[#294A37]"
                      >
                        Organization Name{" "}
                        <span className="font-normal text-[#9CAA9E]">
                          (Optional)
                        </span>
                      </label>

                      <div className="relative">
                        <Building2
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A194]"
                        />

                        <input
                          id="organizationName"
                          name="organizationName"
                          value={form.organizationName}
                          onChange={updateField}
                          maxLength={150}
                          placeholder="e.g. NU Student Council"
                          className="w-full rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] py-3.5 pl-11 pr-4 text-sm text-[#173B2F] outline-none transition focus:border-[#347B54]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="organizationType"
                        className="mb-2 block text-xs font-bold text-[#294A37]"
                      >
                        Organization Type{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <select
                        id="organizationType"
                        name="organizationType"
                        value={form.organizationType}
                        onChange={updateField}
                        required
                        className="w-full rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] px-4 py-3.5 text-sm text-[#173B2F] outline-none transition focus:border-[#347B54]"
                      >
                        {organizationTypes.map(
                          type => (
                            <option
                              key={type.value}
                              value={type.value}
                            >
                              {type.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </section>

                <div className="border-t border-[#EAF0E8]" />

                {/* EVENT PLANS SECTION */}

                <section>
                  <SectionHeading
                    number="02"
                    title="Your Event Plans"
                    description="Help us understand your motivation and experience."
                  />

                  <div className="mt-6 space-y-5">
                    <div>
                      <label
                        htmlFor="reason"
                        className="mb-2 block text-xs font-bold text-[#294A37]"
                      >
                        Why do you want to become an organizer?{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <textarea
                        id="reason"
                        name="reason"
                        value={form.reason}
                        onChange={updateField}
                        required
                        minLength={20}
                        maxLength={2000}
                        rows={5}
                        placeholder="Tell us about the events you want to create and what motivates you to organize them..."
                        className="w-full resize-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] p-4 text-sm leading-7 text-[#173B2F] outline-none transition focus:border-[#347B54]"
                      />

                      <div className="mt-2 flex items-center justify-between text-[11px] text-[#93A396]">
                        <span>
                          Minimum 20 characters
                        </span>

                        <span
                          className={
                            form.reason.length >= 20
                              ? "font-bold text-[#347B54]"
                              : ""
                          }
                        >
                          {form.reason.length}/2000
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="experience"
                        className="mb-2 block text-xs font-bold text-[#294A37]"
                      >
                        Previous Event Experience{" "}
                        <span className="font-normal text-[#9CAA9E]">
                          (Optional)
                        </span>
                      </label>

                      <textarea
                        id="experience"
                        name="experience"
                        value={form.experience}
                        onChange={updateField}
                        maxLength={2000}
                        rows={4}
                        placeholder="Describe any events you've organized or helped manage before..."
                        className="w-full resize-none rounded-xl border border-[#DEE8DB] bg-[#FAFCF9] p-4 text-sm leading-7 text-[#173B2F] outline-none transition focus:border-[#347B54]"
                      />

                      <p className="mt-2 text-right text-[11px] text-[#93A396]">
                        {form.experience.length}/2000
                      </p>
                    </div>
                  </div>
                </section>

                {/* SUBMIT */}

                <div className="border-t border-[#EAF0E8] pt-6">
                  <div className="mb-5 flex items-start gap-3 rounded-xl bg-[#F0F7EF] p-4">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-[#347B54]"
                    />

                    <p className="text-xs leading-6 text-[#64806A]">
                      Your application will be
                      submitted for administrator
                      review. You can return to
                      this page to check its status.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#285541] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Organizer Application
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* RIGHT SIDEBAR */}

            <aside className="space-y-5 lg:sticky lg:top-28">

              <div className="overflow-hidden rounded-[26px] bg-[#173B2F] p-7 text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#B9EAC9]">
                  <CalendarCheck size={24} />
                </div>

                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.15em] text-[#9CD5AC]">
                  ANO G? ORGANIZERS
                </p>

                <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight">
                  Create Moments.
                  <br />
                  Bring People Together.
                </h3>

                <p className="mt-4 text-xs leading-6 text-white/65">
                  Join the organizer community
                  and bring your event ideas
                  to life.
                </p>

                <div className="mt-7 flex items-center gap-3 border-t border-white/15 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Users size={19} />
                  </div>

                  <p className="text-xs leading-5 text-white/75">
                    Connect with people through
                    events and experiences.
                  </p>
                </div>
              </div>

              <div className="rounded-[26px] border border-[#E0E9DE] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4E9] text-[#347B54]">
                    <ClipboardCheck size={21} />
                  </div>

                  <h3 className="text-base font-black text-[#173B2F]">
                    What Happens Next?
                  </h3>
                </div>

                <div className="relative mt-7 space-y-6">
                  {steps.map(
                    ({
                      number,
                      title,
                      description,
                      icon: Icon
                    }) => (
                      <div
                        key={number}
                        className="flex items-start gap-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF5EC] text-[11px] font-black text-[#347B54]">
                          {number}
                        </span>

                        <div>
                          <p className="text-xs font-black text-[#173B2F]">
                            {title}
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-[#8A9A8D]">
                            {description}
                          </p>
                        </div>

                        <Icon
                          size={15}
                          className="ml-auto shrink-0 text-[#A2B5A5]"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </aside>
          </div>
        ) : (

          /* UNAVAILABLE STATE */

          <div className="rounded-[26px] border border-[#E0E9DE] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F4EF] text-[#819287]">
              <AlertCircle size={30} />
            </div>

            <h2 className="mt-5 text-xl font-black text-[#173B2F]">
              Application Unavailable
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#819385]">
              Your account is not currently
              eligible to submit an organizer
              application.
            </p>

            <Link
              to="/profile"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173B2F] px-6 py-3 text-xs font-bold text-white"
            >
              Return to Profile
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
