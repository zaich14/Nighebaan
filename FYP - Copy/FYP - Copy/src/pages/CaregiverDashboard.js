import React from "react";
import Navbar from "../components/Navbar";

function CaregiverDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Caregiver Dashboard</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Assigned Patients & Daily Tasks</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Manage your assigned patients, update health status, and keep track of appointments.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Assigned Patients</h2>
              <p className="mt-3 text-slate-600">View patient details and care history for each family member assigned to you.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Daily Tasks</h2>
              <p className="mt-3 text-slate-600">Track medication reminders, appointments, and care visits for the day.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
              <p className="mt-3 text-slate-600">Submit care notes and review patient progress reports after each visit.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CaregiverDashboard;
