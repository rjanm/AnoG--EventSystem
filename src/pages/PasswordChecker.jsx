import React, { useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, UserPlus, XCircle } from "lucide-react";

function PasswordChecker() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const checkPassword = () => {
    setSaved(false);

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!username.trim()) {
      setResult({ level: "Username Required", message: "Please enter a username first.", width: "0%", type: "error" });
      return;
    }

    if (!password) {
      setResult({ level: "No Password", message: "Please enter a password to begin the security check.", width: "0%", type: "error" });
      return;
    }

    if (password.length < 6) {
      setResult({ level: "Weak", message: "Your password is too short. Use at least 6 characters.", width: "30%", type: "error" });
      return;
    }

    if (password.length <= 9 || !(hasUpper && hasLower && hasNumber && hasSpecial)) {
      setResult({ level: "Medium", message: "Add uppercase letters, numbers, and special characters to improve your password.", width: "60%", type: "warning" });
      return;
    }

    setResult({ level: "Strong", message: "Strong password. Your account is ready to be created.", width: "100%", type: "success" });
  };

  const createAccount = () => {
    if (!result || result.type !== "success") {
      checkPassword();
      return;
    }

    const existingAccounts = JSON.parse(localStorage.getItem("anoGAccounts")) || [];

    const accountExists = existingAccounts.some(
      (account) => account.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (accountExists) {
      setResult({
        level: "Account Exists",
        message: "That username is already registered. Please choose another username.",
        width: "60%",
        type: "warning"
      });
      return;
    }

    const newAccount = {
      username: username.trim(),
      password: password
    };

    localStorage.setItem(
      "anoGAccounts",
      JSON.stringify([...existingAccounts, newAccount])
    );

    setSaved(true);
    setPassword("");
    setResult({
      level: "Account Created",
      message: "Your account has been created successfully. You can now log in.",
      width: "100%",
      type: "success"
    });
  };

  const getIcon = () => {
    if (!result) return <ShieldCheck size={20} className="text-[#173B2F]/40" />;
    if (result.type === "success") return <CheckCircle2 size={20} className="text-[#37865F]" />;
    if (result.type === "warning") return <ShieldCheck size={20} className="text-[#A58220]" />;
    return <XCircle size={20} className="text-[#B85C5C]" />;
  };

  return (
    <div className="min-h-screen bg-[#F2F5EF] text-[#07140F]">
      <section className="border-b border-[#07140F]/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[#173B2F]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#173B2F]/50">Ano G / 07</span>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-[-0.06em] sm:text-6xl lg:text-7xl">Create Account</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#07140F]/50 sm:text-base">Create your Ano G account and check your password strength before registering.</p>
            </div>
            <div className="hidden h-14 w-14 items-center justify-center border border-[#07140F]/10 bg-white sm:flex">
              <UserPlus size={22} className="text-[#173B2F]" />
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">Account Setup</p>
                  <h2 className="mt-2 text-xl font-bold">Create your account</h2>
                </div>
                <LockKeyhole size={19} className="text-[#173B2F]/40" />
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <label className="block">
                <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Username</span>
                <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setSaved(false); }} placeholder="Choose a username" className="w-full border-b border-[#07140F]/15 bg-transparent py-3 text-sm outline-none transition-colors placeholder:text-[#07140F]/25 focus:border-[#173B2F]" />
              </label>

              <label className="mt-8 block">
                <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">Password</span>
                <div className="relative">
                  <LockKeyhole size={17} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#173B2F]/40" />
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setResult(null); setSaved(false); }} placeholder="Create a password" className="w-full border-b border-[#07140F]/15 bg-transparent py-3 pl-7 text-lg font-semibold outline-none transition-colors placeholder:text-[#07140F]/20 focus:border-[#173B2F]" />
                </div>
              </label>

              <div className="mt-8 flex gap-3">
                <button onClick={checkPassword} className="group flex flex-1 items-center justify-center gap-2 bg-[#173B2F] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#245542]">
                  Check Strength <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button onClick={createAccount} disabled={saved} className="px-5 py-3.5 text-sm font-semibold text-[#173B2F] transition-colors hover:bg-[#F2F5EF] disabled:cursor-not-allowed disabled:opacity-40">
                  {saved ? "Saved" : "Create Account"}
                </button>
              </div>
            </div>

            {result && (
              <div className="border-t border-[#07140F]/10">
                <div className="flex items-center justify-between px-6 py-6 sm:px-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">Security Result</p>
                    <h2 className="mt-2 text-xl font-bold">{result.level}</h2>
                  </div>
                  {getIcon()}
                </div>

                <div className="px-6 pb-7 sm:px-8">
                  <div className="h-2 w-full bg-[#07140F]/8">
                    <div className={`h-full transition-all duration-500 ${result.type === "success" ? "bg-[#37865F]" : result.type === "warning" ? "bg-[#D9B44A]" : "bg-[#E07A7A]"}`} style={{ width: result.width }} />
                  </div>
                  <p className="mt-5 text-sm leading-6 text-[#07140F]/45">{result.message}</p>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-[#173B2F] p-7 text-white sm:p-8">
            <div className="flex h-full flex-col">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#52B788]">Account Security</p>
                <h2 className="mt-5 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em]">Create<br />securely.</h2>
                <p className="mt-6 text-sm leading-6 text-white/45">Use a combination of different characters to create a stronger password for your Ano G account.</p>
              </div>

              <div className="mt-10 border-t border-white/10">
                {["Uppercase letters", "Lowercase letters", "Numbers", "Special characters"].map((item) => (
                  <div key={item} className="flex items-center gap-3 border-b border-white/10 py-5">
                    <CheckCircle2 size={16} className="text-[#52B788]" />
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto border-t border-white/10 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">Next Step</p>
                <p className="mt-2 text-sm text-white/50">Create your account, then sign in.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PasswordChecker;