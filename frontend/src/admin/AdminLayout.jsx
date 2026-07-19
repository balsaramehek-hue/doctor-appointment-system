import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import {
  FaThLarge,
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaEnvelope,
  FaCog,
} from 'react-icons/fa'

const items = [
  { to: '/admin', end: true, label: 'Dashboard', icon: <FaThLarge /> },
  { to: '/admin/doctors', label: 'Manage Doctors', icon: <FaUserMd /> },
  { to: '/admin/patients', label: 'Manage Patients', icon: <FaUsers /> },
  { to: '/admin/appointments', label: 'Manage Appointments', icon: <FaCalendarCheck /> },
  { to: '/admin/messages', label: 'Contact Messages', icon: <FaEnvelope /> },
  { to: '/admin/settings', label: 'Settings', icon: <FaCog /> },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={items} title="Admin Panel" />
      <div className="flex-1 overflow-x-hidden">
        <div className="container-px mx-auto max-w-6xl py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
