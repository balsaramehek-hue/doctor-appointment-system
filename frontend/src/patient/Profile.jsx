import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaEnvelope, FaPhone, FaIdBadge, FaLock } from 'react-icons/fa'

export default function Profile() {
  const { user } = useAuth()
  const fields = [
    { icon: FaUser, label: 'Full Name', value: user?.name },
    { icon: FaEnvelope, label: 'Email', value: user?.email },
    { icon: FaPhone, label: 'Phone', value: user?.phone || '+91 98765 00000' },
    { icon: FaIdBadge, label: 'Patient ID', value: user?.id },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your personal information.</p>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-600">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">Patient</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label} className="rounded-xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <f.icon /> {f.label}
              </p>
              <p className="mt-1 font-medium text-slate-800">{f.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-outline">Edit Profile</button>
          <Link to="/dashboard/change-password" className="btn-ghost">
            <FaLock /> Change Password
          </Link>
        </div>
      </div>
    </div>
  )
}
