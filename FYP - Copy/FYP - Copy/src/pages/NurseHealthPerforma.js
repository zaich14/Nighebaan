import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createHealthData, getUsers } from "../services/api";
import { MOCK_HEALTH_RECORDS } from "../utils/mockHealth";

const MOCK_PATIENTS_MAP = {
  "mock-user-1": "Amna Javed",
  "mock-user-2": "Abdul Rehman",
  "mock-user-3": "Fatima Malik",
  "mock-user-4": "Mohsin Riaz",
  "mock-user-5": "Nadia Hassan",
  "mock-user-6": "Tariq Mahmood",
};

function NurseHealthPerforma() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "previous" ? "previous" : searchParams.get("tab") === "add" ? "add" : null);
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    recordedAt: "",
    heartRate: "",
    systolic: "",
    diastolic: "",
    temperature: "",
    bloodOxygen: "",
    bloodGlucose: "",
    weight: "",
    respiratoryRate: "",
    steps: "",
    medication: "",
    notes: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
      if (parsed.role !== "nurse") { navigate("/nurse-dashboard"); return; }
    } catch {
      navigate("/login");
      return;
    }

    getUsers("user")
      .then((res) => {
        const list = res.data?.users || res.data || [];
        setPatients(Array.isArray(list) ? list : []);
      })
      .catch(() => setPatients([]))
      .finally(() => setPatientsLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!form.patientId) { setError("Please select a patient."); return; }
    if (!form.recordedAt) { setError("Date & time is required."); return; }
    if (!form.heartRate) { setError("Heart rate is required."); return; }

    setLoading(true);
    try {
      const payload = {
        patientId: form.patientId,
        recordedAt: form.recordedAt,
        heartRate: Number(form.heartRate),
        bloodPressure: {
          systolic: form.systolic ? Number(form.systolic) : undefined,
          diastolic: form.diastolic ? Number(form.diastolic) : undefined,
        },
        temperature: form.temperature ? Number(form.temperature) : undefined,
        bloodOxygen: form.bloodOxygen ? Number(form.bloodOxygen) : undefined,
        bloodGlucose: form.bloodGlucose ? Number(form.bloodGlucose) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        respiratoryRate: form.respiratoryRate ? Number(form.respiratoryRate) : undefined,
        steps: form.steps ? Number(form.steps) : undefined,
        medication: form.medication,
        notes: form.notes,
      };
      await createHealthData(payload);
      const record = { ...payload, _id: `local-${Date.now()}`, createdAt: new Date().toISOString(),
        patientName: patients.find((p) => (p._id || p.id) === payload.patientId)?.name || MOCK_PATIENTS_MAP[payload.patientId] || "Patient" };
      // Cache latest vitals for patient dashboard & SOS
      localStorage.setItem("nigehbaan_latest_health", JSON.stringify(record));
      // Append to submitted performas list for Previous tab
      const prev = JSON.parse(localStorage.getItem("nigehbaan_submitted_performas") || "[]");
      localStorage.setItem("nigehbaan_submitted_performas", JSON.stringify([record, ...prev]));
      setMessage("Health record saved successfully.");
      setForm({
        patientId: form.patientId,
        recordedAt: "",
        heartRate: "",
        systolic: "",
        diastolic: "",
        temperature: "",
        bloodOxygen: "",
        bloodGlucose: "",
        weight: "",
        respiratoryRate: "",
        steps: "",
        medication: "",
        notes: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save health record.");
    } finally {
      setLoading(false);
    }
  };

  // Collect previous performas: mock records + any locally submitted ones
  const localSubmitted = (() => {
    try { return JSON.parse(localStorage.getItem("nigehbaan_submitted_performas") || "[]"); } catch { return []; }
  })();
  const allPrevious = [...localSubmitted, ...MOCK_HEALTH_RECORDS]
    .sort((a, b) => new Date(b.recordedAt || b.createdAt) - new Date(a.recordedAt || a.createdAt));

  const switchTab = (t) => {
    setTab(t);
    setSearchParams(t === "previous" ? { tab: "previous" } : {});
  };

  const fmtDT = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Back */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/nurse-dashboard")}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Patient Entry</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Health Monitoring Performa</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add a new performa or browse previous records for all patients.
          </p>
        </div>

        {/* ── LANDING: shown only when no tab selected ─────────────────── */}
        {tab === null && (
          <div className="grid gap-5 sm:grid-cols-2">
            <button
              onClick={() => switchTab("add")}
              className="group flex flex-col items-start gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-left transition hover:ring-teal-400 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add New Performa</h2>
                <p className="mt-1.5 text-sm text-slate-500">Record vitals, blood pressure, temperature, medication, and clinical notes for a patient.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-teal-700 transition">
                Start Entry &rarr;
              </span>
            </button>

            <button
              onClick={() => switchTab("previous")}
              className="group flex flex-col items-start gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-left transition hover:ring-indigo-400 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Previous Performas</h2>
                <p className="mt-1.5 text-sm text-slate-500">Browse all submitted health performas for all patients, sorted by most recent.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-indigo-700 transition">
                View Records &rarr;
              </span>
            </button>
          </div>
        )}

        {/* ── Back link: shown only when a tab is selected ────────────────── */}
        {tab !== null && (
          <div className="mb-6">
            <button
              onClick={() => { setTab(null); setSearchParams({}); }}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              &#8592; Back to Options
            </button>
          </div>
        )}

        {/* ── PREVIOUS PERFORMAS TAB ─────────────────────────────────────── */}
        {tab === "previous" && (
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">All Submitted Performas</h2>
              <span className="text-xs text-slate-400">{allPrevious.length} records</span>
            </div>
            {allPrevious.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">No previous performas found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allPrevious.map((r, i) => {
                  const patName = r.patientName || MOCK_PATIENTS_MAP[r.patientId || r.userId] || "Unknown Patient";
                  const bp = r.bloodPressure ? `${r.bloodPressure.systolic}/${r.bloodPressure.diastolic} mmHg` : "—";
                  return (
                    <div key={r._id || i} className="px-6 py-5 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-semibold text-slate-900">{patName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{fmtDT(r.recordedAt || r.createdAt)}</p>
                        </div>
                        <span className="rounded-full bg-teal-50 px-3 py-0.5 text-xs font-semibold text-teal-700">Submitted</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4 text-sm">
                        <span className="text-slate-500">Heart Rate: <strong className="text-slate-800">{r.heartRate ? `${r.heartRate} bpm` : "—"}</strong></span>
                        <span className="text-slate-500">BP: <strong className="text-slate-800">{bp}</strong></span>
                        <span className="text-slate-500">Temp: <strong className="text-slate-800">{r.temperature ? `${r.temperature}°C` : "—"}</strong></span>
                        <span className="text-slate-500">SpO2: <strong className="text-slate-800">{r.bloodOxygen ? `${r.bloodOxygen}%` : "—"}</strong></span>
                        <span className="text-slate-500">Glucose: <strong className="text-slate-800">{r.bloodGlucose ? `${r.bloodGlucose} mg/dL` : "—"}</strong></span>
                        <span className="text-slate-500">Weight: <strong className="text-slate-800">{r.weight ? `${r.weight} kg` : "—"}</strong></span>
                        {r.medication && <span className="col-span-2 text-slate-500">Medication: <strong className="text-slate-800">{r.medication}</strong></span>}
                      </div>
                      {r.notes && (
                        <p className="mt-2 text-xs text-slate-500 italic">"{r.notes}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ADD NEW PERFORMA TAB ───────────────────────────────────────── */}
        {tab === "add" && <div className="space-y-6">

          {/* Patient Selector */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Select Patient</h2>
            {patientsLoading ? (
              <p className="text-sm text-slate-400">Loading patients...</p>
            ) : (
              <select
                name="patientId"
                value={form.patientId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                <option value="">— Choose a patient —</option>
                {patients.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Vitals Form */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Vital Signs & Measurements</h2>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Nurse: {currentUser?.name || "—"}
              </span>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            )}
            {message && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>
            )}

            {/* Row 1 */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Date & Time *" name="recordedAt" type="datetime-local" value={form.recordedAt} onChange={handleChange} />
              <Field label="Heart Rate (bpm) *" name="heartRate" type="number" value={form.heartRate} onChange={handleChange} placeholder="80" />
              <Field label="Systolic BP (mmHg)" name="systolic" type="number" value={form.systolic} onChange={handleChange} placeholder="120" />
              <Field label="Diastolic BP (mmHg)" name="diastolic" type="number" value={form.diastolic} onChange={handleChange} placeholder="80" />
              <Field label="Temperature (°C)" name="temperature" type="number" step="0.1" value={form.temperature} onChange={handleChange} placeholder="36.8" />
              <Field label="Blood Oxygen (%)" name="bloodOxygen" type="number" value={form.bloodOxygen} onChange={handleChange} placeholder="97" />
              <Field label="Blood Glucose (mg/dL)" name="bloodGlucose" type="number" value={form.bloodGlucose} onChange={handleChange} placeholder="110" />
              <Field label="Weight (kg)" name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} placeholder="65" />
              <Field label="Respiratory Rate (/min)" name="respiratoryRate" type="number" value={form.respiratoryRate} onChange={handleChange} placeholder="16" />
              <Field label="Steps" name="steps" type="number" value={form.steps} onChange={handleChange} placeholder="4500" />
            </div>

            <div className="mt-5">
              <Field label="Medication" name="medication" value={form.medication} onChange={handleChange} placeholder="e.g. Aspirin 75mg" />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">Clinical Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Patient is stable and resting comfortably..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
              >
                {loading ? "Saving..." : "Save Health Record"}
              </button>
              <button
                onClick={() => navigate("/nurse-dashboard")}
                className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>}

      </main>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder, step }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}

export default NurseHealthPerforma;
