import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MOCK_HEALTH_RECORDS } from "../utils/mockHealth";

const STORAGE_KEY  = "nigehbaan_nurse_shifts";
const SHIFT_TYPES  = ["Morning (6AM – 2PM)", "Evening (2PM – 10PM)", "Night (10PM – 6AM)"];
const WARDS        = ["Ward A", "Ward B", "Ward C", "ICU", "General", "Emergency", "Outpatient"];

const MOCK_PATIENTS = [
  { id: "mock-user-1",  name: "Amna Javed" },
  { id: "mock-user-2",  name: "Abdul Rehman" },
  { id: "mock-user-3",  name: "Fatima Malik" },
  { id: "mock-user-4",  name: "Mohsin Riaz" },
  { id: "mock-user-5",  name: "Nadia Hassan" },
  { id: "mock-user-6",  name: "Tariq Mahmood" },
];

// Nurse IDs to name map (used to attribute mock checkup records)
const NURSE_ID_MAP = {
  "mock-user-11": "Nurse Sarah",
  "mock-user-12": "Nurse Aliya",
};

const today      = () => new Date().toISOString().slice(0, 10);
const fmtDate    = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const isPast     = (d) => d && new Date(d) < new Date(new Date().setHours(0,0,0,0));
const isCurrent  = (d) => {
  const t = new Date(); const s = new Date(d);
  return s.toDateString() === t.toDateString();
};

function ShiftBadge({ date }) {
  if (!date) return null;
  if (isCurrent(date)) return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Today</span>;
  if (isPast(date))    return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">Completed</span>;
  return                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">Upcoming</span>;
}

export default function NurseShift() {
  const navigate = useNavigate();
  const [nurse, setNurse]         = useState(null);
  const [tab, setTab]             = useState("shifts");   // "shifts" | "checkups"
  const [shifts, setShifts]       = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess]     = useState("");

  // Form state
  const blank = { date: today(), shiftType: SHIFT_TYPES[0], ward: WARDS[0], patients: [], notes: "" };
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  // Checkups filter
  const [filterPatient, setFilterPatient] = useState("all");

  // ── Auth ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "nurse") { navigate("/login"); return; }
      setNurse(u);
    } catch { navigate("/login"); }
  }, [navigate]);

  // ── Load shifts ─────────────────────────────────────────────────────────
  const loadShifts = useCallback((n) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const mine = all.filter((s) => s.nurseId === (n?.id || n?._id));
    mine.sort((a, b) => new Date(b.date) - new Date(a.date));
    setShifts(mine);
  }, []);

  useEffect(() => { if (nurse) loadShifts(nurse); }, [nurse, loadShifts]);

  // ── Save shift ───────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.date)      { setFormError("Please select a date."); return; }
    if (!form.shiftType) { setFormError("Please select a shift type."); return; }
    if (!form.ward)      { setFormError("Please select a ward."); return; }
    setFormError("");

    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (editingId) {
      const updated = all.map((s) => s.id === editingId ? { ...s, ...form, updatedAt: new Date().toISOString() } : s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSuccess("Shift updated successfully.");
    } else {
      const newShift = {
        id: `shift-${Date.now()}`,
        nurseId:   nurse?.id || nurse?._id,
        nurseName: nurse?.name,
        ...form,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newShift, ...all]));
      setSuccess("New shift added successfully.");
    }
    setForm(blank);
    setEditingId(null);
    setShowForm(false);
    loadShifts(nurse);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleEdit = (shift) => {
    setForm({ date: shift.date, shiftType: shift.shiftType, ward: shift.ward, patients: shift.patients || [], notes: shift.notes || "" });
    setEditingId(shift.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter((s) => s.id !== id)));
    loadShifts(nurse);
  };

  const cancelForm = () => { setForm(blank); setEditingId(null); setShowForm(false); setFormError(""); };

  // ── Patient toggle in form ───────────────────────────────────────────────
  const togglePatient = (pid) => {
    setForm((f) => ({
      ...f,
      patients: f.patients.includes(pid) ? f.patients.filter((p) => p !== pid) : [...f.patients, pid],
    }));
  };

  // ── Checkup records ─────────────────────────────────────────────────────
  const nurseIdKey = nurse?.id || nurse?._id;
  // Mock records attributed to this nurse's ID (mock-user-11 or mock-user-12)
  // For display purposes we show all mock records and attribute by recordedBy
  const checkups = MOCK_HEALTH_RECORDS
    .map((r) => ({
      ...r,
      patientName: MOCK_PATIENTS.find((p) => p.id === r.userId)?.name || "Unknown",
      nurseLabel:  NURSE_ID_MAP[r.recordedBy] || nurse?.name || "Nurse",
    }))
    .filter((r) => filterPatient === "all" || r.userId === filterPatient)
    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));

  const currentShift = shifts.find((s) => isCurrent(s.date));
  const upcoming     = shifts.filter((s) => !isPast(s.date) && !isCurrent(s.date));
  const past         = shifts.filter((s) => isPast(s.date));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Nurse Portal</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Shift Management</h1>
            <p className="mt-1 text-sm text-slate-500">{nurse?.name} &middot; {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}</p>
          </div>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(blank); }}
              className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 shrink-0">
              + Add New Shift
            </button>
          )}
        </div>

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              {editingId ? "Edit Shift" : "Add New Shift"}
            </h2>
            {formError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Date *</label>
                <input type="date" value={form.date} min={today()}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Shift Type *</label>
                <select value={form.shiftType} onChange={(e) => setForm({ ...form, shiftType: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100">
                  {SHIFT_TYPES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Ward / Unit *</label>
                <select value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100">
                  {WARDS.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* Patient assignment */}
            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Assign Patients to This Shift</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOCK_PATIENTS.map((p) => {
                  const selected = form.patients.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => togglePatient(p.id)}
                      className={`rounded-2xl border px-4 py-1.5 text-sm font-medium transition ${
                        selected ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                      }`}>
                      {selected ? "✓ " : ""}{p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any handover notes or instructions..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={cancelForm}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleSave}
                className="rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
                {editingId ? "Save Changes" : "Add Shift"}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
          {[["shifts","My Shifts"], ["checkups","Patient Checkups"]].map(([v, label]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                tab === v ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── SHIFTS TAB ──────────────────────────────────────────────────── */}
        {tab === "shifts" && (
          <div className="space-y-6">

            {/* Current shift highlight */}
            {currentShift && (
              <div className="rounded-3xl bg-emerald-600 p-6 text-white shadow-md">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Active Today</p>
                    <h2 className="mt-1 text-2xl font-bold">{currentShift.shiftType}</h2>
                    <p className="mt-1 text-emerald-100 text-sm">{currentShift.ward}</p>
                    {currentShift.patients?.length > 0 && (
                      <p className="mt-1 text-xs text-emerald-200">
                        Patients: {currentShift.patients.map((pid) => MOCK_PATIENTS.find((p) => p.id === pid)?.name).filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleEdit(currentShift)}
                    className="rounded-2xl bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition">
                    Edit Shift
                  </button>
                </div>
                {currentShift.notes && (
                  <p className="mt-4 rounded-2xl bg-white/10 px-4 py-2 text-sm text-emerald-100">{currentShift.notes}</p>
                )}
              </div>
            )}

            {shifts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
                No shifts added yet. Click <strong>+ Add New Shift</strong> to get started.
              </div>
            ) : (
              <>
                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Upcoming</h3>
                    <div className="space-y-3">
                      {upcoming.map((s) => <ShiftCard key={s.id} shift={s} onEdit={handleEdit} onDelete={handleDelete} />)}
                    </div>
                  </div>
                )}

                {/* Past */}
                {past.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Previous Shifts</h3>
                    <div className="space-y-3">
                      {past.map((s) => <ShiftCard key={s.id} shift={s} onEdit={handleEdit} onDelete={handleDelete} past />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── CHECKUPS TAB ────────────────────────────────────────────────── */}
        {tab === "checkups" && (
          <div className="space-y-5">
            {/* Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-slate-600">Filter by patient:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterPatient("all")}
                  className={`rounded-2xl border px-3 py-1 text-xs font-semibold transition ${filterPatient === "all" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                  All Patients
                </button>
                {MOCK_PATIENTS.map((p) => (
                  <button key={p.id} onClick={() => setFilterPatient(p.id)}
                    className={`rounded-2xl border px-3 py-1 text-xs font-semibold transition ${filterPatient === p.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkup cards */}
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date &amp; Time</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Heart Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">BP</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Temp</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">SpO2</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkups.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">No checkup records found.</td></tr>
                    ) : checkups.map((r, i) => {
                      const d = new Date(r.recordedAt || r.createdAt);
                      const isRecent = (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
                      const bp = r.bloodPressure ? `${r.bloodPressure.systolic}/${r.bloodPressure.diastolic}` : "—";
                      return (
                        <tr key={r._id || i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-800">{r.patientName}</p>
                            <p className="text-xs text-slate-400">{r.nurseLabel}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-medium text-slate-700">{fmtDate(r.recordedAt || r.createdAt)}</p>
                            <p className="text-xs text-slate-400">{d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</p>
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-slate-700">{r.heartRate ? `${r.heartRate} bpm` : "—"}</td>
                          <td className="px-4 py-3 text-center text-slate-700">{bp}</td>
                          <td className="px-4 py-3 text-center text-slate-700">{r.temperature ? `${r.temperature}°C` : "—"}</td>
                          <td className="px-4 py-3 text-center text-slate-700">{r.bloodOxygen ? `${r.bloodOxygen}%` : "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isRecent ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                              {isRecent ? "Recent" : "Completed"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function ShiftCard({ shift, onEdit, onDelete, past }) {
  const assignedNames = (shift.patients || [])
    .map((pid) => MOCK_PATIENTS.find((p) => p.id === pid)?.name)
    .filter(Boolean);

  return (
    <div className={`rounded-2xl border p-5 flex items-start justify-between gap-4 ${past ? "border-slate-100 bg-white opacity-80" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
          isCurrent(shift.date) ? "bg-emerald-100" : past ? "bg-slate-100" : "bg-indigo-100"
        }`}>
          {past ? "✓" : isCurrent(shift.date) ? "🟢" : "📅"}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900">{shift.shiftType}</p>
            <ShiftBadge date={shift.date} />
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{fmtDate(shift.date)} &middot; {shift.ward}</p>
          {assignedNames.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">Patients: {assignedNames.join(", ")}</p>
          )}
          {shift.notes && <p className="mt-1 text-xs text-slate-400 italic">{shift.notes}</p>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={() => onEdit(shift)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
          Edit
        </button>
        <button onClick={() => onDelete(shift.id)}
          className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition">
          Delete
        </button>
      </div>
    </div>
  );
}
