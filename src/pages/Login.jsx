
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight, CalendarDays, Check, CheckCircle2, Compass,
  Eye, EyeOff, LockKeyhole, LogOut, Mail, ShieldCheck,
  Sparkles, Ticket, UserRound, Users, AlertCircle, Loader2
} from "lucide-react";
import api from "../services/api";
import { useAuth, getRoleHome } from "../context/AuthContext";
import EmailVerificationModal from "../components/EmailVerificationModal";

const features = [
  { icon: Compass, title: "Discover Events", description: "Find experiences, activities, and communities." },
  { icon: Ticket, title: "Register With Ease", description: "Join events and manage your registrations." },
  { icon: CalendarDays, title: "Organize Experiences", description: "Apply to become an event organizer." }
];

const getModeFromSearch = search =>
  new URLSearchParams(search).get("mode") === "register" ? "register" : "login";

const inputClass = "w-full rounded-xl border border-[#DDE6DD] bg-[#F8FAF7] px-4 py-3.5 text-sm text-[#173B2F] outline-none transition focus:border-[#3B8063] focus:bg-white focus:ring-4 focus:ring-[#3B8063]/10 placeholder:text-[#9BA8A0]";

const initialAvailability = {
  email: { value: "", status: "idle" },
  username: { value: "", status: "idle" }
};

const getErrorMessage = error =>
  error.response?.data?.message ||
  error.response?.data?.errors?.[0]?.msg ||
  error.message ||
  "Cannot connect to the server. Please try again.";

const getDestination = (role, previousPath) => {
  const allowed = {
    admin: ["/admin", "/profile", "/budget", "/attendance", "/organizer/create-event"],
    organizer: ["/organizer", "/profile", "/budget", "/attendance", "/organizer/create-event"],
    attendee: ["/profile"]
  };
  return typeof previousPath === "string" && allowed[role]?.includes(previousPath)
    ? previousPath : getRoleHome(role);
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    register,
    isAuthenticated,
    user,
    loading,
    logout
  } = useAuth();

  const [mode, setMode] = useState(() => getModeFromSearch(location.search));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [touched, setTouched] = useState({});
  const [availability, setAvailability] = useState(initialAvailability);

  const isRegister = mode === "register";
  const cleanedEmail = email.trim().toLowerCase();
  const cleanedUsername = username.trim().toLowerCase();
  const cleanedName = fullName.trim();

  const fullNameValid = cleanedName.length >= 1 && cleanedName.length <= 100;
  const emailValid = cleanedEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail);
  const usernameValid = /^[a-z0-9_]{3,30}$/.test(cleanedUsername);

  const passwordChecks = [
    { label: "10–128 characters", valid: password.length >= 10 && password.length <= 128 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
    { label: "Special character", valid: /[^A-Za-z0-9]/.test(password) }
  ];

  const strengthScore = passwordChecks.filter(x => x.valid).length;
  const passwordValid = strengthScore === 5;
  const confirmValid = Boolean(confirmPassword) && password === confirmPassword;

  const emailAvailable =
    availability.email.value === cleanedEmail &&
    availability.email.status === "available";

  const usernameAvailable =
    availability.username.value === cleanedUsername &&
    availability.username.status === "available";

  const canRegister =
    fullNameValid && emailValid && usernameValid &&
    passwordValid && confirmValid && emailAvailable && usernameAvailable;

  const strengthLabel = strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Good" : "Strong";
  const strengthColor = strengthScore <= 2 ? "bg-red-400" : strengthScore <= 4 ? "bg-amber-400" : "bg-emerald-500";

  useEffect(() => {
    setMode(getModeFromSearch(location.search));
    setMessage("");
  }, [location.search]);

  useEffect(() => {
    if (!isRegister || !emailValid || isAuthenticated) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setAvailability(prev => ({
        ...prev,
        email: { value: cleanedEmail, status: "checking" }
      }));

      try {
        const { data } = await api.get("/api/auth/check-availability", {
          params: { email: cleanedEmail },
          signal: controller.signal
        });

        if (!controller.signal.aborted) {
          setAvailability(prev => ({
            ...prev,
            email: {
              value: cleanedEmail,
              status: data.emailAvailable === true ? "available" : "taken"
            }
          }));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAvailability(prev => ({
            ...prev,
            email: { value: cleanedEmail, status: "error" }
          }));
        }
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cleanedEmail, emailValid, isRegister, isAuthenticated]);

  useEffect(() => {
    if (!isRegister || !usernameValid || isAuthenticated) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setAvailability(prev => ({
        ...prev,
        username: { value: cleanedUsername, status: "checking" }
      }));

      try {
        const { data } = await api.get("/api/auth/check-availability", {
          params: { username: cleanedUsername },
          signal: controller.signal
        });

        if (!controller.signal.aborted) {
          setAvailability(prev => ({
            ...prev,
            username: {
              value: cleanedUsername,
              status: data.usernameAvailable === true ? "available" : "taken"
            }
          }));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setAvailability(prev => ({
            ...prev,
            username: { value: cleanedUsername, status: "error" }
          }));
        }
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cleanedUsername, usernameValid, isRegister, isAuthenticated]);

  const markTouched = field =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const getHint = field => {
    if (!isRegister || !touched[field]) return null;

    if (field === "fullName") {
      return {
        valid: fullNameValid,
        text: fullNameValid
          ? "Full name looks good."
          : "Full name is required (maximum 100 characters)."
      };
    }

    if (field === "email") {
      if (!emailValid) {
        return { valid: false, text: "Please enter a valid email address." };
      }

      if (
        availability.email.value !== cleanedEmail ||
        ["idle", "checking"].includes(availability.email.status)
      ) {
        return { valid: null, text: "Checking email availability..." };
      }

      if (availability.email.status === "error") {
        return { valid: false, text: "Unable to check email. Please try again." };
      }

      if (availability.email.status === "taken") {
        return { valid: false, text: "This email is already registered. Please sign in." };
      }

      return { valid: true, text: "Email is available." };
    }

    if (field === "username") {
      if (!usernameValid) {
        return { valid: false, text: "Use 3–30 letters, numbers, or underscores." };
      }

      if (
        availability.username.value !== cleanedUsername ||
        ["idle", "checking"].includes(availability.username.status)
      ) {
        return { valid: null, text: "Checking username availability..." };
      }

      if (availability.username.status === "error") {
        return { valid: false, text: "Unable to check username. Please try again." };
      }

      if (availability.username.status === "taken") {
        return { valid: false, text: "This username is already taken. Choose another username." };
      }

      return { valid: true, text: "Username is available." };
    }

    if (field === "password") {
      return {
        valid: passwordValid,
        text: passwordValid
          ? "Password meets all requirements."
          : "Complete all five password requirements."
      };
    }

    if (field === "confirmPassword") {
      return {
        valid: confirmValid,
        text: confirmValid
          ? "Passwords match."
          : "Passwords do not match."
      };
    }

    return null;
  };

  const renderHint = field => {
    const result = getHint(field);
    if (!result) return null;

    return (
      <p
        aria-live="polite"
        className={`mt-2 flex items-center gap-1.5 text-xs ${result.valid === true ? "text-emerald-700" :
            result.valid === null ? "text-[#64796B]" : "text-red-600"
          }`}
      >
        {result.valid === true ?
          <CheckCircle2 size={14} /> :
          result.valid === null ?
            <Loader2 size={14} className="animate-spin" /> :
            <AlertCircle size={14} />}
        {result.text}
      </p>
    );
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setTouched({});
    setAvailability({
      email: { value: "", status: "idle" },
      username: { value: "", status: "idle" }
    });
    setMessage("");
  };

  const switchMode = nextMode => {
    if (submitting) return;

    resetForm();
    setMode(nextMode);

    navigate(
      nextMode === "register" ? "/login?mode=register" : "/login",
      {
        replace: true,
        state: location.state
      }
    );
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (submitting || loading || isAuthenticated) return;

    setMessage("");

    if (isRegister) {
      setTouched({
        fullName: true,
        email: true,
        username: true,
        password: true,
        confirmPassword: true
      });

      if (!canRegister) return;
    }

    if (!cleanedUsername || !password) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (!usernameValid) {
      setMessage("Username must contain 3–30 letters, numbers, or underscores.");
      return;
    }

    setSubmitting(true);

    try {
      if (isRegister) {
        const response = await register(
          cleanedUsername,
          cleanedEmail,
          cleanedName,
          password
        );

        setPassword("");
        setConfirmPassword("");

        if (response.user?.emailVerified !== true) {
          setVerificationOpen(true);
          return;
        }

        navigate(
          getRoleHome(response.user?.role || "attendee"),
          { replace: true }
        );

        return;
      }

      const response = await login(
        cleanedUsername,
        password
      );

      setPassword("");
      setConfirmPassword("");
      setVerificationOpen(false);

      navigate(
        getDestination(
          response.user?.role || "attendee",
          location.state?.from
        ),
        { replace: true }
      );

    } catch (error) {
      setMessage(getErrorMessage(error));

      const code = error.response?.data?.code;
      const status = error.response?.status;
      const backendMessage = String(
        error.response?.data?.message || ""
      ).toLowerCase();

      if (isRegister && status === 409) {
        if (
          code === "EMAIL_ALREADY_REGISTERED" ||
          backendMessage.includes("email")
        ) {
          setAvailability(prev => ({
            ...prev,
            email: { value: cleanedEmail, status: "taken" }
          }));
        }

        if (
          code === "USERNAME_ALREADY_REGISTERED" ||
          backendMessage.includes("username")
        ) {
          setAvailability(prev => ({
            ...prev,
            username: { value: cleanedUsername, status: "taken" }
          }));
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setVerificationOpen(false);
    resetForm();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F5EF] pt-20">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DDE6DD] border-t-[#173B2F]" />
          <p className="mt-4 text-sm font-medium text-[#64796B]">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F5EF] pt-20 text-[#173B2F]">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        <div className="grid overflow-hidden rounded-[28px] border border-[#E2E8E0] bg-white shadow-[0_24px_80px_rgba(23,59,47,0.07)] lg:min-h-[690px] lg:grid-cols-[1.05fr_0.95fr]">

          <aside className="relative order-2 flex flex-col overflow-hidden bg-[#173B2F] p-7 text-white sm:p-10 lg:order-1 lg:p-12">

            <div className="pointer-events-none absolute -right-32 -top-36 h-[400px] w-[400px] rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-44 -left-28 h-[400px] w-[400px] rounded-full bg-[#52B788]/10 blur-3xl" />

            <div className="relative z-10">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#52B788] text-[#173B2F]">
                  <CalendarDays size={23} strokeWidth={2.3} />
                </div>
                <div>
                  <p className="text-xl font-black tracking-[-0.05em]">
                    ANO G<span className="text-[#52B788]">?</span>
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-[0.17em] text-white/50">
                    Event Management Platform
                  </p>
                </div>
              </div>

              <div className="mt-14 lg:mt-20">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#52B788]/30 bg-[#52B788]/10 px-4 py-2">
                  <Sparkles size={14} className="text-[#77D6A7]" />
                  <span className="text-[11px] font-semibold tracking-wide text-[#A8E8C7]">
                    YOUR NEXT EXPERIENCE STARTS HERE
                  </span>
                </div>

                <h1 className="max-w-lg text-4xl font-black leading-[1.1] tracking-[-0.055em] sm:text-5xl lg:text-[54px]">
                  Good events.<br />
                  Great people.<br />
                  <span className="text-[#78D5A5]">One place.</span>
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                  Discover exciting events, connect with communities,
                  and turn your ideas into unforgettable experiences.
                  Everything starts with ANO G?.
                </p>
              </div>

              <div className="mt-10 space-y-3 lg:mt-12">
                {features.map(feature => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#52B788]/15 text-[#8BE1B4]">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{feature.title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/45">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 mt-12 flex items-center justify-between border-t border-white/10 pt-6 text-[11px] text-white/40">
              <span>Discover. Connect. Experience.</span>
              <span>ANO G? Platform</span>
            </div>
          </aside>

          <section className="order-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:order-2 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-[420px]">

              {!isAuthenticated ? (
                <>
                  <div className="mb-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#E8F4EB] px-3 py-1.5 text-[11px] font-semibold text-[#2F7953]">
                      <ShieldCheck size={14} />
                      Secure Account Access
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                      {isRegister ? "Join ANO G?" : "Welcome back"}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-[#829088]">
                      {isRegister
                        ? "Create your attendee account and start exploring events."
                        : "Sign in to explore events and manage your experience."}
                    </p>
                  </div>

                  <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-[#F1F5F0] p-1">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => switchMode("login")}
                      className={`rounded-lg py-3 text-sm font-semibold transition ${!isRegister
                          ? "bg-white text-[#173B2F] shadow-sm"
                          : "text-[#849188] hover:text-[#173B2F]"
                        }`}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => switchMode("register")}
                      className={`rounded-lg py-3 text-sm font-semibold transition ${isRegister
                          ? "bg-white text-[#173B2F] shadow-sm"
                          : "text-[#849188] hover:text-[#173B2F]"
                        }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                    {isRegister && (
                      <>
                        <div>
                          <label htmlFor="ano-fullname" className="mb-2 block text-xs font-semibold">
                            Full Name
                          </label>
                          <div className="relative">
                            <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A098]" />
                            <input
                              id="ano-fullname"
                              type="text"
                              value={fullName}
                              onChange={e => {
                                setFullName(e.target.value);
                                markTouched("fullName");
                                setMessage("");
                              }}
                              onBlur={() => markTouched("fullName")}
                              placeholder="Enter your full name"
                              autoComplete="name"
                              maxLength={100}
                              className={`${inputClass} pl-11`}
                            />
                          </div>
                          {renderHint("fullName")}
                        </div>

                        <div>
                          <label htmlFor="ano-email" className="mb-2 block text-xs font-semibold">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A098]" />
                            <input
                              id="ano-email"
                              type="email"
                              value={email}
                              onChange={e => {
                                setEmail(e.target.value);
                                markTouched("email");
                                setMessage("");
                              }}
                              onBlur={() => markTouched("email")}
                              placeholder="you@example.com"
                              autoComplete="email"
                              maxLength={254}
                              className={`${inputClass} pl-11 pr-10`}
                            />
                            {emailAvailable && (
                              <CheckCircle2
                                size={18}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600"
                              />
                            )}
                          </div>
                          {renderHint("email")}
                          <p className="mt-2 text-[11px] leading-5 text-[#819287]">
                            This email will be used for account verification and organizer application updates.
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <label htmlFor="ano-username" className="mb-2 block text-xs font-semibold">
                        Username
                      </label>
                      <div className="relative">
                        <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A098]" />
                        <input
                          id="ano-username"
                          type="text"
                          value={username}
                          onChange={e => {
                            setUsername(e.target.value);
                            if (isRegister) markTouched("username");
                            setMessage("");
                          }}
                          onBlur={() => isRegister && markTouched("username")}
                          placeholder="Enter your username"
                          autoComplete="username"
                          minLength={3}
                          maxLength={30}
                          className={`${inputClass} pl-11 pr-10`}
                        />
                        {isRegister && usernameAvailable && (
                          <CheckCircle2
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600"
                          />
                        )}
                      </div>
                      {renderHint("username")}
                    </div>

                    <div>
                      <label htmlFor="ano-password" className="mb-2 block text-xs font-semibold">
                        Password
                      </label>
                      <div className="relative">
                        <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A098]" />
                        <input
                          id="ano-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => {
                            setPassword(e.target.value);
                            if (isRegister) markTouched("password");
                            setMessage("");
                          }}
                          onBlur={() => isRegister && markTouched("password")}
                          placeholder="Enter your password"
                          autoComplete={isRegister ? "new-password" : "current-password"}
                          className={`${inputClass} pl-11 pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#91A098] hover:text-[#173B2F]"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {renderHint("password")}
                    </div>

                    {isRegister && (
                      <>
                        <div>
                          <label htmlFor="ano-confirm-password" className="mb-2 block text-xs font-semibold">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A098]" />
                            <input
                              id="ano-confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={e => {
                                setConfirmPassword(e.target.value);
                                markTouched("confirmPassword");
                                setMessage("");
                              }}
                              onBlur={() => markTouched("confirmPassword")}
                              placeholder="Re-enter your password"
                              autoComplete="new-password"
                              className={`${inputClass} pl-11 pr-12`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#91A098] hover:text-[#173B2F]"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {renderHint("confirmPassword")}
                        </div>

                        <div className="rounded-xl border border-[#E3EAE2] bg-[#F8FAF7] p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">Password Security</span>
                            <span className="text-xs font-bold text-[#648071]">
                              {password ? strengthLabel : "Not set"}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-5 gap-1.5">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <div
                                key={index}
                                className={`h-1.5 rounded-full ${index < strengthScore ? strengthColor : "bg-[#DEE7DF]"
                                  }`}
                              />
                            ))}
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {passwordChecks.map(check => (
                              <div key={check.label} className="flex items-center gap-2 text-[11px]">
                                <Check
                                  size={13}
                                  className={check.valid ? "text-emerald-600" : "text-[#B5C0B8]"}
                                />
                                <span className={check.valid ? "text-[#2F7953]" : "text-[#849188]"}>
                                  {check.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-[#EEF6EF] p-4">
                          <Users size={19} className="mt-0.5 shrink-0 text-[#38815B]" />
                          <p className="text-xs leading-5 text-[#527260]">
                            New accounts are registered as Attendees.
                            You can apply to become an Organizer after verifying your email.
                            Organizer approval is handled by an administrator.
                          </p>
                        </div>
                      </>
                    )}

                    {message && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="mt-0.5 shrink-0" />
                          <span>{message}</span>
                        </div>

                        {isRegister &&
                          message.toLowerCase().includes("email") &&
                          message.toLowerCase().includes("registered") && (
                            <button
                              type="button"
                              onClick={() => switchMode("login")}
                              className="mt-2 font-bold text-[#173B2F] underline"
                            >
                              Sign in instead
                            </button>
                          )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || loading || (isRegister && !canRegister)}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#285742] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? "Please wait..."
                        : isRegister
                          ? "Create My Account"
                          : "Sign In to ANO G?"}
                      {!submitting && (
                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      )}
                    </button>

                    {isRegister && !canRegister && (
                      <p className="text-center text-[11px] leading-5 text-[#819287]">
                        Complete all fields and confirm that your email and username are available to create an account.
                      </p>
                    )}
                  </form>

                  <div className="mt-7 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#E6EBE4]" />
                    <span className="text-[11px] text-[#98A49B]">
                      {isRegister ? "Already part of ANO G?" : "New to ANO G?"}
                    </span>
                    <div className="h-px flex-1 bg-[#E6EBE4]" />
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => switchMode(isRegister ? "login" : "register")}
                    className="mt-5 w-full text-center text-sm font-semibold text-[#2F7953] hover:underline"
                  >
                    {isRegister ? "Sign in to your account" : "Create your free account"}
                  </button>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E8F5EC] text-[#2F7953]">
                    <CheckCircle2 size={38} />
                  </div>

                  <h2 className="mt-7 text-3xl font-extrabold tracking-tight">
                    You're signed in!
                  </h2>

                  <p className="mt-3 text-sm text-[#849188]">
                    Welcome back, {user?.fullName || user?.username}.
                  </p>

                  <div className="mt-5 inline-flex rounded-full bg-[#E8F5EC] px-4 py-2 text-xs font-semibold capitalize text-[#2F7953]">
                    {user?.role || "Attendee"} Account
                  </div>

                  {user?.email && (
                    <div className="mt-5 rounded-xl border border-[#E3EAE2] bg-[#F8FAF7] p-4 text-left">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-[#38815B]" />
                        <span className="text-xs font-semibold">Registered Email</span>
                      </div>
                      <p className="mt-2 break-all text-sm text-[#64796B]">
                        {user.email}
                      </p>
                      <p className={`mt-2 text-xs font-semibold ${user.emailVerified ? "text-emerald-700" : "text-amber-700"
                        }`}>
                        {user.emailVerified ? "Email verified" : "Email not yet verified"}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate(getRoleHome(user?.role), { replace: true })}
                    className="mt-9 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-5 py-4 text-sm font-semibold text-white hover:bg-[#285742]"
                  >
                    Continue to Workspace
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-[#849188] hover:text-[#173B2F]"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}

              <div className="mt-10 flex items-center justify-center gap-2 border-t border-[#E6EBE4] pt-6 text-[11px] text-[#98A49B]">
                <ShieldCheck size={14} />
                Protected account access
                <span className="mx-1">•</span>
                ANO G?
              </div>
            </div>
          </section>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-3 text-center text-xs text-[#8D9B91] sm:flex-row">
          <span>© {new Date().getFullYear()} ANO G? Event Platform</span>
          <span>Discover events. Create experiences. Bring people together.</span>
        </div>
      </main>

      <EmailVerificationModal
        open={verificationOpen}
        onVerified={verifiedUser => {
          setVerificationOpen(false);
          navigate(
            getRoleHome(verifiedUser?.role || "attendee"),
            { replace: true }
          );
        }}
        onSignOut={handleLogout}
      />
    </div>
  );
}

export default Login;
