import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getPlans } from "../services/api";

function Plans() {
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getPlans();
        setPlans(response.data.data.plans || []);
        setAddOns(response.data.data.addOnServices || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load plans right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Pricing</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">Subscription plans for every care need.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Nigehbaan plans are built for individuals, families, caregivers, and full-service care providers. Start free or upgrade for real-time monitoring, emergency support, and caregiver services.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading plans...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            {error}
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              {plans
                .filter((plan) => plan.id === "basic" || plan.id === "standard" || plan.id === "premium")
                .map((plan) => (
                  <div key={plan.id} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">{plan.tag}</p>
                        <h2 className="mt-4 text-2xl font-semibold text-slate-900">{plan.name}</h2>
                      </div>
                      <p className="text-right text-xl font-bold text-slate-900">{plan.price}</p>
                    </div>
                    <p className="mt-4 text-slate-600">{plan.description}</p>
                    <ul className="mt-6 space-y-3 text-slate-700">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="mt-8 w-full rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                      Choose {plan.name}
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Basic Plan Overview</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">Start with the Basic Plan</h2>
                </div>
                <p className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white">Free / Starter</p>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Core benefits</h3>
                  <ul className="mt-4 space-y-3 text-slate-700">
                    <li>• User registration and profile management</li>
                    <li>• Manual health data entry for BP, sugar, and vitals</li>
                    <li>• Basic family dashboard for caregiver visibility</li>
                    <li>• Limited notifications with daily reminders</li>
                  </ul>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Why it works</h3>
                  <p className="mt-4 text-slate-600 leading-7">
                    The Basic Plan helps new users explore Nigehbaan with essential care management tools. It is ideal for families who want a simple setup before moving to automated monitoring and emergency support.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-semibold text-slate-900">Service-Based Caregiver Plus</h2>
              <p className="mt-4 text-slate-600">
                For users who need real caregiving support, this service-based plan adds professional caregivers, scheduling, in-app communication, and service reporting.
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {plans
                  .filter((plan) => plan.id === "caregiver-plus")
                  .map((plan) => (
                    <div key={plan.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">{plan.tag}</p>
                          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{plan.name}</h3>
                        </div>
                        <p className="text-right text-lg font-bold text-slate-900">{plan.price}</p>
                      </div>
                      <p className="mt-4 text-slate-600">{plan.description}</p>
                      <ul className="mt-5 space-y-3 text-slate-700">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Add-On Services</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Expand your care with optional revenue services.</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {addOns.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Plans;

