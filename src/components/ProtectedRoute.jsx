
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, getRoleHome } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const {
    user,
    loading,
    isAuthenticated
  } = useAuth();

  const location = useLocation();

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

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={getRoleHome(user.role)}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
