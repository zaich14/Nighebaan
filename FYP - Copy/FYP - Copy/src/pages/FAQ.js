import React from "react";
import Navbar from "../components/Navbar";

const faqs = [
  {
    question: "How do I register as a caregiver?",
    answer:
      "Go to Sign Up and choose the Caregiver role. Provide your details and wait for admin approval before you can accept bookings.",
  },
  {
    question: "Can I add my parent’s health data manually?",
    answer:
      "Yes. Once logged in, use the health monitoring dashboard to add BP, sugar, heart rate, and other vitals manually.",
  },
  {
    question: "How do emergency alerts work?",
    answer:
      "The SOS feature sends real-time alerts to caregivers and family contacts. Admins and medical staff can also create alert conditions.",
  },
  {
    question: "What plans include caregiver services?",
    answer:
      "The Premium and Caregiver plans include professional caregiver booking, appointment management, and service reports.",
  },
  {
    question: "Can I reset my password if I forget it?",
    answer:
      "Yes. Use the Forgot Password page to request a password reset link and update your account credentials.",
  },
];

function FAQ() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">FAQs</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Frequently asked questions</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Common questions about registration, plans, emergency alerts, and caregiver services.
          </p>

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-semibold text-slate-900">{item.question}</h2>
                <p className="mt-3 text-slate-600 leading-7">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default FAQ;
