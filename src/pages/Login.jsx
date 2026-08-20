import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

function Login() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(null);

  const checkPasswordStrength = (value) => {
    if (!value) {
      setStrength(null);
      return;
    }

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    if (value.length < 6) {
      setStrength({
        level: "Weak",
        width: "30%",
        type: "weak",
        message: "Use at least 6 characters.",
      });
    } else if (
      value.length < 10 ||
      !hasUpper ||
      !hasLower ||
      !hasNumber ||
      !hasSpecial
    ) {
      setStrength({
        level: "Medium",
        width: "60%",
        type: "medium",
        message: "Add uppercase, lowercase, numbers, and special characters.",
      });
    } else {
      setStrength({
        level: "Strong",
        width: "100%",
        type: "strong",
        message: "Strong password.",
      });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (mode === "register") {
      checkPasswordStrength(value);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim() || !password.trim()) {
      setMessageType("error");
      setMessage("Please enter username and password.");
      return;
    }

    const accounts = JSON.parse(
      localStorage.getItem("anoGAccounts") || "[]"
    );

    const account = accounts.find(
      (item) =>
        item.username.toLowerCase() === username.trim().toLowerCase() &&
        item.password === password
    );

    if (account) {
      setLoggedIn(true);
      setUsername(account.username);
      setPassword("");
      setMessage("");
    } else {
      setMessageType("error");
      setMessage("Invalid username or password.");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim()) {
      setMessageType("error");
      setMessage("Please enter a username.");
      return;
    }

    if (!password.trim()) {
      setMessageType("error");
      setMessage("Please enter a password.");
      return;
    }

    if (!strength || strength.type !== "strong") {
      setMessageType("error");
      setMessage("Please create a strong password before registering.");
      return;
    }

    const accounts = JSON.parse(
      localStorage.getItem("anoGAccounts") || "[]"
    );

    const existingAccount = accounts.find(
      (item) =>
        item.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (existingAccount) {
      setMessageType("error");
      setMessage("That username already exists.");
      return;
    }

    const newAccount = {
      username: username.trim(),
      password,
    };

    localStorage.setItem(
      "anoGAccounts",
      JSON.stringify([...accounts, newAccount])
    );

    setMessageType("success");
    setMessage("Account created successfully. You can now sign in.");

    setPassword("");
    setStrength(null);

    setTimeout(() => {
      setMode("login");
      setMessage("");
    }, 1500);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setMessage("");
    setStrength(null);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setUsername("");
    setPassword("");
    setMessage("");
    setStrength(null);
    setShowPassword(false);
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
                  Ano G / 01
                </span>
              </div>

              <h1 className="text-5xl font-black uppercase tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#07140F]/50 sm:text-base">
                {mode === "login"
                  ? "Sign in to access your Ano G event management workspace."
                  : "Create your Ano G account with a secure password."}
              </p>
            </div>

            <div className="hidden h-14 w-14 items-center justify-center border border-[#07140F]/10 bg-white sm:flex">
              {mode === "login" ? (
                <LogIn size={22} className="text-[#173B2F]" />
              ) : (
                <UserPlus size={22} className="text-[#173B2F]" />
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <section className="border border-[#07140F]/10 bg-white">
            <div className="border-b border-[#07140F]/10 px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#07140F]/35">
                    {mode === "login" ? "Secure Access" : "New Account"}
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {mode === "login"
                      ? "Sign in to Ano G"
                      : "Create your account"}
                  </h2>
                </div>

                <ShieldCheck
                  size={19}
                  className="text-[#173B2F]/40"
                />
              </div>
            </div>

            {!loggedIn ? (
              <form
                onSubmit={
                  mode === "login"
                    ? handleLogin
                    : handleRegister
                }
              >
                <div className="divide-y divide-[#07140F]/10">
                  <label className="block px-6 py-7 sm:px-8">
                    <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">
                      Username
                    </span>

                    <input
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      placeholder={
                        mode === "login"
                          ? "Enter your username"
                          : "Create a username"
                      }
                      autoComplete="username"
                      className="w-full border-b border-[#07140F]/15 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-[#07140F]/25 focus:border-[#173B2F]"
                    />
                  </label>

                  <label className="block px-6 py-7 sm:px-8">
                    <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">
                      Password
                    </span>

                    <div className="relative">
                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder={
                          mode === "login"
                            ? "Enter your password"
                            : "Create a strong password"
                        }
                        autoComplete={
                          mode === "login"
                            ? "current-password"
                            : "new-password"
                        }
                        className="w-full border-b border-[#07140F]/15 bg-transparent px-0 py-3 pr-10 text-sm outline-none transition-colors placeholder:text-[#07140F]/20 focus:border-[#173B2F]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[#07140F]/30 transition-colors hover:text-[#173B2F]"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    {mode === "register" && strength && (
                      <div className="mt-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#07140F]/35">
                            Password Strength
                          </span>

                          <span
                            className={`text-xs font-bold ${
                              strength.type === "strong"
                                ? "text-[#37865F]"
                                : strength.type === "medium"
                                ? "text-[#A58220]"
                                : "text-[#B85C5C]"
                            }`}
                          >
                            {strength.level}
                          </span>
                        </div>

                        <div className="mt-3 h-1 w-full bg-[#07140F]/10">
                          <div
                            className={`h-full transition-all duration-300 ${
                              strength.type === "strong"
                                ? "bg-[#37865F]"
                                : strength.type === "medium"
                                ? "bg-[#D9B44A]"
                                : "bg-[#E07A7A]"
                            }`}
                            style={{
                              width: strength.width,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-xs text-[#07140F]/40">
                          {strength.message}
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {message && (
                  <div
                    className={`mx-6 mt-6 border-l-2 px-4 py-3 sm:mx-8 ${
                      messageType === "success"
                        ? "border-[#37865F] bg-[#37865F]/5"
                        : "border-[#E07A7A] bg-[#E07A7A]/5"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        messageType === "success"
                          ? "text-[#286A49]"
                          : "text-[#9B4848]"
                      }`}
                    >
                      {message}
                    </p>
                  </div>
                )}

                <div className="px-6 py-6 sm:px-8">
                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 bg-[#173B2F] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#245542]"
                  >
                    {mode === "login"
                      ? "Login"
                      : "Create Account"}

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      switchMode(
                        mode === "login"
                          ? "register"
                          : "login"
                      )
                    }
                    className="mt-4 w-full text-center text-xs font-medium text-[#173B2F]/50 transition-colors hover:text-[#173B2F]"
                  >
                    {mode === "login"
                      ? "Don't have an account? Create one"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center gap-4 px-6 py-8 sm:px-8">
                  <CheckCircle2
                    size={24}
                    className="text-[#37865F]"
                  />

                  <div>
                    <p className="text-sm font-bold">
                      Login successful
                    </p>

                    <p className="mt-1 text-xs text-[#07140F]/40">
                      Welcome back, {username}.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#07140F]/10 px-6 py-6 sm:px-8">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-6 py-3.5 text-sm font-semibold text-[#07140F]/50 transition-colors hover:text-[#07140F]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-[#173B2F] p-7 text-white sm:p-8">
            <div className="flex h-full flex-col">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#52B788]">
                  Ano G Access
                </p>

                <h2 className="mt-5 text-3xl font-black uppercase leading-[0.9] tracking-[-0.05em]">
                  {mode === "login" ? (
                    <>
                      Manage
                      <br />
                      with clarity.
                    </>
                  ) : (
                    <>
                      Start
                      <br />
                      securely.
                    </>
                  )}
                </h2>

                <p className="mt-6 text-sm leading-6 text-white/45">
                  {mode === "login"
                    ? "Sign in to continue managing your events, attendance, registration, and budget tools."
                    : "Create an account to securely access your Ano G event management workspace."}
                </p>
              </div>

              <div className="mt-10 border-t border-white/10">
                {[
                  "Event Management",
                  "Staff Attendance",
                  "Budget Planning",
                  "Event Registration",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border-b border-white/10 py-5"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-[#52B788]"
                    />

                    <span className="text-sm text-white/70">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto border-t border-white/10 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                  Account System
                </p>

                <p className="mt-2 text-sm text-white/50">
                  Accounts are saved locally on this device.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Login;