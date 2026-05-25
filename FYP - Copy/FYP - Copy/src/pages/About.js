import React from "react";
import Navbar from "../components/Navbar";

function About() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">About Us</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Elderly Care Management System</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Nigehbaan is designed to make elder care simpler, safer, and more connected for families, caregivers, and older adults.
          </p>

          <section className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Project Purpose</h2>
              <p className="mt-4 text-slate-600 leading-7">
                Our platform brings health monitoring, emergency support, caregiver coordination, and family communication together in one place. It helps caregivers stay informed and empowers elders to access support quickly.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Mission &amp; Vision</h2>
              <p className="mt-4 text-slate-600 leading-7">
                Mission: To provide compassionate care technology that keeps the elderly safe, families informed, and caregivers coordinated.
              </p>
              <p className="mt-4 text-slate-600 leading-7">
                Vision: A connected care ecosystem where every elder can age with dignity and every family can stay confident in daily wellbeing.
              </p>
            </div>
          </section>

          <section className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Health Monitoring",
                description: "Track vitals, review reports, and share updates with family members.",
              },
              {
                title: "Emergency Support",
                description: "Trigger instant alerts, SOS requests, and notify caregivers immediately.",
              },
              {
                title: "Caregiver Services",
                description: "Book caregivers, manage appointments, and track daily care tasks.",
              },
              {
                title: "Chatbot Support",
                description: "Use companion chat to access care guidance and share reminders.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default About;
