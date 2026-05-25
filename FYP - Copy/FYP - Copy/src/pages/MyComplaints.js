import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const STORAGE_KEY = "nigehbaan_complaints";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

function MyComplaints() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", complaint: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadComplaints = (user) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const mine = all.filter((c) => c.email === user.email);
      setMyComplaints(mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setMyComplaints([]);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
      loadComplaints(parsed);
    } catch { navigate("/login"); }
  }, [navigate]);

  const handleSubmit = () => {
    if (!form.subject.trim()) { setError("Please enter a subject."); return; }
    if (!form.complaint.trim()) { setError("Please describe your complaint."); return; }
    setError("");
    setSubmitting(true);

    setTimeout(() => {
      const roleLabel = (r) => {
        if (r === "user") return "Patient";
        if (r === "caregiver") return "Caregiver";
        return r ? r.charAt(0).toUpperCase() + r.slice(1) : "User";
      };
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
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...all]));
      } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([entry]));
      }
      setForm({ subject: "", complaint: "" });
      setShowForm(false);
      setSuccess("Complaint submitted. The admin will review and respond.");
      loadComplaints(currentUser);
      setSubmitting(false);
    }, 400);
  };

  const open     = myComplaints.filter((c) => c.status === "open");
  const resolved = myComplaints.filter((c) => c.status === "resolved");

  const dashLink = () => {
    if (!currentUser) return "/dashboard";
    if (currentUser.role === "doctor") return "/doctor-dashboard";
    if (currentUser.role === "nurse")  return "/nurse-dashboard";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <button
            onClick={() => navigate(dashLink())}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            &#8592; Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">Support</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My Complaints</h1>
          <p className="mt-2 text-sm text-slate-500">Submit complaints and track admin responses here.</p>

          <div className="mt-5 flex gap-4">
            <div className="rounded-2xl bg-rose-50 px-5 py-3 text-center">
              <p className="text-xl font-bold text-rose-600">{open.length}</p>
              <p className="text-xs text-slate-500">Open</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center">
              <p className="text-xl font-bold text-emerald-600">{resolved.length}</p>
              <p className="text-xs text-slate-500">Resolved</p>
            </div>
          </div>
        </div>

        {/* Submit button / form */}
        {!showForm ? (
          <button
            onClick={() => { setShowForm(true); setSuccess(""); }}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50 py-5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            + Submit New Complaint
          </button>
        ) : (
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-rose-200">
            <h2 className="mb-4 font-semibold text-slate-900">New Complaint</h2>
            {error && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Appointment booking issue"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Details *</label>
                <textarea
                  rows={4}
                  value={form.complaint}
                  onChange={(e) => setForm((p) => ({ ...p, complaint: e.target.value }))}
                  placeholder="Describe the issue in detail..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-2xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>
        )}

        {/* Complaints list */}
        {myComplaints.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
            You have not submitted any complaints yet.
          </div>
        ) : (
          <div className="space-y-4">
            {myComplaints.map((c) => (
              <div key={c.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-slate-900">{c.subject || "Complaint"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{fmtDate(c.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    c.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {c.status === "resolved" ? "Resolved" : "Pending Review"}
                  </span>
                </div>

                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Your Complaint</p>
                  <p className="text-sm text-slate-700">{c.complaint}</p>
                </div>

                {c.status === "resolved" && c.response ? (
                  <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
                      Admin Response &middot; {fmtDate(c.resolvedAt)}
                    </p>
                    <p className="text-sm text-slate-800">{c.response}</p>
                  </div>
                ) : c.status === "open" ? (
                  <p className="mt-3 text-xs text-slate-400 italic">Awaiting admin response...</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyComplaints;
