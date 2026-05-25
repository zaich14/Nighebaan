import React, { useState } from "react";
import Navbar from "../components/Navbar";

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Contact Us</p>
            <h1 className="mt-4 text-4xl font-bold text-slate-900">Get in touch with our care support team</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Send us a message and we’ll get back to you about sign-up, subscription plans, or caregiver support.
            </p>

            <div className="mt-10 space-y-6">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="font-semibold text-slate-900">Email</p>
                <p className="mt-2 text-slate-600">support@nigehbaan.com</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="font-semibold text-slate-900">Phone</p>
                <p className="mt-2 text-slate-600">+92 300 123 4567</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900">Send a message</h2>
            {submitted ? (
              <div className="mt-6 rounded-3xl bg-emerald-50 border border-emerald-200 p-6 text-sm text-emerald-700">
                Thank you! Your message has been received. We will respond shortly.
              </div>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    placeholder="Tell us how we can help."
                  />
                </div>
                <button className="w-full rounded-3xl bg-teal-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-teal-700">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Contact;
