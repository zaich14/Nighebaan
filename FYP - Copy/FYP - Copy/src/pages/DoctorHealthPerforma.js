import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers, createHealthData, getAllHealthRecords } from "../services/api";

// Fallback list shown if the API call fails (matches backend mock data)
const FALLBACK_PATIENTS = [
  { _id: "mock-user-1", name: "Amna Javed" },
  { _id: "mock-user-2", name: "Abdul Rehman" },
  { _id: "mock-user-3", name: "Fatima Malik" },
  { _id: "mock-user-4", name: "Mohsin Riaz" },
  { _id: "mock-user-5", name: "Nadia Hassan" },
  { _id: "mock-user-6", name: "Tariq Mahmood" },
];

const EMPTY_FORM = {
  patientId: "", recordedAt: "", heartRate: "",
  systolic: "", diastolic: "", temperature: "", bloodOxygen: "",
  bloodGlucose: "", weight: "", respiratoryRate: "", steps: "",
  medication: "", notes: "",
};

function DoctorHealthPerforma() {
  const navigate = useNavigate();
  const [view, setView]             = useState("add"); // "add" | "previous"
  const [patients, setPatients]     = useState([]);
  const [patientsError, setPatientsError] = useState("");
  const [form, setForm]           = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError]   = useState("");
  const [records, setRecords]       = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [recError, setRecError]     = useState("");
  const [expanded, setExpanded]     = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "doctor") { navigate("/login"); return; }
    } catch { navigate("/login"); }

    getUsers("user")
      .then((r) => {
        const list = r.data?.users || [];
        if (list.length > 0) {
          setPatients(list);
        } else {
          setPatients(FALLBACK_PATIENTS);
        }
      })
      .catch(() => {
        // API unreachable — use hardcoded fallback so dropdown always works
        setPatients(FALLBACK_PATIENTS);
        setPatientsError("Using offline patient list.");
      });
  }, [navigate]);

  const loadRecords = useCallback(async () => {
    setLoadingRec(true);
    setRecError("");
    try {
      const res = await getAllHealthRecords(100, 0);
      setRecords(res.data?.data || []);
    } catch (err) {
      setRecError(err.response?.data?.message || "Unable to load records.");
    } finally {
      setLoadingRec(false);
    }
  }, []);

  useEffect(() => {
    if (view === "previous") loadRecords();
  }, [view, loadRecords]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.patientId) { setFormError("Please select a patient."); return; }
    if (!form.heartRate) { setFormError("Heart rate is required."); return; }
    setFormError("");
    setSubmitting(true);
    try {
      await createHealthData({
        patientId: form.patientId,
        recordedAt: form.recordedAt || new Date().toISOString(),
        heartRate: Number(form.heartRate),
        bloodPressure: form.systolic && form.diastolic
          ? { systolic: Number(form.systolic), diastolic: Number(form.diastolic) }
          : undefined,
        temperature:    form.temperature    ? Number(form.temperature)    : undefined,
        bloodOxygen:    form.bloodOxygen    ? Number(form.bloodOxygen)    : undefined,
        bloodGlucose:   form.bloodGlucose   ? Number(form.bloodGlucose)   : undefined,
        weight:         form.weight         ? Number(form.weight)         : undefined,
        respiratoryRate:form.respiratoryRate? Number(form.respiratoryRate): undefined,
        steps:          form.steps          ? Number(form.steps)          : undefined,
        medication: form.medication,
        notes: form.notes,
      });
      setSuccessMsg("Health performa saved successfully.");
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save performa.");
    } finally {
      setSubmitting(false);
    }
  };

  const patientName = (uid) => {
    const p = patients.find((u) => (u._id || u.id) === uid);
    return p ? p.name : uid;
  };

  const fmt = (v, unit = "") => (v !== undefined && v !== null) ? `${v}${unit}` : "—";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <button onClick={() => navigate("/doctor-performas")} className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
            ← Back to Performas
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Doctor Performa</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Health Monitoring Performa</h1>
        </div>

        {/* Toggle */}
        <div className="mb-8 flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
          {[["add", "Add Performa"], ["previous", "Previous Performas"]].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                view === v ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Add Performa ── */}
        {view === "add" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">New Health Monitoring Entry</h2>

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
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100">
                    <option value="">-- Choose patient --</option>
                    {patients.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                    ))}
                  </select>
                  {patientsError && (
                    <p className="mt-1 text-xs text-amber-600">{patientsError}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Date & Time</label>
                  <input name="recordedAt" type="datetime-local" value={form.recordedAt} onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { name: "heartRate",      label: "Heart Rate (bpm) *", placeholder: "72"   },
                  { name: "systolic",       label: "BP Systolic (mmHg)", placeholder: "120"  },
                  { name: "diastolic",      label: "BP Diastolic (mmHg)",placeholder: "80"   },
                  { name: "temperature",    label: "Temperature (°C)",   placeholder: "36.6" },
                  { name: "bloodOxygen",    label: "Blood Oxygen (%)",   placeholder: "98"   },
                  { name: "bloodGlucose",   label: "Glucose (mg/dL)",    placeholder: "110"  },
                  { name: "weight",         label: "Weight (kg)",        placeholder: "65"   },
                  { name: "respiratoryRate",label: "Resp. Rate (/min)",  placeholder: "16"   },
                  { name: "steps",          label: "Steps",              placeholder: "3000" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="text-sm font-medium text-slate-700">{f.label}</label>
                    <input name={f.name} type="number" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Medication</label>
                <input name="medication" type="text" placeholder="Metformin 500mg, Amlodipine 5mg" value={form.medication} onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Clinical Notes</label>
                <textarea name="notes" rows={3} placeholder="Patient observations, changes in condition..." value={form.notes} onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50">
                {submitting ? "Saving…" : "Save Health Performa"}
              </button>
            </div>
          </div>
        )}

        {/* ── Previous Performas ── */}
        {view === "previous" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Previous Health Performas</h2>
              <button onClick={loadRecords} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                Refresh
              </button>
            </div>

            {loadingRec && (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />)}</div>
            )}
            {recError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{recError}</div>}
            {!loadingRec && !recError && records.length === 0 && (
              <p className="text-sm text-slate-400">No health records found.</p>
            )}

            {!loadingRec && records.length > 0 && (
              <div className="space-y-3">
                {records.map((r) => {
                  const isOpen = expanded === r._id;
                  const date = new Date(r.recordedAt || r.createdAt);
                  const bp = r.bloodPressure ? `${r.bloodPressure.systolic}/${r.bloodPressure.diastolic}` : "—";
                  return (
                    <div key={r._id} className="rounded-2xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : r._id)}
                        className="w-full flex items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700">
                            {patientName(r.userId)?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{patientName(r.userId)}</p>
                            <p className="text-xs text-slate-500">
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {" · "}HR {fmt(r.heartRate, " bpm")} · BP {bp}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-slate-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-5 py-4 bg-white">
                          <div className="grid gap-3 sm:grid-cols-4 mb-4">
                            {[
                              ["Heart Rate", fmt(r.heartRate, " bpm")],
                              ["Blood Pressure", bp === "—" ? "—" : `${bp} mmHg`],
                              ["Temperature", fmt(r.temperature, "°C")],
                              ["SpO₂", fmt(r.bloodOxygen, "%")],
                              ["Glucose", fmt(r.bloodGlucose, " mg/dL")],
                              ["Weight", fmt(r.weight, " kg")],
                              ["Resp. Rate", fmt(r.respiratoryRate, "/min")],
                              ["Steps", fmt(r.steps)],
                            ].map(([label, val]) => (
                              <div key={label} className="rounded-2xl bg-slate-50 px-3 py-2.5">
                                <p className="text-xs text-slate-400">{label}</p>
                                <p className="mt-0.5 text-sm font-semibold text-slate-900">{val}</p>
                              </div>
                            ))}
                          </div>
                          {r.medication && (
                            <div className="mb-2 rounded-2xl bg-teal-50 px-4 py-2.5">
                              <p className="text-xs font-semibold text-teal-600">Medication</p>
                              <p className="text-sm text-teal-800">{r.medication}</p>
                            </div>
                          )}
                          {r.notes && (
                            <div className="rounded-2xl bg-slate-50 px-4 py-2.5">
                              <p className="text-xs font-semibold text-slate-500">Clinical Notes</p>
                              <p className="text-sm text-slate-700">{r.notes}</p>
                            </div>
                          )}
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

export default DoctorHealthPerforma;
