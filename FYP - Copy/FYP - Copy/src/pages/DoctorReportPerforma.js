import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers } from "../services/api";

const STORAGE_KEY = "doctorReports";
const FALLBACK_PATIENTS = [
  { _id: "mock-user-1", name: "Amna Javed" },
  { _id: "mock-user-2", name: "Abdul Rehman" },
  { _id: "mock-user-3", name: "Fatima Malik" },
  { _id: "mock-user-4", name: "Mohsin Riaz" },
  { _id: "mock-user-5", name: "Nadia Hassan" },
  { _id: "mock-user-6", name: "Tariq Mahmood" },
];

const EMPTY_FORM = {
  patientId: "", title: "", diagnosis: "",
  findings: "", recommendations: "", followUpDate: "",
};

function DoctorReportPerforma() {
  const navigate = useNavigate();
  const [doctor, setDoctor]       = useState(null);
  const [view, setView]           = useState("add");
  const [patients, setPatients]   = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError]   = useState("");
  const [reports, setReports]       = useState([]);
  const [expanded, setExpanded]     = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "doctor") { navigate("/login"); return; }
      setDoctor(u);
    } catch { navigate("/login"); }

    getUsers("user")
      .then((r) => {
        const list = r.data?.users || [];
        setPatients(list.length > 0 ? list : FALLBACK_PATIENTS);
      })
      .catch(() => setPatients(FALLBACK_PATIENTS));

    // Load saved reports
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setReports(saved);
    } catch { setReports([]); }
  }, [navigate]);

  const patientName = (uid) => {
    const p = patients.find((u) => (u._id || u.id) === uid);
    return p ? p.name : uid;
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.patientId) { setFormError("Please select a patient."); return; }
    if (!form.title)     { setFormError("Report title is required."); return; }
    if (!form.diagnosis) { setFormError("Diagnosis is required."); return; }
    setFormError("");
    setSubmitting(true);

    const newReport = {
      id: `dr-${Date.now()}`,
      doctorId: doctor?.id || doctor?._id,
      doctorName: doctor?.name,
      patientId: form.patientId,
      title: form.title,
      diagnosis: form.diagnosis,
      findings: form.findings,
      recommendations: form.recommendations,
      followUpDate: form.followUpDate,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReport, ...reports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setReports(updated);
    setForm(EMPTY_FORM);
    setSuccessMsg("Doctor report saved successfully.");
    setTimeout(() => setSuccessMsg(""), 4000);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <button onClick={() => navigate("/doctor-performas")} className="mb-4 flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800">
            ← Back to Performas
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Doctor Performa</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Doctor Report Performa</h1>
        </div>

        {/* Toggle */}
        <div className="mb-8 flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
          {[["add", "Add Performa"], ["previous", "Previous Performas"]].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                view === v ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Add Performa ── */}
        {view === "add" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">New Doctor Report</h2>

            {successMsg && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{successMsg}</div>
            )}
            {formError && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{formError}</div>
            )}

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Select Patient *</label>
                  <select name="patientId" value={form.patientId} onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="">-- Choose patient --</option>
                    {patients.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Report Title *</label>
                  <input name="title" type="text" placeholder="e.g. Blood Pressure Analysis" value={form.title} onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Diagnosis *</label>
                <input name="diagnosis" type="text" placeholder="e.g. Stage 2 Hypertension with controlled Type 2 Diabetes" value={form.diagnosis} onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Clinical Findings</label>
                <textarea name="findings" rows={3} placeholder="Describe examination findings, test results and patient observations..." value={form.findings} onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Recommendations</label>
                <textarea name="recommendations" rows={3} placeholder="Treatment plan, lifestyle advice, medication changes..." value={form.recommendations} onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Follow-up Date</label>
                <input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange}
                  className="mt-2 w-64 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? "Saving…" : "Save Doctor Report"}
              </button>
            </div>
          </div>
        )}

        {/* ── Previous Performas ── */}
        {view === "previous" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Previous Doctor Reports</h2>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {reports.length} report{reports.length !== 1 ? "s" : ""}
              </span>
            </div>

            {reports.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                No reports saved yet. Add a performa to get started.
              </div>
            )}

            {reports.length > 0 && (
              <div className="space-y-3">
                {reports.map((r) => {
                  const isOpen = expanded === r.id;
                  const date = new Date(r.createdAt);
                  return (
                    <div key={r.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                        className="w-full flex items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                            {patientName(r.patientId)?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{r.title}</p>
                            <p className="text-xs text-slate-500">
                              {patientName(r.patientId)} · {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hidden sm:block">
                            {r.diagnosis?.slice(0, 28)}{r.diagnosis?.length > 28 ? "…" : ""}
                          </span>
                          <span className="text-slate-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-5 py-5 bg-white space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Patient</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{patientName(r.patientId)}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Follow-up Date</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {r.followUpDate ? new Date(r.followUpDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                              </p>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-indigo-50 px-4 py-3">
                            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Diagnosis</p>
                            <p className="mt-1 text-sm text-indigo-900">{r.diagnosis}</p>
                          </div>
                          {r.findings && (
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Clinical Findings</p>
                              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{r.findings}</p>
                            </div>
                          )}
                          {r.recommendations && (
                            <div className="rounded-2xl bg-teal-50 px-4 py-3">
                              <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide">Recommendations</p>
                              <p className="mt-1 text-sm text-teal-800 whitespace-pre-wrap">{r.recommendations}</p>
                            </div>
                          )}
                          <p className="text-xs text-slate-400">
                            Reported by {r.doctorName} · {date.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorReportPerforma;
