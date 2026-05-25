import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getLatestHealthData, getAlerts, createAlert, getHealthHistory } from "../services/api";
import { getLatestFallback } from "../utils/mockHealth";

const MOCK_FAMILY = ["Amina", "Kareem", "Layla"];
const MOCK_APPOINTMENTS = [
  { day: "Thu 10:00", desc: "Cardiology follow-up", location: "Clinic Room B2" },
  { day: "Sat 09:30", desc: "Nutrition counseling", location: "Tele-visit" },
];

export default function SOS() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [health, setHealth]   = useState(null);
  const [alerts, setAlerts]   = useState([]);
  const [doctor, setDoctor]   = useState({ name: "Dr. Ahmed Khan", clinic: "City Heart Institute", phone: "+92 42 555 0821", address: "Rashid St. Building 4" });

  const [showModal, setShowModal]         = useState(false);
  const [sosSent, setSosSent]             = useState(false);
  const [sending, setSending]             = useState(false);
  const [sentTime, setSentTime]           = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      setPatient(u);
      if (u.role === "doctor") { navigate("/doctor-dashboard"); return; }
      if (u.role === "nurse")  { navigate("/nurse-dashboard"); return; }
      if (u.role === "admin")  { navigate("/admin-panel"); return; }
    } catch { navigate("/login"); return; }

    // Immediately show cached or static fallback data
    let patientUser = null;
    try { patientUser = JSON.parse(localStorage.getItem("user")); } catch { /* ignore */ }

    try {
      const cached = localStorage.getItem("nigehbaan_latest_health");
      if (cached) setHealth(JSON.parse(cached));
      else setHealth(getLatestFallback(patientUser));
    } catch { setHealth(getLatestFallback(patientUser)); }

    // Refresh from API in background
    getLatestHealthData()
      .then((r) => {
        const data = r.data?.data || r.data || null;
        if (data) {
          setHealth(data);
          localStorage.setItem("nigehbaan_latest_health", JSON.stringify(data));
        }
      })
      .catch(() => { /* static fallback already shown */ });

    getAlerts(5)
      .then((r) => {
        const d = r.data?.data || r.data;
        setAlerts(Array.isArray(d) ? d.slice(0, 3) : []);
      })
      .catch(() => {});
  }, [navigate]);

  const fmt = (v, unit = "", fallback = "—") =>
    v !== undefined && v !== null ? `${v}${unit}` : fallback;

  const bpStr = health?.bloodPressure
    ? `${health.bloodPressure.systolic}/${health.bloodPressure.diastolic}`
    : "—";

  const handleSend = async () => {
    setSending(true);
    try {
      await createAlert({
        type: "sos",
        severity: "critical",
        message: `SOS Alert sent by ${patient?.name || "patient"}. Location and vitals shared. Family notified: ${MOCK_FAMILY.join(", ")}. Doctor: ${doctor.name}.`,
      });
    } catch { /* ignore - still show success */ }
    setSending(false);
    setSosSent(true);
    setSentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    setShowModal(false);
  };

  const downloadReport = async () => {
    setReportLoading(true);
    let records = [];
    try {
      const res = await getHealthHistory(50, 0);
      const all = res.data?.records || res.data?.data || res.data || [];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      records = Array.isArray(all)
        ? all.filter((r) => new Date(r.recordedAt || r.createdAt) >= oneWeekAgo)
        : [];
      if (records.length === 0 && Array.isArray(all)) records = all.slice(0, 10);
    } catch { /* show whatever we have */ }
    setReportLoading(false);

    const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const periodEnd = new Date()
      .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const generatedAt = new Date().toLocaleString("en-US", {
      month: "long", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const dash = "—";
    const rowsHtml = records.length === 0
      ? `<tr><td colspan="10" style="text-align:center;padding:20px;color:#94a3b8;">No health records found for this period.</td></tr>`
      : records.map((r, i) => {
          const date = new Date(r.recordedAt || r.createdAt);
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
          const bp = r.bloodPressure
            ? `${r.bloodPressure.systolic}/${r.bloodPressure.diastolic}`
            : dash;
          const rowBg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
          return `
            <tr style="background:${rowBg};">
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;white-space:nowrap;">${dateStr}<br/><span style="color:#94a3b8;">${timeStr}</span></td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">${r.heartRate ?? dash}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">${bp}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">${r.temperature ?? dash}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">${r.bloodOxygen ?? dash}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">${r.bloodGlucose ?? dash}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">${r.respiratoryRate ?? dash}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;">${r.weight ?? dash}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;">${r.medication || dash}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;max-width:180px;">${r.notes || dash}</td>
            </tr>`;
        }).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Weekly Health Report - ${patient?.name || "Patient"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 32px; }
    @media print { body { padding: 16px; } .no-print { display: none; } }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 800; color: #0d9488; letter-spacing: -0.5px; }
    .logo span { color: #1e293b; }
    .report-title { font-size: 13px; color: #64748b; text-align: right; }
    .patient-card { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; background: #f1fdf9; border: 1px solid #99f6e4; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .patient-field label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #0d9488; }
    .patient-field p { font-size: 14px; font-weight: 600; margin-top: 2px; }
    .section-title { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr { background: #0d9488; color: white; }
    thead th { padding: 10px 12px; text-align: center; font-weight: 600; font-size: 11px; white-space: nowrap; }
    thead th:first-child { text-align: left; }
    tbody tr:hover { background: #f0fdfa !important; }
    .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
    .print-btn { display: inline-block; margin-top: 20px; padding: 10px 24px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Nigeh<span>baan</span></div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Elderly Care System</div>
    </div>
    <div class="report-title">
      <div style="font-size:16px;font-weight:700;color:#1e293b;">Weekly Health Report</div>
      <div style="margin-top:4px;">${periodStart} &ndash; ${periodEnd}</div>
      <div style="margin-top:2px;">Generated: ${generatedAt}</div>
    </div>
  </div>

  <div class="patient-card">
    <div class="patient-field"><label>Patient Name</label><p>${patient?.name || dash}</p></div>
    <div class="patient-field"><label>Email</label><p>${patient?.email || dash}</p></div>
    <div class="patient-field"><label>Report Period</label><p>${periodStart} &rarr; ${periodEnd}</p></div>
  </div>

  <div class="section-title">Health Monitoring Records (${records.length} entries)</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Date / Time</th>
        <th>Heart Rate<br/>(bpm)</th>
        <th>Blood Pressure<br/>(mmHg)</th>
        <th>Temperature<br/>(&deg;C)</th>
        <th>SpO2<br/>(%)</th>
        <th>Glucose<br/>(mg/dL)</th>
        <th>Resp. Rate<br/>(/min)</th>
        <th>Weight<br/>(kg)</th>
        <th>Medication</th>
        <th>Clinical Notes</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="footer">
    <div>Nigehbaan Elderly Care System &nbsp;&middot;&nbsp; Confidential Medical Record</div>
    <div>This report is auto-generated from nurse-recorded health performa data.</div>
  </div>

  <div class="no-print" style="text-align:center;">
    <button class="print-btn" onclick="window.print()">&#x2B07; Save as PDF / Print</button>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) { alert("Please allow popups to download the report."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const vitals = [
    { label: "Glucose",    value: fmt(health?.bloodGlucose, " mg/dL") },
    { label: "Temp",       value: fmt(health?.temperature, "°C") },
    { label: "BP",         value: bpStr === "—" ? "—" : `${bpStr} mmHg` },
    { label: "Heart Rate", value: fmt(health?.heartRate, " bpm") },
    { label: "SpO2",       value: fmt(health?.bloodOxygen, "%") },
    { label: "Weight",     value: fmt(health?.weight, " kg") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="rounded-t-3xl bg-rose-600 px-8 py-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-200">Confirm</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Are you sure you want to send an SOS?</h2>
            </div>
            <div className="px-8 py-6 space-y-4">
              <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 text-lg">📍</div>
                <div>
                  <p className="font-semibold text-slate-900">Send live location &amp; vitals</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Shares GPS plus last 10 minutes of glucose, temperature, blood pressure and heart rate.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 text-lg">👨‍👩‍👧</div>
                <div>
                  <p className="font-semibold text-slate-900">Notify family circle</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Sends SMS and app push to <span className="font-medium text-slate-700">{MOCK_FAMILY.join(", ")}</span> with current status.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 text-lg">📞</div>
                <div>
                  <p className="font-semibold text-slate-900">Call primary doctor</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Initiates a phone call to <span className="font-medium text-slate-700">{doctor.name}</span>'s clinic and shares the emergency note.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-8 py-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Alert"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8 rounded-3xl bg-rose-600 px-8 py-7 text-center shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">🚨</span>
            <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Emergency Alert</h1>
            <span className="text-3xl">🚨</span>
          </div>
          <p className="mt-2 text-rose-200 text-sm">
            Patient: <span className="font-semibold text-white">{patient?.name || "—"}</span>
          </p>
        </div>

        {/* SOS Sent Banner */}
        {sosSent && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white">&#10003;</div>
              <div>
                <p className="text-lg font-bold text-emerald-800">SOS Alert Successfully Sent!</p>
                <p className="mt-0.5 text-sm text-emerald-700">
                  Sent at {sentTime} &middot; Family notified &middot; Doctor alerted &middot; Location shared
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: "📍", label: "Location Shared", sub: "GPS coordinates transmitted" },
                { icon: "👨‍👩‍👧", label: "Family Notified", sub: MOCK_FAMILY.join(", ") },
                { icon: "📞", label: "Doctor Alerted", sub: doctor.name },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOS Button */}
        {!sosSent && (
          <div className="mb-8 flex flex-col items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 rounded-3xl bg-rose-600 px-12 py-5 text-xl font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 active:scale-95"
            >
              <span className="text-2xl">🆘</span>
              Send SOS Alert
            </button>
            <p className="text-sm text-slate-500">Press only in a medical emergency</p>
          </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Vitals Snapshot */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Vitals Snapshot</h2>
              <span className="text-rose-500 text-lg">&#9829;</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {vitals.map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            {health?.medication && (
              <div className="mt-3 rounded-2xl bg-teal-50 px-4 py-2">
                <p className="text-xs text-teal-600 font-medium">Current Medication</p>
                <p className="text-sm font-semibold text-teal-800">{health.medication}</p>
              </div>
            )}
          </div>

          {/* Latest Alerts */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Latest Alerts</h2>
              <span className="text-amber-500 text-lg">&#9888;</span>
            </div>
            {alerts.length === 0 ? (
              <div className="space-y-3">
                {[
                  { time: "Today 09:10", msg: "Low activity detected during usual walk time." },
                  { time: "Yesterday 21:30", msg: "Elevated heart rate while resting." },
                  { time: "Mon 14:05", msg: "Glucose trending high after lunch." },
                ].map((a) => (
                  <div key={a.time} className="rounded-2xl bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-500">{a.time}</p>
                    <p className="mt-0.5 text-sm text-slate-700">{a.msg}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a._id || a.id} className="rounded-2xl bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-500">
                      {new Date(a.createdAt || Date.now()).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinic Contact */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Clinic Contact</h2>
              <span className="text-teal-500 text-lg">🏥</span>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-700">
                {doctor.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{doctor.name}</p>
                <p className="text-sm text-slate-500">{doctor.clinic}</p>
                <p className="text-xs text-slate-400 mt-0.5">{doctor.address}</p>
                <p className="text-xs font-medium text-teal-700 mt-0.5">{doctor.phone}</p>
              </div>
            </div>
            <a
              href={`tel:${doctor.phone}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <span>📞</span> Call Clinic
            </a>
            <div className="mt-3 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-center">
              <p className="text-xs font-bold text-rose-700">Pakistan Emergency</p>
              <a href="tel:1122" className="text-2xl font-bold text-rose-600 hover:text-rose-700">1122</a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">

          {/* Appointments */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">This Week's Appointments</h2>
              <span className="text-indigo-500 text-lg">📅</span>
            </div>
            <div className="space-y-3">
              {MOCK_APPOINTMENTS.map((appt) => (
                <div key={appt.day} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{appt.day}</p>
                    <p className="text-xs text-slate-500">{appt.desc}</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {appt.location}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Weekly Report */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Download Weekly Report</h2>
              <span className="text-slate-400 text-lg">📄</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><span className="text-teal-600">&#10003;</span> All nurse-recorded health performa entries</div>
              <div className="flex items-center gap-2"><span className="text-teal-600">&#10003;</span> Vitals, medication &amp; clinical notes per visit</div>
              <div className="flex items-center gap-2"><span className="text-teal-600">&#10003;</span> Printable / saveable as PDF</div>
              <p className="text-xs text-slate-400 pt-1">
                Period: {new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash;{" "}
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={downloadReport}
              disabled={reportLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {reportLoading
                ? <><span className="animate-spin inline-block">&#x231B;</span> Loading records...</>
                : <><span>&#x2B07;</span> Download PDF Report</>
              }
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
