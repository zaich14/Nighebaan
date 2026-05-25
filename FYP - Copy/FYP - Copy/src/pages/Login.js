import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const role = res.data.user?.role;
      if (role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (role === "nurse") {
        navigate("/nurse-dashboard");
      } else if (role === "admin") {
        navigate("/admin-panel");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message;
      if (msg === "pending_approval") {
        setError("pending");
      } else if (msg === "rejected") {
        setError("rejected");
      } else {
        setError("invalid");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto mb-8 flex max-w-6xl items-center gap-3">
        <img
          src="/nigehbaan-logo.jpeg"
          alt="Nigehbaan"
          className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200"
        />
        <div>
          <p className="text-2xl font-bold text-slate-900">Nigehbaan</p>
          <p className="text-sm text-slate-500">Elder care service</p>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className="mb-8 text-center">
            <img
              src="/nigehbaan-logo.jpeg"
              alt="Nigehbaan"
              className="mx-auto h-20 w-20 rounded-3xl object-cover shadow-sm ring-1 ring-slate-200"
            />
            <h1 className="mt-6 text-3xl font-semibold text-slate-900">Sign In</h1>
            <p className="mt-3 text-slate-500">Access health monitoring and alerts for your care network.</p>
          </div>

          {error === "pending" && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Account pending approval</p>
              <p className="mt-1">Your registration is awaiting admin verification. You will be able to log in once the admin approves your account.</p>
            </div>
          )}
          {error === "rejected" && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Registration rejected</p>
              <p className="mt-1">Your account request was not approved. Please contact the administrator for more information.</p>
            </div>
          )}
          {error === "invalid" && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">Invalid email or password. Please try again.</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-4 w-full rounded-2xl bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Donâ€™t have an account? <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">Register</Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-700">Forgot Password?</Link>
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-3xl bg-indigo-700 text-white p-10 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
              Modern elder care
            </div>
            <h2 className="mt-8 text-3xl font-semibold">Quick access to care insights</h2>
            <p className="mt-4 text-slate-200">View vitals, alerts, appointments and reminders from one secure place.</p>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Real-time vitals</p>
              <p className="mt-3 text-lg font-semibold">Monitor heart rate, blood pressure, and oxygen levels.</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Medication reminders</p>
              <p className="mt-3 text-lg font-semibold">Stay on schedule with smart alerts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
