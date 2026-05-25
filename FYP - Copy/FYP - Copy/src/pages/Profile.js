import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const roleTemplates = {
  doctor: {
    title: "Doctor",
    subtitle: "Medical professional profile",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "Dr. Maya Khanna" },
      { name: "email", label: "Email", type: "email", placeholder: "maya.khanna@hospital.com" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "gender", label: "Gender", type: "text", placeholder: "Female" },
      { name: "designation", label: "Designation", type: "text", placeholder: "Senior Cardiologist" },
      { name: "hospital", label: "Hospital Name", type: "text", placeholder: "City Heart Institute" },
      { name: "specialization", label: "Specialization", type: "text", placeholder: "Interventional Cardiology" },
      { name: "experience", label: "Experience", type: "text", placeholder: "12 years" },
      { name: "phone", label: "Phone", type: "tel", placeholder: "+1 415 555 0142" },
      { name: "license", label: "License Number", type: "text", placeholder: "DOC-98321" },
    ],
  },
  nurse: {
    title: "Nurse",
    subtitle: "Nursing staff profile",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "Ariana Brooks" },
      { name: "email", label: "Email", type: "email", placeholder: "ariana.brooks@citycare.org" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "gender", label: "Gender", type: "text", placeholder: "Female" },
      { name: "hospital", label: "Hospital Name", type: "text", placeholder: "City Care Hospital" },
      { name: "department", label: "Department", type: "text", placeholder: "Emergency" },
      { name: "experience", label: "Experience", type: "text", placeholder: "6 years" },
      { name: "phone", label: "Phone", type: "tel", placeholder: "+1 310 555 0198" },
      { name: "license", label: "License Number", type: "text", placeholder: "RN-48291" },
    ],
  },
  admin: {
    title: "Admin",
    subtitle: "Administrative staff profile",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "Zainab Ahmed" },
      { name: "email", label: "Email", type: "email", placeholder: "admin@nigehbaan.org" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "gender", label: "Gender", type: "text", placeholder: "Male" },
      { name: "adminId", label: "Admin ID", type: "text", placeholder: "ADM-2041" },
      { name: "organization", label: "Organization", type: "text", placeholder: "Nigehbaan Systems" },
      { name: "phone", label: "Phone", type: "tel", placeholder: "+1 212 555 0181" },
      { name: "roleDescription", label: "Role Description", type: "text", placeholder: "Platform administrator" },
    ],
  },
  patient: {
    title: "Patient",
    subtitle: "Elderly patient profile",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "Adeel Khan" },
      { name: "email", label: "Email", type: "email", placeholder: "adeel.khan@example.com" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "gender", label: "Gender", type: "text", placeholder: "Male" },
      { name: "patientId", label: "Patient ID", type: "text", placeholder: "PAT-1278" },
      { name: "address", label: "Address", type: "text", placeholder: "123 Main Street" },
      { name: "emergencyContact", label: "Emergency Contact", type: "tel", placeholder: "+1 415 555 0177" },
      { name: "primaryDoctor", label: "Primary Doctor", type: "text", placeholder: "Dr. Maya Khanna" },
      { name: "phone", label: "Phone", type: "tel", placeholder: "+1 415 555 0111" },
    ],
  },
};

function Profile() {
  const location = useLocation();
  const defaultRole = "patient";
  const initialRole = roleTemplates[location.state?.selectedRole]
    ? location.state.selectedRole
    : defaultRole;
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [formData, setFormData] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState("");

  const currentTemplate = roleTemplates[selectedRole] || roleTemplates[defaultRole];

  useEffect(() => {
    handleRoleSelect(selectedRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleSelect = (role) => {
    const safeRole = roleTemplates[role] ? role : defaultRole;
    setSelectedRole(safeRole);
    setMessage("");
    setPhotoPreview(null);

    const initialData = {};
    roleTemplates[safeRole].fields.forEach((field) => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, photo: file }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(`Created ${roleTemplates[selectedRole].title} profile for ${formData.fullName || "the user"}.`);
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
                to="/profile-selection"
                className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Back to Profile Type
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Create {currentTemplate.title} Profile</h2>
              <p className="mt-2 text-sm text-slate-500">Fill in the required details for the {currentTemplate.title.toLowerCase()} profile.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                {message && (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  {currentTemplate.fields.map((field) => (
                    <div key={field.name}>
                      <label className="text-sm font-medium text-slate-700">{field.label}</label>
                      <input
                        name={field.name}
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder || "Enter value"}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.75fr_1fr]">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none"
                    />
                    <p className="mt-2 text-sm text-slate-500">Upload an image for the selected profile.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">Preview</p>
                    <div className="mt-4 flex h-40 items-center justify-center overflow-hidden rounded-3xl bg-white">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <p className="text-sm text-slate-400">No picture selected</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    className="rounded-3xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    Create {roleTemplates[selectedRole].title} Profile
                  </button>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
          </section>
      </main>
    </div>
  );
}

export default Profile;
