import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers, getPatientHealthData } from "../services/api";

// Condition colour mapping
const conditionColour = (c) => {
  const s = c.toLowerCase();
  if (s.includes("diabetes")) return "bg-amber-50 text-amber-700";
  if (s.includes("heart") || s.includes("cardiac") || s.includes("atrial") || s.includes("congestive")) return "bg-rose-50 text-rose-700";
  if (s.includes("hypertension") || s.includes("blood pressure")) return "bg-orange-50 text-orange-700";
  if (s.includes("copd") || s.includes("respiratory") || s.includes("asthma")) return "bg-sky-50 text-sky-700";
  if (s.includes("parkinson") || s.includes("neuro") || s.includes("alzheimer")) return "bg-purple-50 text-purple-700";
  return "bg-slate-100 text-slate-600";
};

function PatientsList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [latestVitals, setLatestVitals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

    getUsers("user")
      .then(async (res) => {
        const list = res.data?.users || res.data || [];
        const patients = Array.isArray(list) ? list : [];
        setPatients(patients);

        // Fetch latest vitals for each patient in parallel
        const vitalsMap = {};
        await Promise.allSettled(
          patients.map(async (p) => {
            const id = p._id || p.id;
            try {
              const vRes = await getPatientHealthData(id, 1, 0);
              const records = vRes.data?.data || [];
              vitalsMap[id] = records[0] || null;
            } catch {
              vitalsMap[id] = null;
            }
          })
        );
        setLatestVitals(vitalsMap);
      })
      .catch(() => setError("Unable to load patient list."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const filtered = patients.filter((p) =>
    search === "" ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColour = (vitals) => {
    if (!vitals) return { dot: "bg-slate-300", text: "text-slate-400", label: "No Data" };
    const hr = vitals.heartRate;
    const o2 = vitals.bloodOxygen;
    const bp = vitals.bloodPressure?.systolic;
    if ((hr && (hr > 100 || hr < 55)) || (o2 && o2 < 94) || (bp && bp > 160)) {
      return { dot: "bg-rose-500", text: "text-rose-600", label: "Needs Attention" };
    }
    if ((hr && (hr > 90 || hr < 60)) || (o2 && o2 < 96) || (bp && bp > 140)) {
      return { dot: "bg-amber-400", text: "text-amber-600", label: "Monitor" };
    }
    return { dot: "bg-emerald-500", text: "text-emerald-600", label: "Stable" };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Care Management</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Patients</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading…" : `${patients.length} patient${patients.length !== 1 ? "s" : ""} registered`}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            ← Back
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
            {search ? "No patients match your search." : "No patients found."}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((patient) => {
              const id = patient._id || patient.id;
              const vitals = latestVitals[id];
              const status = statusColour(vitals);
              const initials = patient.name
                ? patient.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                : "?";

              return (
                <button
                  key={id}
                  onClick={() => navigate(`/patients/${id}`)}
                  className="group rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-teal-300 hover:shadow-md"
                >
                  {/* Avatar + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-base font-bold text-white">
                      {initials}
                    </div>
                    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.text} bg-opacity-10`}>
                      <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Name & email */}
                  <div className="mt-4">
                    <p className="font-semibold text-slate-900 group-hover:text-teal-700">{patient.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{patient.email}</p>
                  </div>

                  {/* Conditions */}
                  {patient.conditions?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {patient.conditions.slice(0, 2).map((c) => (
                        <span key={c} className={`rounded-full px-2 py-0.5 text-xs font-medium ${conditionColour(c)}`}>
                          {c}
                        </span>
                      ))}
                      {patient.conditions.length > 2 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          +{patient.conditions.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Latest vitals snapshot */}
                  {vitals ? (
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs">
                      <div>
                        <p className="text-slate-400">HR</p>
                        <p className="mt-0.5 font-semibold text-slate-700">{vitals.heartRate} <span className="font-normal text-slate-400">bpm</span></p>
                      </div>
                      <div>
                        <p className="text-slate-400">BP</p>
                        <p className="mt-0.5 font-semibold text-slate-700">
                          {vitals.bloodPressure?.systolic ?? "—"}/{vitals.bloodPressure?.diastolic ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">O₂</p>
                        <p className="mt-0.5 font-semibold text-slate-700">{vitals.bloodOxygen ?? "—"}<span className="font-normal text-slate-400">%</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-center text-xs text-slate-400">
                      No vitals on record
                    </div>
                  )}

                  <p className="mt-4 text-xs font-medium text-teal-600 group-hover:underline">View full history →</p>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default PatientsList;
