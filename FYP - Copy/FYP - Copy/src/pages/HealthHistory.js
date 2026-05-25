import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getHealthHistory } from "../services/api";
import { getHistoryFallback } from "../utils/mockHealth";

const PAGE_SIZE = 10;

const PHARMACIES = [
  { id: "servaid", name: "Servaid Pharmacy", phone: "042111123456", area: "Model Town / Lahore" },
  { id: "fazal-din", name: "Fazal Din's Pharma Plus", phone: "042111111101", area: "Gulberg / Lahore" },
  { id: "dvago", name: "DVAGO Pharmacy", phone: "021111382464", area: "Home delivery support" },
  { id: "d-watson", name: "D. Watson Pharmacy", phone: "051111397286", area: "Islamabad / Rawalpindi" },
];

function HealthHistory() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("records"); // "records" | "prescriptions"

  // Health records state
  const [records, setRecords]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [expandedRec, setExpandedRec] = useState(null);

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState([]);
  const [expandedRx, setExpandedRx]       = useState(null);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(PHARMACIES[0].id);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [rxMessage, setRxMessage] = useState("");

  const fetchPage = useCallback((p, user) => {
    setLoading(true);
    setError("");
    getHealthHistory(PAGE_SIZE, p * PAGE_SIZE)
      .then((res) => {
        const data = res.data?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setRecords(data);
          setTotal(res.data?.total || data.length);
        } else {
          // API returned empty — use fallback
          const fallback = getHistoryFallback(user);
          const paged = fallback.slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);
          setRecords(paged);
          setTotal(fallback.length);
        }
      })
      .catch(() => {
        const fallback = getHistoryFallback(user);
        const paged = fallback.slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);
        setRecords(paged);
        setTotal(fallback.length);
        setError("");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    let user;
    try {
      user = JSON.parse(userData);
      if (user.role === "doctor") { navigate("/doctor-dashboard"); return; }
      if (user.role === "nurse")  { navigate("/nurse-dashboard");  return; }
      if (user.role === "admin")  { navigate("/admin-panel");      return; }
      setCurrentUser(user);
      setDeliveryAddress(user.address || user.profile?.address || "");
    } catch { navigate("/login"); return; }

    // Load prescriptions for this patient
    try {
      const all = JSON.parse(localStorage.getItem("doctorPrescriptions") || "[]");
      const mine = all.filter((rx) => rx.patientId === (user.id || user._id));
      setPrescriptions(mine);
    } catch { setPrescriptions([]); }

    fetchPage(0, user);
  }, [navigate, fetchPage]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const fmtBP = (bp) =>
    bp?.systolic && bp?.diastolic ? `${bp.systolic}/${bp.diastolic}` : "—";

  const selectedPharmacy = PHARMACIES.find((item) => item.id === selectedPharmacyId) || PHARMACIES[0];

  const buildPrescriptionMessage = (rx) => {
    const medicines = (rx.medicines || [])
      .map((m, index) => `${index + 1}. ${m.name} ${m.dosage} - ${m.frequency}${m.route ? ` (${m.route})` : ""}${m.instructions ? `. ${m.instructions}` : ""}`)
      .join("\n");

    return [
      "Nigehbaan prescription delivery request",
      `Patient: ${currentUser?.name || "Patient"}`,
      `Phone/Email: ${currentUser?.phone || currentUser?.email || "Not provided"}`,
      `Delivery address: ${deliveryAddress}`,
      `Prescribed by: ${rx.doctorName || "Doctor"}`,
      `Date: ${rx.date || rx.createdAt || ""}`,
      `Duration: ${rx.duration || "Not specified"}`,
      "Medicines:",
      medicines,
      rx.remarks ? `Doctor remarks: ${rx.remarks}` : "",
      deliveryNote ? `Delivery note: ${deliveryNote}` : "",
      "Please confirm availability, total price, and delivery time.",
    ].filter(Boolean).join("\n");
  };

  const sendPrescriptionToPharmacy = (rx) => {
    if (!deliveryAddress.trim()) {
      setRxMessage("Please enter the patient delivery address before sending the prescription.");
      return;
    }

    const message = encodeURIComponent(buildPrescriptionMessage(rx));
    window.open(`sms:${selectedPharmacy.phone}?&body=${message}`, "_blank");

    const orders = JSON.parse(localStorage.getItem("nigehbaan_pharmacy_orders") || "[]");
    const order = {
      id: `pharmacy-order-${Date.now()}`,
      prescriptionId: rx.id,
      patientId: currentUser?.id || currentUser?._id,
      patientName: currentUser?.name,
      pharmacy: selectedPharmacy,
      deliveryAddress,
      deliveryNote,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("nigehbaan_pharmacy_orders", JSON.stringify([order, ...orders]));
    setRxMessage(`Prescription prepared for ${selectedPharmacy.name}. Press Send in your SMS app.`);
    setTimeout(() => setRxMessage(""), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Back */}
        <div className="mb-6">
          <Link to="/dashboard"
            className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Medical Records</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Health History</h1>
          <p className="mt-2 text-sm text-slate-500">
            {currentUser?.name}'s complete health records and prescriptions.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
          <button onClick={() => setTab("records")}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
              tab === "records" ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
            }`}>
            🩺 Health Records
            {total > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === "records" ? "bg-white/20 text-white" : "bg-teal-100 text-teal-700"}`}>
                {total}
              </span>
            )}
          </button>
          <button onClick={() => setTab("prescriptions")}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
              tab === "prescriptions" ? "bg-violet-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
            }`}>
            💊 Prescriptions
            {prescriptions.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === "prescriptions" ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"}`}>
                {prescriptions.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Health Records Tab ── */}
        {tab === "records" && (
          <>
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-3xl bg-white ring-1 ring-slate-100" />)}
              </div>
            ) : records.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="text-slate-400 text-sm">No health records found. Your nurse or doctor will add records here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => {
                  const id = rec._id || rec.id;
                  const isOpen = expandedRec === id;
                  return (
                    <div key={id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedRec(isOpen ? null : id)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 text-lg">🩺</div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              HR: {rec.heartRate ?? "—"} bpm &nbsp;·&nbsp; BP: {fmtBP(rec.bloodPressure)}
                              {rec.bloodOxygen   ? ` · O₂: ${rec.bloodOxygen}%`    : ""}
                              {rec.temperature   ? ` · Temp: ${rec.temperature}°C` : ""}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">{fmtDate(rec.recordedAt || rec.createdAt)}</p>
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-6 py-5">
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Detail label="Heart Rate"       value={rec.heartRate}       unit=" bpm"    />
                            <Detail label="Blood Pressure"   value={fmtBP(rec.bloodPressure)} unit=" mmHg" />
                            <Detail label="Temperature"      value={rec.temperature}     unit="°C"      />
                            <Detail label="Blood Oxygen"     value={rec.bloodOxygen}     unit="%"       />
                            <Detail label="Blood Glucose"    value={rec.bloodGlucose}    unit=" mg/dL"  />
                            <Detail label="Respiratory Rate" value={rec.respiratoryRate} unit=" /min"   />
                            <Detail label="Weight"           value={rec.weight}          unit=" kg"     />
                            <Detail label="Steps"            value={rec.steps}           unit=""        />
                            <Detail label="Recorded"         value={fmtDate(rec.recordedAt || rec.createdAt)} unit="" />
                          </div>
                          {rec.medication && (
                            <div className="mt-4 rounded-2xl bg-teal-50 px-4 py-3">
                              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Medication</p>
                              <p className="mt-1 text-sm text-teal-800">{rec.medication}</p>
                            </div>
                          )}
                          {rec.notes && (
                            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Clinical Notes</p>
                              <p className="mt-1 text-sm text-slate-700 leading-relaxed">{rec.notes}</p>
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
                  onClick={() => { const p = page - 1; setPage(p); fetchPage(p, currentUser); }}
                  disabled={page === 0}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
                <button
                  onClick={() => { const p = page + 1; setPage(p); fetchPage(p, currentUser); }}
                  disabled={page + 1 >= totalPages}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Prescriptions Tab ── */}
        {tab === "prescriptions" && (
          <>
            {rxMessage && (
              <div className="mb-5 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm font-semibold text-teal-800">
                {rxMessage}
              </div>
            )}
            {prescriptions.length === 0 ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
                  <p className="text-2xl mb-3">💊</p>
                  <p className="text-slate-500 font-medium">No prescriptions yet.</p>
                  <p className="text-slate-400 text-sm mt-1">Prescriptions written by your doctor will appear here.</p>
                </div>
                <div className="rounded-3xl border border-teal-100 bg-teal-50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Pharmacy Contacts</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Medicine delivery pharmacies</h2>
                  <p className="mt-2 text-sm text-teal-800">
                    These pharmacies can be contacted for medicine availability and home delivery. When a prescription is added, you can send it directly from here.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {PHARMACIES.map((pharmacy) => (
                      <div key={pharmacy.id} className="rounded-2xl border border-teal-100 bg-white p-4">
                        <p className="font-semibold text-slate-900">{pharmacy.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{pharmacy.area}</p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-teal-700">{pharmacy.phone}</p>
                          <a
                            href={`tel:${pharmacy.phone}`}
                            className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                          >
                            Call
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <label className="text-sm font-semibold text-slate-700">Patient Delivery Address</label>
                    <textarea
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House no, street, area, city"
                      className="mt-2 w-full rounded-2xl border border-teal-100 bg-white px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx) => {
                  const isOpen = expandedRx === rx.id;
                  const rxDate = new Date(rx.date || rx.createdAt);
                  return (
                    <div key={rx.id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedRx(isOpen ? null : rx.id)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-sm font-bold text-violet-700">
                            Rx
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {rx.medicines?.length} medicine{rx.medicines?.length !== 1 ? "s" : ""}
                              &nbsp;·&nbsp; {rx.duration}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {rxDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              &nbsp;·&nbsp; by {rx.doctorName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:block text-xs text-slate-500 truncate max-w-[200px]">
                            {rx.medicines?.map((m) => m.name).join(", ")}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-100 px-6 py-5 space-y-4">
                          {/* Meta */}
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prescribed By</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{rx.doctorName}</p>
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
                                <div key={i} className="rounded-2xl bg-violet-50 border border-violet-100 px-4 py-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-200 text-xs font-bold text-violet-700">{i + 1}</span>
                                    <span className="font-semibold text-sm text-violet-900">{m.name}</span>
                                    <span className="rounded-full bg-violet-100 border border-violet-200 px-2.5 py-0.5 text-xs font-semibold text-violet-700">{m.dosage}</span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{m.frequency}</span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{m.route}</span>
                                  </div>
                                  {m.instructions && (
                                    <p className="mt-1.5 text-xs text-violet-700 pl-8">{m.instructions}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {rx.remarks && (
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Doctor's Remarks</p>
                              <p className="mt-1 text-sm text-slate-700 leading-relaxed">{rx.remarks}</p>
                            </div>
                          )}

                          <div className="rounded-3xl border border-teal-100 bg-teal-50 p-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">Pharmacy Delivery</p>
                                <h3 className="mt-1 text-lg font-semibold text-slate-900">Send prescription to pharmacy</h3>
                                <p className="mt-1 text-sm text-teal-800">
                                  Choose a pharmacy and include the patient's delivery address for medicine delivery.
                                </p>
                              </div>
                              <a
                                href={`tel:${selectedPharmacy.phone}`}
                                className="w-fit rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-100"
                              >
                                Call Pharmacy
                              </a>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                              <div>
                                <label className="text-sm font-semibold text-slate-700">Select Pharmacy</label>
                                <div className="mt-2 space-y-2">
                                  {PHARMACIES.map((pharmacy) => (
                                    <button
                                      key={pharmacy.id}
                                      type="button"
                                      onClick={() => setSelectedPharmacyId(pharmacy.id)}
                                      className={`w-full rounded-2xl border p-3 text-left transition ${
                                        selectedPharmacyId === pharmacy.id
                                          ? "border-teal-500 bg-white"
                                          : "border-teal-100 bg-teal-50 hover:bg-white"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-semibold text-slate-900">{pharmacy.name}</p>
                                          <p className="mt-0.5 text-xs text-slate-500">{pharmacy.area}</p>
                                        </div>
                                        <p className="text-xs font-semibold text-teal-700">{pharmacy.phone}</p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-semibold text-slate-700">Patient Delivery Address *</label>
                                  <textarea
                                    rows={3}
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="House no, street, area, city"
                                    className="mt-2 w-full rounded-2xl border border-teal-100 bg-white px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-semibold text-slate-700">Delivery Note</label>
                                  <input
                                    value={deliveryNote}
                                    onChange={(e) => setDeliveryNote(e.target.value)}
                                    placeholder="Optional: delivery time, landmark, payment preference"
                                    className="mt-2 w-full rounded-2xl border border-teal-100 bg-white px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => sendPrescriptionToPharmacy(rx)}
                                  className="w-full rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                                >
                                  Send Prescription to {selectedPharmacy.name}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}

function Detail({ label, value, unit }) {
  const hasValue = value !== undefined && value !== null && value !== "" && value !== "—";
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-800">
        {hasValue ? `${value}${unit}` : <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

export default HealthHistory;
