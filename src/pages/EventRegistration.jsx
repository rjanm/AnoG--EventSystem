import React, { useState } from "react";
import { ArrowRight, CalendarPlus, CheckCircle2, Users } from "lucide-react";

const EventRegistration = () => {
  const [eventName, setEventName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [expectedGuests, setExpectedGuests] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const getEventClassification = (guestCount) => {
    if (guestCount >= 250) return { classification: "Large Event", badgeClass: "large" };
    if (guestCount >= 150) return { classification: "Medium Event", badgeClass: "medium" };
    if (guestCount >= 1) return { classification: "Small Event", badgeClass: "small" };
    return { classification: "Invalid Guest Count", badgeClass: "invalid" };
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    if (!expectedGuests || expectedGuests.trim() === "") {
      setError("Expected guests is required.");
      setResult(null);
      return;
    }

    const guests = parseInt(expectedGuests, 10);

    if (isNaN(guests) || guests <= 0) {
      setError("Please enter a valid guest count greater than 0.");
      setResult(null);
      return;
    }

    const { classification, badgeClass } = getEventClassification(guests);
    setResult({ eventName, organizer, expectedGuests: guests, classification, badgeClass });
  };

  const handleClear = () => {
    setEventName("");
    setOrganizer("");
    setExpectedGuests("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F2F5EF] text-[#07140F]">
      <section className="border-b border-[#07140F]/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[#173B2F]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#173B2F]/50">Ano G / 06</span>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-[-0.06em] sm:text-6xl lg:text-7xl">Event Registration</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#07140F]/50 sm:text-base">Create a new event and classify it based on the expected number of guests.</p>
            </div>
            <div className="hidden h-14 w-14 items-center justify-center border border-[#07140F]/10 bg-white sm:flex">
              <CalendarPlus size={22} className="text-[#173B2F]" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">

          <section className="border border-[#07140F]/10 bg-white">
            <div className="border-b border-[#07140F]/10 px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">Event Details</p>
                  <h2 className="mt-2 text-xl font-bold">Register an event</h2>
                </div>
                <CalendarPlus size={19} className="text-[#173B2F]/40" />
              </div>
            </div>

            <form onSubmit={handleRegister}>
              <div className="divide-y divide-[#07140F]/10">
                <label className="block px-6 py-6 sm:px-8">
                  <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Event Name</span>
                  <input type="text" placeholder="Company Annual Party" value={eventName} onChange={(e) => setEventName(e.target.value)} className="w-full border-b border-[#07140F]/15 bg-transparent px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-[#07140F]/25 focus:border-[#173B2F]" />
                </label>

                <label className="block px-6 py-6 sm:px-8">
                  <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Organizer</span>
                  <input type="text" placeholder="HR Department" value={organizer} onChange={(e) => setOrganizer(e.target.value)} className="w-full border-b border-[#07140F]/15 bg-transparent px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-[#07140F]/25 focus:border-[#173B2F]" />
                </label>

                <label className="block px-6 py-6 sm:px-8">
                  <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Expected Guests</span>
                  <div className="relative">
                    <Users size={17} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#173B2F]/40" />
                    <input type="number" min="1" placeholder="250" value={expectedGuests} onChange={(e) => setExpectedGuests(e.target.value)} className="w-full border-b border-[#07140F]/15 bg-transparent py-2.5 pl-7 text-xl font-bold outline-none transition-colors placeholder:text-[#07140F]/20 focus:border-[#173B2F]" />
                  </div>
                </label>
              </div>

              {error && (
                <div className="mx-6 mt-6 flex items-center gap-3 border-l-2 border-[#E07A7A] bg-[#E07A7A]/5 px-4 py-3 sm:mx-8">
                  <span className="text-xs font-medium text-[#9B4848]">{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:px-8">
                <button type="submit" className="group flex flex-1 items-center justify-center gap-2 bg-[#173B2F] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#245542]">
                  Register Event <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button type="button" onClick={handleClear} className="px-6 py-3.5 text-sm font-medium text-[#07140F]/50 transition-colors hover:text-[#07140F]">Clear</button>
              </div>
            </form>
          </section>

          <aside className="bg-[#173B2F] p-7 text-white sm:p-8">
            <div className="flex h-full flex-col">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#52B788]">Event Classification</p>
                <h2 className="mt-5 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em]">Know your<br />event.</h2>
                <p className="mt-6 text-sm leading-6 text-white/45">Ano G automatically classifies your event according to the number of expected guests.</p>
              </div>

              <div className="mt-10 border-t border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 py-5">
                  <div className="flex items-center gap-3"><span className="h-2 w-2 bg-[#52B788]" /><span className="text-sm text-white/70">Small Event</span></div>
                  <span className="text-xs text-white/30">1–149</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 py-5">
                  <div className="flex items-center gap-3"><span className="h-2 w-2 bg-[#D9B44A]" /><span className="text-sm text-white/70">Medium Event</span></div>
                  <span className="text-xs text-white/30">150–249</span>
                </div>

                <div className="flex items-center justify-between py-5">
                  <div className="flex items-center gap-3"><span className="h-2 w-2 bg-[#E07A7A]" /><span className="text-sm text-white/70">Large Event</span></div>
                  <span className="text-xs text-white/30">250+</span>
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">Registration Flow</p>
                <p className="mt-2 text-sm text-white/50">Details → Guests → Classification</p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 border border-[#07140F]/10 bg-white">
          <div className="flex items-center justify-between border-b border-[#07140F]/10 px-6 py-6 sm:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">Registration Result</p>
              <h2 className="mt-2 text-xl font-bold">Event Overview</h2>
            </div>
            {result && <CheckCircle2 size={20} className="text-[#37865F]" />}
          </div>

          {result ? (
            <div className="grid sm:grid-cols-3">
              <div className="border-b border-[#07140F]/10 px-6 py-7 sm:border-b-0 sm:border-r sm:px-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Event</p>
                <p className="mt-3 text-lg font-bold">{result.eventName || "Untitled Event"}</p>
                <p className="mt-1 text-xs text-[#07140F]/35">event name</p>
              </div>

              <div className="border-b border-[#07140F]/10 px-6 py-7 sm:border-b-0 sm:border-r sm:px-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Organizer</p>
                <p className="mt-3 text-lg font-bold">{result.organizer || "Not specified"}</p>
                <p className="mt-1 text-xs text-[#07140F]/35">event organizer</p>
              </div>

              <div className="bg-[#173B2F] px-6 py-7 text-white sm:px-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Expected Guests</p>
                <p className="mt-3 text-3xl font-black tracking-[-0.04em]">{result.expectedGuests.toLocaleString()}</p>
                <p className="mt-1 text-xs text-white/40">registered estimate</p>
              </div>
            </div>
          ) : (
            <div className="px-6 py-10 sm:px-8">
              <p className="text-sm text-[#07140F]/35">Complete the registration form to generate your event overview.</p>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4 border-t border-[#07140F]/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Classification</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`h-2 w-2 ${result.badgeClass === "large" ? "bg-[#E07A7A]" : result.badgeClass === "medium" ? "bg-[#D9B44A]" : "bg-[#37865F]"}`} />
                  <span className="text-sm font-semibold">{result.classification}</span>
                </div>
              </div>
              <p className="max-w-md text-xs leading-5 text-[#07140F]/40 sm:text-right">
                {result.badgeClass === "large" ? "This event has a large expected attendance and may require additional planning." : result.badgeClass === "medium" ? "This event falls within the medium attendance range." : "This event falls within the small attendance range."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EventRegistration;