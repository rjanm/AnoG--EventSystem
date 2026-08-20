import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
} from "lucide-react";

const AttendanceChecker = () => {
  const initialStaff = [
    { name: "", time: "" },
    { name: "", time: "" },
    { name: "", time: "" },
  ];

  const [staffList, setStaffList] = useState(initialStaff);
  const [results, setResults] = useState(null);

  const handleInputChange = (index, field, value) => {
    const updatedList = [...staffList];
    updatedList[index][field] = value;
    setStaffList(updatedList);
  };

  const parseTimeInput = (timeStr) => {
    if (!timeStr) return null;

    const cleanStr = timeStr.trim();

    if (cleanStr.includes(":")) {
      const parts = cleanStr.split(":");
      const hours = parseFloat(parts[0]);
      const minutes = parseFloat(parts[1] || "0");

      if (isNaN(hours) || isNaN(minutes)) return null;

      return hours + minutes / 60;
    }

    const decimalVal = parseFloat(cleanStr);

    return isNaN(decimalVal) ? null : decimalVal;
  };

  const format12Hour = (timeVal) => {
    if (timeVal === null) return "Invalid Time";

    let hours = Math.floor(timeVal);
    const minutes = Math.round((timeVal - hours) * 60);

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) hours = 12;

    const paddedMinutes =
      minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${paddedMinutes} ${period}`;
  };

  const handleCheckAttendance = (e) => {
    e.preventDefault();

    const processedResults = staffList
      .filter((staff) => staff.name.trim() !== "")
      .map((staff) => {
        const timeVal = parseTimeInput(staff.time);

        let status = "On Time";
        let badgeClass = "success";

        if (timeVal === null) {
          status = "Invalid Time";
          badgeClass = "error";
        } else if (timeVal >= 9.0) {
          status = "Very Late";
          badgeClass = "error";
        } else if (timeVal > 8.0) {
          status = "Late";
          badgeClass = "warning";
        }

        return {
          name: staff.name,
          timeDisplay: format12Hour(timeVal),
          status,
          badgeClass,
        };
      });

    setResults(processedResults);
  };

  const handleClear = () => {
    setStaffList([
      { name: "", time: "" },
      { name: "", time: "" },
      { name: "", time: "" },
    ]);

    setResults(null);
  };

  return (
    <div className="min-h-screen bg-[#F2F5EF] text-[#07140F]">
      <section className="border-b border-[#07140F]/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="flex items-start justify-between">
            <div>

              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[#173B2F]" />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#173B2F]/50">
                  Ano G / 04
                </span>

              </div>

              <h1 className="text-5xl font-black uppercase tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                Attendance
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#07140F]/50 sm:text-base">
                Check staff arrival times and quickly identify
                who is on time, late, or very late.
              </p>

            </div>

            <div className="hidden h-14 w-14 items-center justify-center border border-[#07140F]/10 bg-white sm:flex">
              <Users
                size={22}
                className="text-[#173B2F]"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

          <section className="border border-[#07140F]/10 bg-white">

            {/* Form Header */}
            <div className="border-b border-[#07140F]/10 px-6 py-6 sm:px-8">

              <div className="flex items-center justify-between">
                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">
                    Staff Check-in
                  </p>
                  <h2 className="mt-2 text-xl font-bold">
                    Enter attendance
                  </h2>
                </div>

                <Clock3
                  size={19}
                  className="text-[#173B2F]/40"
                />
              </div>
            </div>

            <form onSubmit={handleCheckAttendance}>

              <div className="hidden grid-cols-[1fr_0.7fr] border-b border-[#07140F]/10 bg-[#F2F5EF] px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/40 sm:grid">

                <span>Staff Name</span>

                <span>Time In</span>
              </div>
              <div>

                {staffList.map((staff, index) => (
                  <div
                    key={index}
                    className="grid gap-3 border-b border-[#07140F]/10 px-6 py-5 sm:grid-cols-[1fr_0.7fr] sm:gap-5"
                  >
                    <div>

                      <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35 sm:hidden">
                        Staff Name
                      </label>
                      <input
                        type="text"
                        placeholder={`Staff member ${index + 1}`}
                        value={staff.name}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full border-b border-[#07140F]/15 bg-transparent px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-[#07140F]/25 focus:border-[#173B2F]"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35 sm:hidden">
                        Time In
                      </label>
                      <input
                        type="text"
                        placeholder="8.5 or 8:30"
                        value={staff.time}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "time",
                            e.target.value
                          )
                        }
                        className="w-full border-b border-[#07140F]/15 bg-transparent px-0 py-2.5 text-sm outline-none transition-colors placeholder:text-[#07140F]/25 focus:border-[#173B2F]"
                      />

                    </div>

                  </div>
                ))}

              </div>

              <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:px-8">

                <button
                  type="submit"
                  className="group flex flex-1 items-center justify-center gap-2 bg-[#173B2F] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#245542]"
                >
                  Check Attendance
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-3.5 text-sm font-medium text-[#07140F]/50 transition-colors hover:text-[#07140F]"
                >
                  Clear
                </button>

              </div>

            </form>
          </section>

          <aside className="bg-[#173B2F] p-7 text-white sm:p-8">

            <div className="flex h-full flex-col">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#52B788]">
                  Attendance Rules
                </p>
                <h2 className="mt-5 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em]">
                  Know who
                  <br />
                  arrived.
                </h2>

                <p className="mt-6 text-sm leading-6 text-white/45">
                  Enter a staff member's arrival time using a
                  24-hour format. Ano G will automatically
                  determine their attendance status.
                </p>
              </div>

              <div className="mt-10 border-t border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 py-5">
                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      size={16}
                      className="text-[#52B788]"
                    />

                    <span className="text-sm text-white/70">
                      On Time
                    </span>
                  </div>

                  <span className="text-xs text-white/30">
                    ≤ 8:00 AM
                  </span>

                </div>
                <div className="flex items-center justify-between border-b border-white/10 py-5">

                  <div className="flex items-center gap-3">

                    <Clock3
                      size={16}
                      className="text-[#D9B44A]"
                    />
                    <span className="text-sm text-white/70">
                      Late
                    </span>
                  </div>

                  <span className="text-xs text-white/30">
                    8:01 – 8:59
                  </span>
                </div>

                <div className="flex items-center justify-between py-5">

                  <div className="flex items-center gap-3">

                    <XCircle
                      size={16}
                      className="text-[#E07A7A]"
                    />

                    <span className="text-sm text-white/70">
                      Very Late
                    </span>
                  </div>

                  <span className="text-xs text-white/30">
                    ≥ 9:00 AM
                  </span>
                </div>
              </div>

              {/* Tip */}
              <div className="mt-auto border-t border-white/10 pt-6">

                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                  Accepted Format
                </p>
                <p className="mt-2 text-sm text-white/50">
                  8 &nbsp; • &nbsp; 8.5 &nbsp; • &nbsp; 8:30
                </p>

              </div>

            </div>

          </aside>

        </div>

        {results && results.length > 0 && (
          <section className="mt-8 border border-[#07140F]/10 bg-white">

            <div className="flex items-center justify-between border-b border-[#07140F]/10 px-6 py-6 sm:px-8">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">
                  Results
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Attendance Summary
                </h2>

              </div>
              <span className="text-sm text-[#07140F]/30">
                {results.length} staff
              </span>

            </div>
            <div>

              {results.map((item, idx) => {

                let icon = <CheckCircle2 size={17} />;
                let iconClass = "text-[#37865F]";
                let statusClass =
                  "bg-[#37865F]/10 text-[#286A49]";

                if (item.badgeClass === "warning") {
                  icon = <Clock3 size={17} />;
                  iconClass = "text-[#A58220]";
                  statusClass =
                    "bg-[#D9B44A]/15 text-[#806717]";
                }
                if (item.badgeClass === "error") {
                  icon = <XCircle size={17} />;
                  iconClass = "text-[#B85C5C]";
                  statusClass =
                    "bg-[#E07A7A]/10 text-[#9B4848]";
                }
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 border-b border-[#07140F]/10 px-6 py-5 last:border-b-0 sm:px-8"
                  >
                    <div className="flex items-center gap-4">
                      <div className={iconClass}>
                        {icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-[#07140F]/40">
                          {item.timeDisplay}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${statusClass}`}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AttendanceChecker;