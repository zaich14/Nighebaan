import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getPlans } from "../services/api";

const PAYMENT_OPTIONS = [
  { id: "card", label: "Debit/Credit Card", detail: "Visa, Mastercard, UnionPay" },
  { id: "easypaisa", label: "Easypaisa", detail: "Mobile wallet transfer" },
  { id: "jazzcash", label: "JazzCash", detail: "Mobile wallet transfer" },
  { id: "bank", label: "Bank Transfer", detail: "Online banking receipt" },
];

const BANK_ACCOUNTS = [
  { id: "hbl", bank: "HBL", title: "Nigehbaan Health Services", iban: "PK36HABB0000001122334455", account: "1122-334455-01" },
  { id: "meezan", bank: "Meezan Bank", title: "Nigehbaan Health Services", iban: "PK22MEZN0000006677889900", account: "6677-889900-02" },
  { id: "ubl", bank: "UBL", title: "Nigehbaan Health Services", iban: "PK17UNIL0000005566778899", account: "5566-778899-03" },
];

const PLAN_AMOUNTS = {
  basic: 0,
  standard: 999,
  premium: 2499,
};

const fallbackPlans = [
  {
    id: "basic",
    name: "Free",
    tag: "Starter",
    price: "Free",
    description: "Essential tools for patients who want simple health tracking.",
    features: ["Manual vitals entry", "AI health assistant", "Book doctor or nurse appointments", "SOS location sharing"],
  },
  {
    id: "standard",
    name: "Standard",
    tag: "Popular",
    price: "PKR 999/mo",
    description: "Better follow-up and family coordination for regular care needs.",
    features: ["Everything in Free", "Medication reminders", "Saved family emergency contacts", "Appointment payment history", "Priority support responses"],
  },
  {
    id: "premium",
    name: "Premium",
    tag: "Advanced",
    price: "PKR 2,499/mo",
    description: "Full care support for patients who need closer monitoring.",
    features: ["Everything in Standard", "24/7 emergency escalation", "Doctor and nurse care coordination", "Monthly health summary reports", "Premium telehealth support"],
  },
];

const getUserKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || user.email || "guest";
  } catch {
    return "guest";
  }
};

const subscriptionKey = () => `nigehbaan_subscription_${getUserKey()}`;

function PlanPaymentModal({ plan, onClose, onPaid }) {
  const [method, setMethod] = useState("card");
  const [bankId, setBankId] = useState(BANK_ACCOUNTS[0].id);
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState(null);
  const [error, setError] = useState("");
  const amount = PLAN_AMOUNTS[plan.id] || 0;
  const requiresProof = method === "bank" || method === "easypaisa" || method === "jazzcash";

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleProofChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProof(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image screenshot or receipt.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Proof image must be 2MB or smaller.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProof({ name: file.name, type: file.type, dataUrl: reader.result });
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handlePay = () => {
    if (!method) {
      setError("Please select a payment method.");
      return;
    }
    if (amount > 0 && method !== "card" && !reference.trim()) {
      setError("Please enter a transaction or receipt reference.");
      return;
    }
    if (amount > 0 && requiresProof && !proof) {
      setError("Please upload a payment screenshot or receipt proof.");
      return;
    }

    const selected = PAYMENT_OPTIONS.find((item) => item.id === method);
    const selectedBank = BANK_ACCOUNTS.find((bank) => bank.id === bankId);
    const subscription = {
      planId: plan.id,
      planName: plan.name,
      amount,
      status: amount === 0 ? "active" : "paid",
      paymentMethod: amount === 0 ? "Free plan" : selected?.label,
      paymentReference: amount === 0 ? "" : reference.trim() || `NGB-PLAN-${Date.now()}`,
      paymentBank: method === "bank" ? selectedBank : null,
      paymentProof: proof,
      upgradedAt: new Date().toISOString(),
    };

    localStorage.setItem(subscriptionKey(), JSON.stringify(subscription));
    onPaid(subscription);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-7 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">Plan Payment</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900">Upgrade to {plan.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-7 py-6">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Amount</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{amount === 0 ? "Free" : `PKR ${amount.toLocaleString()}`}</p>
            <p className="mt-1 text-xs text-slate-500">Nigehbaan records your selected plan for this account.</p>
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          {amount > 0 && (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-700">Payment Method</label>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PAYMENT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMethod(option.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        method === option.id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-slate-50 hover:border-teal-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{option.detail}</p>
                    </button>
                  ))}
                </div>
              </div>

              {method === "bank" && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">Transfer To</label>
                  <div className="mt-3 grid gap-2">
                    {BANK_ACCOUNTS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setBankId(bank.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          bankId === bank.id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-slate-50 hover:border-teal-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{bank.bank}</p>
                          <span className="text-xs font-semibold text-teal-700">PKR {amount.toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Account Title: {bank.title}</p>
                        <p className="text-xs text-slate-500">Account No: {bank.account}</p>
                        <p className="text-xs text-slate-500">IBAN: {bank.iban}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(method === "easypaisa" || method === "jazzcash") && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Send PKR {amount.toLocaleString()} to Nigehbaan wallet 0300-1234567, then enter the transaction ID and upload the screenshot.
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700">Transaction Reference</label>
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder={method === "card" ? "Auto-generated if left empty" : "Enter wallet/bank reference"}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {requiresProof && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">Payment Proof Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none"
                  />
                  <p className="mt-2 text-xs text-slate-500">Upload a screenshot of your bank transfer, Easypaisa, or JazzCash receipt. Max 2MB.</p>
                  {proof && <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-800">Proof attached: {proof.name}</div>}
                </div>
              )}
            </>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-100 bg-white px-7 py-5">
          <button onClick={onClose} className="flex-1 rounded-2xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Cancel
          </button>
          <button onClick={handlePay} className="flex-1 rounded-2xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
            {amount === 0 ? "Activate Free Plan" : "Pay and Upgrade"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Plans() {
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedSubscription = localStorage.getItem(subscriptionKey());
    if (savedSubscription) {
      try {
        setSubscription(JSON.parse(savedSubscription));
      } catch {
        setSubscription(null);
      }
    }

    const fetchPlans = async () => {
      try {
        const response = await getPlans();
        setPlans(response.data.data.plans || fallbackPlans);
        setAddOns(response.data.data.addOnServices || []);
      } catch (err) {
        console.error(err);
        setPlans(fallbackPlans);
        setError("Backend plans are unavailable, so showing the saved Nigehbaan plan list.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const visiblePlans = (plans.length ? plans : fallbackPlans).filter((plan) => PLAN_AMOUNTS[plan.id] !== undefined);

  const handlePaid = (newSubscription) => {
    setSubscription(newSubscription);
    setSelectedPlan(null);
    setMessage(`${newSubscription.planName} plan activated successfully.`);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      {selectedPlan && (
        <PlanPaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onPaid={handlePaid}
        />
      )}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Pricing</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">Subscription plans for every care need.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Start free, then upgrade when you need reminders, family coordination, emergency escalation, and care reports.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-3xl border border-teal-100 bg-teal-50 p-4 text-center text-sm font-semibold text-teal-800">
            {message}
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading plans...
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              {visiblePlans.map((plan) => {
                const isCurrent = subscription?.planId === plan.id;
                const amount = PLAN_AMOUNTS[plan.id] || 0;
                return (
                  <div key={plan.id} className={`rounded-3xl border bg-white p-8 shadow-sm ${plan.id === "standard" ? "border-teal-300 ring-2 ring-teal-100" : "border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">{plan.tag}</p>
                        <h2 className="mt-4 text-2xl font-semibold text-slate-900">{plan.name}</h2>
                      </div>
                      <p className="text-right text-xl font-bold text-slate-900">{plan.price}</p>
                    </div>
                    <p className="mt-4 min-h-[48px] text-slate-600">{plan.description}</p>
                    <ul className="mt-6 space-y-3 text-slate-700">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      disabled={isCurrent}
                      className={`mt-8 w-full rounded-full px-6 py-3 text-sm font-semibold transition ${
                        isCurrent
                          ? "bg-slate-200 text-slate-500"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {isCurrent ? "Current Plan" : amount === 0 ? "Activate Free" : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Plan Summary</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">Choose only the care level you need</h2>
                </div>
                <p className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
                  {subscription ? `${subscription.planName} active` : "No plan selected"}
                </p>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h3 className="text-xl font-semibold text-slate-900">Free</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Best for trying Nigehbaan, entering vitals manually, chatting with AI, booking appointments, and using SOS location sharing.</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h3 className="text-xl font-semibold text-slate-900">Standard</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Best for families who need reminders, saved emergency contacts, payment records, and faster support.</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h3 className="text-xl font-semibold text-slate-900">Premium</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Best for patients who need emergency escalation, doctor and nurse coordination, reports, and premium telehealth support.</p>
                </div>
              </div>
            </div>
          </>
        )}

        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Add-On Services</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Expand your care with optional services.</h2>
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
