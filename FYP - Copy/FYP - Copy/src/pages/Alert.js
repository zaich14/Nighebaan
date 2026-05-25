import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import { createAlert, getAlerts, getPublicUsers } from "../services/api";

const familyStorageKey = (user) => `nigehbaan_family_contacts_${user?.id || user?._id || user?.email || "guest"}`;

const formatLocationLink = (coords) =>
  coords ? `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}` : "";

const normalizePhone = (phone) => String(phone || "").replace(/[^\d+]/g, "");

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
  const [familyContacts, setFamilyContacts] = useState([]);
  const [selectedFamilyIds, setSelectedFamilyIds] = useState([]);
  const [contactForm, setContactForm] = useState({ name: "", phone: "" });
  const [sendToOther, setSendToOther] = useState(false);
  const [extraContact, setExtraContact] = useState({ name: "", phone: "" });
  const [shareLocationWithFamily, setShareLocationWithFamily] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [primaryDoctor, setPrimaryDoctor] = useState(null);
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

  useEffect(() => {
    // Get current user info
    const userData = localStorage.getItem("user");
    let currentUserId = null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        currentUserId = user.id || user._id;
        const savedContacts = localStorage.getItem(familyStorageKey(user));
        if (savedContacts) {
          const parsedContacts = JSON.parse(savedContacts);
          if (Array.isArray(parsedContacts)) {
            setFamilyContacts(parsedContacts);
            setSelectedFamilyIds(parsedContacts.map((contact) => contact.id));
          }
        }
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
        setAlerts(Array.isArray(data) ? data : sampleAlerts);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts:", err);
        setError("Backend not available. Showing demo alert summary.");
        setAlerts(sampleAlerts);
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    getPublicUsers("doctor")
      .then((res) => {
        const doctors = res.data?.users || [];
        const withPhone = doctors.find((doc) => doc.phone);
        const fallback = doctors[0];
        if (withPhone || fallback) {
          setPrimaryDoctor({
            ...(withPhone || fallback),
            phone: (withPhone || fallback).phone || "+92 42 555 0821",
            hospital: (withPhone || fallback).hospital || "Nigehbaan Clinic",
          });
        }
      })
      .catch(() => {
        setPrimaryDoctor({
          name: "Dr. Ahmed Khan",
          phone: "+92 42 555 0821",
          hospital: "City Heart Institute",
        });
      });
  }, []);

  const isMedicalStaff = currentUser?.role === 'doctor' || currentUser?.role === 'nurse' || currentUser?.role === 'admin';

  const toggleOption = (name) => {
    setOptions((prev) => {
      const nextValue = !prev[name];
      if (name === "location" && !nextValue) {
        setShareLocationWithFamily(false);
      }
      return { ...prev, [name]: nextValue };
    });
  };

  const saveFamilyContacts = (contacts) => {
    setFamilyContacts(contacts);
    if (currentUser) localStorage.setItem(familyStorageKey(currentUser), JSON.stringify(contacts));
  };

  const addFamilyContact = () => {
    const name = contactForm.name.trim();
    const phone = normalizePhone(contactForm.phone);
    if (!name || !phone) {
      setError("Please enter both family member name and phone number.");
      return;
    }
    const newContact = { id: Date.now(), name, phone };
    saveFamilyContacts([...familyContacts, newContact]);
    setSelectedFamilyIds((prev) => [...prev, newContact.id]);
    setContactForm({ name: "", phone: "" });
    setError(null);
  };

  const removeFamilyContact = (id) => {
    saveFamilyContacts(familyContacts.filter((contact) => contact.id !== id));
    setSelectedFamilyIds((prev) => prev.filter((contactId) => contactId !== id));
  };

  const toggleFamilyRecipient = (id) => {
    setSelectedFamilyIds((prev) =>
      prev.includes(id) ? prev.filter((contactId) => contactId !== id) : [...prev, id]
    );
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("GPS is not supported in this browser.");
      return Promise.resolve(null);
    }

    setLocationLoading(true);
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(coords);
          setShareLocationWithFamily(true);
          setLocationLoading(false);
          resolve(coords);
        },
        () => {
          setLocationLoading(false);
          setError("Could not access GPS location. Please allow location permission and try again.");
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });
  };

  const buildEmergencyMessage = (coords = location) => {
    const locationLink = formatLocationLink(coords);
    const vitalsSummary = vitals.map((item) => `${item.label}: ${item.value}${item.unit ? " " + item.unit : ""}`).join(", ");
    return `Emergency alert from ${currentUser?.name || "Nigehbaan patient"}. ${locationLink ? `Location: ${locationLink}. ` : ""}Vitals: ${vitalsSummary}. Please check immediately.`;
  };

  const openSmsForContact = (contact, coords = location) => {
    const phone = normalizePhone(contact.phone);
    if (!phone) return;
    const body = encodeURIComponent(buildEmergencyMessage(coords));
    window.open(`sms:${phone}?&body=${body}`, "_blank");
  };

  const openSmsForRecipients = (recipients, coords = location) => {
    const phones = recipients.map((contact) => normalizePhone(contact.phone)).filter(Boolean);
    if (phones.length === 0) return false;
    const body = encodeURIComponent(buildEmergencyMessage(coords));
    window.open(`sms:${phones.join(",")}?&body=${body}`, "_blank");
    return true;
  };

  const handleSendAlert = async () => {
    let coords = location;
    if (options.location && !coords) {
      coords = await getCurrentLocation();
    }

    const recipients = familyContacts.filter((contact) => selectedFamilyIds.includes(contact.id));
    const extraPhone = normalizePhone(extraContact.phone);
    if (sendToOther && extraPhone) recipients.push({ ...extraContact, phone: extraPhone, id: "extra" });

    const shouldSendSms = options.notifyFamily || options.location;
    if (shouldSendSms && recipients.length === 0) {
      setError("Choose the family member or add another contact number before sending the SOS location.");
      setMessage(null);
      return;
    }

    if (shouldSendSms && recipients.length > 0) {
      openSmsForRecipients(recipients, coords);
    }

    const selected = Object.entries(options)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    const alertData = {
      message: buildEmergencyMessage(coords) + " Selected options: " + selected.join(", "),
      type: "emergency",
      severity: "high",
    };

    try {
      await createAlert(alertData);
      setMessage("Alert sent successfully.");
      setError(null);
    } catch (err) {
      console.error("Failed to send alert:", err);
      if (shouldSendSms && recipients.length > 0) {
        setMessage(`SMS opened for ${recipients.length} selected recipient${recipients.length === 1 ? "" : "s"}, but the backend could not save the alert.`);
        setError(err.response?.data?.message || "Backend alert save failed.");
      } else {
        setError(err.response?.data?.message || "Could not send alert.");
        setMessage(null);
      }
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
            <span className="rounded-full bg-indigo-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-indigo-600">
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
              <p className="text-sm text-indigo-600 font-medium">
                Logged in as: {currentUser.name} ({currentUser.role})
              </p>
            )}
          </div>

          {isMedicalStaff ? (
            <div className="mt-10">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowCreateAlert(!showCreateAlert)}
                  className="rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
                          className="text-sm text-indigo-600 hover:text-indigo-700"
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
                      className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700"
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
                  description: location
                    ? `GPS ready: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                    : "Gets your GPS location and prepares a Google Maps link with current vitals.",
                },
                {
                  key: "notifyFamily",
                  title: "Notify family circle",
                  description: familyContacts.length > 0
                    ? `${familyContacts.length} saved contact${familyContacts.length === 1 ? "" : "s"} will appear automatically.`
                    : "Add family phone numbers once; they will appear automatically next time.",
                },
                {
                  key: "callDoctor",
                  title: "Call primary doctor",
                  description: primaryDoctor
                    ? `Call ${primaryDoctor.name} at ${primaryDoctor.phone}.`
                    : "Loads your available doctor contact from Nigehbaan.",
                },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleOption(option.key)}
                  className={`flex flex-col gap-4 rounded-3xl border p-6 text-left transition ${
                    options[option.key]
                      ? "border-indigo-500 bg-indigo-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${options[option.key] ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-500"}`}>
                      {options[option.key] ? "✓" : ""}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{option.title}</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">{option.description}</p>
                </button>
              ))}
            </div>
          )}

          {!isMedicalStaff && Object.values(options).some(Boolean) && (
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {options.location && (
                <div className="rounded-3xl border border-teal-100 bg-teal-50 p-5">
                  <p className="text-sm font-semibold text-teal-900">Live Location</p>
                  <p className="mt-2 text-sm text-teal-700">
                    {location
                      ? `Ready to share within about ${Math.round(location.accuracy || 0)} meters.`
                      : "Allow browser location permission to generate a shareable Google Maps link."}
                  </p>
                  <button
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="mt-4 rounded-2xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
                  >
                    {locationLoading ? "Getting GPS..." : location ? "Refresh Location" : "Get GPS Location"}
                  </button>
                  {location && (
                    <a
                      href={formatLocationLink(location)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block text-sm font-semibold text-teal-800 underline"
                    >
                      Open Google Maps location
                    </a>
                  )}
                  {location && (
                    <button
                      type="button"
                      onClick={() => setShareLocationWithFamily((prev) => !prev)}
                      className={`mt-4 w-full rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        shareLocationWithFamily
                          ? "bg-teal-700 text-white hover:bg-teal-800"
                          : "bg-white text-teal-800 ring-1 ring-teal-200 hover:bg-teal-100"
                      }`}
                    >
                      {shareLocationWithFamily ? "Hide location contacts" : "Share location with family"}
                    </button>
                  )}
                </div>
              )}

              {(options.notifyFamily || (options.location && location && shareLocationWithFamily)) && (
                <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                  <p className="text-sm font-semibold text-amber-900">
                    {options.location && shareLocationWithFamily ? "Share Location With" : "Notify Family Members"}
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    {options.location && shareLocationWithFamily
                      ? "Choose a saved family member or add another contact for this location alert."
                      : "Choose who should receive the family SOS message."}
                  </p>
                  <div className="mt-3 space-y-2">
                    {familyContacts.length === 0 ? (
                      <p className="text-sm text-amber-700">No saved family contacts yet.</p>
                    ) : familyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedFamilyIds.includes(contact.id)}
                            onChange={() => toggleFamilyRecipient(contact.id)}
                            className="h-4 w-4 rounded border-amber-300 text-amber-500"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                            <p className="text-xs text-slate-500">{contact.phone}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openSmsForContact(contact)}
                            className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800"
                          >
                            SMS
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFamilyContact(contact.id)}
                            className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {familyContacts.length > 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      Checked contacts will receive the GPS/vitals SMS when you press Send Alert.
                    </p>
                  )}
                  <div className="mt-4 grid gap-2">
                    <input
                      value={contactForm.name}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Family member name"
                      className="rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      value={contactForm.phone}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                      className="rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addFamilyContact}
                      className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                      Save Family Contact
                    </button>
                  </div>
                  <div className="mt-4 rounded-2xl bg-white p-3">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <input
                        type="checkbox"
                        checked={sendToOther}
                        onChange={(e) => setSendToOther(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-amber-500"
                      />
                      Send to another contact instead/as well
                    </label>
                    {sendToOther && (
                      <div className="mt-2 grid gap-2">
                        <input
                          value={extraContact.name}
                          onChange={(e) => setExtraContact((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Contact name"
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                        <input
                          value={extraContact.phone}
                          onChange={(e) => setExtraContact((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="Contact phone number"
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {options.callDoctor && (
                <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
                  <p className="text-sm font-semibold text-indigo-900">Primary Doctor</p>
                  <div className="mt-3 rounded-2xl bg-white p-4">
                    <p className="font-semibold text-slate-900">{primaryDoctor?.name || "Doctor not found"}</p>
                    <p className="text-sm text-slate-500">{primaryDoctor?.hospital || "Nigehbaan Clinic"}</p>
                    <p className="mt-1 text-sm font-semibold text-indigo-700">{primaryDoctor?.phone || "No phone available"}</p>
                  </div>
                  {primaryDoctor?.phone && (
                    <a
                      href={`tel:${primaryDoctor.phone}`}
                      className="mt-4 flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Call Doctor
                    </a>
                  )}
                </div>
              )}
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
                className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
              <div className="rounded-3xl bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">Updated 2m ago</div>
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
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">{primaryDoctor?.hospital || "Nigehbaan Clinic"}</h2>
            <p className="mt-4 text-sm text-slate-500">{primaryDoctor?.phone || "No phone number available"}</p>
            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-slate-50 p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600 text-xl font-bold text-white">
                {(primaryDoctor?.name || "D").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-slate-500">Primary care</p>
                <p className="font-semibold text-slate-900">{primaryDoctor?.name || "Doctor not found"}</p>
              </div>
            </div>
            {primaryDoctor?.phone ? (
              <a
                href={`tel:${primaryDoctor.phone}`}
                className="mt-6 flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Call Doctor
              </a>
            ) : (
              <button className="mt-6 w-full rounded-3xl bg-slate-300 px-5 py-3 text-sm font-semibold text-white" disabled>
                No Number Available
              </button>
            )}
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
            <button className="mt-8 rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
