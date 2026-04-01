import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminDoctors from '@/pages/admin/AdminDoctors';
import AdminPatients from '@/pages/admin/AdminPatients';
import AdminBilling from '@/pages/admin/AdminBilling';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';

// Doctor
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import DoctorAppointments from '@/pages/doctor/DoctorAppointments';
import DoctorPatients from '@/pages/doctor/DoctorPatients';
import DoctorPrescriptions from '@/pages/doctor/DoctorPrescriptions';

// Patient
import PatientDashboard from '@/pages/patient/PatientDashboard';
import PatientAppointments from '@/pages/patient/PatientAppointments';
import PatientPrescriptions from '@/pages/patient/PatientPrescriptions';
import PatientReports from '@/pages/patient/PatientReports';
import PatientBilling from '@/pages/patient/PatientBilling';

// Receptionist
import ReceptionistDashboard from '@/pages/receptionist/ReceptionistDashboard';
import ReceptionistPatients from '@/pages/receptionist/ReceptionistPatients';
import ReceptionistAppointments from '@/pages/receptionist/ReceptionistAppointments';
import ReceptionistBilling from '@/pages/receptionist/ReceptionistBilling';

// Shared
import SettingsPage from '@/pages/settings/SettingsPage';

import { useAuthStore } from '@/store/authStore';
import { ReactNode } from 'react';

const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'ADMIN': return <Navigate to="/admin" replace />;
    case 'DOCTOR': return <Navigate to="/doctor" replace />;
    case 'PATIENT': return <Navigate to="/patient" replace />;
    case 'RECEPTIONIST': return <Navigate to="/receptionist" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/billing" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminBilling /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorPrescriptions /></ProtectedRoute>} />
          <Route path="/doctor/settings" element={<ProtectedRoute allowedRoles={['DOCTOR']}><SettingsPage /></ProtectedRoute>} />

          {/* Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientAppointments /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientPrescriptions /></ProtectedRoute>} />
          <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientReports /></ProtectedRoute>} />
          <Route path="/patient/billing" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientBilling /></ProtectedRoute>} />
          <Route path="/patient/settings" element={<ProtectedRoute allowedRoles={['PATIENT']}><SettingsPage /></ProtectedRoute>} />
          {/* Receptionist Routes */}
          <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path="/receptionist/patients" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><ReceptionistPatients /></ProtectedRoute>} />
          <Route path="/receptionist/appointments" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><ReceptionistAppointments /></ProtectedRoute>} />
          <Route path="/receptionist/billing" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><ReceptionistBilling /></ProtectedRoute>} />
          <Route path="/receptionist/settings" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><SettingsPage /></ProtectedRoute>} />
        </Route>

        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
