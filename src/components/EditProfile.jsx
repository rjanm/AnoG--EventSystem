
import React, { useEffect, useRef, useState } from "react";
import {
  AtSign,
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const tabs = [
  { id: "personal", label: "Personal Info", icon: UserRound },
  { id: "photo", label: "Profile Photo", icon: Camera },
  { id: "username", label: "Username", icon: AtSign },
  { id: "email", label: "Email Address", icon: Mail },
  { id: "password", label: "Password", icon: LockKeyhole }
];

const inputClass =
  "w-full rounded-xl border border-[#DFE8DE] bg-[#FAFCF9] px-4 py-3 text-sm text-[#173B2F] outline-none transition focus:border-[#438363] focus:ring-4 focus:ring-[#438363]/10";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285742] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#DFE8DE] bg-white px-5 py-3 text-sm font-semibold text-[#173B2F] transition hover:bg-[#F2F5EF] disabled:opacity-50";

const getError = error => {
  const data = error?.response?.data;

  return (
    data?.message ||
    data?.errors?.[0]?.msg ||
    data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#284D3A]">
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-2 text-xs leading-5 text-[#819184]">
          {hint}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "off"
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${inputClass} pr-12`}
          required
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#839589] hover:text-[#173B2F]"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  );
}

export default function EditProfile({ isOpen, onClose }) {
  const {
    user,
    refreshProfile,
    uploadProfilePicture,
    removeProfilePicture
  } = useAuth();

  const fileRef = useRef(null);
  const modalRef = useRef(null);

  const [activeTab, setActiveTab] = useState("personal");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [username, setUsername] = useState("");
  const [usernamePassword, setUsernamePassword] = useState("");

  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFullName(user?.fullName || "");
    setPhoneNumber(
      String(user?.phoneNumber || "")
        .replace(/[^0-9]/g, "")
        .slice(0, 15)
    );

    setUsername(user?.username || "");
    setUsernamePassword("");
    setEmail("");
    setEmailPassword("");
    setPendingEmail("");
    setVerificationCode("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSelectedFile(null);
    setActiveTab("personal");
    setMessage("");
    setError("");
    setImageFailed(false);
  }, [isOpen]);

  useEffect(() => {
    if (!selectedFile) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    setImageFailed(false);
  }, [user?.profilePicture, preview]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = event => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(element => element.getClientRects().length > 0);

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = "hidden";
    modalRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, [isOpen, busy, onClose]);

  const switchTab = tab => {
    if (busy) return;

    setActiveTab(tab);
    setMessage("");
    setError("");
  };

  const runAction = async (action, successMessage) => {
    if (busy) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await action();
      await refreshProfile();
      setMessage(successMessage);
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err.response?.data || err);
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const savePersonal = async event => {
    event.preventDefault();

    const name = fullName.trim();
    const phone = phoneNumber.trim();

    if (!name || name.length > 100) {
      setError("Full name must contain 1 to 100 characters.");
      return;
    }

    if (phone && !/^[0-9]{7,15}$/.test(phone)) {
      setError("Phone number must contain 7 to 15 digits only.");
      return;
    }

    await runAction(
      () =>
        api.put("/api/auth/profile", {
          fullName: name,
          phoneNumber: phone
        }),
      "Personal information updated successfully."
    );
  };

  const selectPhoto = event => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile picture must not exceed 2 MB.");
      return;
    }

    if (file.size === 0) {
      setError("The selected image is empty.");
      return;
    }

    setSelectedFile(file);
    setImageFailed(false);
    setError("");
    setMessage("");
  };

  const uploadPhoto = async () => {
    if (!selectedFile || busy) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await uploadProfilePicture(selectedFile);

      if (result?.success === false) {
        throw new Error(
          result.message || "Profile picture upload failed."
        );
      }

      if (!result?.user) {
        await refreshProfile();
      }

      setSelectedFile(null);
      setImageFailed(false);
      setMessage("Profile picture updated successfully.");
    } catch (err) {
      console.error(
        "PROFILE PICTURE UPLOAD STATUS:",
        err.response?.status
      );
      console.error(
        "PROFILE PICTURE UPLOAD RESPONSE:",
        err.response?.data
      );
      console.error(
        "PROFILE PICTURE UPLOAD ERROR:",
        err
      );

      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    if (busy) return;

    if (selectedFile) {
      setSelectedFile(null);
      setError("");
      setMessage("");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await removeProfilePicture();

      if (result?.success === false) {
        throw new Error(
          result.message || "Unable to remove profile picture."
        );
      }

      if (!result?.user) {
        await refreshProfile();
      }

      setImageFailed(false);
      setMessage("Profile picture removed successfully.");
    } catch (err) {
      console.error(
        "PROFILE PICTURE REMOVE ERROR:",
        err.response?.data || err
      );
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const saveUsername = async event => {
    event.preventDefault();

    const cleaned = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,30}$/.test(cleaned)) {
      setError(
        "Username must contain 3–30 letters, numbers, or underscores."
      );
      return;
    }

    if (cleaned === user?.username?.toLowerCase()) {
      setError("Enter a different username.");
      return;
    }

    await runAction(async () => {
      await api.put("/api/auth/change-username", {
        username: cleaned,
        currentPassword: usernamePassword
      });

      setUsernamePassword("");
    }, "Username changed successfully.");
  };

  const requestNewEmail = async event => {
    event.preventDefault();

    const cleaned = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setError("Enter a valid email address.");
      return;
    }

    if (cleaned === user?.email?.toLowerCase()) {
      setError("This is already your current email.");
      return;
    }

    if (busy) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        "/api/auth/request-email-change",
        {
          email: cleaned,
          currentPassword: emailPassword
        }
      );

      setPendingEmail(response.data.pendingEmail || cleaned);
      setEmailPassword("");
      setMessage("Verification code sent to your new email.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmNewEmail = async event => {
    event.preventDefault();

    if (!/^[0-9]{6}$/.test(verificationCode)) {
      setError("Enter the six-digit verification code.");
      return;
    }

    await runAction(async () => {
      await api.post("/api/auth/confirm-email-change", {
        code: verificationCode
      });

      setPendingEmail("");
      setEmail("");
      setVerificationCode("");
    }, "Email address changed and verified successfully.");
  };

  const savePassword = async event => {
    event.preventDefault();

    const valid =
      newPassword.length >= 10 &&
      newPassword.length <= 128 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword);

    if (!valid) {
      setError(
        "Password must have 10–128 characters, uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    await runAction(async () => {
      await api.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, "Password changed successfully.");
  };

  const initials = (user?.fullName || user?.username || "A")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#07150E]/65 p-3 backdrop-blur-[5px] sm:p-6"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="flex max-h-[min(90vh,800px)] w-full max-w-[900px] flex-col overflow-hidden rounded-[22px] bg-white text-[#173B2F] shadow-2xl outline-none"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8EDE6] px-5 py-5 sm:px-7">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.17em] text-[#6A9779]">
              ANO G? / ACCOUNT SETTINGS
            </p>

            <h2
              id="edit-profile-title"
              className="text-xl font-extrabold tracking-tight sm:text-2xl"
            >
              Edit Profile
            </h2>

            <p className="mt-1 text-xs text-[#859287]">
              Update your information and account security.
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close editor"
            className="rounded-xl border border-[#E8EDE6] p-2.5 text-[#607667] transition hover:bg-[#F2F5EF] disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <aside className="shrink-0 border-b border-[#E8EDE6] bg-[#F7F9F5] p-3 sm:w-[235px] sm:border-b-0 sm:border-r sm:p-5">
            <div className="mb-5 hidden items-center gap-3 rounded-xl bg-white p-3 sm:flex">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DDEDE0] text-sm font-bold">
                {user?.profilePicture && !imageFailed ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold">
                  {user?.fullName || "Member"}
                </p>
                <p className="truncate text-[11px] text-[#849188]">
                  @{user?.username || "member"}
                </p>
              </div>
            </div>

            <nav
              aria-label="Profile settings"
              className="flex gap-1 overflow-x-auto sm:flex-col"
            >
              {tabs.map(tab => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={busy}
                    onClick={() => switchTab(tab.id)}
                    aria-current={selected ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-3 text-left text-xs font-semibold transition sm:w-full ${
                      selected
                        ? "bg-[#173B2F] text-white"
                        : "text-[#6C8071] hover:bg-[#EAF0E8]"
                    }`}
                  >
                    <Icon size={17} />
                    <span className="whitespace-nowrap">
                      {tab.label}
                    </span>
                    {selected && (
                      <ChevronRight
                        size={14}
                        className="ml-auto hidden sm:block"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-7 hidden rounded-xl border border-[#DDE8DC] bg-white p-4 sm:block">
              <ShieldCheck size={19} className="text-[#448765]" />
              <p className="mt-2 text-xs font-bold">
                Account Security
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#8A988D]">
                Sensitive changes require your current password.
              </p>
            </div>
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
            {activeTab === "personal" && (
              <form onSubmit={savePersonal} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">
                    Personal Information
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#859287]">
                    These details help personalize your ANO G? account.
                  </p>
                </div>

                <Field label="Full Name">
                  <input
                    className={inputClass}
                    value={fullName}
                    onChange={event =>
                      setFullName(event.target.value)
                    }
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </Field>

                <Field
                  label="Phone Number"
                  hint="Optional. Numbers only. Example: 09171234567"
                >
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={inputClass}
                    value={phoneNumber}
                    onChange={event => {
                      const numbersOnly =
                        event.target.value.replace(/[^0-9]/g, "");

                      setPhoneNumber(numbersOnly.slice(0, 15));

                      if (error) setError("");
                    }}
                    maxLength={15}
                    placeholder="Enter phone number"
                    autoComplete="tel"
                  />
                </Field>

                <div className="flex justify-end border-t border-[#E8EDE6] pt-5">
                  <button
                    type="submit"
                    disabled={busy}
                    className={primaryButton}
                  >
                    {busy ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === "photo" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">
                    Profile Photo
                  </h3>
                  <p className="mt-2 text-xs text-[#859287]">
                    Add a photo to make your profile recognizable.
                  </p>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={selectPhoto}
                />

                <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#C7D8C8] bg-[#F8FAF7] px-5 py-8">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#DDEDE0] text-3xl font-black shadow-sm">
                    {(preview || user?.profilePicture) &&
                    !imageFailed ? (
                      <img
                        src={preview || user.profilePicture}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                        onError={() => setImageFailed(true)}
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <p className="mt-4 max-w-full break-all text-center text-sm font-bold">
                    {selectedFile
                      ? selectedFile.name
                      : "Your Profile Photo"}
                  </p>

                  <p className="mt-2 text-xs text-[#859287]">
                    JPG, PNG, or WebP · Maximum 2 MB
                  </p>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                    className={`${secondaryButton} mt-5`}
                  >
                    <ImagePlus size={17} />
                    Choose Image
                  </button>
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                  {(selectedFile || user?.profilePicture) && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={removePhoto}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {selectedFile
                        ? "Cancel Selection"
                        : "Remove Photo"}
                    </button>
                  )}

                  {selectedFile && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={uploadPhoto}
                      className={primaryButton}
                    >
                      {busy ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save size={16} />
                      )}
                      {busy ? "Uploading..." : "Upload Photo"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === "username" && (
              <form onSubmit={saveUsername} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">
                    Change Username
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#859287]">
                    Your username is used when signing in.
                  </p>
                </div>

                <Field
                  label="New Username"
                  hint="3–30 characters. Letters, numbers, and underscores only."
                >
                  <input
                    className={inputClass}
                    value={username}
                    onChange={event =>
                      setUsername(event.target.value.toLowerCase())
                    }
                    maxLength={30}
                    autoComplete="username"
                    required
                  />
                </Field>

                <PasswordField
                  label="Current Password"
                  value={usernamePassword}
                  onChange={event =>
                    setUsernamePassword(event.target.value)
                  }
                  placeholder="Confirm your password"
                  autoComplete="current-password"
                />

                <div className="flex justify-end border-t border-[#E8EDE6] pt-5">
                  <button
                    type="submit"
                    disabled={busy}
                    className={primaryButton}
                  >
                    {busy ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={16} />
                    )}
                    Update Username
                  </button>
                </div>
              </form>
            )}

            {activeTab === "email" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">
                    Email Address
                  </h3>
                  <p className="mt-2 text-xs text-[#859287]">
                    A verification code will be sent to your new email.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E0E9DF] bg-[#F8FAF7] p-4">
                  <p className="text-xs text-[#859287]">
                    Current Email
                  </p>
                  <p className="mt-1 break-all text-sm font-bold">
                    {user?.email}
                  </p>
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      user?.emailVerified
                        ? "text-[#39805A]"
                        : "text-amber-700"
                    }`}
                  >
                    {user?.emailVerified
                      ? "Verified"
                      : "Not verified"}
                  </p>
                </div>

                {!pendingEmail ? (
                  <form
                    onSubmit={requestNewEmail}
                    className="space-y-5"
                  >
                    <Field label="New Email Address">
                      <input
                        type="email"
                        className={inputClass}
                        value={email}
                        onChange={event =>
                          setEmail(event.target.value)
                        }
                        placeholder="Enter new email"
                        autoComplete="email"
                        required
                      />
                    </Field>

                    <PasswordField
                      label="Current Password"
                      value={emailPassword}
                      onChange={event =>
                        setEmailPassword(event.target.value)
                      }
                      placeholder="Confirm your password"
                      autoComplete="current-password"
                    />

                    <div className="flex justify-end border-t border-[#E8EDE6] pt-5">
                      <button
                        type="submit"
                        disabled={busy}
                        className={primaryButton}
                      >
                        {busy ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Mail size={16} />
                        )}
                        Send Verification Code
                      </button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={confirmNewEmail}
                    className="space-y-5"
                  >
                    <div className="rounded-xl bg-[#EAF5ED] p-4 text-xs leading-5 text-[#326C4B]">
                      A six-digit code was sent to{" "}
                      <strong className="break-all">
                        {pendingEmail}
                      </strong>
                      .
                    </div>

                    <Field label="Verification Code">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className={`${inputClass} text-center text-lg font-bold tracking-[0.3em]`}
                        value={verificationCode}
                        onChange={event =>
                          setVerificationCode(
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="000000"
                        required
                      />
                    </Field>

                    <div className="flex justify-end gap-3 border-t border-[#E8EDE6] pt-5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setPendingEmail("");
                          setVerificationCode("");
                          setMessage("");
                          setError("");
                        }}
                        className={secondaryButton}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={busy}
                        className={primaryButton}
                      >
                        {busy ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Verify Email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === "password" && (
              <form onSubmit={savePassword} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">
                    Change Password
                  </h3>
                  <p className="mt-2 text-xs text-[#859287]">
                    Use a strong, unique password to protect your account.
                  </p>
                </div>

                <PasswordField
                  label="Current Password"
                  value={currentPassword}
                  onChange={event =>
                    setCurrentPassword(event.target.value)
                  }
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />

                <PasswordField
                  label="New Password"
                  value={newPassword}
                  onChange={event =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />

                <PasswordField
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={event =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />

                <p className="text-xs leading-5 text-[#859287]">
                  Minimum 10 characters with uppercase, lowercase,
                  number, and special character.
                </p>

                <div className="flex justify-end border-t border-[#E8EDE6] pt-5">
                  <button
                    type="submit"
                    disabled={busy}
                    className={primaryButton}
                  >
                    {busy ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <LockKeyhole size={16} />
                    )}
                    Change Password
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mt-6 flex items-start gap-2 rounded-xl border border-[#CBE6D1] bg-[#EFF8F0] px-4 py-3 text-xs leading-5 text-[#32734F]"
              >
                <CheckCircle2
                  size={17}
                  className="shrink-0"
                />
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
