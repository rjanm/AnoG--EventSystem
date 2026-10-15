
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Clock3,
  LockKeyhole,
  MailCheck,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong. Please try again.";

function EmailVerificationModal({ open, onVerified, onSignOut }) {
  const {
    user,
    emailVerified,
    verifyEmail,
    resendVerificationEmail
  } = useAuth();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !cooldownUntil) return;

    const updateRemaining = () => {
      setRemaining(
        Math.max(
          0,
          Math.ceil((cooldownUntil - Date.now()) / 1000)
        )
      );
    };

    updateRemaining();

    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [open, cooldownUntil]);

  useEffect(() => {
    if (!open) {
      setCode("");
      setError("");
      setMessage("");
      setCooldownUntil(0);
      setRemaining(0);
    }
  }, [open]);

  const handleVerify = async (event) => {
    event.preventDefault();

    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await verifyEmail(code);

      if (!result?.user?.emailVerified) {
        throw new Error("Email verification was not confirmed.");
      }

      setCode("");
      onVerified?.(result.user);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resending || remaining > 0) return;

    setResending(true);
    setError("");
    setMessage("");

    try {
      await resendVerificationEmail();

      setCooldownUntil(Date.now() + 60000);
      setRemaining(60);
      setCode("");
      setMessage("New code sent. Check your inbox or spam folder.");
      inputRef.current?.focus();
    } catch (err) {
      setError(getErrorMessage(err));

      if (err.response?.status === 429) {
        setCooldownUntil(Date.now() + 60000);
        setRemaining(60);
      }
    } finally {
      setResending(false);
    }
  };

  if (!open || !user || emailVerified) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#07140F]/75 px-4 py-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-title"
        className="my-auto w-full max-w-[410px] overflow-hidden rounded-[20px] border border-[#DDE8DD] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="relative bg-[#173B2F] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#91E0B5]">
              <MailCheck size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <h2
                id="verification-title"
                className="text-lg font-extrabold tracking-tight"
              >
                Verify Your Email
              </h2>

              <p className="mt-0.5 text-xs text-white/65">
                One step away from your ANO G? account.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-5">
          <div className="mb-5 text-center">
            <p className="text-xs leading-5 text-[#77897D]">
              Enter the 6-digit verification code sent to
            </p>

            <p className="mt-1 break-all text-sm font-bold text-[#173B2F]">
              {user.email}
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <label
              htmlFor="email-otp"
              className="mb-2 block text-xs font-bold text-[#173B2F]"
            >
              Verification Code
            </label>

            <input
              ref={inputRef}
              id="email-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                );
                setError("");
              }}
              maxLength={6}
              placeholder="000000"
              required
              aria-invalid={Boolean(error)}
              className="h-[58px] w-full rounded-xl border border-[#DDE6DD] bg-[#F8FAF7] px-4 text-center text-[27px] font-extrabold tracking-[0.3em] text-[#173B2F] outline-none transition placeholder:text-[#C2CEC5] focus:border-[#3B8063] focus:ring-4 focus:ring-[#3B8063]/10"
            />

            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#849188]">
              <Clock3 size={12} />
              Code expires in 10 minutes
            </div>

            {error && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs leading-5 text-green-800"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#173B2F] text-sm font-bold text-white transition hover:bg-[#285742] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-[#849188]">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || remaining > 0}
              className="mt-1.5 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#2F7953] transition hover:text-[#173B2F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={resending ? "animate-spin" : ""}
              />

              {resending
                ? "Sending..."
                : remaining > 0
                ? `Resend code in ${remaining}s`
                : "Resend Verification Code"}
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#E0EBDF] bg-[#F3F8F2] px-3 py-2.5">
            <ShieldCheck
              size={15}
              className="mt-0.5 shrink-0 text-[#38815B]"
            />

            <p className="text-[11px] leading-[17px] text-[#527260]">
              Can't find your email? Check your{" "}
              <span className="font-bold">Spam or Junk</span>{" "}
              folder. Your account stays protected until verified.
            </p>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#849188] transition hover:text-[#173B2F]"
          >
            <LockKeyhole size={12} />
            Sign out / Use another account
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationModal;
