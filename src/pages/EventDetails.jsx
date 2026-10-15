
import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Ticket,
  UserRound,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const formatDate = value => {
  if (!value) return "To be announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "To be announced";
  }

  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

const formatTime = value => {
  if (!value) return "Time TBA";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time TBA";
  }

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit"
  });
};

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#E2EAE0] bg-white p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E8] text-[#347B54]">
        <Icon size={21} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#829286]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-[#173B2F]">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] =
    useState(false);

  const [registrationMessage, setRegistrationMessage] =
    useState("");
  const [registrationError, setRegistrationError] =
    useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadEvent = async () => {
      try {
        setLoading(true);
        setError("");
        setEvent(null);

        const response = await fetch(
          `${API_URL}/api/events/public/${eventId}`,
          {
            signal: controller.signal
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load event."
          );
        }

        if (!data.event) {
          throw new Error("Event not found.");
        }

        setEvent(data.event);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load event."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEvent();

    return () => controller.abort();
  }, [eventId]);

  useEffect(() => {
    const token = sessionStorage.getItem("anoGToken");

    setIsRegistered(false);
    setRegistrationMessage("");
    setRegistrationError("");

    if (!token) {
      setCheckingRegistration(false);
      return;
    }

    const controller = new AbortController();

    const checkRegistration = async () => {
      try {
        setCheckingRegistration(true);

        const response = await fetch(
          `${API_URL}/api/event-registrations/status/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => ({}));

          throw new Error(
            data.message ||
              "Unable to check registration status."
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setIsRegistered(
            Boolean(data.isRegistered)
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(
            "Registration status error:",
            err
          );

          if (!controller.signal.aborted) {
            setRegistrationError(
              "Unable to verify your registration status. Please refresh before registering."
            );
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingRegistration(false);
        }
      }
    };

    checkRegistration();

    return () => controller.abort();
  }, [eventId]);

  const handleRegister = async () => {
    if (
      registering ||
      checkingRegistration ||
      isRegistered ||
      registrationError
    ) {
      return;
    }

    const token = sessionStorage.getItem("anoGToken");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/events/${eventId}`
        }
      });
      return;
    }

    try {
      setRegistering(true);
      setRegistrationMessage("");
      setRegistrationError("");

      const response = await fetch(
        `${API_URL}/api/event-registrations/${eventId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        if (response.status === 409) {
          setIsRegistered(true);
        }

        throw new Error(
          data.message || "Registration failed."
        );
      }

      setIsRegistered(true);

      setRegistrationMessage(
        "You have successfully registered for this event!"
      );

      if (data.event) {
        setEvent(previous => ({
          ...previous,
          ...data.event
        }));
      } else {
        setEvent(previous => ({
          ...previous,
          registeredCount:
            (Number(previous.registeredCount) || 0) + 1
        }));
      }
    } catch (err) {
      setRegistrationError(
        err.message || "Unable to register."
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F5EF]">
        <div className="flex flex-col items-center gap-4 text-[#347B54]">
          <Loader2
            size={36}
            className="animate-spin"
          />

          <p className="text-sm font-semibold">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F2F5EF] px-5 text-center">
        <AlertCircle
          size={48}
          className="text-[#C66B63]"
        />

        <h2 className="mt-5 text-2xl font-bold text-[#173B2F]">
          Event unavailable
        </h2>

        <p className="mt-3 text-sm text-[#718579]">
          {error || "This event could not be found."}
        </p>

        <Link
          to="/events"
          className="mt-7 rounded-xl bg-[#173B2F] px-6 py-3 text-sm font-semibold text-white"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const capacity = Number(event.capacity) || 0;
  const registered = Number(event.registeredCount) || 0;

  const hasCapacity = capacity > 0;

  const remaining = hasCapacity
    ? Math.max(0, capacity - registered)
    : null;

  const percentage = hasCapacity
    ? Math.min(100, (registered / capacity) * 100)
    : 0;

  const now = Date.now();

  const startDate = event.startDate
    ? new Date(event.startDate).getTime()
    : null;

  const endDate = event.endDate
    ? new Date(event.endDate).getTime()
    : startDate;

  const deadline = event.registrationDeadline
    ? new Date(event.registrationDeadline).getTime()
    : null;

  const hasEnded =
    endDate !== null &&
    Number.isFinite(endDate) &&
    endDate < now;

  const hasStarted =
    startDate !== null &&
    Number.isFinite(startDate) &&
    startDate <= now;

  const deadlinePassed =
    deadline !== null &&
    Number.isFinite(deadline) &&
    deadline <= now;

  const isFull =
    hasCapacity &&
    remaining === 0;

  const canRegister =
    event.status === "published" &&
    !event.isDeleted &&
    !hasEnded &&
    !hasStarted &&
    !deadlinePassed &&
    !isFull;

  let registrationStatus = "Registration Open";

  if (hasEnded || hasStarted) {
    registrationStatus = "Event Started or Ended";
  } else if (deadlinePassed) {
    registrationStatus = "Registration Closed";
  } else if (isFull) {
    registrationStatus = "Fully Booked";
  } else if (
    event.status !== "published" ||
    event.isDeleted
  ) {
    registrationStatus = "Unavailable";
  }

  const price = event.isFree
    ? "FREE"
    : `₱${Number(event.ticketPrice || 0).toLocaleString(
        "en-PH"
      )}`;

  const organizer =
    event.organizer?.fullName ||
    event.organizer?.username ||
    "Event Organizer";

  const locationText = [
    event.venue,
    event.location
  ]
    .filter(Boolean)
    .join(", ");

  const buttonDisabled =
    !canRegister ||
    registering ||
    checkingRegistration ||
    isRegistered ||
    Boolean(registrationError);

  return (
    <div className="min-h-screen bg-[#F2F5EF] text-[#173B2F]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Link
          to="/events"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#347B54] transition hover:text-[#173B2F]"
        >
          <ArrowLeft size={18} />
          Back to Browse Events
        </Link>

        <div className="overflow-hidden rounded-[28px] border border-[#DFE7DD] bg-white shadow-sm">
          <div className="relative h-[300px] overflow-hidden bg-[#173B2F] sm:h-[420px]">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CalendarDays
                  size={70}
                  className="text-[#9CCFAE]"
                />
              </div>
            )}
          </div>

          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#E7F1E8] px-4 py-2 text-xs font-bold text-[#347B54]">
                {event.category || "General Event"}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  isRegistered || canRegister
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isRegistered
                  ? "Already Registered"
                  : registrationStatus}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-[#173B2F] sm:text-5xl">
              {event.title}
            </h1>

            <p className="mt-4 flex items-center gap-2 text-sm text-[#718579]">
              <MapPin size={17} />
              {locationText || "Venue to be announced"}
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_360px]">
          <div className="space-y-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={CalendarDays}
                label="Event Date"
                value={formatDate(event.startDate)}
              />

              <InfoCard
                icon={Clock3}
                label="Event Time"
                value={`${formatTime(
                  event.startDate
                )} – ${formatTime(event.endDate)}`}
              />

              <InfoCard
                icon={MapPin}
                label="Venue"
                value={event.venue}
              />

              <InfoCard
                icon={Ticket}
                label="Admission"
                value={price}
              />
            </div>

            <div className="rounded-[24px] border border-[#E2EAE0] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-black text-[#173B2F]">
                About This Event
              </h2>

              <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[#64796A]">
                {event.description ||
                  "No event description available."}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#E2EAE0] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-black text-[#173B2F]">
                Event Organizer
              </h2>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F1E8] text-[#347B54]">
                  <UserRound size={26} />
                </div>

                <div>
                  <p className="font-bold text-[#173B2F]">
                    {organizer}
                  </p>

                  <p className="mt-1 text-xs text-[#829286]">
                    Event organizer
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E2EAE0] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-black text-[#173B2F]">
                Event Location
              </h2>

              <div className="mt-5 flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-1 shrink-0 text-[#347B54]"
                />

                <div>
                  <p className="font-bold">
                    {event.venue || "Venue to be announced"}
                  </p>

                  <p className="mt-1 text-sm text-[#718579]">
                    {event.location || "Location unavailable"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-[24px] border border-[#E2EAE0] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#829286]">
                Event Admission
              </p>

              <h2 className="mt-3 text-4xl font-black text-[#173B2F]">
                {price}
              </h2>

              <div className="mt-7 border-t border-[#E5ECE5] pt-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-[#718579]">
                    <Users size={17} />
                    Available Slots
                  </span>

                  <span className="text-sm font-black text-[#173B2F]">
                    {remaining === null
                      ? "Contact organizer"
                      : `${remaining} / ${capacity}`}
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5ECE5]">
                  <div
                    className="h-full rounded-full bg-[#347B54] transition-all duration-500"
                    style={{
                      width: `${percentage}%`
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-[#829286]">
                  {registered} participants registered
                </p>
              </div>

              <div className="mt-6 border-t border-[#E5ECE5] pt-6">
                <p className="text-xs font-semibold text-[#829286]">
                  Registration Deadline
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#173B2F]">
                  <CalendarDays size={17} />

                  {event.registrationDeadline
                    ? formatDate(event.registrationDeadline)
                    : "Before the event starts"}
                </p>
              </div>

              <button
                type="button"
                disabled={buttonDisabled}
                onClick={handleRegister}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#286043] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {registering ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Registering...
                  </>
                ) : checkingRegistration ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Checking registration...
                  </>
                ) : isRegistered ? (
                  <>
                    <CheckCircle2 size={19} />
                    Already Registered
                  </>
                ) : canRegister ? (
                  <>
                    <Ticket size={19} />
                    Register for Event
                  </>
                ) : (
                  <>
                    <AlertCircle size={19} />
                    {registrationStatus}
                  </>
                )}
              </button>

              {registrationMessage && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700"
                >
                  <CheckCircle2
                    size={18}
                    className="shrink-0"
                  />

                  <span>{registrationMessage}</span>
                </div>
              )}

              {registrationError && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      size={18}
                      className="shrink-0"
                    />

                    <span>{registrationError}</span>
                  </div>

                  {!isRegistered && (
                    <button
                      type="button"
                      onClick={() =>
                        window.location.reload()
                      }
                      className="mt-3 text-xs font-bold underline"
                    >
                      Refresh to try again
                    </button>
                  )}
                </div>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-[#829286]">
                {isRegistered
                  ? "Your registration has been recorded."
                  : canRegister
                    ? "Secure your spot and join this event."
                    : "Registration is currently unavailable."}
              </p>

              {isRegistered && (
                <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-[#347B54]">
                  <CheckCircle2 size={16} />
                  Registration confirmed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
