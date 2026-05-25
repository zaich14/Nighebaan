import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const roleTemplates = {
  doctor: {
    title: "Doctor",
    subtitle: "Medical professional profile",
  },
  nurse: {
    title: "Nurse",
    subtitle: "Nursing staff profile",
  },
  admin: {
    title: "Admin",
    subtitle: "Administrative staff profile",
  },
  patient: {
    title: "Patient",
    subtitle: "Elderly patient profile",
  },
};

function ProfileSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate("/profile", { state: { selectedRole: role } });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create Profile</h1>
              <p className="mt-1 text-sm text-slate-500">Choose a profile type and provide the required details.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Profile Type</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Start by selecting a profile.</h2>
            <p className="mt-2 text-sm text-slate-500">Doctor, nurse, admin, or patient — choose the type first, then fill out the required fields.</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(roleTemplates).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleRoleSelect(key)}
                className="rounded-3xl border border-slate-200 bg-white px-5 py-6 text-left transition hover:border-teal-500 hover:bg-teal-50/50"
              >
                <p className="text-sm font-semibold text-slate-900">{template.title}</p>
                <p className="mt-2 text-sm text-slate-500">{template.subtitle}</p>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProfileSelection;