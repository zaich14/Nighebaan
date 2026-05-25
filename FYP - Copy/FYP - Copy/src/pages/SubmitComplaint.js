import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const STORAGE_KEY = "nigehbaan_complaints";

function SubmitComplaint() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({ subject: "", complaint: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
    } catch { navigate("/login"); }
  }, [navigate]);

  const roleLabel = (r) => {
    if (r === "user") return "Patient";
    if (r === "caregiver") return "Caregiver";
    return r ? r.charAt(0).toUpperCase() + r.slice(1) : "User";
  };

  const handleSubmit = () => {
    if (!form.subject.trim()) { setError("Please enter a subject."); return; }
    if (!form.complaint.trim()) { setError("Please describe your complaint."); return; }
    setError("");

    const entry = {
      id: `c-${Date.now()}`,
      name: currentUser?.name || "User",
      email: currentUser?.email || "",
      role: roleLabel(currentUser?.role),
      subject: form.subject.trim(),
      complaint: form.complaint.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
      response: "",
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([entry]));
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="rounded-3xl bg-white p-12 shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">
              &#10003;
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Complaint Submitted</h1>
            <p className="mt-3 text-sm text-slate-500">
              Your complaint has been received. The admin team will review it and respond as soon as possible.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-8 inline-flex rounded-2xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            &#8592; Back
          </button>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">Support</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Submit a Complaint</h1>
          <p className="mt-2 text-sm text-slate-500">
            Describe your issue and our admin team will review it and get back to you.
          </p>

          {currentUser && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.email} &middot; {roleLabel(currentUser.role)}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g. Appointment booking issue"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Describe your complaint *</label>
              <textarea
                rows={5}
                value={form.complaint}
                onChange={(e) => setForm((prev) => ({ ...prev, complaint: e.target.value }))}
                placeholder="Please describe the issue in detail..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              className="inline-flex rounded-2xl bg-rose-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Submit Complaint
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex rounded-2xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SubmitComplaint;
