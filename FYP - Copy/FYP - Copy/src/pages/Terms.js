import React from "react";
import Navbar from "../components/Navbar";

function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Terms & Conditions</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Terms of use for Nigehbaan</h1>
          <p className="mt-4 text-slate-600 leading-7">
            By using this platform, you agree to follow the terms and conditions that protect users, caregivers, and service quality.
          </p>

          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">User Responsibilities</h2>
              <p className="mt-3 text-slate-600 leading-7">
                Keep your account secure, provide accurate information, and use the system only for lawful caregiving purposes.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Service Use</h2>
              <p className="mt-3 text-slate-600 leading-7">
                Services are provided as guidance and coordination tools. Medical advice should be confirmed with licensed professionals.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Subscription Terms</h2>
              <p className="mt-3 text-slate-600 leading-7">
                Billing, plan changes, and cancellations follow the plan details shown in the Pricing page.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Terms;
