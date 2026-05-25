import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function NurseDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
      if (parsed.role !== "nurse") {
        if (parsed.role === "doctor") navigate("/doctor-dashboard");
        else if (parsed.role === "admin") navigate("/admin-panel");
        else navigate("/dashboard");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const joinedDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Welcome Header */}
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-8 text-white shadow-md">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-teal-200">Nurse Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold">
            Welcome back, {currentUser?.name?.split(" ")[0] || "Nurse"}
          </h1>
          <p className="mt-2 text-teal-100">{today}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Profile Card */}
          <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Profile Information
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Your Account Details</h2>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Full Name</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{currentUser?.name || "â€”"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{currentUser?.email || "â€”"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Role</p>
                  <span className="mt-1 inline-block rounded-full bg-teal-100 px-3 py-0.5 text-xs font-semibold capitalize text-teal-700">
                    {currentUser?.role || "Nurse"}
                  </span>
                </div>
              </div>

              {joinedDate && (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Member Since</p>
                    <p className="mt-0.5 font-semibold text-slate-800">{joinedDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Quick Actions */}
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Patient Care
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Quick Actions</h2>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/nurse-health-performa")}
                  className="flex w-full items-center gap-3 rounded-2xl bg-teal-600 px-5 py-4 text-left text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Add Patient Health Performa</p>
                    <p className="mt-0.5 text-xs text-teal-100">Record vitals &amp; clinical notes</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/nurse-shift")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-left text-indigo-700 shadow-sm transition hover:bg-indigo-100 active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Manage Shifts</p>
                    <p className="mt-0.5 text-xs text-indigo-400">Add, edit &amp; view patient checkups</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/nurse-appointments")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-teal-200 bg-white px-5 py-4 text-left text-teal-700 shadow-sm transition hover:bg-teal-50 active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 11-6 0 3 3 0 016 0zM18 9a3 3 0 11-6 0 3 3 0 016 0zM2 15a5 5 0 0110 0v1H2v-1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Patient Appointment Requests</p>
                    <p className="mt-0.5 text-xs text-teal-400">View incoming booking requests</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/patients")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">View All Patients</p>
                    <p className="mt-0.5 text-xs text-slate-400">Browse patient list &amp; history</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Status</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Current Shift</h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-emerald-700">Active &amp; On Duty</span>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Logged in as{" "}
                <span className="font-medium text-slate-600">{currentUser?.name || "Nurse"}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NurseDashboard;

