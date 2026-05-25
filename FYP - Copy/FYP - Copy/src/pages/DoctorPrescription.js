import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers } from "../services/api";

const STORAGE_KEY = "doctorPrescriptions";

const FALLBACK_PATIENTS = [
  { _id: "mock-user-1", name: "Amna Javed" },
  { _id: "mock-user-2", name: "Abdul Rehman" },
  { _id: "mock-user-3", name: "Fatima Malik" },
  { _id: "mock-user-4", name: "Mohsin Riaz" },
  { _id: "mock-user-5", name: "Nadia Hassan" },
  { _id: "mock-user-6", name: "Tariq Mahmood" },
];

const EMPTY_MED = { name: "", dosage: "", frequency: "", route: "Oral", instructions: "" };

const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "Every 8 hours", "Every 12 hours", "As needed (PRN)", "Weekly", "Monthly"];
const DURATIONS   = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months", "3 months", "6 months", "Ongoing"];
const ROUTES      = ["Oral", "Injection (IV)", "Injection (IM)", "Topical", "Inhaled", "Sublingual", "Nasal", "Eye drops", "Ear drops"];

function DoctorPrescription() {
  const navigate = useNavigate();
  const [doctor, setDoctor]         = useState(null);
  const [view, setView]             = useState("add");
  const [patients, setPatients]     = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [expanded, setExpanded]     = useState(null);

  // Form state
  const [patientId, setPatientId]   = useState("");
  const [date, setDate]             = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration]     = useState("7 days");
  const [remarks, setRemarks]       = useState("");
  const [medicines, setMedicines]   = useState([{ ...EMPTY_MED }]);
  const [formError, setFormError]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "doctor") { navigate("/login"); return; }
      setDoctor(u);
    } catch { navigate("/login"); return; }

    getUsers("user")
      .then((r) => {
        const list = r.data?.users || [];
        setPatients(list.length > 0 ? list : FALLBACK_PATIENTS);
      })
      .catch(() => setPatients(FALLBACK_PATIENTS));

    try {
      setPrescriptions(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch { setPrescriptions([]); }
  }, [navigate]);

  const patientName = (uid) => {
    const p = patients.find((u) => (u._id || u.id) === uid);
    return p ? p.name : uid;
  };

  // Medicine row handlers
  const updateMed = (idx, field, value) =>
    setMedicines((prev) => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));

  const addMedRow    = () => setMedicines((prev) => [...prev, { ...EMPTY_MED }]);
  const removeMedRow = (idx) => setMedicines((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!patientId)                          { setFormError("Please select a patient."); return; }
    if (!medicines[0].name || !medicines[0].dosage || !medicines[0].frequency) {
      setFormError("Please fill in at least the first medicine's name, dosage and frequency.");
      return;
    }
    setFormError("");

    const record = {
      id: `rx-${Date.now()}`,
      doctorId:   doctor?.id || doctor?._id,
      doctorName: doctor?.name,
      patientId,
      date,
      duration,
      remarks,
      medicines: medicines.filter((m) => m.name.trim()),
      createdAt: new Date().toISOString(),
    };

    const updated = [record, ...prescriptions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPrescriptions(updated);

    // Reset form
    setPatientId("");
    setDate(new Date().toISOString().slice(0, 10));
    setDuration("7 days");
    setRemarks("");
    setMedicines([{ ...EMPTY_MED }]);
    setSuccessMsg("Prescription saved successfully.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <button onClick={() => navigate("/doctor-performas")}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800">
            ← Back to Performas
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Doctor Tools</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Write Prescription</h1>
          <p className="mt-1 text-sm text-slate-500">Issue prescriptions to patients with full medication details.</p>
        </div>

        {/* Toggle */}
        <div className="mb-8 flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
          {[["add","Add Prescription"],["previous","Previous Prescriptions"]].map(([v,label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                view === v ? "bg-violet-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Add Prescription ── */}
        {view === "add" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">New Prescription</h2>

            {successMsg && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{successMsg}</div>
            )}
            {formError && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{formError}</div>
            )}

            {/* Patient + Date + Duration */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Patient *</label>
                <select value={patientId} onChange={(e) => setPatientId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100">
                  <option value="">-- Select patient --</option>
                  {patients.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100">
                  {DURATIONS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Medicines table */}
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Medicines *</label>
                <button onClick={addMedRow}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-50 border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition">
                  + Add Medicine
                </button>
              </div>

              <div className="space-y-3">
                {medicines.map((med, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Medicine {idx + 1}
                      </span>
                      {medicines.length > 1 && (
                        <button onClick={() => removeMedRow(idx)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700">
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="lg:col-span-1">
                        <label className="text-xs font-medium text-slate-600">Medicine Name *</label>
                        <input type="text" placeholder="e.g. Metformin" value={med.name}
                          onChange={(e) => updateMed(idx, "name", e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Dosage *</label>
                        <input type="text" placeholder="e.g. 500mg" value={med.dosage}
                          onChange={(e) => updateMed(idx, "dosage", e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Frequency *</label>
                        <select value={med.frequency} onChange={(e) => updateMed(idx, "frequency", e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100">
                          <option value="">-- Select --</option>
                          {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Route</label>
                        <select value={med.route} onChange={(e) => updateMed(idx, "route", e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100">
                          {ROUTES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Instructions</label>
                        <input type="text" placeholder="e.g. Take after meals with water"
                          value={med.instructions} onChange={(e) => updateMed(idx, "instructions", e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Remarks */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700">Doctor Remarks</label>
              <textarea rows={3} placeholder="Additional notes, follow-up instructions, lifestyle advice..."
                value={remarks} onChange={(e) => setRemarks(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100" />
            </div>

            {/* Preview strip */}
            {patientId && medicines[0].name && (
              <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">Preview</p>
                <p className="mt-1 text-sm font-semibold text-violet-900">
                  {patientName(patientId)} · {medicines.filter(m => m.name).length} medicine{medicines.filter(m=>m.name).length !== 1 ? "s" : ""} · {duration}
                </p>
                <p className="text-xs text-violet-700 mt-0.5">
                  {medicines.filter(m => m.name).map(m => `${m.name} ${m.dosage}`).join(" · ")}
                </p>
              </div>
            )}

            <button onClick={handleSubmit}
              className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700">
              Save Prescription
            </button>
          </div>
        )}

        {/* ── Previous Prescriptions ── */}
        {view === "previous" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Previous Prescriptions</h2>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                {prescriptions.length} total
              </span>
            </div>

            {prescriptions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
                No prescriptions saved yet.
              </div>
            )}

            {prescriptions.length > 0 && (
              <div className="space-y-3">
                {prescriptions.map((rx) => {
                  const isOpen = expanded === rx.id;
                  const rxDate = new Date(rx.date || rx.createdAt);
                  return (
                    <div key={rx.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : rx.id)}
                        className="w-full flex items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                            Rx
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              {patientName(rx.patientId)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {rxDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {" · "}
                              {rx.medicines?.length} medicine{rx.medicines?.length !== 1 ? "s" : ""}
                              {" · "}
                              {rx.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="hidden sm:block text-xs text-slate-500 truncate max-w-[180px]">
                            {rx.medicines?.map(m => m.name).join(", ")}
                          </span>
                          <span className="text-slate-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-5 py-5 bg-white space-y-4">
                          {/* Header info */}
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Patient</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{patientName(rx.patientId)}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {rxDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{rx.duration}</p>
                            </div>
                          </div>

                          {/* Medicines */}
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">Prescribed Medicines</p>
                            <div className="space-y-2">
                              {rx.medicines?.map((m, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-2 rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-700">
                                    {i + 1}
                                  </span>
                                  <span className="font-semibold text-sm text-violet-900">{m.name}</span>
                                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">{m.dosage}</span>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{m.frequency}</span>
                                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{m.route}</span>
                                  {m.instructions && (
                                    <span className="text-xs text-slate-500 w-full pl-8">{m.instructions}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {rx.remarks && (
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Doctor Remarks</p>
                              <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{rx.remarks}</p>
                            </div>
                          )}

                          <p className="text-xs text-slate-400">
                            Issued by {rx.doctorName} · {new Date(rx.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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

export default DoctorPrescription;
