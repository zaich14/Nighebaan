import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers, getPatientHealthData } from "../services/api";

const PAGE_SIZE = 8;

const conditionColour = (c) => {
  const s = c.toLowerCase();
  if (s.includes("diabetes")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("heart") || s.includes("cardiac") || s.includes("atrial") || s.includes("congestive")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (s.includes("hypertension") || s.includes("blood pressure")) return "bg-orange-50 text-orange-700 border-orange-200";
  if (s.includes("copd") || s.includes("respiratory") || s.includes("asthma")) return "bg-sky-50 text-sky-700 border-sky-200";
  if (s.includes("parkinson") || s.includes("neuro") || s.includes("alzheimer")) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
};

function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  const fetchPage = useCallback(
    (p) => {
      setLoading(true);
      getPatientHealthData(patientId, PAGE_SIZE, p * PAGE_SIZE)
        .then((res) => {
          setRecords(res.data?.data || []);
          setTotal(res.data?.total || 0);
        })
        .catch(() => setError("Unable to load health records."))
        .finally(() => setLoading(false));
    },
    [patientId]
  );

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      if (!["nurse", "doctor", "admin"].includes(parsed.role)) {
        navigate("/dashboard");
        return;
      }
    } catch { navigate("/login"); return; }

    // Fetch patient profile
    getUsers("user")
      .then((res) => {
        const list = res.data?.users || res.data || [];
        const found = (Array.isArray(list) ? list : []).find(
          (u) => (u._id || u.id) === patientId
        );
        setPatient(found || null);
      })
      .catch(() => {});

    fetchPage(0);
  }, [navigate, patientId, fetchPage]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const initials = patient?.name
    ? patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "—";

  const fmtBP = (bp) =>
    bp?.systolic && bp?.diastolic ? `${bp.systolic}/${bp.diastolic}` : "—";

  // Latest record for the header vitals bar
  const latest = records[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Back */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/patients")}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            ← All Patients
          </button>
          <button
            onClick={() => navigate("/nurse-health-performa")}
            className="flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            + Add Record
          </button>
        </div>

        {/* Patient profile card */}
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-xl font-bold text-white">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{patient?.name || "Patient"}</h1>
                  <p className="mt-0.5 text-sm text-slate-400">{patient?.email || patientId}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient?.age && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Age: {patient.age}
                    </span>
                  )}
                  {patient?.gender && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {patient.gender}
                    </span>
                  )}
                  {patient?.bloodType && (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                      Blood: {patient.bloodType}
                    </span>
                  )}
                </div>
              </div>

              {/* Conditions */}
              {patient?.conditions?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.conditions.map((c) => (
                      <span key={c} className={`rounded-full border px-3 py-1 text-xs font-medium ${conditionColour(c)}`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergies */}
              {patient?.allergies?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((a) => (
                      <span key={a} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                        ⚠ {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest vitals summary */}
        {latest && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { label: "Heart Rate", val: latest.heartRate, unit: " bpm" },
              { label: "Blood Pressure", val: fmtBP(latest.bloodPressure), unit: "" },
              { label: "Temperature", val: latest.temperature, unit: "°C" },
              { label: "Blood O₂", val: latest.bloodOxygen, unit: "%" },
              { label: "Glucose", val: latest.bloodGlucose, unit: " mg/dL" },
              { label: "Resp. Rate", val: latest.respiratoryRate, unit: "/min" },
              { label: "Weight", val: latest.weight, unit: " kg" },
              { label: "Steps", val: latest.steps, unit: "" },
            ].map(({ label, val, unit }) => (
              <div key={label} className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {val !== undefined && val !== null ? `${val}${unit}` : <span className="text-slate-300">—</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Medical history */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Medical History
            {total > 0 && <span className="ml-2 text-sm font-normal text-slate-400">({total} record{total !== 1 ? "s" : ""})</span>}
          </h2>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
            No health records found for this patient.
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec, idx) => {
              const id = rec._id || rec.id || idx;
              const isOpen = expanded === id;
              return (
                <div key={id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                  <button
                    onClick={() => setExpanded(isOpen ? null : id)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-600">
                        {total - (page * PAGE_SIZE) - idx}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          HR {rec.heartRate} bpm · BP {fmtBP(rec.bloodPressure)}
                          {rec.bloodOxygen ? ` · O₂ ${rec.bloodOxygen}%` : ""}
                          {rec.temperature ? ` · ${rec.temperature}°C` : ""}
                          {rec.bloodGlucose ? ` · Glucose ${rec.bloodGlucose} mg/dL` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">{fmtDate(rec.recordedAt || rec.createdAt)}</p>
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-6 py-5">
                      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {[
                          ["Heart Rate", rec.heartRate, " bpm"],
                          ["Blood Pressure", fmtBP(rec.bloodPressure), " mmHg"],
                          ["Temperature", rec.temperature, "°C"],
                          ["Blood Oxygen", rec.bloodOxygen, "%"],
                          ["Blood Glucose", rec.bloodGlucose, " mg/dL"],
                          ["Respiratory Rate", rec.respiratoryRate, " /min"],
                          ["Weight", rec.weight, " kg"],
                          ["Steps", rec.steps, ""],
                        ].map(([label, val, unit]) => (
                          <div key={label}>
                            <p className="text-xs text-slate-400">{label}</p>
                            <p className="mt-0.5 font-semibold text-slate-800">
                              {val !== undefined && val !== null
                                ? `${val}${unit}`
                                : <span className="text-slate-300">—</span>}
                            </p>
                          </div>
                        ))}
                      </div>

                      {rec.medication && (
                        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Medication</p>
                          <p className="mt-1 text-sm text-teal-800">{rec.medication}</p>
                        </div>
                      )}
                      {rec.notes && (
                        <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Clinical Notes</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-700">{rec.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={page === 0}
              onClick={() => { const p = page - 1; setPage(p); fetchPage(p); }}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => { const p = page + 1; setPage(p); fetchPage(p); }}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default PatientDetail;
