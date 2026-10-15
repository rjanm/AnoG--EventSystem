
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ShieldCheck,
  Users,
  UserRound,
  Plus,
  ListChecks,
  MapPin,
  Ticket,
  Clock3,
  CheckCircle2,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roleContent = {
  admin: {
    title: "Admin Dashboard",
    subtitle: "Manage the ANO G? event platform.",
    description:
      "Your workspace for reviewing organizer applications, monitoring events, and managing platform users.",
    icon: ShieldCheck
  },
  organizer: {
    title: "Organizer Dashboard",
    subtitle: "Create and manage great events.",
    description:
      "Plan your next event, manage event details, and publish experiences for your attendees.",
    icon: CalendarDays
  }
};

const organizerModules = [
  {
    title: "Create Event",
    description:
      "Set up a new event with its schedule, venue, tickets, and attendee capacity.",
    icon: Plus,
    path: "/organizer/events/create",
    button: "Create New Event",
    featured: true
  },
  {
    title: "My Events",
    description:
      "View, edit, publish, cancel, and manage the events you have created.",
    icon: CalendarDays,
    path: "/organizer/events",
    button: "Manage My Events",
    featured: false
  }
];

const adminModules = [
  {
    title: "User Management",
    description:
      "View and manage registered accounts.",
    icon: Users,
    path: "/admin/users"
  },
  {
    title: "Organizer Applications",
    description:
      "Review submitted organizer applications.",
    icon: ListChecks,
    path: "/admin/applications"
  },
  {
    title: "Event Management",
    description:
      "Monitor events created by organizers.",
    icon: CalendarDays,
    path: "/admin/events"
  },
  {
    title: "Admin Dashboard",
    description:
      "View platform administration.",
    icon: LayoutDashboard,
    path: "/admin"
  }
];

function RoleDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || "organizer";
  const isAdmin = role === "admin";

  const config =
    roleContent[role] || roleContent.organizer;

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#F2F5EF] px-5 pb-20 pt-12 text-[#173B2F]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E3EFE5] px-4 py-2 text-xs font-semibold text-[#2F7953]">
              <Icon size={15} />
              {role.toUpperCase()} WORKSPACE
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {config.title}
            </h1>

            <p className="mt-3 text-sm text-[#789084]">
              {config.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 rounded-xl border border-[#D7E3D8] bg-white px-5 py-3 text-sm font-semibold transition hover:bg-[#F7FAF6]"
          >
            <UserRound size={17} />
            My Profile
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[#173B2F] p-8 text-white sm:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Icon
                  size={27}
                  className="text-[#83D9AB]"
                />
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome,{" "}
                {user?.fullName ||
                  user?.username ||
                  "Organizer"}
                !
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">
                {config.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => navigate("/admin")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173B2F] transition hover:bg-[#EAF3E9]"
                  >
                    <LayoutDashboard size={17} />
                    Admin Dashboard
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/organizer/events/create")
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#83D9AB] px-5 py-3 text-sm font-bold text-[#173B2F] transition hover:bg-[#A0E6BE]"
                    >
                      <Plus size={18} />
                      Create Event
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/organizer/events")
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <CalendarDays size={17} />
                      My Events
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="hidden shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-10 lg:flex">
              <CalendarDays
                size={110}
                strokeWidth={1}
                className="text-[#83D9AB]/60"
              />
            </div>
          </div>
        </div>

        {!isAdmin ? (
          <>
            <div className="mb-5 mt-10">
              <h3 className="text-2xl font-black tracking-tight">
                Event Workspace
              </h3>

              <p className="mt-2 text-sm text-[#849188]">
                Everything you need to start organizing
                your events.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {organizerModules.map(module => {
                const ModuleIcon = module.icon;

                return (
                  <div
                    key={module.title}
                    className="flex flex-col rounded-3xl border border-[#E1E8DF] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div
                      className={`mb-6 flex h-13 w-13 items-center justify-center rounded-2xl ${
                        module.featured
                          ? "bg-[#173B2F] text-white"
                          : "bg-[#EAF3E9] text-[#347B54]"
                      }`}
                      style={{
                        width: 52,
                        height: 52
                      }}
                    >
                      <ModuleIcon size={24} />
                    </div>

                    <h4 className="text-xl font-black text-[#173B2F]">
                      {module.title}
                    </h4>

                    <p className="mt-3 flex-1 text-sm leading-7 text-[#849188]">
                      {module.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate(module.path)}
                      className={`mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                        module.featured
                          ? "bg-[#173B2F] text-white hover:bg-[#285742]"
                          : "border border-[#D7E3D8] bg-[#F7FAF6] text-[#173B2F] hover:bg-[#EAF3E9]"
                      }`}
                    >
                      {module.button}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-3xl border border-[#DCE8DC] bg-[#EAF3E9] p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-black text-[#173B2F]">
                <CheckCircle2
                  size={21}
                  className="text-[#347B54]"
                />
                How Event Creation Works
              </h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#347B54]">
                    <MapPin size={19} />
                  </div>

                  <p className="text-sm font-bold">
                    1. Create Your Event
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#718576]">
                    Enter your event details, location,
                    schedule, and attendee capacity.
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#347B54]">
                    <Clock3 size={19} />
                  </div>

                  <p className="text-sm font-bold">
                    2. Review Your Draft
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#718576]">
                    Review and update your event
                    information before publishing.
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#347B54]">
                    <Ticket size={19} />
                  </div>

                  <p className="text-sm font-bold">
                    3. Publish Your Event
                  </p>

                  <p className="mt-2 text-xs leading-6 text-[#718576]">
                    Publish your event so attendees
                    can discover its details.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-10">
            <h3 className="text-2xl font-black">
              Administration Modules
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {adminModules.map(module => {
                const ModuleIcon = module.icon;

                return (
                  <button
                    key={module.title}
                    type="button"
                    onClick={() => navigate(module.path)}
                    className="flex items-center gap-4 rounded-2xl border border-[#E1E8DF] bg-white p-5 text-left transition hover:border-[#9BC6A7] hover:bg-[#F7FAF6]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3E9] text-[#347B54]">
                      <ModuleIcon size={21} />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-[#173B2F]">
                        {module.title}
                      </h4>

                      <p className="mt-1 text-xs text-[#849188]">
                        {module.description}
                      </p>
                    </div>

                    <ArrowRight
                      size={17}
                      className="text-[#347B54]"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-10 flex items-center gap-2 text-sm font-semibold text-[#2F7953] hover:underline"
        >
          Return to Homepage
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default RoleDashboard;
