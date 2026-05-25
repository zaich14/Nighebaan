import React from "react";
import Navbar from "../components/Navbar";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Privacy Policy</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Your privacy is important to us</h1>
          <p className="mt-4 text-slate-600 leading-7">
            We collect only the information needed to deliver care services and protect your data with secure practices.
          </p>

          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Data Collection</h2>
              <p className="mt-3 text-slate-600 leading-7">
                Personal details, health entries, and contact information are stored securely and used only for care coordination.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Sharing</h2>
              <p className="mt-3 text-slate-600 leading-7">
                Data is shared only with authorized caregivers, family members, and service providers you approve.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Security</h2>
              <p className="mt-3 text-slate-600 leading-7">
                We use security best practices to keep your account and health information protected.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicy;

