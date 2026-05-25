import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Plans from "./pages/Plans";
import Dashboard from "./pages/Dashboard";
import Health from "./pages/Health";
import Alerts from "./pages/Alert";
import DoctorPerforma from "./pages/DoctorPerforma";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPerformas from "./pages/DoctorPerformas";
import DoctorHealthPerforma from "./pages/DoctorHealthPerforma";
import DoctorReportPerforma from "./pages/DoctorReportPerforma";
import DoctorPrescription from "./pages/DoctorPrescription";
import NurseDashboard from "./pages/NurseDashboard";
import NurseHealthPerforma from "./pages/NurseHealthPerforma";
import HealthHistory from "./pages/HealthHistory";
import PatientsList from "./pages/PatientsList";
import PatientDetail from "./pages/PatientDetail";
import Profile from "./pages/Profile";
import ProfileSelection from "./pages/ProfileSelection";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ForgotPassword from "./pages/ForgotPassword";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import AdminPanel from "./pages/AdminPanel";
import ManageUsers from "./pages/ManageUsers";
import ChatAI from "./pages/ChatAI";
import BookAppointment from "./pages/BookAppointment";
import Vitals from "./pages/Vitals";
import NurseShift from "./pages/NurseShift";
import DoctorAppointments from "./pages/DoctorAppointments";
import NurseAppointments from "./pages/NurseAppointments";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminFAQ from "./pages/AdminFAQ";
import AdminComplaints from "./pages/AdminComplaints";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import AskQuestion from "./pages/AskQuestion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Plans />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/health" element={<Health />} />
        <Route path="/alerts" element={<Navigate to="/sos" replace />} />
        <Route path="/doctor-performa" element={<DoctorPerforma />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-performas" element={<DoctorPerformas />} />
        <Route path="/doctor-health-performa" element={<DoctorHealthPerforma />} />
        <Route path="/doctor-report-performa" element={<DoctorReportPerforma />} />
        <Route path="/doctor-prescription" element={<DoctorPrescription />} />
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        <Route path="/nurse-health-performa" element={<NurseHealthPerforma />} />
        <Route path="/health-history" element={<HealthHistory />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/:patientId" element={<PatientDetail />} />
        <Route path="/caregiver-dashboard" element={<CaregiverDashboard />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/chat-ai" element={<ChatAI />} />
        <Route path="/sos" element={<Alerts />} />
        <Route path="/vitals" element={<Vitals />} />
        <Route path="/nurse-shift" element={<NurseShift />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/doctor-appointments" element={<DoctorAppointments />} />
        <Route path="/nurse-appointments" element={<NurseAppointments />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin-registrations" element={<AdminRegistrations />} />
        <Route path="/admin-faq" element={<AdminFAQ />} />
        <Route path="/admin-complaints" element={<AdminComplaints />} />
        <Route path="/submit-complaint" element={<SubmitComplaint />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/ask-question" element={<AskQuestion />} />
        <Route path="/profile-selection" element={<ProfileSelection />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
