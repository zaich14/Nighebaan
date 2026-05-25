import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const STORAGE_KEY = "nigehbaan_faq_questions";

const SEED_QUESTIONS = [
  {
    id: "q1",
    name: "Amna Javed",
    email: "amna@example.com",
    question: "How do I book an appointment with a doctor?",
    answer: "",
    status: "pending",
    createdAt: "2026-05-05T10:00:00Z",
  },
  {
    id: "q2",
    name: "Abdul Rehman",
    email: "abdul@example.com",
    question: "Can the nurse see my health records?",
    answer: "Yes, nurses assigned to your care can view your health records to monitor your vitals and update your performa.",
    status: "answered",
    createdAt: "2026-05-03T09:00:00Z",
    answeredAt: "2026-05-04T11:00:00Z",
  },
  {
    id: "q3",
    name: "Fatima Malik",
    email: "fatima@example.com",
    question: "What is the SOS feature and how does it work?",
    answer: "",
    status: "pending",
    createdAt: "2026-05-06T14:00:00Z",
  },
  {
    id: "q4",
    name: "Mohsin Riaz",
    email: "mohsin@example.com",
    question: "How can I upgrade to the premium plan?",
    answer: "You can upgrade by clicking on 'Upgrade Plan' in the navigation menu and selecting a suitable plan.",
    status: "answered",
    createdAt: "2026-05-02T08:00:00Z",
    answeredAt: "2026-05-02T15:00:00Z",
  },
];

function getQuestions() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (stored) return stored;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_QUESTIONS));
    return SEED_QUESTIONS;
  } catch {
    return SEED_QUESTIONS;
  }
}

function saveQuestions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

function AdminFAQ() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [questions, setQuestions] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== "admin") { navigate("/login"); return; }
    } catch { navigate("/login"); return; }
    setQuestions(getQuestions());
  }, [navigate]);

  const pending  = questions.filter((q) => q.status === "pending");
  const answered = questions.filter((q) => q.status === "answered");
  const listed   = tab === "pending" ? pending : answered;

  const handleAnswer = (id) => {
    const answer = (drafts[id] || "").trim();
    if (!answer) return;
    setSaving(id);
    setTimeout(() => {
      const updated = questions.map((q) =>
        q.id === id ? { ...q, answer, status: "answered", answeredAt: new Date().toISOString() } : q
      );
      setQuestions(updated);
      saveQuestions(updated);
      setDrafts((prev) => { const d = { ...prev }; delete d[id]; return d; });
      setSaving(null);
    }, 400);
  };

  const handleDelete = (id) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    saveQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <button
            onClick={() => navigate("/admin-panel")}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            &#8592; Back to Dashboard
          </button>
        </div>

        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">FAQ &amp; User Questions</h1>
          <p className="mt-2 text-sm text-slate-500">Answer questions submitted by users. Answered questions appear on the public FAQ page.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-slate-100 p-1.5 w-fit">
          {[["pending", `Pending (${pending.length})`], ["answered", `Answered (${answered.length})`]].map(([v, label]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                tab === v ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {listed.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
              No {tab} questions.
            </div>
          ) : (
            listed.map((q) => (
              <div key={q.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
                      {q.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{q.name}</p>
                      <p className="text-xs text-slate-400">{q.email} &middot; {fmtDate(q.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                      q.status === "answered" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {q.status === "answered" ? "Answered" : "Pending"}
                    </span>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Question</p>
                  <p className="text-sm text-slate-800">{q.question}</p>
                </div>

                {q.status === "answered" ? (
                  <div className="mt-3 rounded-2xl bg-teal-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">Your Answer &middot; {fmtDate(q.answeredAt)}</p>
                    <p className="text-sm text-slate-800">{q.answer}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Write your answer</label>
                    <textarea
                      rows={3}
                      value={drafts[q.id] || ""}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Type your answer here..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      onClick={() => handleAnswer(q.id)}
                      disabled={saving === q.id || !drafts[q.id]?.trim()}
                      className="mt-2 inline-flex items-center rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed"
                    >
                      {saving === q.id ? "Posting..." : "Post Answer"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminFAQ;
