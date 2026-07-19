import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { FaThLarge, FaUser, FaCalendarCheck, FaEnvelope } from 'react-icons/fa'

const items = [
  { to: '/dashboard', end: true, label: 'Dashboard', icon: <FaThLarge /> },
  { to: '/dashboard/profile', label: 'My Profile', icon: <FaUser /> },
  { to: '/dashboard/appointments', label: 'My Appointments', icon: <FaCalendarCheck /> },
  { to: '/dashboard/contact', label: 'Contact', icon: <FaEnvelope /> },
]

export default function PatientLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={items} title="Patient Panel" />
      <div className="flex-1 overflow-x-hidden">
        <div className="container-px mx-auto max-w-5xl py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
