import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const STORAGE_KEY = "nigehbaan_appointments";

function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const loadPendingCount = useCallback((doc) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const count = all.filter((a) => a.doctorId === (doc?.id || doc?._id) && a.status === "pending").length;
    setPendingCount(count);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "doctor") {
        navigate(u.role === "nurse" ? "/nurse-dashboard" : u.role === "admin" ? "/admin-panel" : "/dashboard");
        return;
      }
      setDoctor(u);
      loadPendingCount(u);
    } catch { navigate("/login"); }
  }, [navigate, loadPendingCount]);

  if (!doctor) return null;

  const initial = doctor.name?.charAt(0).toUpperCase() || "D";
  const memberSince = doctor.createdAt
    ? new Date(doctor.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "2023";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600">Doctor Portal</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Welcome back, {doctor.name}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">

          {/* ── Profile Card ── */}
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white text-3xl font-bold shadow-lg">
                  {initial}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{doctor.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{doctor.email}</p>
                <span className="mt-3 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700">
                  Doctor
                </span>
              </div>
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                    Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member since</span>
                  <span className="font-medium text-slate-700">{memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="font-medium text-slate-700 capitalize">Doctor</span>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 text-sm space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Account Info</p>
              <div><p className="font-semibold text-slate-900">Name</p><p className="text-slate-500">{doctor.name}</p></div>
              <div><p className="font-semibold text-slate-900">Email</p><p className="text-slate-500">{doctor.email}</p></div>
              <div><p className="font-semibold text-slate-900">Role</p><p className="text-slate-500 capitalize">Doctor</p></div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="space-y-5">
            {/* Performas Button */}
            <button
              onClick={() => navigate("/doctor-performas")}
              className="w-full rounded-3xl bg-indigo-600 p-8 text-left shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">Medical Forms</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Performas</h2>
                  <p className="mt-2 text-sm text-indigo-200">
                    Access health monitoring and doctor report performas.
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                  📋
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <span className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">Health Monitoring</span>
                <span className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">Doctor Report</span>
              </div>
            </button>

            {/* Quick stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Patients</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">6</p>
                <p className="mt-1 text-sm text-slate-500">Assigned patients</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Performas</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">2</p>
                <p className="mt-1 text-sm text-slate-500">Available forms</p>
              </div>
            </div>

            {/* Appointment requests */}
            <button
              onClick={() => navigate("/doctor-appointments")}
              className="relative w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-teal-400"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Appointment Requests</p>
                    <p className="text-xs text-slate-500">Review and confirm patient bookings</p>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </div>
            </button>

            {/* Quick actions row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => navigate("/doctor-prescription")}
                className="rounded-3xl bg-violet-600 p-5 text-left shadow-sm shadow-violet-100 transition hover:bg-violet-700"
              >
                <span className="text-2xl">💊</span>
                <p className="mt-3 text-base font-semibold text-white">Write Prescription</p>
                <p className="mt-1 text-xs text-violet-200">Issue medicines to a patient</p>
              </button>
              <button
                onClick={() => navigate("/patients")}
                className="rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
              >
                <span className="text-2xl">👥</span>
                <p className="mt-3 text-base font-semibold text-slate-900">View Patients</p>
                <p className="mt-1 text-xs text-slate-500">Browse records and health history</p>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default DoctorDashboard;
