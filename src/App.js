import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import SymptomChecker from './pages/patient/SymptomChecker';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MyPrescriptions from './pages/patient/MyPrescriptions';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import AppointmentDetail from './pages/doctor/AppointmentDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DoctorManagement from './pages/admin/DoctorManagement';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif' },
            success: { style: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' } },
            error:   { style: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Navigate to="/login" replace />} />

          {/* Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route element={<DashboardLayout role="patient" />}>
              <Route path="/patient/dashboard"    element={<PatientDashboard />} />
              <Route path="/patient/profile"      element={<PatientProfile />} />
              <Route path="/patient/symptoms"     element={<SymptomChecker />} />
              <Route path="/patient/book"         element={<BookAppointment />} />
              <Route path="/patient/appointments" element={<MyAppointments />} />
              <Route path="/patient/prescriptions"element={<MyPrescriptions />} />
            </Route>
          </Route>

          {/* Doctor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route element={<DashboardLayout role="doctor" />}>
              <Route path="/doctor/dashboard"      element={<DoctorDashboard />} />
              <Route path="/doctor/appointments"   element={<DoctorAppointments />} />
              <Route path="/doctor/appointments/:id" element={<AppointmentDetail />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout role="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users"     element={<UserManagement />} />
              <Route path="/admin/doctors"   element={<DoctorManagement />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
