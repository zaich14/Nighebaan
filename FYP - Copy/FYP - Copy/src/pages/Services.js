import React from "react";
import Navbar from "../components/Navbar";

function Services() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Services</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Care services built for families and caregivers</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Our platform supports several care pathways so every elder, family member, and caregiver can stay connected.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Health Monitoring</h2>
              <p className="mt-4 text-slate-600 leading-7">
                Add vitals like blood pressure, sugar, and heart rate. View health history and charts to make care decisions faster.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Emergency Support</h2>
              <p className="mt-4 text-slate-600 leading-7">
                Send SOS alerts, notify emergency contacts, and escalate care quickly when a senior needs help.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Caregiver Services</h2>
              <p className="mt-4 text-slate-600 leading-7">
                Browse caregivers, book appointments, and manage care tasks with appointment history and schedules.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Companion / Chatbot Support</h2>
              <p className="mt-4 text-slate-600 leading-7">
                Use an intelligent chat assistant to get care guidance, reminders, and easy access to support information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Services;
