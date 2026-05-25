import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [user, setUser]           = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [logoMotionOpen, setLogoMotionOpen] = useState(false);
  const supportRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { setUser(null); }
    }
    const onStorage = () => {
      const r = localStorage.getItem("user");
      try { setUser(r ? JSON.parse(r) : null); } catch { setUser(null); }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setSupportOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setLogoMotionOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Close support dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (supportRef.current && !supportRef.current.contains(e.target)) {
        setSupportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const dashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "doctor")    return "/doctor-dashboard";
    if (user.role === "nurse")     return "/nurse-dashboard";
    if (user.role === "admin")     return "/admin-panel";
    if (user.role === "caregiver") return "/caregiver-dashboard";
    return "/dashboard";
  };

  const roleLabel = (role) => {
    if (role === "user")      return "Patient";
    if (role === "caregiver") return "Caregiver";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const isActive  = (path) => location.pathname === path;
  const isSupportActive = ["/my-complaints", "/ask-question"].includes(location.pathname);
  const navLink   = "text-sm font-medium transition whitespace-nowrap";
  const active    = "text-indigo-600 font-semibold";
  const inactive  = "text-slate-600 hover:text-indigo-600";

  // ── Reusable Support dropdown (desktop) ────────────────────────────────
  const SupportDropdown = () => (
    <div ref={supportRef} className="relative">
      <button
        onClick={() => setSupportOpen((v) => !v)}
        className={`${navLink} flex items-center gap-1 ${isSupportActive ? active : inactive}`}
      >
        Support
        <svg className={`h-3.5 w-3.5 transition-transform ${supportOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {supportOpen && (
        <div className="absolute left-0 top-full mt-2 w-44 rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 py-1.5 z-50">
          <Link
            to="/my-complaints"
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
          >
            Complaints
          </Link>
          <Link
            to="/ask-question"
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
          >
            Ask a Question
          </Link>
        </div>
      )}
    </div>
  );

  // ── Patient nav ─────────────────────────────────────────────────────────
  const patientNav = (
    <>
      <Link to="/dashboard"        className={`${navLink} ${isActive("/dashboard")        ? active : inactive}`}>Home</Link>
      <Link to="/vitals"           className={`${navLink} ${isActive("/vitals")           ? active : inactive}`}>Vitals</Link>
      <Link to="/book-appointment" className={`${navLink} ${isActive("/book-appointment") ? active : inactive}`}>Appointments</Link>
      <Link to="/chat-ai"          className={`${navLink} ${isActive("/chat-ai")          ? active : inactive}`}>AI Chat</Link>
      <Link to="/pricing"          className={`${navLink} ${isActive("/pricing")          ? active : inactive}`}>Upgrade Plan</Link>
      <SupportDropdown />
      <Link
        to="/sos"
        className="flex items-center gap-1.5 rounded-2xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700 whitespace-nowrap"
      >
        🆘 SOS
      </Link>
    </>
  );

  // ── Nurse nav ───────────────────────────────────────────────────────────
  const nurseNav = (
    <>
      <Link to="/nurse-dashboard"       className={`${navLink} ${isActive("/nurse-dashboard")       ? active : inactive}`}>Home</Link>
      <Link to="/nurse-health-performa" className={`${navLink} ${isActive("/nurse-health-performa") ? active : inactive}`}>Health Performa</Link>
      <Link to="/nurse-shift"           className={`${navLink} ${isActive("/nurse-shift")           ? active : inactive}`}>Shifts</Link>
      <Link to="/patients"              className={`${navLink} ${isActive("/patients")              ? active : inactive}`}>Patients</Link>
      <Link to="/pricing"               className={`${navLink} ${isActive("/pricing")               ? active : inactive}`}>Upgrade Plan</Link>
      <SupportDropdown />
    </>
  );

  // ── Doctor nav ──────────────────────────────────────────────────────────
  const doctorNav = (
    <>
      <Link to="/doctor-dashboard"    className={`${navLink} ${isActive("/doctor-dashboard")    ? active : inactive}`}>Home</Link>
      <Link to="/doctor-appointments" className={`${navLink} ${isActive("/doctor-appointments") ? active : inactive}`}>Appointments</Link>
      <Link to="/doctor-prescription" className={`${navLink} ${isActive("/doctor-prescription") ? active : inactive}`}>Prescription</Link>
      <Link to="/doctor-performas"    className={`${navLink} ${isActive("/doctor-performas")    ? active : inactive}`}>Performas</Link>
      <Link to="/pricing"             className={`${navLink} ${isActive("/pricing")             ? active : inactive}`}>Upgrade Plan</Link>
      <SupportDropdown />
    </>
  );

  // ── Admin nav ───────────────────────────────────────────────────────────
  const adminNav = (
    <>
      <Link to="/admin-panel"      className={`${navLink} ${isActive("/admin-panel")      ? active : inactive}`}>Home</Link>
      <Link to="/manage-users"     className={`${navLink} ${isActive("/manage-users")     ? active : inactive}`}>Manage Users</Link>
      <Link to="/admin-registrations" className={`${navLink} ${isActive("/admin-registrations") ? active : inactive}`}>Registrations</Link>
      <Link to="/admin-faq"        className={`${navLink} ${isActive("/admin-faq")        ? active : inactive}`}>FAQ Answers</Link>
      <Link to="/admin-complaints" className={`${navLink} ${isActive("/admin-complaints") ? active : inactive}`}>Complaints</Link>
    </>
  );

  // ── Generic nav ─────────────────────────────────────────────────────────
  const genericNav = (
    <>
      <Link to={dashboardLink()} className={`${navLink} ${inactive}`}>Home</Link>
      <Link to="/about"           className={`${navLink} ${inactive}`}>About</Link>
      <Link to="/contact"         className={`${navLink} ${inactive}`}>Contact</Link>
    </>
  );

  // ── Guest nav ───────────────────────────────────────────────────────────
  const guestNav = (
    <>
      <Link to="/"         className={`${navLink} ${isActive("/")         ? active : inactive}`}>Home</Link>
      <Link to="/about"    className={`${navLink} ${isActive("/about")    ? active : inactive}`}>About</Link>
      <Link to="/services" className={`${navLink} ${isActive("/services") ? active : inactive}`}>Services</Link>
      <Link to="/pricing"  className={`${navLink} ${isActive("/pricing")  ? active : inactive}`}>Pricing</Link>
      <Link to="/contact"  className={`${navLink} ${isActive("/contact")  ? active : inactive}`}>Contact</Link>
    </>
  );

  const isPatient = user?.role === "user" || user?.role === "caregiver";
  const isDoctor  = user?.role === "doctor";
  const isNurse   = user?.role === "nurse";
  const isAdmin   = user?.role === "admin";

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      {logoMotionOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4"
          onMouseDown={() => setLogoMotionOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-200"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLogoMotionOpen(false)}
              className="absolute right-4 top-4 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
            >
              Close
            </button>
            <img
              src="/nigehbaan-logo.jpeg"
              alt="Nigehbaan elder care service logo"
              className="mx-auto max-h-[78vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <button
            type="button"
            onClick={() => setLogoMotionOpen(true)}
            className="flex items-center gap-2.5 shrink-0 rounded-2xl text-left transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-teal-200"
            aria-label="Open Nigehbaan logo animation"
          >
            <img
              src="/nigehbaan-logo.jpeg"
              alt="Nigehbaan"
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <span className="text-xl font-bold text-slate-900 hidden sm:block">Nigehbaan</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-4">
            {!user                                             && guestNav}
            {user && isPatient                                 && patientNav}
            {user && isDoctor                                  && doctorNav}
            {user && isNurse                                   && nurseNav}
            {user && isAdmin                                   && adminNav}
            {user && !isPatient && !isDoctor && !isNurse && !isAdmin && genericNav}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate hidden sm:block">
                    {user.name}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 hidden sm:block">
                    {roleLabel(user.role)}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"  className="text-sm font-medium text-slate-700 transition hover:text-indigo-600">Login</Link>
                <Link to="/signup" className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Sign Up</Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden flex flex-col gap-1 p-2 rounded-xl hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-slate-700 transition-transform ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 w-5 bg-slate-700 transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-slate-700 transition-transform ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="lg:hidden mt-3 border-t border-slate-100 pt-3 pb-2 flex flex-col gap-3">
            {!user && (
              <>
                <Link to="/"         className={`${navLink} ${inactive}`}>Home</Link>
                <Link to="/about"    className={`${navLink} ${inactive}`}>About</Link>
                <Link to="/services" className={`${navLink} ${inactive}`}>Services</Link>
                <Link to="/pricing"  className={`${navLink} ${inactive}`}>Pricing</Link>
                <Link to="/contact"  className={`${navLink} ${inactive}`}>Contact</Link>
              </>
            )}
            {user && isPatient && (
              <>
                <Link to="/dashboard"        className={`${navLink} ${inactive}`}>Home</Link>
                <Link to="/vitals"           className={`${navLink} ${inactive}`}>Vitals</Link>
                <Link to="/book-appointment" className={`${navLink} ${inactive}`}>Appointments</Link>
                <Link to="/chat-ai"          className={`${navLink} ${inactive}`}>AI Chat</Link>
                <Link to="/pricing"          className={`${navLink} ${inactive}`}>Upgrade Plan</Link>
                <Link to="/my-complaints"    className={`${navLink} ${inactive}`}>Complaints</Link>
                <Link to="/ask-question"     className={`${navLink} ${inactive}`}>Ask a Question</Link>
                <Link to="/sos"              className="font-semibold text-rose-600 text-sm">🆘 SOS Emergency</Link>
              </>
            )}
            {user && isDoctor && (
              <>
                <Link to="/doctor-dashboard"    className={`${navLink} ${inactive}`}>Home</Link>
                <Link to="/doctor-appointments" className={`${navLink} ${inactive}`}>Appointments</Link>
                <Link to="/doctor-prescription" className={`${navLink} ${inactive}`}>Prescription</Link>
                <Link to="/doctor-performas"    className={`${navLink} ${inactive}`}>Performas</Link>
                <Link to="/pricing"             className={`${navLink} ${inactive}`}>Upgrade Plan</Link>
                <Link to="/my-complaints"       className={`${navLink} ${inactive}`}>Complaints</Link>
                <Link to="/ask-question"        className={`${navLink} ${inactive}`}>Ask a Question</Link>
              </>
            )}
            {user && isNurse && (
              <>
                <Link to="/nurse-dashboard"       className={`${navLink} ${inactive}`}>Home</Link>
                <Link to="/nurse-health-performa" className={`${navLink} ${inactive}`}>Health Performa</Link>
                <Link to="/nurse-shift"           className={`${navLink} ${inactive}`}>Shifts</Link>
                <Link to="/patients"              className={`${navLink} ${inactive}`}>Patients</Link>
                <Link to="/pricing"               className={`${navLink} ${inactive}`}>Upgrade Plan</Link>
                <Link to="/my-complaints"         className={`${navLink} ${inactive}`}>Complaints</Link>
                <Link to="/ask-question"          className={`${navLink} ${inactive}`}>Ask a Question</Link>
              </>
            )}
            {user && isAdmin && (
              <>
                <Link to="/admin-panel"      className={`${navLink} ${inactive}`}>Home</Link>
                <Link to="/manage-users"     className={`${navLink} ${inactive}`}>Manage Users</Link>
                <Link to="/admin-registrations" className={`${navLink} ${isActive("/admin-registrations") ? active : inactive}`}>Registrations</Link>
                <Link to="/admin-faq"        className={`${navLink} ${inactive}`}>FAQ Answers</Link>
                <Link to="/admin-complaints" className={`${navLink} ${inactive}`}>Complaints</Link>
              </>
            )}
            {user && !isPatient && !isDoctor && !isNurse && !isAdmin && (
              <>
                <Link to={dashboardLink()} className={`${navLink} ${inactive}`}>Home</Link>
                <Link to="/about"          className={`${navLink} ${inactive}`}>About</Link>
                <Link to="/contact"        className={`${navLink} ${inactive}`}>Contact</Link>
                <Link to="/pricing"        className={`${navLink} ${inactive}`}>Upgrade Plan</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
