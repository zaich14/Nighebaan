import React, { useState } from "react";
import Navbar from "../components/Navbar";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Reset Password</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Forgot Password</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Enter your email address and we will send instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {submitted ? (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-700">
                If the email is registered, you will receive password reset instructions shortly.
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email address</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    placeholder="you@example.com"
                  />
                </div>
                <button className="rounded-3xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                  Send reset link
                </button>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;
