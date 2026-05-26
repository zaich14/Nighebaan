import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import { createAlert, getAlerts } from "../services/api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [options, setOptions] = useState({
    location: false,
    notifyFamily: false,
    callDoctor: false,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [alertForm, setAlertForm] = useState({
    message: "",
    type: "health",
    severity: "medium",
    conditions: []
  });

  const sampleAlerts = [
    {
      id: 1,
      title: "Low Activity Detected",
      message: "Activity has been low during your usual walk time.",
      time: "Today 08:10",
      severity: "medium",
    },
    {
      id: 2,
      title: "Elevated Heart Rate",
      message: "Heart rate was elevated while resting.",
      time: "Yesterday 21:30",
      severity: "high",
    },
    {
      id: 3,
      title: "Glucose Trend Alert",
      message: "Glucose is trending higher after lunch.",
      time: "Mon 14:05",
      severity: "low",
    },
  ];

// Move demo alerts to module level so hook deps are stable
const SAMPLE_ALERTS = [
  {
    id: 1,
    title: "Low Activity Detected",
    message: "Activity has been low during your usual walk time.",
    time: "Today 08:10",
    severity: "medium",
  },
  {
    id: 2,
    title: "Elevated Heart Rate",
    message: "Heart rate was elevated while resting.",
    time: "Yesterday 21:30",
    severity: "high",
  },
  {
    id: 3,
    title: "Glucose Trend Alert",
    message: "Glucose is trending higher after lunch.",
    time: "Mon 14:05",
    severity: "low",
  },
];

useEffect(() => {
    // Get current user info
    const userData = localStorage.getItem("user");
    let currentUserId = null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        currentUserId = user.id || user._id;
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message || err);
    });
    socket.on("newAlert", (alert) => {
      const alertUserId = alert.userId?._id?.toString?.() || alert.userId?.toString?.();
      if (alertUserId && currentUserId && alertUserId === currentUserId) {
        setAlerts((prev) => [alert, ...prev]);
        setMessage("New alert received in real time.");
      }
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    getAlerts()
      .then((res) => {
        const data = res.data?.data || res.data;
        setAlerts(Array.isArray(data) ? data : SAMPLE_ALERTS);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts:", err);
        setError("Backend not available. Showing demo alert summary.");
        setAlerts(SAMPLE_ALERTS);
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  const isMedicalStaff = currentUser?.role === 'doctor' || currentUser?.role === 'nurse' || currentUser?.role === 'admin';

  const toggleOption = (name) => {
    setOptions((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSendAlert = async () => {
    const selected = Object.entries(options)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    const alertData = {
      message: "Emergency SOS sent with selected options: " + selected.join(", "),
      type: "emergency",
      severity: "high",
    };

    try {
      await createAlert(alertData);
      setMessage("SOS alert sent successfully.");
      setError(null);
    } catch (err) {
      console.error("Failed to send alert:", err);
      setError(err.response?.data?.message || "Could not send alert. Only medical staff can create alerts.");
      setMessage(null);
    }
  };

  const handleCreateMedicalAlert = async () => {
    if (!alertForm.message.trim()) {
      setError("Alert message is required");
      return;
    }

    try {
      await createAlert({
        message: alertForm.message,
        type: alertForm.type,
        severity: alertForm.severity,
        conditions: alertForm.conditions
      });
      setMessage("Medical alert created successfully.");
      setError(null);
      setShowCreateAlert(false);
      setAlertForm({ message: "", type: "health", severity: "medium", conditions: [] });
      // Refresh alerts
      getAlerts().then((res) => {
        const data = res.data?.data || res.data;
        setAlerts(Array.isArray(data) ? data : sampleAlerts);
      });
    } catch (err) {
      console.error("Failed to create alert:", err);
      setError(err.response?.data?.message || "Failed to create alert. Check that conditions are met.");
      setMessage(null);
    }
  };

  const addCondition = () => {
    setAlertForm(prev => ({
      ...prev,
      conditions: [...prev.conditions, { type: "heartRate", operator: "gt", value: 100, description: "" }]
    }));
  };

  const updateCondition = (index, field, value) => {
    setAlertForm(prev => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) =>
        i === index ? { ...cond, [field]: value } : cond
      )
    }));
  };

  const removeCondition = (index) => {
    setAlertForm(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const vitals = [
    { label: "Glucose", value: "108", unit: "mg/dL" },
    { label: "Temp", value: "98.2", unit: "°F" },
    { label: "BP", value: "124/78", unit: "" },
    { label: "Heart Rate", value: "72", unit: "bpm" },
    { label: "Sleep", value: "7h 35m", unit: "" },
    { label: "Steps", value: "5,412", unit: "" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <span className="rounded-full bg-cyan-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-600">
              {isMedicalStaff ? "Medical Staff Panel" : "Emergency"}
            </span>
            <h1 className="text-3xl font-semibold text-slate-900">
              {isMedicalStaff ? "Alert Management System" : "Are you sure you want to send an SOS?"}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              {isMedicalStaff
                ? "As medical staff, you can create alerts based on patient conditions and manage emergency responses."
                : "Choose the emergency action you want to trigger now. You can send real-time vitals and location, notify family members, or call your primary doctor immediately."
              }
            </p>
            {currentUser && (
              <p className="text-sm text-cyan-600 font-medium">
                Logged in as: {currentUser.name} ({currentUser.role})
              </p>
            )}
          </div>

          {isMedicalStaff ? (
            <div className="mt-10">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowCreateAlert(!showCreateAlert)}
                  className="rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  {showCreateAlert ? "Cancel" : "Create Medical Alert"}
                </button>
                <button
                  onClick={() => setOptions({ location: true, notifyFamily: true, callDoctor: true })}
                  className="rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Emergency SOS Override
                </button>
              </div>

              {showCreateAlert && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Alert</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Alert Message</label>
                      <textarea
                        value={alertForm.message}
                        onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                        placeholder="Describe the alert condition..."
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Type</label>
                        <select
                          value={alertForm.type}
                          onChange={(e) => setAlertForm(prev => ({ ...prev, type: e.target.value }))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                        >
                          <option value="health">Health</option>
                          <option value="medication">Medication</option>
                          <option value="appointment">Appointment</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Severity</label>
                        <select
                          value={alertForm.severity}
                          onChange={(e) => setAlertForm(prev => ({ ...prev, severity: e.target.value }))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">Alert Conditions</label>
                        <button
                          type="button"
                          onClick={addCondition}
                          className="text-sm text-cyan-600 hover:text-cyan-700"
                        >
                          + Add Condition
                        </button>
                      </div>
                      {alertForm.conditions.map((condition, index) => (
                        <div key={index} className="flex gap-2 items-center mb-2">
                          <select
                            value={condition.type}
                            onChange={(e) => updateCondition(index, 'type', e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="heartRate">Heart Rate</option>
                            <option value="bloodPressure">Blood Pressure</option>
                            <option value="temperature">Temperature</option>
                            <option value="bloodOxygen">Blood Oxygen</option>
                            <option value="glucose">Glucose</option>
                          </select>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                            className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                          >
                            <option value="gt">&gt;</option>
                            <option value="lt">&lt;</option>
                            <option value="eq">=</option>
                            <option value="gte">≥</option>
                            <option value="lte">≤</option>
                          </select>
                          <input
                            type="number"
                            value={condition.value}
                            onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value))}
                            className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeCondition(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleCreateMedicalAlert}
                      className="w-full rounded-2xl bg-cyan-600 px-6 py-3 text-white transition hover:bg-cyan-700"
                    >
                      Create Alert
                    </button>
                  </div>
                </div>
              )}

              {Object.values(options).some(v => v) && (
                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Emergency SOS Override Active</h3>
                  <div className="grid gap-4 lg:grid-cols-3 mb-4">
                    {[
                      { key: "location", title: "Send live location & vitals" },
                      { key: "notifyFamily", title: "Notify family circle" },
                      { key: "callDoctor", title: "Call primary doctor" },
                    ].map((option) => (
                      <div key={option.key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={options[option.key]}
                          onChange={() => toggleOption(option.key)}
                          className="h-4 w-4 rounded border-red-300 text-red-600"
                        />
                        <span className="text-sm text-red-700">{option.title}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSendAlert}
                    className="rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Send Emergency SOS
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {[
                {
                  key: "location",
                  title: "Send live location & vitals",
                  description: "Shares GPS plus last 10 minutes of glucose, temperature, blood pressure and heart rate.",
                },
                {
                  key: "notifyFamily",
                  title: "Notify family circle",
                  description: "Sends SMS and app push to Amina, Kareem and Layla with current status.",
                },
                {
                  key: "callDoctor",
                  title: "Call primary doctor",
                  description: "Initiates a phone call to Dr. Noura’s clinic and shares the emergency note.",
                },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleOption(option.key)}
                  className={`flex flex-col gap-4 rounded-3xl border p-6 text-left transition ${
                    options[option.key]
                      ? "border-cyan-500 bg-cyan-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${options[option.key] ? "border-cyan-500 bg-cyan-600 text-white" : "border-slate-300 bg-white text-slate-500"}`}>
                      {options[option.key] ? "✓" : ""}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{option.title}</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">{option.description}</p>
                </button>
              ))}
            </div>
          )}

          {!isMedicalStaff && (
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setOptions({ location: false, notifyFamily: false, callDoctor: false })}
                className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendAlert}
                className="inline-flex items-center justify-center rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Send Alert
              </button>
            </div>
          )}

          {(message || error) && (
            <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
              {message && <p className="text-green-700">{message}</p>}
              {error && <p className="text-red-700">{error}</p>}
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr_0.75fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Vitals Snapshot</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Real-time overview</h2>
              </div>
              <div className="rounded-3xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">Updated 2m ago</div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {vitals.map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-4 text-2xl font-semibold text-slate-900">
                    {item.value} <span className="text-sm font-medium text-slate-500">{item.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Latest Alerts</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Recent notifications</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{alerts.length} items</span>
            </div>

            <div className="mt-6 space-y-4">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id || alert._id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{alert.title || alert.message}</h3>
                      <p className="mt-2 text-sm text-slate-500">{alert.message}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{alert.time || "Now"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Clinic Contact</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Dr. Noura’s Family Clinic</h2>
            <p className="mt-4 text-sm text-slate-500">Rashid St, Building 4 · 04 555 8821</p>
            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-slate-50 p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-600 text-xl font-bold text-white">N</div>
              <div>
                <p className="text-sm text-slate-500">Primary care</p>
                <p className="font-semibold text-slate-900">Dr. Noura</p>
              </div>
            </div>
            <button className="mt-6 w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Call Clinic</button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">This Week’s Appointments</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Upcoming care schedule</h2>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Thu 10:00 • Cardiology follow-up</p>
                <p className="mt-2 text-sm text-slate-500">Clinic Room B2</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Sat 09:30 • Nutrition counseling</p>
                <p className="mt-2 text-sm text-slate-500">Tele-visit</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Download Weekly Report</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Vitals & activity summary</h2>
              </div>
            </div>
            <p className="mt-6 text-sm leading-6 text-slate-500">
              Includes vitals trends, medication adherence and activity summary.
            </p>
            <button className="mt-8 rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;

