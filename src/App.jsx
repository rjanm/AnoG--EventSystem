
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import PasswordChecker from "./pages/PasswordChecker";
import Profile from "./pages/Profile";
import RoleDashboard from "./pages/RoleDashboard";
import OrganizerApplication from "./pages/OrganizerApplication";

import BrowseEvents from "./pages/attendee/BrowseEvents";
import EventDetails from "./pages/EventDetails";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminTrash from "./pages/admin/AdminTrash";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminReports from "./pages/admin/AdminReports";

import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import CreateEvent from "./pages/organizer/CreateEvent";

function App() {
  const location = useLocation();

  const isAdminPage =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  const isOrganizerPage =
    location.pathname === "/organizer" ||
    location.pathname.startsWith("/organizer/");

  const showFooter = !isAdminPage && !isOrganizerPage;

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F5EF] text-[#07140F]">
      <Navbar />

      <main className="flex-1 pt-20">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/events"
            element={<BrowseEvents />}
          />

          <Route
            path="/events/:eventId"
            element={<EventDetails />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={
              <Navigate
                to="/login?mode=register"
                replace
              />
            }
          />

          <Route
            path="/signup"
            element={
              <Navigate
                to="/login?mode=register"
                replace
              />
            }
          />

          <Route
            path="/password"
            element={<PasswordChecker />}
          />

          <Route
            path="/verify-email"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/apply-organizer"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "attendee",
                  "organizer",
                  "admin"
                ]}
              >
                <OrganizerApplication />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="users"
              element={<AdminUsers />}
            />

            <Route
              path="applications"
              element={<AdminApplications />}
            />

            <Route
              path="trash"
              element={<AdminTrash />}
            />

            <Route
              path="events"
              element={<AdminEvents />}
            />

            <Route
              path="reports"
              element={<AdminReports />}
            />
          </Route>

          <Route
            path="/organizer"
            element={
              <ProtectedRoute
                allowedRoles={["organizer"]}
              >
                <RoleDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute
                allowedRoles={["organizer"]}
              >
                <OrganizerEvents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/events/create"
            element={
              <ProtectedRoute
                allowedRoles={["organizer"]}
              >
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/events/:eventId/edit"
            element={
              <ProtectedRoute
                allowedRoles={["organizer"]}
              >
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
                <div className="text-center">
                  <p className="mb-3 text-sm font-semibold text-[#2F7953]">
                    ERROR 404
                  </p>

                  <h1 className="text-3xl font-black tracking-tight">
                    Page Not Found
                  </h1>

                  <p className="mt-3 text-sm text-[#07140F]/50">
                    The page you're looking for doesn't exist.
                  </p>

                  <Link
                    to="/"
                    className="mt-7 inline-flex rounded-xl bg-[#173B2F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#285742]"
                  >
                    Back to Homepage
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default App;
