import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getHealthData } from "../services/api";

function Health() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHealthData()
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Failed to fetch health data:", err);
        setError("Unable to load health data. Backend may not be running.");
        // Mock data for demo
        setData([
          { heartRate: 72 },
          { heartRate: 75 },
          { heartRate: 68 }
        ]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-semibold text-slate-900">Health Monitoring</h2>
        {error && <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>}
        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={i} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="font-semibold text-slate-900">Heart Rate</p>
              <p className="mt-2 text-3xl font-bold text-indigo-600">{item.heartRate} bpm</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Health;