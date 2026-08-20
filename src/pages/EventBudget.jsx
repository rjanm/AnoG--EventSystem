import React, { useState } from "react";
import { ArrowRight, Calculator, CheckCircle2, Users, Wallet } from "lucide-react";

function EventBudget() {
  const [guests, setGuests] = useState("");
  const [result, setResult] = useState(null);

  const calculateBill = (e) => {
    e.preventDefault();
    const count = Number(guests);

    if (guests === "" || isNaN(count) || count <= 0) {
      setResult({ error: "Please enter a valid number of guests." });
      return;
    }

    let rate;
    if (count <= 100) rate = 650;
    else if (count <= 200) rate = 700;
    else if (count <= 300) rate = 750;
    else rate = 800;

    const total = count * rate;
    const isHigh = total >= 150000;
    setResult({ guests: count, rate, total, isHigh });
  };

  const handleClear = () => {
    setGuests("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#F2F5EF] text-[#07140F]">
      <section className="border-b border-[#07140F]/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[#173B2F]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#173B2F]/50">Ano G / 05</span>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-[-0.06em] sm:text-6xl lg:text-7xl">Event Budget</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#07140F]/50 sm:text-base">Estimate your event budget based on the number of guests and quickly understand your expected cost.</p>
            </div>
            <div className="hidden h-14 w-14 items-center justify-center border border-[#07140F]/10 bg-white sm:flex">
              <Wallet size={22} className="text-[#173B2F]" />
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">Budget Estimator</p>
                  <h2 className="mt-2 text-xl font-bold">Calculate your event</h2>
                </div>
                <Calculator size={19} className="text-[#173B2F]/40" />
              </div>
            </div>

            <form onSubmit={calculateBill}>
              <div className="px-6 py-8 sm:px-8 sm:py-10">
                <label className="block">
                  <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#07140F]/40">Number of Guests</span>
                  <div className="relative">
                    <Users size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#173B2F]/40" />
                    <input type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="250" className="w-full border-b border-[#07140F]/15 bg-transparent py-4 pl-8 text-3xl font-bold outline-none transition-colors placeholder:text-[#07140F]/15 focus:border-[#173B2F]" />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#07140F]/35">Enter the estimated number of guests attending your event.</p>
                </label>
              </div>

              <div className="border-y border-[#07140F]/10">
                <div className="grid grid-cols-2 bg-[#F2F5EF] px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/40 sm:grid-cols-3 sm:px-8">
                  <span>Guests</span><span>Rate</span><span className="hidden sm:block">Category</span>
                </div>

                <div className="grid grid-cols-2 px-6 py-4 text-sm sm:grid-cols-3 sm:px-8">
                  <span>1 – 100</span><span className="font-semibold">₱650</span><span className="hidden text-[#07140F]/40 sm:block">Small</span>
                </div>

                <div className="grid grid-cols-2 border-t border-[#07140F]/10 px-6 py-4 text-sm sm:grid-cols-3 sm:px-8">
                  <span>101 – 200</span><span className="font-semibold">₱700</span><span className="hidden text-[#07140F]/40 sm:block">Medium</span>
                </div>

                <div className="grid grid-cols-2 border-t border-[#07140F]/10 px-6 py-4 text-sm sm:grid-cols-3 sm:px-8">
                  <span>201 – 300</span><span className="font-semibold">₱750</span><span className="hidden text-[#07140F]/40 sm:block">Large</span>
                </div>

                <div className="grid grid-cols-2 border-t border-[#07140F]/10 px-6 py-4 text-sm sm:grid-cols-3 sm:px-8">
                  <span>301+</span><span className="font-semibold">₱800</span><span className="hidden text-[#07140F]/40 sm:block">Extra Large</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:px-8">
                <button type="submit" className="group flex flex-1 items-center justify-center gap-2 bg-[#173B2F] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#245542]">
                  Calculate Budget <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button type="button" onClick={handleClear} className="px-6 py-3.5 text-sm font-medium text-[#07140F]/50 transition-colors hover:text-[#07140F]">Clear</button>
              </div>
            </form>
          </section>

          <aside className="bg-[#173B2F] p-7 text-white sm:p-8">
            <div className="flex h-full flex-col">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#52B788]">Pricing Guide</p>
                <h2 className="mt-5 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em]">Plan<br />smarter.</h2>
                <p className="mt-6 text-sm leading-6 text-white/45">Your estimated cost is calculated using a guest-based pricing structure. Larger events use a higher rate per guest.</p>
              </div>

              <div className="mt-10 border-t border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 py-5">
                  <div className="flex items-center gap-3"><Users size={16} className="text-[#52B788]" /><span className="text-sm text-white/70">Small Event</span></div>
                  <span className="text-xs text-white/30">1–100</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 py-5">
                  <div className="flex items-center gap-3"><Users size={16} className="text-[#52B788]" /><span className="text-sm text-white/70">Medium Event</span></div>
                  <span className="text-xs text-white/30">101–200</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 py-5">
                  <div className="flex items-center gap-3"><Users size={16} className="text-[#52B788]" /><span className="text-sm text-white/70">Large Event</span></div>
                  <span className="text-xs text-white/30">201–300</span>
                </div>

                <div className="flex items-center justify-between py-5">
                  <div className="flex items-center gap-3"><Users size={16} className="text-[#52B788]" /><span className="text-sm text-white/70">Extra Large</span></div>
                  <span className="text-xs text-white/30">301+</span>
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">Pricing Range</p>
                <p className="mt-2 text-sm text-white/50">₱650 &nbsp; — &nbsp; ₱800 / guest</p>
              </div>
            </div>
          </aside>
        </div>

        {result && (
          <section className="mt-8 border border-[#07140F]/10 bg-white">
            {result.error ? (
              <div className="flex items-center gap-3 px-6 py-6 sm:px-8">
                <div className="h-2 w-2 bg-[#E07A7A]" />
                <p className="text-sm font-medium text-[#9B4848]">{result.error}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#07140F]/10 px-6 py-6 sm:px-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">Estimate</p>
                    <h2 className="mt-2 text-xl font-bold">Budget Summary</h2>
                  </div>
                  <CheckCircle2 size={20} className="text-[#37865F]" />
                </div>

                <div className="grid sm:grid-cols-3">
                  <div className="border-b border-[#07140F]/10 px-6 py-7 sm:border-b-0 sm:border-r sm:px-8">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Guests</p>
                    <p className="mt-3 text-3xl font-black tracking-[-0.04em]">{result.guests.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-[#07140F]/35">estimated attendees</p>
                  </div>

                  <div className="border-b border-[#07140F]/10 px-6 py-7 sm:border-b-0 sm:border-r sm:px-8">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Rate / Guest</p>
                    <p className="mt-3 text-3xl font-black tracking-[-0.04em]">₱{result.rate.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-[#07140F]/35">based on guest count</p>
                  </div>

                  <div className="bg-[#173B2F] px-6 py-7 text-white sm:px-8">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Total Budget</p>
                    <p className="mt-3 text-3xl font-black tracking-[-0.04em]">₱{result.total.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-white/40">estimated event cost</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-[#07140F]/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Budget Level</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`h-2 w-2 ${result.isHigh ? "bg-[#D9B44A]" : "bg-[#37865F]"}`} />
                      <span className="text-sm font-semibold">{result.isHigh ? "High Cost" : "Normal Cost"}</span>
                    </div>
                  </div>

                  <p className="max-w-md text-xs leading-5 text-[#07140F]/40 sm:text-right">
                    {result.isHigh ? "You have a large event with a high estimated budget." : "This falls within the standard budget range for an event."}
                  </p>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default EventBudget;