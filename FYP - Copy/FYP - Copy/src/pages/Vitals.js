import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getLatestHealthData, getHealthHistory } from "../services/api";
import { getLatestFallback, getHistoryFallback } from "../utils/mockHealth";

const PRESCRIPTION_KEY = "doctorPrescriptions";

const MOCK_PRESCRIPTIONS = {
  "mock-user-1": [
    { id: "rx-m1-1", doctorName: "Dr. Ahmed Khan", date: "2026-04-20", duration: "1 month", remarks: "Monitor BP weekly. Avoid salty food.",
      medicines: [{ name: "Amlodipine", dosage: "5mg", frequency: "Once daily", route: "Oral", instructions: "Take in the morning" }, { name: "Metformin", dosage: "500mg", frequency: "Twice daily", route: "Oral", instructions: "Take with meals" }] },
  ],
  "mock-user-2": [
    { id: "rx-m2-1", doctorName: "Dr. Ahmed Khan", date: "2026-04-15", duration: "Ongoing", remarks: "Avoid strenuous exercise. Follow low-fat diet.",
      medicines: [{ name: "Aspirin", dosage: "75mg", frequency: "Once daily", route: "Oral", instructions: "Take after breakfast" }, { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", route: "Oral", instructions: "Take at night" }] },
  ],
  "mock-user-3": [
    { id: "rx-m3-1", doctorName: "Dr. Sara Malik", date: "2026-05-01", duration: "3 months", remarks: "Calcium and Vitamin D supplementation. Avoid falls.",
      medicines: [{ name: "Calcium Carbonate", dosage: "500mg", frequency: "Twice daily", route: "Oral", instructions: "Take with meals" }, { name: "Vitamin D3", dosage: "1000 IU", frequency: "Once daily", route: "Oral", instructions: "" }] },
  ],
  "mock-user-4": [
    { id: "rx-m4-1", doctorName: "Dr. Ahmed Khan", date: "2026-04-10", duration: "Ongoing", remarks: "Use inhaler as needed. Avoid cold air and smoke.",
      medicines: [{ name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "As needed (PRN)", route: "Inhaled", instructions: "2 puffs when breathless" }, { name: "Metformin", dosage: "1000mg", frequency: "Twice daily", route: "Oral", instructions: "Take with meals" }] },
  ],
  "mock-user-5": [
    { id: "rx-m5-1", doctorName: "Dr. Sara Malik", date: "2026-04-25", duration: "Ongoing", remarks: "INR monitoring required monthly.",
      medicines: [{ name: "Warfarin", dosage: "2mg", frequency: "Once daily", route: "Oral", instructions: "Take at the same time each day" }, { name: "Furosemide", dosage: "40mg", frequency: "Once daily", route: "Oral", instructions: "Take in the morning" }] },
  ],
  "mock-user-6": [
    { id: "rx-m6-1", doctorName: "Dr. Ahmed Khan", date: "2026-05-03", duration: "2 months", remarks: "Physiotherapy recommended alongside medication.",
      medicines: [{ name: "Levodopa/Carbidopa", dosage: "100/25mg", frequency: "Three times daily", route: "Oral", instructions: "Take 30 min before meals" }, { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", route: "Oral", instructions: "Take in the morning" }] },
  ],
};

export default function Vitals() {
  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [latest, setLatest]           = useState(null);
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [expandedRx, setExpandedRx]   = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    let u;
    try {
      u = JSON.parse(raw);
      if (u.role === "doctor") { navigate("/doctor-dashboard"); return; }
      if (u.role === "nurse")  { navigate("/nurse-dashboard");  return; }
      if (u.role === "admin")  { navigate("/admin-panel");      return; }
      setUser(u);
    } catch { navigate("/login"); return; }

    // Load latest vitals
    getLatestHealthData()
      .then((r) => {
        const data = r.data?.data || r.data || null;
        if (data) {
          setLatest(data);
          localStorage.setItem("nigehbaan_latest_health", JSON.stringify(data));
        } else {
          try {
            const cached = localStorage.getItem("nigehbaan_latest_health");
            setLatest(cached ? JSON.parse(cached) : getLatestFallback(u));
          } catch { setLatest(getLatestFallback(u)); }
        }
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem("nigehbaan_latest_health");
          setLatest(cached ? JSON.parse(cached) : getLatestFallback(u));
        } catch { setLatest(getLatestFallback(u)); }
      });

    // Load prescriptions
    try {
      const uid = u.id || u._id || "";
      const all = JSON.parse(localStorage.getItem(PRESCRIPTION_KEY) || "[]");
      const mine = all.filter((rx) => rx.patientId === uid);
      if (mine.length > 0) {
        setPrescriptions(mine.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        setPrescriptions(MOCK_PRESCRIPTIONS[uid] || []);
      }
    } catch { setPrescriptions([]); }

    // Load history
    getHealthHistory(20, 0)
      .then((r) => {
        const data = r.data?.data || [];
        if (Array.isArray(data) && data.length > 0) setRecords(data);
        else setRecords(getHistoryFallback(u));
      })
      .catch(() => setRecords(getHistoryFallback(u)))
      .finally(() => setLoading(false));
  }, [navigate]);

  const fmt = (v, unit = "", fallback = "—") =>
    v !== undefined && v !== null ? `${v}${unit}` : fallback;

  const bpStr = latest?.bloodPressure
    ? `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic} mmHg`
    : "—";

  const lastUpdated = latest?.recordedAt || latest?.createdAt
    ? new Date(latest.recordedAt || latest.createdAt).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  const vitals = [
    {
      label: "Heart Rate", value: latest?.heartRate, unit: " bpm", icon: "❤️",
      color: "rose",
      status: latest?.heartRate
        ? (latest.heartRate >= 60 && latest.heartRate <= 100 ? "Normal" : "Abnormal")
        : null,
      abnormal: latest?.heartRate && !(latest.heartRate >= 60 && latest.heartRate <= 100),
    },
    {
      label: "Blood Pressure", value: bpStr, unit: "", icon: "🩸",
      color: "indigo",
      status: latest?.bloodPressure ? "mmHg" : null,
      abnormal: false,
    },
    {
      label: "Temperature", value: latest?.temperature, unit: "°C", icon: "🌡️",
      color: "amber",
      status: latest?.temperature
        ? (latest.temperature >= 36.1 && latest.temperature <= 37.2 ? "Normal" : "Elevated")
        : null,
      abnormal: latest?.temperature && !(latest.temperature >= 36.1 && latest.temperature <= 37.2),
    },
    {
      label: "Blood Oxygen", value: latest?.bloodOxygen, unit: "%", icon: "💨",
      color: "teal",
      status: latest?.bloodOxygen
        ? (latest.bloodOxygen >= 95 ? "Normal" : "Low")
        : null,
      abnormal: latest?.bloodOxygen && latest.bloodOxygen < 95,
    },
    {
      label: "Blood Glucose", value: latest?.bloodGlucose, unit: " mg/dL", icon: "🍬",
      color: "violet",
      status: latest?.bloodGlucose ? "Recorded" : null,
      abnormal: false,
    },
    {
      label: "Respiratory Rate", value: latest?.respiratoryRate, unit: " /min", icon: "🫁",
      color: "sky",
      status: latest?.respiratoryRate ? "Recorded" : null,
      abnormal: false,
    },
    {
      label: "Weight", value: latest?.weight, unit: " kg", icon: "⚖️",
      color: "slate",
      status: latest?.weight ? "Recorded" : null,
      abnormal: false,
    },
    {
      label: "Steps Today", value: latest?.steps, unit: "", icon: "👟",
      color: "emerald",
      status: latest?.steps ? "Recorded" : null,
      abnormal: false,
    },
  ];

  const colorMap = {
    rose:    "bg-rose-50 ring-rose-100",
    indigo:  "bg-indigo-50 ring-indigo-100",
    amber:   "bg-amber-50 ring-amber-100",
    teal:    "bg-teal-50 ring-teal-100",
    violet:  "bg-violet-50 ring-violet-100",
    sky:     "bg-sky-50 ring-sky-100",
    slate:   "bg-slate-50 ring-slate-200",
    emerald: "bg-emerald-50 ring-emerald-100",
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const fmtTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };
  const bpCell = (r) => r.bloodPressure
    ? `${r.bloodPressure.systolic}/${r.bloodPressure.diastolic}`
    : "—";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Patient Portal</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">My Vitals</h1>
            {lastUpdated && (
              <p className="mt-1 text-sm text-slate-400">Last recorded: {lastUpdated}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link to="/health-history"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300">
              Full History
            </Link>
            <Link to="/dashboard"
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Medication banner */}
        {latest?.medication && (
          <div className="mb-6 rounded-3xl bg-teal-50 border border-teal-200 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">💊</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Current Medication</p>
              <p className="mt-0.5 font-semibold text-teal-800">{latest.medication}</p>
            </div>
          </div>
        )}

        {/* Latest Vitals Grid */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Latest Readings</h2>
          {loading && !latest ? (
            <p className="text-sm text-slate-400">Loading vitals...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {vitals.map(({ label, value, unit, icon, color, status, abnormal }) => {
                const hasValue = value !== undefined && value !== null && value !== "—";
                const displayVal = label === "Blood Pressure"
                  ? (latest?.bloodPressure ? bpStr : "—")
                  : hasValue ? `${value}${unit}` : "—";

                return (
                  <div key={label} className={`rounded-3xl p-6 shadow-sm ring-1 ${colorMap[color]}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600">{label}</p>
                      <span className="text-xl">{icon}</span>
                    </div>
                    <p className="mt-4 text-2xl font-bold text-slate-900">
                      {displayVal === "—" ? <span className="text-slate-300 text-xl">—</span> : displayVal}
                    </p>
                    {status && (
                      <p className={`mt-2 text-xs font-semibold ${abnormal ? "text-rose-600" : "text-slate-400"}`}>
                        {status}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Clinical Notes */}
        {latest?.notes && (
          <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Clinical Notes</p>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">{latest.notes}</p>
          </div>
        )}

        {/* History Table */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Vitals History</h2>
            {loading && <span className="text-xs text-slate-400">Loading...</span>}
          </div>

          {records.length === 0 && !loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
              No health records found yet.
            </div>
          ) : (
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Heart Rate</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">BP</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Temp</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">SpO2</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Glucose</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Weight</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r._id || i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-5 py-3 whitespace-nowrap">
                          <p className="font-medium text-slate-800">{fmtDate(r.recordedAt || r.createdAt)}</p>
                          <p className="text-xs text-slate-400">{fmtTime(r.recordedAt || r.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${r.heartRate && !(r.heartRate >= 60 && r.heartRate <= 100) ? "text-rose-600" : "text-slate-800"}`}>
                            {r.heartRate ? `${r.heartRate} bpm` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700">{bpCell(r)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={r.temperature && !(r.temperature >= 36.1 && r.temperature <= 37.2) ? "text-amber-600 font-semibold" : "text-slate-700"}>
                            {r.temperature ? `${r.temperature}°C` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={r.bloodOxygen && r.bloodOxygen < 95 ? "text-rose-600 font-semibold" : "text-slate-700"}>
                            {r.bloodOxygen ? `${r.bloodOxygen}%` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700">{r.bloodGlucose ? `${r.bloodGlucose} mg/dL` : "—"}</td>
                        <td className="px-4 py-3 text-center text-slate-700">{r.weight ? `${r.weight} kg` : "—"}</td>
                        <td className="px-4 py-3 max-w-[200px] text-xs text-slate-500 truncate">{r.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Prescriptions */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">My Prescriptions</h2>

          {prescriptions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
              No prescriptions on file yet.
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((rx) => {
                const isOpen = expandedRx === rx.id;
                return (
                  <div key={rx.id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    {/* Header row — always visible */}
                    <button
                      onClick={() => setExpandedRx(isOpen ? null : rx.id)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {rx.medicines?.map((m) => m.name).join(", ")}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {rx.doctorName} &middot; {new Date(rx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &middot; {rx.duration}
                          </p>
                        </div>
                      </div>
                      <svg
                        className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20" fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                        <div className="mb-4 grid gap-3 sm:grid-cols-3 text-sm">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Prescribed by</p>
                            <p className="font-semibold text-slate-800">{rx.doctorName}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Date</p>
                            <p className="font-semibold text-slate-800">{new Date(rx.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Duration</p>
                            <p className="font-semibold text-slate-800">{rx.duration}</p>
                          </div>
                        </div>

                        {/* Medicines table */}
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Medicines</p>
                        <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Medicine</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Dosage</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Frequency</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 hidden sm:table-cell">Route</th>
                                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rx.medicines?.map((m, i) => (
                                <tr key={i} className="border-b border-slate-100 last:border-0">
                                  <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                                  <td className="px-4 py-3 text-slate-600">{m.dosage}</td>
                                  <td className="px-4 py-3 text-slate-600">{m.frequency}</td>
                                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{m.route}</td>
                                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{m.instructions || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {rx.remarks && (
                          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-1">Doctor's Remarks</p>
                            <p className="text-sm text-slate-700">{rx.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
