import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EventRegistration from "./pages/EventRegistration";
import EventBudget from "./pages/EventBudget";
import AttendanceChecker from "./pages/AttendanceChecker";

function App() {
  return (
    <div className="min-h-screen bg-[#070711] text-white">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<EventRegistration />} />
          <Route path="/budget" element={<EventBudget />} />
          <Route path="/attendance" element={<AttendanceChecker />} />
        </Routes>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <p className="text-sm text-gray-500">
          Event Management System • React JS Practical Assessment
        </p>
      </footer>
    </div>
  );
}

export default App;