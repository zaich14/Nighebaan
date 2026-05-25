import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers, getPendingUsers, updateUserStatus } from "../services/api";

const ROLE_TABS = [
  { label: "Doctors",  value: "doctor"  },
  { label: "Nurses",   value: "nurse"   },
  { label: "Patients", value: "patient" },
];

function AdminPanel() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedTab, setSelectedTab] = useState("doctor");
  const [users, setUsers]             = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError]   = useState("");

  const [stats, setStats] = useState({ doctor: null, nurse: null, patient: null });
  const loadReqId = useRef(0);

  const [pending, setPending]               = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError]     = useState("");
  const [actionMsg, setActionMsg]           = useState("");
  const [showPending, setShowPending]       = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
      if (parsed.role !== "admin") {
        navigate(
          parsed.role === "doctor" ? "/doctor-dashboard" :
          parsed.role === "nurse"  ? "/nurse-dashboard"  : "/dashboard"
        );
      }
    } catch { navigate("/login"); }
  }, [navigate]);

  const loadUsers = useCallback(async (role) => {
    const reqId = ++loadReqId.current;
    setLoadingUsers(true);
    setUsersError("");
    try {
      const res = await getUsers(role);
      if (reqId !== loadReqId.current) return; // stale — a newer request is in flight
      const list = res.data.users || res.data || [];
      setUsers(Array.isArray(list) ? list : []);
      setStats((prev) => ({ ...prev, [role]: Array.isArray(list) ? list.length : 0 }));
    } catch (err) {
      if (reqId !== loadReqId.current) return;
      setUsersError(err.response?.data?.message || "Unable to load users.");
      setUsers([]);
    } finally {
      if (reqId === loadReqId.current) setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { loadUsers(selectedTab); }, [selectedTab, loadUsers]);

  // Load counts for the other two roles in background so stats cards are always filled
  useEffect(() => {
    const roles = ["doctor", "nurse", "patient"];
    roles.forEach(async (role) => {
      try {
        const res = await getUsers(role);
        const list = res.data.users || res.data || [];
        setStats((prev) => ({ ...prev, [role]: Array.isArray(list) ? list.length : 0 }));
      } catch {
        setStats((prev) => ({ ...prev, [role]: prev[role] ?? 0 }));
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPending = useCallback(async () => {
    setPendingLoading(true);
    setPendingError("");
    try {
      const res = await getPendingUsers();
      setPending(res.data.users || []);
    } catch (err) {
      setPendingError(err.response?.data?.message || "Unable to load pending requests.");
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const handleStatus = async (userId, status) => {
    setActionMsg("");
    try {
      await updateUserStatus(userId, status);
      setActionMsg(status === "active" ? "User approved successfully." : "User rejected.");
      await loadPending();
      await loadUsers(selectedTab);
    } catch (err) {
      setActionMsg(err.response?.data?.message || "Action failed.");
    }
  };

  const handleStatClick = (role) => {
    setSelectedTab(role);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const roleLabel = (r) =>
    r === "user" ? "Patient" : r.charAt(0).toUpperCase() + r.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.5fr]">

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-600 text-white text-2xl font-semibold">
                  A
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Administrator</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">{currentUser?.name || "Admin User"}</h2>
                  <p className="mt-1 text-sm text-slate-500">{currentUser?.email || ""}</p>
                </div>
              </div>
            </div>

            {/* Pending approvals button */}
            <button
              onClick={() => setShowPending((v) => !v)}
              className={`relative w-full rounded-3xl p-6 text-left shadow-sm ring-1 transition ${
                showPending
                  ? "bg-amber-600 text-white ring-amber-600"
                  : "bg-white text-slate-900 ring-slate-200 hover:ring-amber-300"
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${showPending ? "text-amber-100" : "text-slate-400"}`}>
                Approvals
              </p>
              <p className="mt-1 text-lg font-semibold">Pending Registrations</p>
              {pending.length > 0 && (
                <span className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                  {pending.length}
                </span>
              )}
              <p className={`mt-1 text-sm ${showPending ? "text-amber-100" : "text-slate-500"}`}>
                {pending.length === 0 ? "No pending requests" : `${pending.length} awaiting review`}
              </p>
            </button>

            {/* Manage Users button */}
            <button
              onClick={() => navigate("/manage-users")}
              className="w-full rounded-3xl bg-teal-600 p-6 text-left shadow-sm ring-1 ring-teal-600 transition hover:bg-teal-700"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-100">Administration</p>
              <p className="mt-1 text-lg font-semibold text-white">Manage Users</p>
              <p className="mt-1 text-sm text-teal-100">Show, update or delete doctors, nurses and patients.</p>
            </button>

            {/* Account info */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 text-sm text-slate-600 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Account Info</p>
              <div><p className="font-semibold text-slate-900">Name</p><p>{currentUser?.name || "-"}</p></div>
              <div><p className="font-semibold text-slate-900">Email</p><p>{currentUser?.email || "-"}</p></div>
              <div><p className="font-semibold text-slate-900">Role</p><p className="capitalize">{currentUser?.role || "admin"}</p></div>
            </div>
          </aside>

          {/* Main panel */}
          <section className="space-y-6">

            {/* Stats — clickable to switch tab */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Active Doctors",  role: "doctor",  color: "teal"   },
                { label: "Active Nurses",   role: "nurse",   color: "indigo" },
                { label: "Active Patients", role: "patient", color: "emerald" },
              ].map(({ label, role, color }) => (
                <button
                  key={role}
                  onClick={() => handleStatClick(role)}
                  className={`rounded-3xl border bg-white p-6 shadow-sm text-left transition hover:shadow-md active:scale-[0.98] ${
                    selectedTab === role
                      ? `ring-2 ring-${color}-400 border-${color}-200`
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {stats[role] === null ? (
                      <span className="inline-block h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
                    ) : (
                      stats[role]
                    )}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">Click to view list</p>
                </button>
              ))}
            </div>

            {/* Pending approvals panel */}
            {showPending && (
              <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">Action Required</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">Pending Registrations</h2>
                    <p className="mt-1 text-sm text-slate-500">Review and approve or reject each request.</p>
                  </div>
                </div>

                {actionMsg && (
                  <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {actionMsg}
                  </div>
                )}
                {pendingError && (
                  <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{pendingError}</div>
                )}

                {pendingLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}
                  </div>
                ) : pending.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                    No pending registration requests.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pending.map((u) => (
                      <div key={u._id || u.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm font-bold text-amber-700">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Registered as{" "}
                              <span className="font-medium text-slate-600 capitalize">{roleLabel(u.role)}</span>
                              {u.createdAt && (
                                <> &nbsp;&middot;&nbsp; {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatus(u._id || u.id, "active")}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatus(u._id || u.id, "rejected")}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users list */}
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Manage Users</p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-900">Active Users</h1>
                </div>
              </div>

              {/* Role tabs */}
              <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-2">
                {ROLE_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedTab(tab.value)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                      selectedTab === tab.value
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {tab.label}
                    {stats[tab.value] !== null && (
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        selectedTab === tab.value ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {stats[tab.value]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-4">
                  <p className="text-sm text-slate-500">
                    {loadingUsers
                      ? "Loading..."
                      : usersError
                      ? ""
                      : `${users.length} active ${selectedTab === "patient" ? "patients" : selectedTab + "s"}`}
                  </p>
                </div>

                {loadingUsers ? (
                  <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />)}</div>
                ) : usersError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{usersError}</div>
                ) : users.length === 0 ? (
                  <p className="text-sm text-slate-400">No active users in this group.</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((u) => (
                      <div key={u._id || u.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{roleLabel(u.role)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;
