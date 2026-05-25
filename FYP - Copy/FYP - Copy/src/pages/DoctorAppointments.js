import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const STORAGE_KEY = "nigehbaan_appointments";

const TIME_SLOTS = [
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM",
  "4:00 PM","4:30 PM","5:00 PM",
];

function ConfirmModal({ appt, onClose, onConfirmed }) {
  const [date, setDate]   = useState("");
  const [time, setTime]   = useState("");
  const [note, setNote]   = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!date) { setError("Please select a date."); return; }
    if (!time) { setError("Please select a time slot."); return; }
    setError("");

    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = all.map((a) =>
      a.id === appt.id
        ? { ...a, status: "confirmed", timeSlot: { date, day: dayName, time }, doctorNote: note, confirmedAt: new Date().toISOString() }
        : a
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    onConfirmed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">Confirm Appointment</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">{appt.patientName}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">✕</button>
        </div>

        <div className="px-7 py-6 space-y-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reason</p>
            <p className="mt-1 text-slate-700">{appt.reason}</p>
            {appt.preferredDate && (
              <p className="mt-1 text-xs text-slate-500">Patient preferred: {new Date(appt.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            )}
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          <div>
            <label className="text-sm font-medium text-slate-700">Appointment Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Time Slot *</label>
            <select value={time} onChange={(e) => setTime(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100">
              <option value="">-- Select time --</option>
              {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Note to Patient (optional)</label>
            <textarea rows={2} placeholder="Any instructions or preparation notes..."
              value={note} onChange={(e) => setNote(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-7 py-5">
          <button onClick={onClose} className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Cancel
          </button>
          <button onClick={handleConfirm} className="flex-1 rounded-2xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
            Confirm Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [doctor, setDoctor]           = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab]                 = useState("pending");
  const [confirmingAppt, setConfirmingAppt] = useState(null);
  const [successMsg, setSuccessMsg]   = useState("");

  const loadAppointments = useCallback((doc) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const mine = all.filter((a) => a.doctorId === (doc?.id || doc?._id));
    setAppointments(mine);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "doctor") { navigate("/login"); return; }
      setDoctor(u);
      loadAppointments(u);
    } catch { navigate("/login"); }
  }, [navigate, loadAppointments]);

  const handleConfirmed = () => {
    setConfirmingAppt(null);
    setSuccessMsg("Appointment confirmed and patient has been notified.");
    setTimeout(() => setSuccessMsg(""), 4000);
    loadAppointments(doctor);
  };

  const handleCancel = (apptId) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = all.map((a) =>
      a.id === apptId ? { ...a, status: "cancelled", cancelledAt: new Date().toISOString() } : a
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    loadAppointments(doctor);
  };

  const filtered = appointments.filter((a) => {
    if (tab === "pending")   return a.status === "pending";
    if (tab === "confirmed") return a.status === "confirmed";
    return true;
  });

  const pendingCount   = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const paidCount      = appointments.filter((a) => a.paymentStatus === "paid").length;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      {confirmingAppt && (
        <ConfirmModal appt={confirmingAppt} onClose={() => setConfirmingAppt(null)} onConfirmed={handleConfirmed} />
      )}

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        <button onClick={() => navigate("/doctor-dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800">
          ← Back to Dashboard
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Doctor Portal</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Appointment Requests</h1>
        <p className="mt-1 text-sm text-slate-500 mb-8">Review and confirm patient appointment requests.</p>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Paid</p>
            <p className="mt-1 text-2xl font-bold text-teal-700">{paidCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Unpaid</p>
            <p className="mt-1 text-2xl font-bold text-slate-700">{appointments.length - paidCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Requests</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">{appointments.length}</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{successMsg}</div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
          {[
            ["pending",   `Pending (${pendingCount})`],
            ["confirmed", `Confirmed (${confirmedCount})`],
            ["all",       `All (${appointments.length})`],
          ].map(([v, label]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                tab === v ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
              {tab === "pending" ? "No pending appointment requests." : "No appointments in this category."}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((appt) => (
                <div key={appt.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                        {appt.patientName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{appt.patientName}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{appt.reason}</p>
                        {appt.notes && <p className="text-xs text-slate-400 mt-1">"{appt.notes}"</p>}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            appt.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                            appt.status === "cancelled" ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            appt.paymentStatus === "paid" ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-600"
                          }`}>
                            {appt.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                          </span>
                          <span className="text-xs text-slate-400">
                            Requested {fmtDate(appt.requestedAt)}
                          </span>
                          {appt.preferredDate && (
                            <span className="text-xs text-slate-400">
                              · Preferred: {fmtDate(appt.preferredDate)}
                            </span>
                          )}
                        </div>

                        {/* Confirmed time slot */}
                        {appt.status === "confirmed" && appt.timeSlot && (
                          <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm">
                            <p className="font-semibold text-emerald-800">
                              📅 {appt.timeSlot.day}, {fmtDate(appt.timeSlot.date)} at {appt.timeSlot.time}
                            </p>
                            {appt.doctorNote && <p className="text-xs text-emerald-600 mt-1">{appt.doctorNote}</p>}
                          </div>
                        )}
                        <div className={`mt-3 rounded-xl border px-3 py-2.5 text-sm ${
                          appt.paymentStatus === "paid"
                            ? "border-teal-200 bg-teal-50 text-teal-800"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}>
                          <p className="font-semibold">
                            Payment: {appt.paymentStatus === "paid" ? "Paid" : "Not paid yet"}
                          </p>
                          <p className="text-xs">
                            PKR {(appt.paymentAmount || 2500).toLocaleString()}
                            {appt.paymentStatus === "paid" && appt.paymentMethod ? ` via ${appt.paymentMethod}` : ""}
                            {appt.paymentReference ? ` · Ref: ${appt.paymentReference}` : ""}
                          </p>
                          {appt.paymentBank && (
                            <p className="mt-1 text-xs">Bank: {appt.paymentBank.bank} · {appt.paymentBank.account}</p>
                          )}
                          {appt.paymentProof?.dataUrl && (
                            <a
                              href={appt.paymentProof.dataUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex text-xs font-semibold text-teal-700 underline"
                            >
                              View payment proof
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {appt.status === "pending" && (
                      <div className="flex shrink-0 gap-2">
                        <button onClick={() => setConfirmingAppt(appt)}
                          className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition">
                          Confirm & Set Time
                        </button>
                        <button onClick={() => handleCancel(appt.id)}
                          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
