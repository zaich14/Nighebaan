import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUsers, deleteUser, updateUser } from "../services/api";

const TABS = [
  { label: "Doctors",  value: "doctor"  },
  { label: "Nurses",   value: "nurse"   },
  { label: "Patients", value: "patient" },
];

const FIELD_LABELS = {
  name: "Full Name", email: "Email", phone: "Phone", gender: "Gender",
  dob: "Date of Birth", designation: "Designation", hospital: "Hospital",
  specialization: "Specialization", experience: "Experience", license: "License No.",
  department: "Department", address: "Address", role: "Role", status: "Status",
  createdAt: "Registered",
};

const EDITABLE_FIELDS = {
  doctor:  ["name","email","phone","gender","dob","designation","hospital","specialization","experience","license"],
  nurse:   ["name","email","phone","gender","dob","hospital","department","experience","license"],
  patient: ["name","email","phone","gender","dob","address"],
};

function formatValue(key, val) {
  if (!val && val !== 0) return "—";
  if (key === "createdAt") return new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (key === "dob") return new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (key === "role") return val === "user" ? "Patient" : val.charAt(0).toUpperCase() + val.slice(1);
  if (Array.isArray(val)) return val.join(", ") || "—";
  return String(val);
}

// ── Show Modal ────────────────────────────────────────────────────────────────
function ShowModal({ user, onClose }) {
  const skip = new Set(["password", "_id", "id", "photo", "profileData", "__v"]);
  const entries = Object.entries(user).filter(([k]) => !skip.has(k));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-600">User Profile</p>
            <h2 className="mt-0.5 text-xl font-semibold text-slate-900">{user.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-8 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {entries.map(([key, val]) => (
              <div key={key} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {FIELD_LABELS[key] || key}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 break-words">{formatValue(key, val)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 px-8 py-4 text-right">
          <button onClick={onClose} className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Update Modal ──────────────────────────────────────────────────────────────
function UpdateModal({ user, tabRole, onClose, onSaved }) {
  const fields = EDITABLE_FIELDS[tabRole] || ["name", "email", "phone"];
  const [form, setForm] = useState(() => {
    const init = {};
    fields.forEach((f) => { init[f] = user[f] || ""; });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateUser(user._id || user.id, form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">Edit Profile</p>
            <h2 className="mt-0.5 text-xl font-semibold text-slate-900">{user.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-8 py-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f}>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {FIELD_LABELS[f] || f}
                </label>
                <input
                  type={f === "dob" ? "date" : f === "email" ? "email" : "text"}
                  value={form[f]}
                  onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-8 py-4">
          <button onClick={onClose} className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteUser(user._id || user.id);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-xl mx-auto">⚠</div>
        <h2 className="mt-4 text-center text-xl font-semibold text-slate-900">Delete User?</h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          You are about to permanently delete <span className="font-semibold text-slate-800">{user.name}</span>. This action cannot be undone.
        </p>
        {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function ManageUsers() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("doctor");
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [successMsg, setSuccessMsg]   = useState("");
  const loadReqId = useRef(0);

  const [showUser,   setShowUser]   = useState(null);
  const [updateUser_, setUpdateUser] = useState(null);
  const [deleteUser_, setDeleteUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== "admin") navigate("/admin-panel");
    } catch { navigate("/login"); }
  }, [navigate]);

  const loadUsers = useCallback(async (role) => {
    const reqId = ++loadReqId.current;
    setLoading(true);
    setError("");
    try {
      const res = await getUsers(role);
      if (reqId !== loadReqId.current) return;
      setUsers(res.data.users || []);
    } catch (err) {
      if (reqId !== loadReqId.current) return;
      setError(err.response?.data?.message || "Unable to load users.");
    } finally {
      if (reqId === loadReqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(selectedTab); }, [selectedTab, loadUsers]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleted = () => {
    setDeleteUser(null);
    flash("User deleted successfully.");
    loadUsers(selectedTab);
  };

  const handleSaved = () => {
    setUpdateUser(null);
    flash("User updated successfully.");
    loadUsers(selectedTab);
  };

  const roleLabel = (r) => r === "user" ? "Patient" : r.charAt(0).toUpperCase() + r.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {showUser   && <ShowModal   user={showUser}   onClose={() => setShowUser(null)} />}
      {updateUser_ && <UpdateModal user={updateUser_} tabRole={selectedTab} onClose={() => setUpdateUser(null)} onSaved={handleSaved} />}
      {deleteUser_ && <DeleteModal user={deleteUser_} onClose={() => setDeleteUser(null)} onDeleted={handleDeleted} />}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/admin-panel")}
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              ← Back to Admin Panel
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Administration</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Manage Users</h1>
            <p className="mt-1 text-sm text-slate-500">View, update, or remove doctors, nurses and patients.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {successMsg}
          </div>
        )}

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-2 mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                  selectedTab === tab.value
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Count */}
          {!loading && !error && (
            <p className="mb-4 text-sm text-slate-500">
              {users.length} {selectedTab === "patient" ? "patients" : selectedTab + "s"} found
            </p>
          )}

          {/* States */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3,4].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          )}
          {!loading && !error && users.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
              No users found in this group.
            </div>
          )}

          {/* User rows */}
          {!loading && !error && users.length > 0 && (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u._id || u.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Avatar + info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                          {roleLabel(u.role)}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                        {u.designation && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{u.designation}</span>
                        )}
                        {u.department && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{u.department}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setShowUser(u)}
                      className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Show
                    </button>
                    <button
                      onClick={() => setUpdateUser(u)}
                      className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setDeleteUser(u)}
                      className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ManageUsers;
