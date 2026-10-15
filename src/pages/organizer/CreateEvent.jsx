
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CloudUpload,
  FileText,
  ImagePlus,
  Info,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Tag,
  Ticket,
  Trash2,
  Users,
  X
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () =>
  sessionStorage.getItem("anoGToken") || "";

const CATEGORIES = [
  "Music & Concerts",
  "Arts & Culture",
  "Sports & Fitness",
  "Food & Lifestyle",
  "Education & Workshops",
  "Technology",
  "Business & Networking",
  "Community & Social",
  "Charity & Fundraising",
  "Other"
];

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "",
  image: "",
  venue: "",
  location: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  capacity: "",
  isFree: true,
  ticketPrice: ""
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const inputClass =
  "w-full rounded-xl border border-[#DCE7DA] bg-[#F8FAF7] px-4 py-3.5 text-sm text-[#173B2F] outline-none transition placeholder:text-[#9CAA9F] focus:border-[#438D62] focus:bg-white focus:ring-4 focus:ring-[#438D62]/10 disabled:opacity-60";

const toLocalDateTime = value => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);
};

const formatDate = value => {
  if (!value) return "Date to be announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-bold text-[#244936]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}

      {hint && (
        <p className="mt-2 text-[11px] leading-5 text-[#8A9C8D]">
          {hint}
        </p>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  number,
  title,
  description,
  children
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#DEE8DC] bg-white shadow-[0_8px_35px_rgba(23,59,47,0.035)]">
      <div className="flex items-center gap-4 border-b border-[#EDF1EB] px-5 py-5 sm:px-7">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3E9] text-[#347B54]">
          <Icon size={21} />
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#78A084]">
            SECTION {number}
          </p>

          <h2 className="mt-1 text-lg font-black tracking-tight text-[#173B2F]">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-[#849587]">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        {children}
      </div>
    </section>
  );
}

function CreateEvent() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const isEditing = Boolean(eventId);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [existingStatus, setExistingStatus] =
    useState("draft");

  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [posterError, setPosterError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [
    removeExistingPoster,
    setRemoveExistingPoster
  ] = useState(false);

  const fileInputRef = useRef(null);

  const updateField = (name, value) => {
    setForm(previous => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  useEffect(() => {
    if (!posterFile) {
      setPosterPreview("");
      return;
    }

    const url = URL.createObjectURL(posterFile);

    setPosterPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [posterFile]);

  useEffect(() => {
    if (!isEditing) return;

    const controller = new AbortController();

    const loadEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/events/manage/${eventId}`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || "Unable to load event."
          );
        }

        const event = data.event;

        if (!event) {
          throw new Error("Event not found.");
        }

        setExistingStatus(event.status || "draft");

        setForm({
          title: event.title || "",
          description: event.description || "",
          category: event.category || "",
          image: event.image || "",
          venue: event.venue || "",
          location: event.location || "",
          startDate: toLocalDateTime(event.startDate),
          endDate: toLocalDateTime(event.endDate),
          registrationDeadline: toLocalDateTime(
            event.registrationDeadline
          ),
          capacity: String(event.capacity ?? ""),
          isFree: event.isFree !== false,
          ticketPrice: String(event.ticketPrice ?? "")
        });

        setPosterFile(null);
        setRemoveExistingPoster(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("LOAD EVENT ERROR:", err);
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
  }, [eventId, isEditing]);

  const selectPoster = file => {
    if (!file) return;

    setPosterError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setPosterError(
        "Only JPG, PNG, and WEBP images are supported."
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setPosterError(
        "Poster must not exceed 5 MB."
      );
      return;
    }

    setPosterFile(file);
    setRemoveExistingPoster(false);
    setError("");
  };

  const clearPoster = () => {
    setPosterFile(null);
    setPosterError("");
    setRemoveExistingPoster(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const activePoster =
    posterPreview ||
    (!removeExistingPoster ? form.image : "");

  const validate = () => {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category ||
      !form.venue.trim() ||
      !form.location.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.capacity
    ) {
      return "Please complete all required fields.";
    }

    if (form.title.trim().length < 3) {
      return "Event title must contain at least 3 characters.";
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return "Please enter valid event dates.";
    }

    if (!isEditing && start <= new Date()) {
      return "Event start date must be in the future.";
    }

    if (end <= start) {
      return "End date must be later than the start date.";
    }

    if (form.registrationDeadline) {
      const deadline = new Date(
        form.registrationDeadline
      );

      if (
        Number.isNaN(deadline.getTime()) ||
        deadline > start
      ) {
        return "Registration deadline cannot be later than the event start.";
      }
    }

    const capacity = Number(form.capacity);

    if (
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      return "Capacity must be a whole number greater than zero.";
    }

    if (
      !form.isFree &&
      (
        !form.ticketPrice ||
        !Number.isFinite(Number(form.ticketPrice)) ||
        Number(form.ticketPrice) <= 0
      )
    ) {
      return "Please enter a valid ticket price.";
    }

    if (posterError) {
      return posterError;
    }

    return null;
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (saving) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your session has expired. Please log in again."
      );
      return;
    }

    const payload = new FormData();

    payload.append("title", form.title.trim());
    payload.append(
      "description",
      form.description.trim()
    );
    payload.append("category", form.category);
    payload.append("venue", form.venue.trim());
    payload.append("location", form.location.trim());

    payload.append(
      "startDate",
      new Date(form.startDate).toISOString()
    );

    payload.append(
      "endDate",
      new Date(form.endDate).toISOString()
    );

    payload.append(
      "registrationDeadline",
      form.registrationDeadline
        ? new Date(
            form.registrationDeadline
          ).toISOString()
        : ""
    );

    payload.append(
      "capacity",
      String(Number(form.capacity))
    );

    payload.append(
      "isFree",
      String(form.isFree)
    );

    payload.append(
      "ticketPrice",
      String(
        form.isFree
          ? 0
          : Number(form.ticketPrice)
      )
    );

    if (posterFile) {
      payload.append(
        "image",
        posterFile,
        posterFile.name
      );
    } else if (
      isEditing &&
      removeExistingPoster
    ) {
      payload.append("removeImage", "true");
    }

    try {
      setSaving(true);
      setError("");

      console.log("EVENT SUBMISSION:", {
        mode: isEditing ? "UPDATE" : "CREATE",
        title: form.title,
        category: form.category,
        venue: form.venue,
        location: form.location,
        startDate: form.startDate,
        endDate: form.endDate,
        registrationDeadline:
          form.registrationDeadline,
        capacity: form.capacity,
        isFree: form.isFree,
        ticketPrice: form.isFree
          ? 0
          : Number(form.ticketPrice),
        poster: posterFile
          ? {
              name: posterFile.name,
              type: posterFile.type,
              size: posterFile.size
            }
          : null
      });

      const url = isEditing
        ? `${API_URL}/api/events/${eventId}`
        : `${API_URL}/api/events`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: payload
      });

      const responseText = await response.text();

      let data = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          message:
            responseText ||
            "Unknown server response."
        };
      }

      console.log(
        "EVENT STATUS:",
        response.status
      );

      console.log(
        "EVENT RESPONSE:",
        data
      );

      if (
        !response.ok ||
        data.success === false
      ) {
        const message =
          data.message ||
          data.error ||
          "Unable to save event.";

        console.error(
          "EVENT CREATION FAILED:",
          message
        );

        throw new Error(message);
      }

      console.log(
        "EVENT SAVED SUCCESSFULLY:",
        data
      );

      navigate("/organizer/events", {
        replace: true
      });
    } catch (err) {
      console.error(
        "CREATE EVENT ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to save event."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F5EF] px-5 py-10">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-5 w-40 rounded bg-[#DEE9DC]" />
          <div className="mb-8 h-12 w-72 rounded-xl bg-[#DEE9DC]" />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              {[1, 2, 3].map(item => (
                <div
                  key={item}
                  className="h-72 rounded-[24px] bg-white/50"
                />
              ))}
            </div>

            <div className="h-[470px] rounded-[24px] bg-white/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F5EF] pb-20 text-[#173B2F]">
      <header className="relative overflow-hidden border-b border-[#DDE8DB] bg-[#EAF2E8]">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border-[60px] border-white/40" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#347B54]" />

                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#347B54]">
                  ANO G? / ORGANIZER STUDIO
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                {isEditing
                  ? "Edit your"
                  : "Create your"}

                <span className="text-[#4E9C70]">
                  {" "}event.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#718575]">
                {isEditing
                  ? "Refine your event details and keep your attendees informed."
                  : "Bring your event to life. Set the details, upload your poster, and prepare your experience for attendees."}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#D4E3D2] bg-white/75 px-5 py-3">
              <FileText
                size={19}
                className="text-[#438B60]"
              />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B9C8F]">
                  Event Status
                </p>

                <p className="mt-1 text-xs font-black uppercase">
                  {isEditing
                    ? existingStatus
                    : "New Draft"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <Info
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span className="flex-1">
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-7 flex flex-wrap items-center gap-3">
          {[
            "Event Information",
            "Schedule & Venue",
            "Registration",
            "Event Poster"
          ].map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-full border border-[#DAE7D8] bg-white px-4 py-2.5 text-[11px] font-bold text-[#55735D]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E4F2E5] text-[10px] font-black text-[#347B54]">
                {index + 1}
              </span>

              {item}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
        >
          <div className="space-y-6">
            <Section
              icon={FileText}
              number="01"
              title="Event Information"
              description="Give your event a clear identity and a compelling description."
            >
              <Field
                label="Event Title"
                required
              >
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={e =>
                    updateField(
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="Enter your event name"
                  maxLength={150}
                  required
                />
              </Field>

              <Field
                label="Event Category"
                required
              >
                <div className="relative">
                  <Tag
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#79917F]"
                  />

                  <select
                    className={`${inputClass} pl-11`}
                    value={form.category}
                    onChange={e =>
                      updateField(
                        "category",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Choose a category
                    </option>

                    {CATEGORIES.map(item => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>

              <Field
                label="Event Description"
                required
                hint="Describe the experience, activities, and important information for attendees."
              >
                <textarea
                  className={`${inputClass} min-h-[170px] resize-y`}
                  value={form.description}
                  onChange={e =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="What makes your event worth attending?"
                  maxLength={10000}
                  required
                />

                <p className="mt-2 text-right text-[11px] text-[#93A297]">
                  {form.description.length} / 10000
                </p>
              </Field>
            </Section>

            <Section
              icon={CalendarDays}
              number="02"
              title="Schedule & Venue"
              description="Tell attendees when and where your event will happen."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Start Date & Time"
                  required
                >
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.startDate}
                    onChange={e =>
                      updateField(
                        "startDate",
                        e.target.value
                      )
                    }
                    required
                  />
                </Field>

                <Field
                  label="End Date & Time"
                  required
                >
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={e =>
                      updateField(
                        "endDate",
                        e.target.value
                      )
                    }
                    required
                  />
                </Field>
              </div>

              <Field
                label="Registration Deadline"
                hint="Optional. Leave blank if registration has no separate deadline."
              >
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.registrationDeadline}
                  max={form.startDate || undefined}
                  onChange={e =>
                    updateField(
                      "registrationDeadline",
                      e.target.value
                    )
                  }
                />
              </Field>

              <div className="border-t border-[#EDF1EB] pt-5">
                <div className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#44845B]">
                  <MapPin size={16} />
                  Venue Details
                </div>

                <div className="space-y-5">
                  <Field
                    label="Venue Name"
                    required
                  >
                    <input
                      className={inputClass}
                      value={form.venue}
                      onChange={e =>
                        updateField(
                          "venue",
                          e.target.value
                        )
                      }
                      placeholder="e.g. SMX Convention Center"
                      maxLength={200}
                      required
                    />
                  </Field>

                  <Field
                    label="Complete Location"
                    required
                  >
                    <textarea
                      className={`${inputClass} min-h-[90px] resize-y`}
                      value={form.location}
                      onChange={e =>
                        updateField(
                          "location",
                          e.target.value
                        )
                      }
                      placeholder="Street, city, province, or complete venue address"
                      maxLength={500}
                      required
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section
              icon={Ticket}
              number="03"
              title="Registration & Tickets"
              description="Manage event admission, attendee limits, and ticket pricing."
            >
              <Field
                label="Maximum Attendees"
                required
                hint="Maximum number of attendees who can register."
              >
                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#819287]"
                  />

                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={`${inputClass} pl-11`}
                    value={form.capacity}
                    onChange={e =>
                      updateField(
                        "capacity",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 200"
                    required
                  />
                </div>
              </Field>

              <Field
                label="Admission Type"
                required
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      free: true,
                      title: "Free Event",
                      subtitle: "No admission fee"
                    },
                    {
                      free: false,
                      title: "Paid Event",
                      subtitle: "Ticketed admission"
                    }
                  ].map(option => {
                    const selected =
                      form.isFree === option.free;

                    return (
                      <button
                        key={option.title}
                        type="button"
                        onClick={() =>
                          updateField(
                            "isFree",
                            option.free
                          )
                        }
                        className={`relative rounded-2xl border-2 p-5 text-left transition ${
                          selected
                            ? "border-[#347B54] bg-[#EAF5ED]"
                            : "border-[#E4EAE1] bg-[#FAFCF9] hover:border-[#B9D2BE]"
                        }`}
                      >
                        {selected && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#347B54] text-white">
                            <Check size={12} />
                          </span>
                        )}

                        <Ticket
                          size={22}
                          className="mb-4 text-[#43865C]"
                        />

                        <p className="text-sm font-black">
                          {option.title}
                        </p>

                        <p className="mt-1 text-[11px] text-[#819287]">
                          {option.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {!form.isFree && (
                <Field
                  label="Ticket Price (PHP)"
                  required
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#347B54]">
                      ₱
                    </span>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={`${inputClass} pl-9`}
                      value={form.ticketPrice}
                      onChange={e =>
                        updateField(
                          "ticketPrice",
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </Field>
              )}
            </Section>

            <Section
              icon={ImagePlus}
              number="04"
              title="Event Poster"
              description="Upload an image that will represent your event across the platform."
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                  selectPoster(
                    e.target.files?.[0]
                  );

                  e.target.value = "";
                }}
              />

              {activePoster ? (
                <div className="overflow-hidden rounded-2xl border border-[#DDE8DB] bg-[#F5F8F3]">
                  <div className="relative flex h-[280px] items-center justify-center overflow-hidden bg-[#E4ECE3]">
                    <img
                      src={activePoster}
                      alt="Selected event poster"
                      className="h-full w-full object-contain"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-[#173B2F]/80 px-3 py-2 text-[10px] font-bold text-white">
                      Poster Preview
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-[#244936]">
                        {posterFile
                          ? posterFile.name
                          : "Current event poster"}
                      </p>

                      <p className="mt-1 text-[11px] text-[#829486]">
                        {posterFile
                          ? `${(
                              posterFile.size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`
                          : "Already uploaded"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="rounded-lg border border-[#DCE7DA] bg-white px-4 py-2 text-xs font-bold text-[#347B54]"
                      >
                        Replace
                      </button>

                      <button
                        type="button"
                        onClick={clearPoster}
                        className="flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  onKeyDown={e => {
                    if (
                      e.key === "Enter" ||
                      e.key === " "
                    ) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={e => {
                    e.preventDefault();
                    setDragging(false);
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    setDragging(false);

                    selectPoster(
                      e.dataTransfer.files?.[0]
                    );
                  }}
                  className={`group flex min-h-[270px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                    dragging
                      ? "border-[#347B54] bg-[#E2F2E5]"
                      : "border-[#C9DCCA] bg-[#F7FAF5] hover:border-[#438D62] hover:bg-[#EDF6EC]"
                  }`}
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D9E8D7] bg-white text-[#438D62]">
                    <CloudUpload size={30} />
                  </div>

                  <h3 className="text-base font-black text-[#173B2F]">
                    Drop your event poster here
                  </h3>

                  <p className="mt-2 text-xs text-[#829486]">
                    or click to browse files from your device
                  </p>

                  <span className="mt-5 rounded-xl bg-[#173B2F] px-5 py-3 text-xs font-bold text-white">
                    Choose Image
                  </span>

                  <p className="mt-4 text-[11px] text-[#91A397]">
                    JPG, PNG or WEBP · Maximum 5 MB
                  </p>
                </div>
              )}

              {posterError && (
                <p className="text-xs font-semibold text-red-600">
                  {posterError}
                </p>
              )}

              <div className="flex items-start gap-3 rounded-xl bg-[#EFF5ED] p-4">
                <Info
                  size={17}
                  className="mt-0.5 shrink-0 text-[#43865C]"
                />

                <p className="text-xs leading-6 text-[#607966]">
                  Choose a clear, high-quality event poster.
                  The image will appear in your event listing
                  after it is saved and published.
                </p>
              </div>
            </Section>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[#DDE8DB] bg-white p-5 shadow-sm">
              <Link
                to="/organizer/events"
                className="rounded-xl border border-[#DDE7DB] px-6 py-3.5 text-sm font-bold text-[#55715D] transition hover:bg-[#F4F8F2]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  saving ||
                  (
                    isEditing &&
                    !["draft", "published"].includes(
                      existingStatus
                    )
                  )
                }
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#173B2F] px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(23,59,47,0.13)] transition hover:bg-[#286043] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {saving
                  ? "Saving Event..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Event"}

                {!saving && (
                  <ArrowRight size={17} />
                )}
              </button>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[22px] border border-[#DDE8DB] bg-white p-2 shadow-[0_12px_45px_rgba(23,59,47,0.07)]">
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-sm font-black">
                    Live Event Preview
                  </p>

                  <p className="mt-1 text-[11px] text-[#91A195]">
                    How your event could appear
                  </p>
                </div>

                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF3E9] text-[#43865C]">
                  <Sparkles size={18} />
                </span>
              </div>

              <div className="relative flex h-[205px] items-center justify-center overflow-hidden rounded-[16px] bg-[#173B2F]">
                {activePoster ? (
                  <img
                    src={activePoster}
                    alt="Event preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white">
                    <CalendarDays
                      size={42}
                      className="text-[#A6DDB6]"
                    />

                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      ANO G? EVENT
                    </span>
                  </div>
                )}

                <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-2 text-center shadow-lg">
                  <p className="text-[10px] font-black uppercase text-[#43865C]">
                    {form.startDate &&
                    !Number.isNaN(
                      new Date(form.startDate).getTime()
                    )
                      ? new Date(
                          form.startDate
                        ).toLocaleString("en-PH", {
                          month: "short"
                        })
                      : "TBA"}
                  </p>

                  <p className="text-xl font-black text-[#173B2F]">
                    {form.startDate &&
                    !Number.isNaN(
                      new Date(form.startDate).getTime()
                    )
                      ? new Date(
                          form.startDate
                        ).getDate()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <span className="inline-flex rounded-full bg-[#EAF5ED] px-3 py-1.5 text-[10px] font-bold text-[#347B54]">
                  {form.category || "Event Category"}
                </span>

                <h3 className="mt-4 break-words text-xl font-black leading-7 tracking-tight">
                  {form.title || "Your Event Title"}
                </h3>

                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#859588]">
                  {form.description ||
                    "Your event description will appear here."}
                </p>

                <div className="mt-5 space-y-3 border-t border-[#EDF1EB] pt-5">
                  <div className="flex items-start gap-3 text-xs text-[#647B69]">
                    <Clock3
                      size={16}
                      className="shrink-0 text-[#43865C]"
                    />

                    {formatDate(form.startDate)}
                  </div>

                  <div className="flex items-start gap-3 text-xs text-[#647B69]">
                    <MapPin
                      size={16}
                      className="shrink-0 text-[#43865C]"
                    />

                    <span className="line-clamp-2">
                      {form.venue || "Event venue"}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-[#647B69]">
                    <Users
                      size={16}
                      className="shrink-0 text-[#43865C]"
                    />

                    {form.capacity || "0"} attendee capacity
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#EDF1EB] pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A89A]">
                      Admission
                    </p>

                    <p className="mt-1 text-xl font-black">
                      {form.isFree
                        ? "FREE"
                        : `₱${Number(
                            form.ticketPrice || 0
                          ).toLocaleString("en-PH")}`}
                    </p>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B2F] text-white">
                    <ArrowRight size={19} />
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] bg-[#173B2F] p-6 text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={22}
                  className="text-[#A2D9B3]"
                />

                <h3 className="text-sm font-black">
                  Before You Publish
                </h3>
              </div>

              <p className="mt-4 text-xs leading-6 text-[#BCD5C4]">
                Creating an event saves it as a draft.
                You can review the details before publishing
                it from My Events.
              </p>

              <div className="mt-5 space-y-3 border-t border-white/15 pt-5">
                {[
                  "Review event information",
                  "Confirm the schedule and venue",
                  "Verify registration settings",
                  "Check your event poster"
                ].map(item => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2
                      size={15}
                      className="shrink-0 text-[#91D5A7]"
                    />

                    <span className="text-xs text-[#D2E5D6]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
