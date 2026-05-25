import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function DoctorPerformas() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "doctor") { navigate("/login"); return; }
      setDoctor(u);
    } catch { navigate("/login"); }
  }, [navigate]);

  const CARDS = [
    {
      title: "Health Monitoring Performa",
      description: "Record and review patient vitals — heart rate, blood pressure, temperature, oxygen, glucose, weight and more.",
      icon: "🩺",
      color: "bg-teal-600",
      hoverColor: "hover:bg-teal-700",
      shadowColor: "shadow-teal-100",
      path: "/doctor-health-performa",
      tags: ["Vitals", "Medication", "Clinical Notes"],
    },
    {
      title: "Doctor Report Performa",
      description: "Write clinical reports with diagnosis, findings and follow-up recommendations for individual patients.",
      icon: "📝",
      color: "bg-indigo-600",
      hoverColor: "hover:bg-indigo-700",
      shadowColor: "shadow-indigo-100",
      path: "/doctor-report-performa",
      tags: ["Diagnosis", "Findings", "Recommendations"],
    },
    {
      title: "Write Prescription",
      description: "Issue prescriptions with full medicine details — dosage, frequency, route and instructions for each drug.",
      icon: "💊",
      color: "bg-violet-600",
      hoverColor: "hover:bg-violet-700",
      shadowColor: "shadow-violet-100",
      path: "/doctor-prescription",
      tags: ["Medicines", "Dosage", "Frequency"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <button
            onClick={() => navigate("/doctor-dashboard")}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
          >
            ← Back to Dashboard
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Medical Forms</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Performas</h1>
          <p className="mt-2 text-slate-500">
            Welcome, <span className="font-semibold text-slate-700">{doctor?.name}</span>. Select a performa to add or review records.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className={`w-full rounded-3xl ${card.color} p-8 text-left shadow-lg ${card.shadowColor} transition ${card.hoverColor} active:scale-[0.99]`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                  {card.icon}
                </div>
                <span className="mt-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                  Open →
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{card.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span key={tag} className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

      </main>
    </div>
  );
}

export default DoctorPerformas;
