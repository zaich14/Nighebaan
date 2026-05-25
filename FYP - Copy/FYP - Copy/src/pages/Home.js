import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const u = JSON.parse(raw);
      if (u.role === "doctor")    { navigate("/doctor-dashboard"); return; }
      if (u.role === "nurse")     { navigate("/nurse-dashboard");  return; }
      if (u.role === "admin")     { navigate("/admin-panel");      return; }
      if (u.role === "caregiver") { navigate("/caregiver-dashboard"); return; }
      navigate("/dashboard");
    } catch { /* invalid data, stay on home */ }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-700">Overview of services</p>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Simplified health care for elders, families, and caregivers.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Nigehbaan helps families stay connected with loved ones through health tracking, alerts, appointment support, and caregiver coordination — all from one secure dashboard.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-200/20 transition hover:bg-teal-700"
              >
                Get Started
              </Link>
              <Link
                to="/plans"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                View Plans
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Live</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">Health dashboard</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Safe</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">Emergency alerts</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Smart</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">Care reminders</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-teal-600 via-cyan-500 to-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20">
            <div className="rounded-[1.75rem] bg-white/10 p-8">
              <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
                Family first care
              </span>
              <h2 className="mt-6 text-3xl font-semibold">One app for family peace of mind.</h2>
              <p className="mt-4 text-slate-200 leading-7">
                Monitor vital signs, share care updates, and manage alerts from a single platform built for elderly wellbeing and family visibility.
              </p>
              <div className="mt-8 space-y-4 text-slate-100">
                <div className="rounded-3xl bg-white/10 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-200">Care teams</p>
                  <p className="mt-2 text-lg font-semibold">Connect doctors, nurses, and family in one place.</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-200">Easy setup</p>
                  <p className="mt-2 text-lg font-semibold">Quick onboarding for elders and caregivers.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Key features</p>
              <h2 className="mt-3 text-4xl font-bold text-slate-900">Everything you need to manage elder care smoothly.</h2>
            </div>
            <p className="max-w-xl text-slate-600">
              From health tracking to alerts and family coordination, Nigehbaan makes care easier without adding complexity.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">📊</div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-900">Live Health Tracking</h3>
              <p className="mt-4 text-slate-600">View vital signs and health summaries for every family member in seconds.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">🔔</div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-900">Instant Alerts</h3>
              <p className="mt-4 text-slate-600">Know immediately when a senior needs attention or a medication is missed.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">👨‍👩‍👧‍👦</div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-900">Family Visibility</h3>
              <p className="mt-4 text-slate-600">Share updates with caregivers and loved ones while keeping everyone connected.</p>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Family</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Trusted health info for loved ones</h3>
            <p className="mt-4 text-slate-600">Keep your family in sync with meaningful care notifications and clear reports.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Caregivers</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Work smarter with shared tools</h3>
            <p className="mt-4 text-slate-600">Coordinate support, appointments, and services with one secure system.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Elders</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Feel safer and more independent</h3>
            <p className="mt-4 text-slate-600">Use friendly reminders, SOS help, and connected support for daily living.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-slate-600">
          <div className="grid gap-8 lg:grid-cols-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Nigehbaan</p>
              <p className="mt-4 max-w-sm text-sm leading-6">
                Caring technology for your family’s wellbeing, designed to keep elders connected, healthy, and safe.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Product</p>
              <p className="mt-4 text-sm text-slate-600">Dashboard</p>
              <p className="mt-2 text-sm text-slate-600">Plans</p>
              <p className="mt-2 text-sm text-slate-600">Alerts</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Contact</p>
              <p className="mt-4 text-sm text-slate-600">support@nigehbaan.com</p>
              <p className="mt-2 text-sm text-slate-600">+92 300 123 4567</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Legal</p>
              <div className="mt-4 space-y-2 text-sm">
                <Link to="/privacy-policy" className="text-slate-600 transition hover:text-teal-700">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-slate-600 transition hover:text-teal-700">
                  Terms & Conditions
                </Link>
                <Link to="/faq" className="text-slate-600 transition hover:text-teal-700">
                  FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
