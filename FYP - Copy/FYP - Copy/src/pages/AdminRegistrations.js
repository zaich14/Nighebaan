import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPendingUsers, updateUserStatus } from "../services/api";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

const roleLabel = (r) => {
  if (r === "user") return "Patient";
  if (r === "caregiver") return "Nurse";
  return r ? r.charAt(0).toUpperCase() + r.slice(1) : "User";
};

const roleColor = (r) => {
  if (r === "doctor")    return "bg-indigo-50 text-indigo-700";
  if (r === "nurse" || r === "caregiver") return "bg-teal-50 text-teal-700";
  if (r === "admin")     return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

export default function AdminRegistrations() {
  const navigate = useNavigate();
  const [pending, setPending]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [acting, setActing]     = useState(null);
  const [filter, setFilter]     = useState("all");

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPendingUsers();
      setPending(res.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pending registrations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== "admin") { navigate("/login"); return; }
    } catch { navigate("/login"); return; }
    loadPending();
  }, [navigate, loadPending]);

  const handleAction = async (userId, status) => {
    setActing(userId + status);
    setActionMsg("");
    try {
      await updateUserStatus(userId, status);
      setActionMsg(
        status === "active"
          ? "User approved successfully. They can now log in."
          : "Registration rejected."
      );
      await loadPending();
    } catch (err) {
      setActionMsg(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActing(null);
    }
  };

  const roles = ["all", "user", "doctor", "nurse", "caregiver"];
  const filtered = filter === "all" ? pending : pending.filter((u) => u.role === filter);

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

        {/* Header */}
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Pending Registrations</h1>
          <p className="mt-2 text-sm text-slate-500">
            Users who signed up are waiting for your approval before they can access the system.
            Review each request and approve or reject.
          </p>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Pending</p>
            </div>
            {["user","doctor","nurse"].map((r) => {
              const count = pending.filter((u) => u.role === r || (r === "nurse" && u.role === "caregiver")).length;
              return count > 0 ? (
                <div key={r} className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-slate-700">{count}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{roleLabel(r)}s</p>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Action message */}
        {actionMsg && (
          <div className={`mb-5 rounded-2xl border p-4 text-sm ${
            actionMsg.includes("approved")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : actionMsg.includes("ejected")
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}>
            {actionMsg}
          </div>
        )}

        {/* Filter chips */}
        {pending.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {[["all","All"], ["user","Patients"], ["doctor","Doctors"], ["nurse","Nurses"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  filter === val ? "bg-amber-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>
                {label}
                {val !== "all" && (
                  <span className="ml-1.5 opacity-70">
                    ({pending.filter((u) => val === "nurse" ? (u.role === "nurse" || u.role === "caregiver") : u.role === val).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl bg-white p-14 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">&#10003;</div>
            <p className="text-lg font-semibold text-slate-800">All caught up!</p>
            <p className="mt-1 text-sm text-slate-400">
              {filter === "all" ? "No pending registration requests right now." : `No pending ${filter} registrations.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((u) => (
              <div key={u._id || u.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* User info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-lg font-bold text-amber-700">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColor(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                        {u.createdAt && (
                          <span className="text-xs text-slate-400">
                            Registered {fmtDate(u.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <button
                      onClick={() => handleAction(u._id || u.id, "active")}
                      disabled={!!acting}
                      className="flex-1 sm:flex-none rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {acting === (u._id || u.id) + "active" ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(u._id || u.id, "rejected")}
                      disabled={!!acting}
                      className="flex-1 sm:flex-none rounded-2xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {acting === (u._id || u.id) + "rejected" ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>

                {/* Extra profile fields if available */}
                {(u.phone || u.hospital || u.specialization || u.designation || u.license) && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm border-t border-slate-100 pt-4">
                    {u.phone        && <span className="text-slate-500">Phone: <strong className="text-slate-700">{u.phone}</strong></span>}
                    {u.hospital     && <span className="text-slate-500">Hospital: <strong className="text-slate-700">{u.hospital}</strong></span>}
                    {u.specialization && <span className="text-slate-500">Specialization: <strong className="text-slate-700">{u.specialization}</strong></span>}
                    {u.designation  && <span className="text-slate-500">Designation: <strong className="text-slate-700">{u.designation}</strong></span>}
                    {u.license      && <span className="text-slate-500">License: <strong className="text-slate-700">{u.license}</strong></span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
