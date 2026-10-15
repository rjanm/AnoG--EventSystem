
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Crown,
  Fingerprint,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  X
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import EditProfile from "../components/EditProfile";

const ROLE_CONFIG = {
  attendee: {
    label: "Attendee",
    description: "Discover experiences and connect with your community.",
    icon: Ticket
  },
  organizer: {
    label: "Organizer",
    description: "Create events and bring memorable experiences to life.",
    icon: CalendarDays
  },
  admin: {
    label: "Administrator",
    description: "Manage and oversee the ANO G? platform.",
    icon: ShieldCheck
  }
};

const formatMemberSince = date => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric"
  });
};

function ProfileAvatar({ user, initials, size = "large" }) {
  const [imageFailed, setImageFailed] = useState(false);

  const sizes = {
    large: "h-24 w-24 sm:h-28 sm:w-28 text-3xl",
    small: "h-12 w-12 text-base"
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[22px] border-[3px] border-white/20 bg-[#6BC696] font-black text-[#173B2F] ${sizes[size]}`}
    >
      {user?.profilePicture && !imageFailed ? (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials || "A"
      )}
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4B9668]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-black tracking-tight text-[#173B2F]">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-xs leading-6 text-[#859688]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function InformationField({ icon: Icon, label, value, badge }) {
  return (
    <div className="group rounded-2xl border border-[#E5ECE2] bg-[#FAFCF9] p-4 transition hover:border-[#C6DECA] hover:bg-white">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4E9] text-[#43865C]">
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-[#91A194]">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-bold text-[#173B2F]">
            {value || "Not provided"}
          </p>

          {badge && (
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                badge === "Verified"
                  ? "bg-[#E7F5E9] text-[#2E8652]"
                  : "bg-[#FFF4E3] text-[#B27B2C]"
              }`}
            >
              {badge === "Verified" && <CheckCircle2 size={11} />}
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, title, description, to, dark = false }) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        dark
          ? "border-[#173B2F] bg-[#173B2F] text-white hover:bg-[#255640]"
          : "border-[#E3ECE1] bg-[#FAFCF9] text-[#173B2F] hover:border-[#BBD9BF] hover:bg-[#F1F8F0]"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          dark
            ? "bg-white/10 text-[#A9E7C0]"
            : "bg-[#E8F3E7] text-[#43865C]"
        }`}
      >
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-black">{title}</p>

        <p
          className={`mt-1 text-[11px] leading-5 ${
            dark ? "text-white/55" : "text-[#8A9A8D]"
          }`}
        >
          {description}
        </p>
      </div>

      <ArrowUpRight
        size={18}
        className={`shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
          dark ? "text-[#A9E7C0]" : "text-[#91A594]"
        }`}
      />
    </Link>
  );
}

function OverviewRow({ label, value, last = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3.5 ${
        last ? "" : "border-b border-[#EDF1EB]"
      }`}
    >
      <span className="text-xs text-[#87998A]">{label}</span>
      <span className="max-w-[55%] break-words text-right text-xs font-bold capitalize text-[#173B2F]">
        {value || "—"}
      </span>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showEdit, setShowEdit] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const role =
    user?.role === "user"
      ? "attendee"
      : user?.role || "attendee";

  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.attendee;
  const RoleIcon = roleConfig.icon;

  const displayName =
    user?.fullName?.trim() ||
    user?.username ||
    "ANO G? Member";

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase();

  const memberSince = formatMemberSince(user?.createdAt);
  const isSuspended = user?.accountStatus === "suspended";

  const dashboardPath =
    role === "admin"
      ? "/admin"
      : role === "organizer"
        ? "/organizer"
        : "/events";

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F2F5EF] pb-20 text-[#173B2F]">
      <header className="relative overflow-hidden border-b border-[#DDE8DB] bg-[#EAF2E8]">
        <div className="pointer-events-none absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full border-[70px] border-white/40" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#347B54]" />

                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#347B54]">
                  ANO G? / MEMBER ACCOUNT
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                My <span className="text-[#4E9C70]">Profile.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#718575]">
                Manage your personal information, account settings,
                and ANO G? experience.
              </p>
            </div>

            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D3E2D1] bg-white px-5 py-3 text-xs font-bold text-[#173B2F] transition hover:bg-[#F8FCF7]"
            >
              {role === "attendee" ? (
                <Compass size={17} />
              ) : (
                <LayoutDashboard size={17} />
              )}

              {role === "attendee" ? "Explore Events" : "My Dashboard"}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-7 px-5 pt-8 sm:px-8">
        <section className="relative overflow-hidden rounded-[26px] bg-[#173B2F] text-white shadow-[0_18px_45px_rgba(23,59,47,0.12)]">
          <div className="pointer-events-none absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full border-[70px] border-white/5" />

          <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-64 bg-gradient-to-t from-[#327450]/30 to-transparent" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="mb-7 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A6D7B5]">
                MEMBER IDENTITY
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-[#C2E7CC]">
                ANO G? COMMUNITY
              </span>
            </div>

            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="relative">
                <ProfileAvatar user={user} initials={initials} />

                <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#173B2F] bg-[#72D49D] text-[#173B2F]">
                  <CheckCircle2 size={15} />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      isSuspended
                        ? "bg-red-400/15 text-red-200"
                        : "bg-[#52B788]/15 text-[#A8E8C7]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSuspended ? "bg-red-300" : "bg-[#72D49D]"
                      }`}
                    />

                    {isSuspended ? "Account Suspended" : "Active Account"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/80">
                    <RoleIcon size={12} />
                    {roleConfig.label}
                  </span>
                </div>

                <h2 className="mt-4 break-words text-3xl font-black tracking-tight sm:text-4xl">
                  {displayName}
                </h2>

                {user?.username && (
                  <p className="mt-2 text-sm text-white/55">
                    @{user.username}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                  <span className="inline-flex items-center gap-2 text-xs text-white/65">
                    <Mail size={15} className="text-[#A6D7B5]" />
                    <span className="break-all">
                      {user?.email || "No email available"}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 text-xs text-white/65">
                    <Clock3 size={15} className="text-[#A6D7B5]" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#70D39B] px-5 py-3.5 text-xs font-black text-[#173B2F] transition hover:bg-[#95E5B4]"
              >
                <Pencil size={16} />
                Edit Profile
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="relative grid border-t border-white/10 bg-white/[0.035] sm:grid-cols-3">
            {[
              {
                icon: Fingerprint,
                label: "Account Type",
                value: roleConfig.label
              },
              {
                icon: ShieldCheck,
                label: "Email Verification",
                value: user?.emailVerified ? "Verified" : "Not verified"
              },
              {
                icon: CalendarDays,
                label: "Membership",
                value: memberSince
              }
            ].map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-6 py-5 ${
                  index !== 2 ? "sm:border-r sm:border-white/10" : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#A6D7B5]">
                  <item.icon size={19} />
                </div>

                <div>
                  <p className="text-[10px] text-white/45">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs font-bold">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid items-start gap-7 lg:grid-cols-[1.5fr_0.85fr]">
          <div className="space-y-7">
            <section className="rounded-[24px] border border-[#DEE8DC] bg-white p-6 shadow-[0_8px_35px_rgba(23,59,47,0.035)] sm:p-8">
              <SectionHeading
                eyebrow="01 / PERSONAL DETAILS"
                title="Personal Information"
                description="Your registered account details and contact information."
                action={
                  <button
                    type="button"
                    onClick={() => setShowEdit(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#DDE8DB] bg-[#F7FAF6] px-4 py-2.5 text-xs font-bold text-[#43865C] transition hover:bg-[#EAF4E9]"
                  >
                    <Pencil size={14} />
                    Edit Details
                  </button>
                }
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <InformationField
                  icon={UserRound}
                  label="Full Name"
                  value={user?.fullName}
                />

                <InformationField
                  icon={Fingerprint}
                  label="Username"
                  value={user?.username ? `@${user.username}` : ""}
                />

                <InformationField
                  icon={Mail}
                  label="Email Address"
                  value={user?.email}
                  badge={user?.emailVerified ? "Verified" : "Not verified"}
                />

                <InformationField
                  icon={Phone}
                  label="Phone Number"
                  value={user?.phoneNumber}
                />
              </div>
            </section>

            <section className="rounded-[24px] border border-[#DEE8DC] bg-white p-6 sm:p-8">
              <SectionHeading
                eyebrow="02 / ACCOUNT SECURITY"
                title="Security & Account"
                description="Review your account access and security information."
              />

              <div className="mt-7 flex items-start gap-4 rounded-2xl border border-[#DDEBDD] bg-[#F3F9F2] p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E2F1E3] text-[#43865C]">
                  <ShieldCheck size={23} />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-black">
                    Account Information
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#718575]">
                    Keep your contact information up to date.
                    Use Edit Profile to manage the account fields
                    supported by your current profile settings.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowEdit(true)}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#347B54] hover:underline"
                  >
                    Open Profile Settings
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#E5ECE2] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF4E9] text-[#43865C]">
                    <Mail size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-black">Email Verification</p>
                    <p className="mt-1 text-[11px] text-[#91A194]">
                      Verification status of your registered email.
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                    user?.emailVerified
                      ? "bg-[#E8F5E9] text-[#287747]"
                      : "bg-[#FFF3E4] text-[#B47D32]"
                  }`}
                >
                  {user?.emailVerified ? "Verified" : "Pending"}
                </span>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#DEE8DC] bg-white p-6 sm:p-8">
              <SectionHeading
                eyebrow="03 / QUICK ACCESS"
                title="Your ANO G? Workspace"
                description="Navigate to the features available for your account."
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <QuickLink
                  icon={Compass}
                  title="Browse Events"
                  description="Discover upcoming events and experiences."
                  to="/events"
                  dark
                />

                {role === "organizer" && (
                  <>
                    <QuickLink
                      icon={LayoutDashboard}
                      title="Organizer Dashboard"
                      description="Access your organizer workspace."
                      to="/organizer"
                    />

                    <QuickLink
                      icon={CalendarDays}
                      title="Manage Events"
                      description="View and manage events you've created."
                      to="/organizer/events"
                    />

                    <QuickLink
                      icon={Sparkles}
                      title="Create New Event"
                      description="Start planning a new experience."
                      to="/organizer/events/create"
                    />
                  </>
                )}

                {role === "admin" && (
                  <>
                    <QuickLink
                      icon={LayoutDashboard}
                      title="Admin Dashboard"
                      description="Oversee platform activity."
                      to="/admin"
                    />

                    <QuickLink
                      icon={Users}
                      title="Manage Users"
                      description="View and manage user accounts."
                      to="/admin/users"
                    />

                    <QuickLink
                      icon={CalendarDays}
                      title="Manage Events"
                      description="Review events across the platform."
                      to="/admin/events"
                    />
                  </>
                )}

                {role === "attendee" && (
                  <QuickLink
                    icon={Sparkles}
                    title="Become an Organizer"
                    description="Apply to create and manage events."
                    to="/apply-organizer"
                  />
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-7">
            <section className="rounded-[24px] border border-[#DEE8DC] bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tight">
                  Account Overview
                </h3>

                <Fingerprint size={21} className="text-[#91A99A]" />
              </div>

              <p className="mt-2 text-xs leading-6 text-[#91A194]">
                A quick summary of your membership.
              </p>

              <div className="mt-5">
                <OverviewRow
                  label="Account Status"
                  value={user?.accountStatus || "active"}
                />

                <OverviewRow
                  label="Account Type"
                  value={roleConfig.label}
                />

                <OverviewRow
                  label="Member Since"
                  value={memberSince}
                />

                <OverviewRow
                  label="Email Status"
                  value={user?.emailVerified ? "Verified" : "Not verified"}
                />

                <OverviewRow
                  label="Profile Picture"
                  value={user?.profilePicture ? "Uploaded" : "Not added"}
                  last
                />
              </div>
            </section>

            {role === "attendee" && (
              <section className="relative overflow-hidden rounded-[24px] bg-[#173B2F] p-7 text-white">
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full border-[30px] border-white/5" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#A6E5BD]">
                    <Sparkles size={23} />
                  </div>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#9AD9AF]">
                    ORGANIZER PROGRAM
                  </p>

                  <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight">
                    Have an event idea?
                  </h3>

                  <p className="mt-4 text-xs leading-7 text-white/60">
                    Turn your ideas into memorable experiences.
                    Apply to become an ANO G? organizer and
                    start bringing your community together.
                  </p>

                  <Link
                    to="/apply-organizer"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#70D39B] px-5 py-3.5 text-xs font-black text-[#173B2F] transition hover:bg-[#95E5B4]"
                  >
                    Apply as Organizer
                    <ArrowRight size={16} />
                  </Link>

                  <p className="mt-4 text-center text-[10px] text-white/40">
                    Applications are subject to admin approval.
                  </p>
                </div>
              </section>
            )}

            {(role === "organizer" || role === "admin") && (
              <section className="relative overflow-hidden rounded-[24px] bg-[#173B2F] p-7 text-white">
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full border-[30px] border-white/5" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#A6E5BD]">
                    {role === "admin" ? (
                      <Crown size={23} />
                    ) : (
                      <CalendarDays size={23} />
                    )}
                  </div>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#9AD9AF]">
                    YOUR WORKSPACE
                  </p>

                  <h3 className="mt-3 text-2xl font-black tracking-tight">
                    {role === "admin"
                      ? "Platform Management"
                      : "Organizer Studio"}
                  </h3>

                  <p className="mt-3 text-xs leading-7 text-white/60">
                    {roleConfig.description}
                  </p>

                  <Link
                    to={dashboardPath}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#70D39B] px-5 py-3.5 text-xs font-black text-[#173B2F] transition hover:bg-[#95E5B4]"
                  >
                    Open Dashboard
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </section>
            )}

            <section className="rounded-[24px] border border-[#DEE8DC] bg-white p-6">
              <h3 className="text-lg font-black tracking-tight">
                Account Actions
              </h3>

              <p className="mt-2 text-xs leading-6 text-[#91A194]">
                Manage your current account session.
              </p>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="mt-5 flex w-full items-center justify-between rounded-xl border border-[#F2D9D5] bg-[#FFF6F4] px-4 py-3.5 text-xs font-bold text-[#C35A50] transition hover:bg-[#FFECE8]"
              >
                <span className="flex items-center gap-3">
                  <LogOut size={17} />
                  Sign Out
                </span>

                <ArrowUpRight size={16} />
              </button>
            </section>
          </aside>
        </div>
      </main>

      <EditProfile
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
      />

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#07140F]/65 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowLogoutConfirm(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-md rounded-[24px] bg-white p-7 shadow-2xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0ED] text-[#C35A50]">
              <LogOut size={25} />
            </div>

            <h2
              id="logout-title"
              className="mt-5 text-xl font-black tracking-tight"
            >
              Sign out of ANO G?
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#758979]">
              Are you sure you want to sign out of your account?
              You can log back in whenever you're ready.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-[#DDE8DB] px-5 py-3 text-xs font-bold text-[#496A53]"
              >
                Stay Logged In
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C35A50] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#A7463D]"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
