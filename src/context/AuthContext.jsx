
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "anoGToken";

const normalizeUser = user => {
  if (!user) return null;

  return {
    ...user,
    username: user.username || "",
    email: user.email || "",
    emailVerified: user.emailVerified === true,
    emailVerifiedAt: user.emailVerifiedAt || null,
    fullName: user.fullName || "",
    phoneNumber: user.phoneNumber || "",
    profilePicture: user.profilePicture || "",
    role:
      user.role === "user"
        ? "attendee"
        : user.role || "attendee",
    accountStatus: user.accountStatus || "active",
    isDeleted: user.isDeleted === true,
    organizerApplicationStatus:
      user.organizerApplicationStatus || "none",
    organizerAppliedAt: user.organizerAppliedAt || null,
    organizerReviewedAt: user.organizerReviewedAt || null
  };
};

const isAccountBlocked = user =>
  user?.isDeleted === true ||
  user?.accountStatus === "suspended";

const isAuthRejection = error => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;

  return (
    status === 401 ||
    code === "ACCOUNT_DELETED" ||
    code === "ACCOUNT_SUSPENDED"
  );
};

export const getRoleHome = role => {
  if (role === "admin") return "/admin";
  if (role === "organizer") return "/organizer";
  return "/profile";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const applyUser = useCallback(
    userData => {
      const normalizedUser = normalizeUser(userData);

      if (
        normalizedUser &&
        isAccountBlocked(normalizedUser)
      ) {
        logout();

        throw new Error(
          normalizedUser.isDeleted
            ? "Your account has been deleted by an administrator."
            : "Your account has been suspended."
        );
      }

      setUser(normalizedUser);

      return normalizedUser;
    },
    [logout]
  );

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.get("/api/auth/profile");

      return applyUser(response.data.user);
    } catch (error) {
      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  }, [applyUser, logout]);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const token = sessionStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/api/auth/profile");
        const normalizedUser = normalizeUser(
          response.data.user
        );

        if (isAccountBlocked(normalizedUser)) {
          sessionStorage.removeItem(TOKEN_KEY);

          if (active) {
            setUser(null);
          }

          return;
        }

        if (active) {
          setUser(normalizedUser);
        }
      } catch (error) {
        if (active) {
          sessionStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async (username, password) => {
    const response = await api.post("/api/auth/login", {
      username: username.trim().toLowerCase(),
      password
    });

    const normalizedUser = normalizeUser(
      response.data.user
    );

    if (!response.data.token || !normalizedUser) {
      throw new Error("Invalid login response from server.");
    }

    if (isAccountBlocked(normalizedUser)) {
      throw new Error(
        normalizedUser.isDeleted
          ? "Your account has been deleted by an administrator."
          : "Your account has been suspended."
      );
    }

    sessionStorage.setItem(
      TOKEN_KEY,
      response.data.token
    );

    setUser(normalizedUser);

    return {
      ...response.data,
      user: normalizedUser
    };
  };

  const register = async (
    username,
    email,
    fullName,
    password
  ) => {
    const response = await api.post("/api/auth/register", {
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      password
    });

    const normalizedUser = normalizeUser(
      response.data.user
    );

    if (!response.data.token || !normalizedUser) {
      throw new Error(
        "Invalid registration response from server."
      );
    }

    if (isAccountBlocked(normalizedUser)) {
      throw new Error("This account is not available.");
    }

    sessionStorage.setItem(
      TOKEN_KEY,
      response.data.token
    );

    setUser(normalizedUser);

    return {
      ...response.data,
      user: normalizedUser
    };
  };

  const verifyEmail = async code => {
    try {
      const response = await api.post(
        "/api/auth/verify-email",
        {
          code: String(code).trim()
        }
      );

      let verifiedUser = response.data.user
        ? normalizeUser(response.data.user)
        : null;

      if (!verifiedUser || !verifiedUser.emailVerified) {
        verifiedUser = await refreshProfile();
      } else {
        verifiedUser = applyUser(verifiedUser);
      }

      if (!verifiedUser?.emailVerified) {
        throw new Error(
          "Email verification was not confirmed."
        );
      }

      return {
        ...response.data,
        user: verifiedUser
      };
    } catch (error) {
      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const response = await api.post(
        "/api/auth/resend-verification"
      );

      return response.data;
    } catch (error) {
      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const updateProfile = async profileData => {
    const payload =
      typeof profileData === "string"
        ? {
            fullName: profileData.trim()
          }
        : {
            ...(profileData.fullName !== undefined
              ? {
                  fullName: profileData.fullName.trim()
                }
              : {}),
            ...(profileData.phoneNumber !== undefined
              ? {
                  phoneNumber:
                    profileData.phoneNumber.trim()
                }
              : {})
          };

    try {
      const response = await api.put(
        "/api/auth/profile",
        payload
      );

      const normalizedUser = applyUser(
        response.data.user
      );

      return {
        ...response.data,
        user: normalizedUser
      };
    } catch (error) {
      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const changeUsername = async (
    username,
    currentPassword
  ) => {
    try {
      const response = await api.put(
        "/api/auth/change-username",
        {
          username: username.trim().toLowerCase(),
          currentPassword
        }
      );

      const normalizedUser = applyUser(
        response.data.user
      );

      return {
        ...response.data,
        user: normalizedUser
      };
    } catch (error) {
      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const changePassword = async (
    currentPassword,
    newPassword,
    confirmPassword
  ) => {
    try {
      const response = await api.put(
        "/api/auth/change-password",
        {
          currentPassword,
          newPassword,
          confirmPassword
        }
      );

      return response.data;
    } catch (error) {
      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const requestEmailChange = async (
    email,
    currentPassword
  ) => {
    try {
      const response = await api.post(
        "/api/auth/request-email-change",
        {
          email: email.trim().toLowerCase(),
          currentPassword
        }
      );

      return response.data;
    } catch (error) {
      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const confirmEmailChange = async code => {
    try {
      const response = await api.post(
        "/api/auth/confirm-email-change",
        {
          code: String(code).trim()
        }
      );

      const normalizedUser = applyUser(
        response.data.user
      );

      return {
        ...response.data,
        user: normalizedUser
      };
    } catch (error) {
      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const uploadProfilePicture = async file => {
    if (!(file instanceof File)) {
      throw new Error(
        "Please select a valid profile picture."
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Only JPG, PNG, and WebP images are allowed."
      );
    }

    if (file.size === 0) {
      throw new Error(
        "The selected profile picture is empty."
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error(
        "Profile picture must not exceed 2 MB."
      );
    }

    const formData = new FormData();

    formData.append(
      "profilePicture",
      file,
      file.name
    );

    try {
      const response = await api.post(
        "/api/auth/profile/picture",
        formData
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message ||
            "Unable to upload profile picture."
        );
      }

      const normalizedUser = response.data?.user
        ? applyUser(response.data.user)
        : await refreshProfile();

      return {
        ...response.data,
        user: normalizedUser
      };
    } catch (error) {
      console.error(
        "PROFILE PICTURE UPLOAD STATUS:",
        error.response?.status
      );

      console.error(
        "PROFILE PICTURE UPLOAD RESPONSE:",
        error.response?.data
      );

      console.error(
        "PROFILE PICTURE UPLOAD ERROR:",
        error.message
      );

      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const removeProfilePicture = async () => {
    try {
      const response = await api.delete(
        "/api/auth/profile/picture"
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message ||
            "Unable to remove profile picture."
        );
      }

      const normalizedUser = response.data?.user
        ? applyUser(response.data.user)
        : await refreshProfile();

      return {
        ...response.data,
        user: normalizedUser
      };
    } catch (error) {
      console.error(
        "PROFILE PICTURE REMOVE ERROR:",
        error.response?.data || error.message
      );

      if (isAuthRejection(error)) {
        logout();
      }

      throw error;
    }
  };

  const isVerifiedAccount = Boolean(
    user?.emailVerified
  );

  const requiresEmailVerification = Boolean(
    user && user.emailVerified !== true
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated:
          Boolean(user) && !isAccountBlocked(user),
        isVerifiedAccount,
        requiresEmailVerification,
        role: user?.role || null,
        isAttendee: user?.role === "attendee",
        isOrganizer: user?.role === "organizer",
        isAdmin: user?.role === "admin",
        emailVerified: isVerifiedAccount,
        organizerApplicationStatus:
          user?.organizerApplicationStatus || "none",
        login,
        register,
        verifyEmail,
        resendVerificationEmail,
        logout,
        updateProfile,
        refreshProfile,
        changeUsername,
        changePassword,
        requestEmailChange,
        confirmEmailChange,
        uploadProfilePicture,
        removeProfilePicture
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
};
