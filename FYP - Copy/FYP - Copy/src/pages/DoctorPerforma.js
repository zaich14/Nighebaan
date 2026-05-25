import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function DoctorPerforma() {
  const navigate = useNavigate();
  const [report, setReport] = useState({ title: "", description: "", patient: "" });
  const [health, setHealth] = useState({ heartRate: "", bp: "", temp: "", o2: "", steps: "", notes: "" });
  const [prescription, setPrescription] = useState({ medicine: "", dosage: "", remarks: "", patient: "" });

  const handleReportSubmit = () => alert("Report saved!");
  const handleHealthSubmit = () => alert("Health reading saved!");
  const handlePrescriptionSubmit = () => alert("Prescription saved!");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      if (parsed?.role !== "doctor") {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Could not parse user data", err);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-3xl font-semibold text-slate-900">Doctor's Performa</h2>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Doctor Report Performa */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Doctor Report Performa</h3>
              <span className="text-xs font-medium text-slate-500">v1.0</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Select Patient</label>
                <select
                  value={report.patient}
                  onChange={(e) => setReport({ ...report, patient: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option>e.g., Amna Akbar</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Report Title</label>
                <input
                  type="text"
                  placeholder="Blood Pressure Analysis"
                  value={report.title}
                  onChange={(e) => setReport({ ...report, title: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  placeholder="Patient shows stable condition with mild systolic variation observed over the last 24 hours. Recommend continued monitoring and hydration."
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                onClick={handleReportSubmit}
                className="mt-4 w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Save Report
              </button>
            </div>
          </div>

          {/* Health Monitoring Performa */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-6 text-xl font-semibold text-slate-900">Health Monitoring Performa</h3>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Heart rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={health.heartRate}
                    onChange={(e) => setHealth({ ...health, heartRate: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    placeholder="118/75"
                    value={health.bp}
                    onChange={(e) => setHealth({ ...health, bp: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={health.temp}
                    onChange={(e) => setHealth({ ...health, temp: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Oxygen level (%)</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={health.o2}
                    onChange={(e) => setHealth({ ...health, o2: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Steps walked</label>
                <input
                  type="number"
                  placeholder="5500"
                  value={health.steps}
                  onChange={(e) => setHealth({ ...health, steps: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                <textarea
                  placeholder="Patient reports light fatigue after morning walk"
                  value={health.notes}
                  onChange={(e) => setHealth({ ...health, notes: e.target.value })}
                  rows="2"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                onClick={handleHealthSubmit}
                className="mt-4 w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Save Reading
              </button>
            </div>
          </div>
        </div>

        {/* Prescription Performa */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-6 text-xl font-semibold text-slate-900">Prescription Performa</h3>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Select Patient</label>
                <select
                  value={prescription.patient}
                  onChange={(e) => setPrescription({ ...prescription, patient: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option>e.g., Rehaan Habib</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Medicine Name</label>
                <input
                  type="text"
                  placeholder="Amlodipine 5mg"
                  value={prescription.medicine}
                  onChange={(e) => setPrescription({ ...prescription, medicine: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Dosage</label>
                <input
                  type="text"
                  placeholder="1 tablet, twice daily"
                  value={prescription.dosage}
                  onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Doctor Remarks</label>
                <textarea
                  placeholder="Take after meals, review in 2 weeks"
                  value={prescription.remarks}
                  onChange={(e) => setPrescription({ ...prescription, remarks: e.target.value })}
                  rows="2"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                onClick={handlePrescriptionSubmit}
                className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Save Prescription
              </button>
            </div>

            <div className="flex items-center justify-center rounded-3xl bg-slate-50 p-8">
              <div className="text-center">
                <div className="text-sm text-slate-500">Prescription Chart</div>
                <p className="mt-4 text-slate-400">Graph visualization will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorPerforma;
