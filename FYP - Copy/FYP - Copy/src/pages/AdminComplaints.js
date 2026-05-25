import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const STORAGE_KEY = "nigehbaan_complaints";

const SEED_COMPLAINTS = [
  {
    id: "c1",
    name: "Tariq Mahmood",
    email: "tariq@example.com",
    role: "Patient",
    subject: "Appointment Booking Issue",
    complaint: "The appointment booking system is not working properly. When I try to confirm a slot, it shows an error and the appointment is not saved.",
    status: "open",
    createdAt: "2026-05-07T08:00:00Z",
    response: "",
  },
  {
    id: "c2",
    name: "Nadia Hassan",
    email: "nadia@example.com",
    role: "Patient",
    subject: "Cannot View Health Records",
    complaint: "I cannot see my previous health records on the dashboard. The page shows empty even though the nurse entered my vitals last week.",
    status: "resolved",
    createdAt: "2026-05-04T12:00:00Z",
    response: "We have identified and fixed the issue. Your health records should now be visible. Please refresh the page and try again. If the problem persists, please contact us again.",
    resolvedAt: "2026-05-05T10:00:00Z",
  },
  {
    id: "c3",
    name: "Mohsin Riaz",
    email: "mohsin@example.com",
    role: "Patient",
    subject: "SOS Alert Not Sending",
    complaint: "The SOS emergency alert feature did not work during my test. The alert was not received by my caregiver.",
    status: "open",
    createdAt: "2026-05-08T16:00:00Z",
    response: "",
  },
];

function getComplaints() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (stored) return stored;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_COMPLAINTS));
    return SEED_COMPLAINTS;
  } catch {
    return SEED_COMPLAINTS;
  }
}

function saveComplaints(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

function AdminComplaints() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("open");
  const [complaints, setComplaints] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== "admin") { navigate("/login"); return; }
    } catch { navigate("/login"); return; }
    setComplaints(getComplaints());
  }, [navigate]);

  const open     = complaints.filter((c) => c.status === "open");
  const resolved = complaints.filter((c) => c.status === "resolved");
  const listed   = tab === "open" ? open : resolved;

  const handleResolve = (id) => {
    const response = (drafts[id] || "").trim();
    if (!response) return;
    setSaving(id);
    setTimeout(() => {
      const updated = complaints.map((c) =>
        c.id === id ? { ...c, response, status: "resolved", resolvedAt: new Date().toISOString() } : c
      );
      setComplaints(updated);
      saveComplaints(updated);
      setDrafts((prev) => { const d = { ...prev }; delete d[id]; return d; });
      setSaving(null);
    }, 400);
  };

  const handleDelete = (id) => {
    const updated = complaints.filter((c) => c.id !== id);
    setComplaints(updated);
    saveComplaints(updated);
  };

  const priorityColor = (status) =>
    status === "open" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <button
            onClick={() => navigate("/admin-panel")}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            &#8592; Back to Dashboard
          </button>
        </div>

        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">User Complaints</h1>
          <p className="mt-2 text-sm text-slate-500">Review and respond to complaints submitted by patients, nurses, and doctors.</p>
        </div>

        {/* Summary strip */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 text-center">
            <p className="text-2xl font-bold text-rose-600">{open.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Open</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 text-center">
            <p className="text-2xl font-bold text-emerald-600">{resolved.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 text-center sm:block hidden">
            <p className="text-2xl font-bold text-slate-700">{complaints.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
          {[["open", `Open (${open.length})`], ["resolved", `Resolved (${resolved.length})`]].map(([v, label]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                tab === v ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {listed.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
              No {tab} complaints.
            </div>
          ) : (
            listed.map((c) => (
              <div key={c.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-bold text-rose-700">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email} &middot; {c.role} &middot; {fmtDate(c.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${priorityColor(c.status)}`}>
                      {c.status === "resolved" ? "Resolved" : "Open"}
                    </span>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                {c.subject && (
                  <p className="mt-3 text-sm font-semibold text-slate-700">{c.subject}</p>
                )}

                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Complaint</p>
                  <p className="text-sm text-slate-800">{c.complaint}</p>
                </div>

                {c.status === "resolved" ? (
                  <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">Admin Response &middot; {fmtDate(c.resolvedAt)}</p>
                    <p className="text-sm text-slate-800">{c.response}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Write a response &amp; mark as resolved</label>
                    <textarea
                      rows={3}
                      value={drafts[c.id] || ""}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="Describe how the issue was addressed..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                    <button
                      onClick={() => handleResolve(c.id)}
                      disabled={saving === c.id || !drafts[c.id]?.trim()}
                      className="mt-2 inline-flex items-center rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed"
                    >
                      {saving === c.id ? "Saving..." : "Respond & Resolve"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminComplaints;
