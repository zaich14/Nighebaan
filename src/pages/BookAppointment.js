import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers } from "../services/api";

const STORAGE_KEY = "nigehbaan_appointments";

const MOCK_DOCTORS = [
  { _id: "mock-user-9",  name: "Dr. Ahmed Khan", specialization: "Cardiology",      hospital: "City Heart Institute" },
  { _id: "mock-user-10", name: "Dr. Sara Malik",  specialization: "General Medicine", hospital: "Metro Health Clinic"  },
];

const REASONS = [
  "Regular checkup", "Follow-up visit", "Blood pressure review",
  "Diabetes management", "Heart condition review", "Respiratory issues",
  "Medication review", "Lab results discussion", "New symptoms", "Other",
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

const statusBadge = (s) => {
  if (s === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (s === "rejected")  return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(
    searchParams.get("tab") === "book" ? "book" :
    searchParams.get("tab") === "previous" ? "previous" : null
  );

  const [patient, setPatient]   = useState(null);
  const [doctors, setDoctors]   = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason]     = useState("");
  const [customReason, setCustomReason] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes]       = useState("");
  const [error, setError]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "user" && u.role !== "caregiver") { navigate("/dashboard"); return; }
      setPatient(u);
      loadAppointments(u);
    } catch { navigate("/login"); return; }

    getUsers("doctor")
      .then((r) => {
        const list = r.data?.users || [];
        setDoctors(list.length > 0 ? list : MOCK_DOCTORS);
      })
      .catch(() => setDoctors(MOCK_DOCTORS));
  }, [navigate]);

  const loadAppointments = (u) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const pid = u.id || u._id;
      const mine = all.filter((a) => a.patientId === pid);
      setMyAppointments(mine.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)));
    } catch { setMyAppointments([]); }
  };

  const switchTab = (t) => {
    setTab(t);
    setSearchParams(t ? { tab: t } : {});
    setSubmitted(false);
    setError("");
  };

  const handleSubmit = () => {
    if (!doctorId) { setError("Please select a doctor."); return; }
    if (!reason)   { setError("Please select a reason for the appointment."); return; }
    setError("");

    const doctor = doctors.find((d) => (d._id || d.id) === doctorId);
    const appt = {
      id:           `appt-${Date.now()}`,
      patientId:    patient.id || patient._id,
      patientName:  patient.name,
      doctorId,
      doctorName:   doctor?.name || "-",
      doctorSpecialization: doctor?.specialization || "",
      reason:       reason === "Other" ? customReason : reason,
      preferredDate,
      notes,
      status:       "pending",
      requestedAt:  new Date().toISOString(),
      timeSlot:     null,
      doctorNote:   "",
    };

    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify([appt, ...all]));
    loadAppointments(patient);
    setSubmitted(true);
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-3xl">&#128197;</div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">Appointment Requested!</h2>
            <p className="mt-3 text-slate-500 text-sm">
              Your request has been sent to{" "}
              <span className="font-semibold text-slate-700">
                {doctors.find((d) => (d._id || d.id) === doctorId)?.name}
              </span>.
            </p>
            <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800 text-left space-y-1.5">
              <p>&#8226; The doctor will review and assign a time slot.</p>
              <p>&#8226; You will see the confirmed appointment on your dashboard.</p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={() => switchTab("previous")}
                className="w-full rounded-2xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition">
                View My Appointments
              </button>
              <button onClick={() => navigate("/dashboard")}
                className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Back button */}
        <div className="mb-6">
          {tab === null ? (
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
              &#8592; Back to Dashboard
            </button>
          ) : (
            <button onClick={() => { setTab(null); setSearchParams({}); }}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
              &#8592; Back to Options
            </button>
          )}
        </div>

        {/* Header */}
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Patient Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-2 text-sm text-slate-500">Book a new appointment or view your previous appointment history.</p>
        </div>

        {/* ── LANDING ──────────────────────────────────────────────────────── */}
        {tab === null && (
          <div className="grid gap-5 sm:grid-cols-2">
            <button
              onClick={() => switchTab("book")}
              className="group flex flex-col items-start gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-left transition hover:ring-teal-400 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Book an Appointment</h2>
                <p className="mt-1.5 text-sm text-slate-500">Select a doctor, choose a reason, and send your appointment request.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-teal-700 transition">
                Book Now &rarr;
              </span>
            </button>

            <button
              onClick={() => switchTab("previous")}
              className="group flex flex-col items-start gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-left transition hover:ring-cyan-400 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Previous Appointments</h2>
                <p className="mt-1.5 text-sm text-slate-500">View all your past and upcoming appointment requests and their status.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-cyan-700 transition">
                View History &rarr;
              </span>
            </button>
          </div>
        )}

        {/* ── BOOK APPOINTMENT ─────────────────────────────────────────────── */}
        {tab === "book" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 space-y-6">

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            )}

            {/* Doctor selection */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Select Doctor *</label>
              <div className="mt-3 grid gap-3">
                {doctors.map((d) => {
                  const did = d._id || d.id;
                  const selected = doctorId === did;
                  return (
                    <button key={did} type="button" onClick={() => setDoctorId(did)}
                      className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                        selected ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-slate-50 hover:border-teal-300"
                      }`}>
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        selected ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {d.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{d.name}</p>
                        <p className="text-xs text-slate-500">{d.specialization || d.designation || "Doctor"}</p>
                        {d.hospital && <p className="text-xs text-slate-400">{d.hospital}</p>}
                      </div>
                      {selected && <span className="text-teal-600 text-lg shrink-0">&#10003;</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Reason for Appointment *</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100">
                <option value="">-- Select reason --</option>
                {REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              {reason === "Other" && (
                <input type="text" placeholder="Describe your reason..." value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
              )}
            </div>

            {/* Preferred date */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Preferred Date (optional)</label>
              <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Additional Notes (optional)</label>
              <textarea rows={3} placeholder="Any symptoms, concerns or information the doctor should know..."
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
            </div>

            <button onClick={handleSubmit}
              className="w-full rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700">
              Send Appointment Request
            </button>
          </div>
        )}

        {/* ── PREVIOUS APPOINTMENTS ────────────────────────────────────────── */}
        {tab === "previous" && (
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">My Appointments</h2>
              <span className="text-xs text-slate-400">{myAppointments.length} total</span>
            </div>

            {myAppointments.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-slate-400">No appointments found.</p>
                <button onClick={() => switchTab("book")}
                  className="mt-4 inline-flex rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition">
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myAppointments.map((a) => (
                  <div key={a.id} className="px-6 py-5 hover:bg-slate-50 transition">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-slate-900">{a.doctorName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{a.doctorSpecialization}</p>
                      </div>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                      <span className="text-slate-500">Reason: <strong className="text-slate-800">{a.reason}</strong></span>
                      <span className="text-slate-500">Requested: <strong className="text-slate-800">{fmtDate(a.requestedAt)}</strong></span>
                      {a.preferredDate && (
                        <span className="text-slate-500">Preferred: <strong className="text-slate-800">{fmtDate(a.preferredDate)}</strong></span>
                      )}
                      {a.timeSlot && (
                        <span className="text-slate-500">Slot: <strong className="text-emerald-700">{a.timeSlot}</strong></span>
                      )}
                    </div>

                    {a.doctorNote && (
                      <div className="mt-3 rounded-2xl bg-teal-50 border border-teal-100 px-4 py-3">
                        <p className="text-xs font-semibold text-teal-600 mb-1">Doctor's Note</p>
                        <p className="text-sm text-slate-700">{a.doctorNote}</p>
                      </div>
                    )}
                    {a.status === "rejected" && (
                      <p className="mt-2 text-xs text-rose-500 italic">This request was not accepted. You may book a new appointment.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

