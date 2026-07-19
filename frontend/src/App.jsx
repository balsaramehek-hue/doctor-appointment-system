import { Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import ProtectedRoute from './routes/ProtectedRoute'

import Home from './pages/Home'
import DoctorList from './pages/DoctorList'
import DoctorDetails from './pages/DoctorDetails'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Payment from './pages/Payment'
import BookAppointment from './pages/BookAppointment'
import NotFound from './pages/NotFound'

import PatientLayout from './patient/PatientLayout'
import PatientDashboard from './patient/Dashboard'
import PatientProfile from './patient/Profile'
import PatientAppointments from './patient/Appointments'
import ChangePassword from './patient/ChangePassword'
import MyMessages from './patient/MyMessages'

import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/Dashboard'
import ManageDoctors from './admin/ManageDoctors'
import ManagePatients from './admin/ManagePatients'
import ManageAppointments from './admin/ManageAppointments'
import Messages from './admin/Messages'
import Settings from './admin/Settings'

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword switchToLogin={() => window.history.back()} />} />
        <Route path="/reset-password" element={<ResetPassword switchToLogin={() => window.history.back()} />} />
      </Route>

      {/* Payment (requires login) */}
      <Route
        path="/payment/:id"
        element={
          <ProtectedRoute role="patient">
            <Payment />
          </ProtectedRoute>
        }
      />

      {/* Booking (requires login) */}
      <Route
        path="/book/:id"
        element={
          <ProtectedRoute role="patient">
            <BookAppointment />
          </ProtectedRoute>
        }
      />

      {/* Patient dashboard */}
      <Route
        element={
          <ProtectedRoute role="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/dashboard/profile" element={<PatientProfile />} />
        <Route path="/dashboard/appointments" element={<PatientAppointments />} />
        <Route path="/dashboard/contact" element={<MyMessages />} />
        <Route path="/dashboard/change-password" element={<ChangePassword />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="doctors" element={<ManageDoctors />} />
        <Route path="patients" element={<ManagePatients />} />
        <Route path="appointments" element={<ManageAppointments />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
