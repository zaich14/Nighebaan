import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser } from "../services/api";

const roleTemplates = {
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
};

function Signup() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingName, setPendingName] = useState(null);
  const navigate = useNavigate();
  const submitting = useRef(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({});
    setPhotoPreview(null);
    setError("");
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

  const handleSignup = async () => {
    if (submitting.current) return;

    if (!selectedRole) {
      setError("Please select a registration type.");
      return;
    }

    const { email } = formData;
    if (!email || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    submitting.current = true;
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach((key) => {
        if (key === "photo" && formData[key]) {
          formDataToSend.append("photo", formData[key]);
        } else if (key === "fullName") {
          formDataToSend.append("name", formData[key] || "");
        } else {
          formDataToSend.append(key, formData[key] || "");
        }
      });
      
      formDataToSend.append("password", password);
      formDataToSend.append("role", selectedRole === "patient" ? "user" : selectedRole);

      const response = await registerUser(formDataToSend);

      // Admin accounts are activated immediately
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/admin-panel");
        return;
      }

      // Everyone else is pending approval
      if (response.data.message === "pending_approval") {
        setPendingName(response.data.name || formData.fullName || "");
        return;
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || err.message || "Unable to create account. Please try again."
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const currentTemplate = selectedRole ? roleTemplates[selectedRole] : null;

  if (pendingName !== null) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-3xl">
              ⏳
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">Registration Submitted</h2>
            <p className="mt-3 text-slate-600">
              Hi <span className="font-semibold text-slate-900">{pendingName}</span>, your account request has been received.
            </p>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 text-left space-y-2">
              <p className="font-semibold">What happens next?</p>
              <p>• The admin has been notified of your registration request.</p>
              <p>• Once your credentials are verified and approved, you will be able to log in.</p>
              <p>• If you are rejected, you will see a message on the login page.</p>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Already approved?{" "}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                Sign in here
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!selectedRole ? (
          <div>
            <div className="mb-10 text-center">
              <img src="/logo.jpeg" alt="Nigehbaan Logo" className="mx-auto h-16 w-16 rounded-full object-cover mb-4" />
              <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Register</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Create your Nigehbaan account
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-slate-600">
                Choose your registration type to get started with Nigehbaan. Select the role that best describes you.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 max-w-5xl mx-auto">
              {Object.entries(roleTemplates).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRoleSelect(key)}
                  className="rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:border-teal-500 hover:bg-teal-50/50"
                >
                  <p className="text-sm font-semibold text-slate-900">{template.title}</p>
                  <p className="mt-2 text-sm text-slate-500">{template.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole(null);
                  setFormData({});
                  setError("");
                }}
                className="mb-6 text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-2"
              >
                ← Back to role selection
              </button>
              <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Register as {currentTemplate.title}</p>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
                {currentTemplate.title} Registration
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Fill in your details below to create a {currentTemplate.title.toLowerCase()} account on Nigehbaan.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Secure registration</h2>
                  <p className="mt-3 text-slate-600">Your account and data are encrypted and stored securely.</p>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Complete profile</h2>
                  <p className="mt-3 text-slate-600">Provide all required details for a complete registration.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-10 shadow-2xl shadow-slate-900/5">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-semibold text-slate-900">Sign up now</h2>
                <p className="mt-3 text-slate-500">Complete your {currentTemplate.title.toLowerCase()} registration.</p>
              </div>

              {error && (
                <div className="mb-6 rounded-3xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {currentTemplate.fields.map((field) => (
                    <div key={field.name}>
                      <label className="text-sm font-medium text-slate-700">{field.label}</label>
                      <input
                        name={field.name}
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Create a password"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Confirm password</label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Confirm your password"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.75fr_1fr]">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none"
                    />
                    <p className="mt-2 text-sm text-slate-500">Upload a profile photo (optional).</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">Preview</p>
                    <div className="mt-4 flex h-40 items-center justify-center overflow-hidden rounded-3xl bg-white">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile Preview" className="h-full w-full object-cover" />
                      ) : (
                        <p className="text-sm text-slate-400">No picture selected</p>
                      )}
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  I agree to the <Link to="/terms" className="font-semibold text-teal-700 hover:text-teal-800">terms</Link> and <Link to="/privacy-policy" className="font-semibold text-teal-700 hover:text-teal-800">privacy policy</Link>.
                </label>

                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="mt-4 w-full rounded-3xl bg-teal-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
                >
                  {loading ? "Creating account..." : `Create ${currentTemplate.title} Account`}
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already registered? <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">Sign in</Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Signup;

