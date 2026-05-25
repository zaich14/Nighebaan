import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPublicUsers } from "../services/api";

const STORAGE_KEY = "nigehbaan_appointments";

const MOCK_DOCTORS = [
  { _id: "mock-user-9",  name: "Dr. Ahmed Khan", specialization: "Cardiology",      hospital: "City Heart Institute" },
  { _id: "mock-user-10", name: "Dr. Sara Malik",  specialization: "General Medicine", hospital: "Metro Health Clinic"  },
];

const PROVIDER_NAME_MAP = {
  "mock-user-9": "Dr. Ahmed Khan",
  "mock-user-10": "Dr. Sara Malik",
  "mock-user-11": "Nurse Sarah",
  "mock-user-12": "Nurse Aliya",
};

const REASONS = [
  "Regular checkup", "Follow-up visit", "Blood pressure review",
  "Diabetes management", "Heart condition review", "Respiratory issues",
  "Medication review", "Lab results discussion", "New symptoms", "Other",
];

const PAYMENT_OPTIONS = [
  { id: "card", label: "Debit/Credit Card", detail: "Visa, Mastercard, UnionPay" },
  { id: "easypaisa", label: "Easypaisa", detail: "Mobile wallet transfer" },
  { id: "jazzcash", label: "JazzCash", detail: "Mobile wallet transfer" },
  { id: "bank", label: "Bank Transfer", detail: "Online banking receipt" },
];

const BANK_ACCOUNTS = [
  { id: "hbl", bank: "HBL", title: "Nigehbaan Health Services", iban: "PK36HABB0000001122334455", account: "1122-334455-01" },
  { id: "meezan", bank: "Meezan Bank", title: "Nigehbaan Health Services", iban: "PK22MEZN0000006677889900", account: "6677-889900-02" },
  { id: "ubl", bank: "UBL", title: "Nigehbaan Health Services", iban: "PK17UNIL0000005566778899", account: "5566-778899-03" },
];

const getAppointmentFee = (type) => type === "nurse" ? 1500 : 2500;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

const statusBadge = (s) => {
  if (s === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (s === "rejected")  return "bg-rose-50 text-rose-700";
  if (s === "cancelled") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
};

function PaymentModal({ appointment, providerName, onClose, onPaid }) {
  const [method, setMethod] = useState("card");
  const [bankId, setBankId] = useState(BANK_ACCOUNTS[0].id);
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState(null);
  const [error, setError] = useState("");
  const amount = appointment.paymentAmount || getAppointmentFee(appointment.providerType);
  const requiresProof = method === "bank" || method === "easypaisa" || method === "jazzcash";

  const handleProofChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProof(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image screenshot or receipt.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Proof image must be 2MB or smaller.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProof({ name: file.name, type: file.type, dataUrl: reader.result });
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handlePay = () => {
    if (!method) { setError("Please select a payment method."); return; }
    if (method !== "card" && !reference.trim()) {
      setError("Please enter a transaction or receipt reference.");
      return;
    }
    if (requiresProof && !proof) {
      setError("Please upload a payment screenshot or receipt proof.");
      return;
    }

    const selected = PAYMENT_OPTIONS.find((p) => p.id === method);
    const selectedBank = BANK_ACCOUNTS.find((b) => b.id === bankId);
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const paidAt = new Date().toISOString();
    const updated = all.map((a) =>
      a.id === appointment.id
        ? {
            ...a,
            paymentStatus: "paid",
            paymentMethod: selected?.label || method,
            paymentReference: reference.trim() || `NGB-${Date.now()}`,
            paymentAmount: amount,
            paymentBank: method === "bank" ? selectedBank : null,
            paymentProof: proof,
            paidAt,
          }
        : a
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    onPaid();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">Online Payment</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">Pay {providerName}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">x</button>
        </div>

        <div className="px-7 py-6 space-y-5">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Amount</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">PKR {amount.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">Nigehbaan records this as paid and shares the status with the provider.</p>
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          <div>
            <label className="text-sm font-semibold text-slate-700">Payment Method</label>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMethod(option.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    method === option.id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-slate-50 hover:border-teal-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{option.detail}</p>
                </button>
              ))}
            </div>
          </div>

          {method === "bank" && (
            <div>
              <label className="text-sm font-semibold text-slate-700">Transfer To</label>
              <div className="mt-3 grid gap-2">
                {BANK_ACCOUNTS.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setBankId(bank.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      bankId === bank.id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-slate-50 hover:border-teal-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{bank.bank}</p>
                      <span className="text-xs font-semibold text-teal-700">PKR {amount.toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Account Title: {bank.title}</p>
                    <p className="text-xs text-slate-500">Account No: {bank.account}</p>
                    <p className="text-xs text-slate-500">IBAN: {bank.iban}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(method === "easypaisa" || method === "jazzcash") && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Send PKR {amount.toLocaleString()} to Nigehbaan wallet 0300-1234567, then enter the transaction ID and upload the screenshot.
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700">Transaction Reference</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={method === "card" ? "Auto-generated if left empty" : "Enter wallet/bank reference"}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {requiresProof && (
            <div>
              <label className="text-sm font-semibold text-slate-700">Payment Proof Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProofChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none"
              />
              <p className="mt-2 text-xs text-slate-500">
                Upload a screenshot of your bank transfer, Easypaisa, or JazzCash receipt. Max 2MB.
              </p>
              {proof && (
                <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-800">
                  Proof attached: {proof.name}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-7 py-5">
          <button onClick={onClose} className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Cancel
          </button>
          <button onClick={handlePay} className="flex-1 rounded-2xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(
    searchParams.get("tab") === "book" ? "book" :
    searchParams.get("tab") === "previous" ? "previous" : null
  );

  const [patient, setPatient]   = useState(null);
  const [doctors, setDoctors]   = useState([]);
  const [nurses, setNurses]     = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [nurseId, setNurseId]   = useState("");
  const [recipientType, setRecipientType] = useState("doctor");
  const [reason, setReason]     = useState("");
  const [customReason, setCustomReason] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes]       = useState("");
  const [error, setError]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedProviderName, setSubmittedProviderName] = useState("");
  const [notification, setNotification] = useState("");
  const [myAppointments, setMyAppointments] = useState([]);
  const [payingAppointment, setPayingAppointment] = useState(null);
  const [paymentMsg, setPaymentMsg] = useState("");

  const loadAppointments = useCallback((u) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const pid = u.id || u._id;
      const mine = all.filter((a) => a.patientId === pid);
      const normalized = mine.map((appt) => {
        const providerId = appt.providerId || appt.doctorId || appt.nurseId;
        const providerName = getProviderLabel({ ...appt, providerId });
        if ((!appt.providerName || appt.providerName === "-" || appt.providerName === providerId) && providerName) {
          return { ...appt, providerName };
        }
        return appt;
      });
      const sorted = normalized.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
      setMyAppointments(sorted);

      const latestConfirmed = sorted
        .filter((a) => a.status === "confirmed" && a.confirmedAt)
        .reduce((best, current) => {
          if (!best) return current;
          return new Date(current.confirmedAt) > new Date(best.confirmedAt) ? current : best;
        }, null);

      if (latestConfirmed) {
        setNotification(
          `Your appointment with ${getProviderLabel(latestConfirmed)} has been confirmed for ${fmtDate(latestConfirmed.timeSlot?.date)} at ${latestConfirmed.timeSlot?.time}.`
        );
      } else {
        setNotification("");
      }

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const updated = saved.map((appt) => {
        if (appt.patientId !== pid) return appt;
        const providerId = appt.providerId || appt.doctorId || appt.nurseId;
        const providerName = getProviderLabel({ ...appt, providerId });
        if ((!appt.providerName || appt.providerName === "-" || appt.providerName === providerId) && providerName) {
          return { ...appt, providerName };
        }
        return appt;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      setMyAppointments([]);
      setNotification("");
    }
  }, [doctors, nurses]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    let patientData;
    try {
      const u = JSON.parse(raw);
      if (u.role !== "user" && u.role !== "caregiver") { navigate("/dashboard"); return; }
      setPatient(u);
      patientData = u;
    } catch { navigate("/login"); return; }

    const doctorPromise = getPublicUsers("doctor")
      .then((r) => {
        const list = r.data?.users || [];
        setDoctors(list.length > 0 ? list : MOCK_DOCTORS);
      })
      .catch(() => setDoctors(MOCK_DOCTORS));

    const nursePromise = getPublicUsers("nurse")
      .then((r) => setNurses(r.data?.users || []))
      .catch(() => setNurses([]));

    Promise.allSettled([doctorPromise, nursePromise]).finally(() => {
      if (patientData) loadAppointments(patientData);
    });
  }, [navigate, loadAppointments]);

  const switchTab = (t) => {
    setTab(t);
    setSearchParams(t ? { tab: t } : {});
    setSubmitted(false);
    setError("");
  };

  const getProviderLabel = (appt) => {
    const providerName = appt.providerName && appt.providerName !== "-" ? appt.providerName : null;
    if (providerName) return providerName;
    if (appt.doctorName) return appt.doctorName;
    if (appt.nurseName) return appt.nurseName;

    const providerId = appt.providerId || appt.doctorId || appt.nurseId;
    if (providerId && PROVIDER_NAME_MAP[providerId]) return PROVIDER_NAME_MAP[providerId];

    const doctor = doctors.find((d) => (d._id || d.id) === providerId);
    if (doctor) return doctor.name;

    const nurse = nurses.find((n) => (n._id || n.id) === providerId);
    if (nurse) return nurse.name;

    if (appt.providerType === "doctor") {
      return providerId || "Doctor";
    }
    if (appt.providerType === "nurse") {
      return providerId || "Nurse";
    }

    return providerId || "your provider";
  };

  const handleSubmit = () => {
    if (recipientType === "doctor" && !doctorId) { setError("Please select a doctor."); return; }
    if (recipientType === "nurse" && !nurseId)   { setError("Please select a nurse."); return; }
    if (!reason)   { setError("Please select a reason for the appointment."); return; }
    setError("");
    const provider = recipientType === "doctor"
      ? doctors.find((d) => (d._id || d.id) === doctorId)
      : nurses.find((n) => (n._id || n.id) === nurseId);

    const appt = {
      id:           `appt-${Date.now()}`,
      patientId:    patient.id || patient._id,
      patientName:  patient.name,
      providerType: recipientType, // 'doctor' or 'nurse'
      providerId:   provider?._id || provider?.id || (recipientType === "doctor" ? doctorId : nurseId),
      providerName: provider?.name || "-",
      providerSpecialization: provider?.specialization || provider?.designation || "",
      doctorId:     recipientType === "doctor" ? (provider?._id || provider?.id || doctorId) : "",
      nurseId:      recipientType === "nurse"  ? (provider?._id || provider?.id || nurseId) : "",
      reason:       reason === "Other" ? customReason : reason,
      preferredDate,
      notes,
      status:       "pending",
      requestedAt:  new Date().toISOString(),
      timeSlot:     null,
      doctorNote:   "",
      paymentStatus: "unpaid",
      paymentAmount: getAppointmentFee(recipientType),
      paymentMethod: "",
      paymentReference: "",
      paidAt: "",
    };

    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify([appt, ...all]));
    loadAppointments(patient);
    setSubmittedProviderName(appt.providerName || "");
    setSubmitted(true);
  };

  const handlePaid = () => {
    setPayingAppointment(null);
    setPaymentMsg("Payment recorded successfully. Your provider can now see this appointment as paid.");
    setTimeout(() => setPaymentMsg(""), 4000);
    loadAppointments(patient);
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
              Your request has been sent to <span className="font-semibold text-slate-700">{submittedProviderName}</span>.
            </p>
            <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800 text-left space-y-1.5">
              <p>&#8226; The provider will review and assign a time slot.</p>
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
      {payingAppointment && (
        <PaymentModal
          appointment={payingAppointment}
          providerName={getProviderLabel(payingAppointment)}
          onClose={() => setPayingAppointment(null)}
          onPaid={handlePaid}
        />
      )}
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

        {notification && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700 shadow-sm">
            {notification}
          </div>
        )}
        {paymentMsg && (
          <div className="mb-6 rounded-3xl border border-teal-200 bg-teal-50 p-5 text-sm text-teal-700 shadow-sm">
            {paymentMsg}
          </div>
        )}

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
              className="group flex flex-col items-start gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-left transition hover:ring-indigo-400 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Previous Appointments</h2>
                <p className="mt-1.5 text-sm text-slate-500">View all your past and upcoming appointment requests and their status.</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-indigo-700 transition">
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

            {/* Recipient type selection */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Who would you like to book?</label>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setRecipientType("doctor")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${recipientType === "doctor" ? "bg-teal-600 text-white" : "bg-slate-50 text-slate-700 border border-slate-200"}`}>
                  Doctor
                </button>
                <button type="button" onClick={() => setRecipientType("nurse")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${recipientType === "nurse" ? "bg-teal-600 text-white" : "bg-slate-50 text-slate-700 border border-slate-200"}`}>
                  Nurse
                </button>
              </div>
            </div>

            {/* Provider selection (doctor or nurse) */}
            <div>
              <label className="text-sm font-semibold text-slate-700">Select {recipientType === "doctor" ? "Doctor" : "Nurse"} *</label>
              <div className="mt-3 grid gap-3">
                {(recipientType === "doctor" ? doctors : nurses).map((d) => {
                  const pid = d._id || d.id;
                  const selected = recipientType === "doctor" ? doctorId === pid : nurseId === pid;
                  return (
                    <button key={pid} type="button" onClick={() => recipientType === "doctor" ? setDoctorId(pid) : setNurseId(pid)}
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
                        <p className="text-xs text-slate-500">{d.specialization || d.designation || (recipientType === "doctor" ? "Doctor" : "Nurse")}</p>
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
                        <p className="font-semibold text-slate-900">{getProviderLabel(a)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{a.providerSpecialization || a.doctorSpecialization || a.nurseSpecialization}</p>
                      </div>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusBadge(a.status)}`}>
                        {a.status}
                      </span>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                        a.paymentStatus === "paid" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {a.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                      <span className="text-slate-500">Reason: <strong className="text-slate-800">{a.reason}</strong></span>
                      <span className="text-slate-500">Requested: <strong className="text-slate-800">{fmtDate(a.requestedAt)}</strong></span>
                      {a.preferredDate && (
                        <span className="text-slate-500">Preferred: <strong className="text-slate-800">{fmtDate(a.preferredDate)}</strong></span>
                      )}
                      {a.timeSlot && (
                        <span className="text-slate-500">
                          Slot: <strong className="text-emerald-700">
                            {typeof a.timeSlot === "string"
                              ? a.timeSlot
                              : `${a.timeSlot.day}, ${fmtDate(a.timeSlot.date)} at ${a.timeSlot.time}`}
                          </strong>
                        </span>
                      )}
                      <span className="text-slate-500">Fee: <strong className="text-slate-800">PKR {(a.paymentAmount || getAppointmentFee(a.providerType)).toLocaleString()}</strong></span>
                    </div>

                    {a.paymentStatus === "paid" ? (
                      <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                        Paid via {a.paymentMethod || "online payment"} {a.paymentReference ? `(${a.paymentReference})` : ""}.
                        {a.paymentBank && (
                          <span> Bank: {a.paymentBank.bank}.</span>
                        )}
                        {a.paymentProof?.dataUrl && (
                          <a
                            href={a.paymentProof.dataUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 font-semibold text-teal-700 underline"
                          >
                            View proof
                          </a>
                        )}
                      </div>
                    ) : a.status === "confirmed" ? (
                      <button
                        onClick={() => setPayingAppointment(a)}
                        className="mt-4 rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        Pay {a.providerType === "nurse" ? "Nurse" : "Doctor"}
                      </button>
                    ) : null}

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
