import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const STORAGE_KEY = "nigehbaan_faq_questions";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

function AskQuestion() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [myQuestions, setMyQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadQuestions = (user) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const mine = all.filter((q) => q.email === user.email);
      setMyQuestions(mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setMyQuestions([]);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
      loadQuestions(parsed);
    } catch { navigate("/login"); }
  }, [navigate]);

  const handleSubmit = () => {
    if (!question.trim()) { setError("Please enter your question."); return; }
    setError("");
    setSubmitting(true);

    setTimeout(() => {
      const entry = {
        id: `q-${Date.now()}`,
        name: currentUser?.name || "User",
        email: currentUser?.email || "",
        question: question.trim(),
        answer: "",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...all]));
      } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([entry]));
      }
      setQuestion("");
      setShowForm(false);
      setSuccess("Question submitted. The admin will answer it soon.");
      loadQuestions(currentUser);
      setSubmitting(false);
    }, 400);
  };

  const pending  = myQuestions.filter((q) => q.status === "pending");
  const answered = myQuestions.filter((q) => q.status === "answered");

  const dashLink = () => {
    if (!currentUser) return "/dashboard";
    if (currentUser.role === "doctor") return "/doctor-dashboard";
    if (currentUser.role === "nurse")  return "/nurse-dashboard";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <button
            onClick={() => navigate(dashLink())}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            &#8592; Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600">Support</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Ask a Question</h1>
          <p className="mt-2 text-sm text-slate-500">Submit any question and the admin will answer it directly here.</p>

          <div className="mt-5 flex gap-4">
            <div className="rounded-2xl bg-amber-50 px-5 py-3 text-center">
              <p className="text-xl font-bold text-amber-600">{pending.length}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
            <div className="rounded-2xl bg-teal-50 px-5 py-3 text-center">
              <p className="text-xl font-bold text-teal-600">{answered.length}</p>
              <p className="text-xs text-slate-500">Answered</p>
            </div>
          </div>
        </div>

        {/* Submit button / form */}
        {!showForm ? (
          <button
            onClick={() => { setShowForm(true); setSuccess(""); }}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50 py-5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            + Ask a New Question
          </button>
        ) : (
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-indigo-200">
            <h2 className="mb-4 font-semibold text-slate-900">Your Question</h2>
            {error && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Question *</label>
              <textarea
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Question"}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>
        )}

        {/* Questions list */}
        {myQuestions.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
            You have not asked any questions yet.
          </div>
        ) : (
          <div className="space-y-4">
            {myQuestions.map((q) => (
              <div key={q.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <p className="text-xs text-slate-400">{fmtDate(q.createdAt)}</p>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    q.status === "answered" ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {q.status === "answered" ? "Answered" : "Pending"}
                  </span>
                </div>

                <div className="mt-2 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Your Question</p>
                  <p className="text-sm text-slate-700">{q.question}</p>
                </div>

                {q.status === "answered" && q.answer ? (
                  <div className="mt-3 rounded-2xl bg-teal-50 border border-teal-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
                      Admin Answer &middot; {fmtDate(q.answeredAt)}
                    </p>
                    <p className="text-sm text-slate-800">{q.answer}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-400 italic">Awaiting admin response...</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AskQuestion;
