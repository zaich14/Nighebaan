import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getLatestHealthData } from "../services/api";
import { getLatestFallback } from "../utils/mockHealth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

const PHARMACIES = [
  { id: "servaid", name: "Servaid Pharmacy", phone: "042111123456", area: "Model Town / Lahore" },
  { id: "fazal-din", name: "Fazal Din's Pharma Plus", phone: "042111111101", area: "Gulberg / Lahore" },
  { id: "dvago", name: "DVAGO Pharmacy", phone: "021111382464", area: "Home delivery support" },
  { id: "d-watson", name: "D. Watson Pharmacy", phone: "051111397286", area: "Islamabad / Rawalpindi" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [health, setHealth]           = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
      if (parsed?.role === "doctor") { navigate("/doctor-dashboard"); return; }
      if (parsed?.role === "nurse")  { navigate("/nurse-dashboard");  return; }
      if (parsed?.role === "admin")  { navigate("/admin-panel");      return; }
    } catch { navigate("/login"); return; }

    let parsedUser = null;
    try { parsedUser = JSON.parse(localStorage.getItem("user")); } catch {}

    getLatestHealthData()
      .then((res) => {
        const data = res.data?.data || res.data || null;
        if (data) {
          setHealth(data);
          localStorage.setItem("nigehbaan_latest_health", JSON.stringify(data));
        } else {
          try {
            const cached = localStorage.getItem("nigehbaan_latest_health");
            setHealth(cached ? JSON.parse(cached) : getLatestFallback(parsedUser));
          } catch { setHealth(getLatestFallback(parsedUser)); }
        }
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem("nigehbaan_latest_health");
          if (cached) { setHealth(JSON.parse(cached)); return; }
        } catch {}
        setHealth(getLatestFallback(parsedUser));
      })
      .finally(() => setHealthLoading(false));
  }, [navigate]);

  const bpStr = health?.bloodPressure
    ? `${health.bloodPressure.systolic}/${health.bloodPressure.diastolic}`
    : null;

  const lastUpdated = health?.recordedAt || health?.createdAt
    ? new Date(health.recordedAt || health.createdAt).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  // ── Bar chart data ────────────────────────────────────────────────────────
  const RANGES = {
    "Heart Rate":       { min: 60,   max: 100,  unit: "bpm"    },
    "Blood Oxygen":     { min: 95,   max: 100,  unit: "%"      },
    "Temperature":      { min: 36.1, max: 37.2, unit: "°C"     },
    "Respiratory Rate": { min: 12,   max: 20,   unit: "/min"   },
    "Blood Glucose":    { min: 70,   max: 140,  unit: "mg/dL"  },
  };

  const barData = [
    { name: "Heart Rate",       value: health?.heartRate,       unit: "bpm"   },
    { name: "Blood Oxygen",     value: health?.bloodOxygen,     unit: "%"     },
    { name: "Temperature",      value: health?.temperature,     unit: "°C"    },
    { name: "Respiratory Rate", value: health?.respiratoryRate, unit: "/min"  },
    { name: "Blood Glucose",    value: health?.bloodGlucose,    unit: "mg/dL" },
  ].filter((d) => d.value !== undefined && d.value !== null);

  const isNormal = (name, val) => {
    const r = RANGES[name];
    if (!r || val === undefined || val === null) return null;
    return val >= r.min && val <= r.max;
  };

  // ── Pie chart data ────────────────────────────────────────────────────────
  const vitalChecks = [
    { name: "Heart Rate",       val: health?.heartRate       },
    { name: "Blood Oxygen",     val: health?.bloodOxygen     },
    { name: "Temperature",      val: health?.temperature     },
    { name: "Respiratory Rate", val: health?.respiratoryRate },
    { name: "Blood Glucose",    val: health?.bloodGlucose    },
  ];

  let normalCount = 0, abnormalCount = 0, missingCount = 0;
  vitalChecks.forEach(({ name, val }) => {
    if (val === undefined || val === null) { missingCount++; return; }
    isNormal(name, val) ? normalCount++ : abnormalCount++;
  });

  const pieData = [
    { name: "Normal",       value: normalCount,   color: "#14b8a6" },
    { name: "Needs Review", value: abnormalCount, color: "#f43f5e" },
    { name: "Not Recorded", value: missingCount,  color: "#cbd5e1" },
  ].filter((d) => d.value > 0);

  const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value, unit } = payload[0].payload;
    const r = RANGES[name];
    const ok = isNormal(name, value);
    return (
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 px-4 py-3 text-sm">
        <p className="font-semibold text-slate-800">{name}</p>
        <p className="mt-1 text-slate-600">{value} {unit}</p>
        {r && <p className="text-xs text-slate-400 mt-0.5">Normal: {r.min}–{r.max} {unit}</p>}
        <p className={`text-xs font-semibold mt-1 ${ok ? "text-teal-600" : "text-rose-500"}`}>
          {ok ? "Within range" : "Outside range"}
        </p>
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 px-4 py-3 text-sm">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-slate-600 mt-0.5">{payload[0].value} vital{payload[0].value !== 1 ? "s" : ""}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Patient Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {currentUser?.name ? `Welcome, ${currentUser.name}` : "Health Overview"}
              </h1>
              {lastUpdated && <p className="mt-1 text-sm text-slate-400">Last updated: {lastUpdated}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/sos" className="flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700">
                🆘 SOS Emergency
              </Link>
              <Link to="/chat-ai" className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                Chat with AI
              </Link>
              <Link to="/book-appointment" className="flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700">
                Book Appointment
              </Link>
              <Link to="/health-history" className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                Health History
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">

            {/* Patient info + quick stats */}
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white text-2xl font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase() || "P"}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Patient</p>
                  <p className="mt-0.5 text-xl font-bold text-slate-900">{currentUser?.name || "-"}</p>
                  <p className="text-sm text-slate-400">{currentUser?.email || ""}</p>
                </div>
                {health?.medication && (
                  <div className="ml-auto rounded-2xl bg-teal-50 border border-teal-100 px-4 py-3 text-sm hidden sm:block">
                    <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide">Medication</p>
                    <p className="mt-0.5 font-semibold text-teal-800">{health.medication}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 text-center min-w-[110px]">
                  <p className={`text-2xl font-bold ${normalCount > abnormalCount ? "text-teal-600" : "text-rose-500"}`}>
                    {healthLoading ? "…" : normalCount + "/" + (normalCount + abnormalCount + missingCount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Vitals Normal</p>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 text-center min-w-[110px]">
                  <p className={`text-2xl font-bold ${health ? "text-emerald-600" : "text-slate-400"}`}>
                    {health ? "On File" : "Pending"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Health Status</p>
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Current Readings</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">Vitals Overview</h2>
                </div>
                <Link to="/vitals" className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Full Vitals
                </Link>
              </div>

              {healthLoading ? (
                <div className="h-56 flex items-center justify-center text-sm text-slate-400">Loading...</div>
              ) : barData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-sm text-slate-400">No vitals data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barSize={38}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8fafc" }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={isNormal(entry.name, entry.value) ? "#14b8a6" : "#f43f5e"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              <div className="mt-3 flex items-center gap-5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-teal-500"></span> Within normal range</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-500"></span> Outside normal range</span>
              </div>
            </div>

            {/* Vitals cards */}
            {health && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-slate-900">Latest Vitals</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Heart Rate",       value: health.heartRate,       unit: " bpm",    ok: isNormal("Heart Rate", health.heartRate) },
                    { label: "Blood Pressure",   value: bpStr,                  unit: " mmHg",   ok: true },
                    { label: "Temperature",      value: health.temperature,     unit: "°C",      ok: isNormal("Temperature", health.temperature) },
                    { label: "Blood Oxygen",     value: health.bloodOxygen,     unit: "%",       ok: isNormal("Blood Oxygen", health.bloodOxygen) },
                    { label: "Blood Glucose",    value: health.bloodGlucose,    unit: " mg/dL",  ok: isNormal("Blood Glucose", health.bloodGlucose) },
                    { label: "Respiratory Rate", value: health.respiratoryRate, unit: " /min",   ok: isNormal("Respiratory Rate", health.respiratoryRate) },
                    { label: "Weight",           value: health.weight,          unit: " kg",     ok: true },
                    { label: "Steps Today",      value: health.steps,           unit: "",        ok: true },
                  ].map(({ label, value, unit, ok }) => (
                    <div key={label} className={`rounded-3xl p-5 shadow-sm ring-1 ${
                      ok === false ? "bg-rose-50 ring-rose-100" : "bg-white ring-slate-200"
                    }`}>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {value !== undefined && value !== null
                          ? <>{value}<span className="text-sm font-medium text-slate-400">{unit}</span></>
                          : <span className="text-slate-300">-</span>}
                      </p>
                      {ok === false && <p className="mt-1 text-xs font-semibold text-rose-500">Outside range</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

            {/* Pie chart */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Health Breakdown</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Vitals Status</h2>

              {healthLoading ? (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">Loading...</div>
              ) : pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {!healthLoading && health && (
                <div className="mt-2 space-y-2">
                  {[
                    { label: "Normal",       count: normalCount,   color: "teal"  },
                    { label: "Needs Review", count: abnormalCount, color: "rose"  },
                    { label: "Not Recorded", count: missingCount,  color: "slate" },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{label}</span>
                      <span className={`font-bold text-${color}-600`}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick summary */}
            {health && (
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 mb-4">Quick Summary</p>
                <div className="space-y-3">
                  {[
                    ["Heart Rate",    health.heartRate      ? `${health.heartRate} bpm`       : "-"],
                    ["Blood Pressure",bpStr                 ? `${bpStr} mmHg`                 : "-"],
                    ["Temperature",   health.temperature    ? `${health.temperature}°C`        : "-"],
                    ["Blood Oxygen",  health.bloodOxygen    ? `${health.bloodOxygen}%`         : "-"],
                    ["Glucose",       health.bloodGlucose   ? `${health.bloodGlucose} mg/dL`  : "-"],
                    ["Weight",        health.weight         ? `${health.weight} kg`            : "-"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-semibold text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-3">
              <Link to="/vitals" className="flex w-full items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                View Full Vitals
              </Link>
              <Link to="/book-appointment" className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Book Appointment
              </Link>
              <Link to="/health-history" className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Health History
              </Link>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Pharmacy Delivery</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Medicine contacts</h2>
              <p className="mt-2 text-sm text-slate-500">
                Call a pharmacy for medicine availability and home delivery.
              </p>
              <div className="mt-4 space-y-3">
                {PHARMACIES.map((pharmacy) => (
                  <div key={pharmacy.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">{pharmacy.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{pharmacy.area}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-teal-700">{pharmacy.phone}</p>
                      <a
                        href={`tel:${pharmacy.phone}`}
                        className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/health-history"
                className="mt-4 flex w-full items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
              >
                Open Prescriptions
              </Link>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
