import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaCalendarDay,
  FaEnvelope,
  FaCog,
  FaChartBar,
  FaHospital,
} from 'react-icons/fa'
import LoadingSpinner from '../components/LoadingSpinner'
import { dashboardService } from '../services/apiService'

const quickActions = [
  { to: '/admin/doctors?add=1', label: 'Add Doctor', icon: FaUserMd, color: 'text-primary-600 bg-primary-50' },
  { to: '/admin/appointments', label: 'View Appointments', icon: FaCalendarCheck, color: 'text-green-600 bg-green-50' },
  { to: '/admin/patients', label: 'Manage Patients', icon: FaUsers, color: 'text-accent-600 bg-accent-50' },
  { to: '/admin/messages', label: 'View Messages', icon: FaEnvelope, color: 'text-purple-600 bg-purple-50' },
  { to: '/admin/settings#departments', label: 'Add Department', icon: FaHospital, color: 'text-orange-600 bg-orange-50' },
  { to: '/admin/appointments?export=1', label: 'Generate Reports', icon: FaChartBar, color: 'text-blue-600 bg-blue-50' },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todaysAppointments: 0,
    completed: 0,
    cancelled: 0,
    confirmed: 0,
    pending: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await dashboardService.getStats()
        if (active && res?.success) setStats(res.data.stats)
      } catch (err) {
        if (active) setError(err.message || 'Failed to load stats.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const cards = [
    { label: 'Total Doctors', value: stats.totalDoctors, icon: FaUserMd, color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Patients', value: stats.totalPatients.toLocaleString(), icon: FaUsers, color: 'text-accent-600 bg-accent-50' },
    { label: 'Total Appointments', value: stats.totalAppointments.toLocaleString(), icon: FaCalendarCheck, color: 'text-purple-600 bg-purple-50' },
    { label: "Today's Appointments", value: stats.todaysAppointments, icon: FaCalendarDay, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Hospital overview at a glance.
      </p>

      {loading ? (
        <LoadingSpinner text="Loading stats..." />
      ) : error ? (
        <div className="mt-6 card p-6 text-sm text-red-500">{error}</div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card flex items-center gap-4 p-5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}>
                  <c.icon />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                  <p className="text-xs text-slate-500">{c.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Navigate to common admin tasks.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {quickActions.map((action, i) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="card flex flex-col items-center gap-3 p-4 text-center transition hover:shadow-md"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}
                  >
                    <action.icon size={22} />
                  </motion.div>
                  <span className="text-xs font-medium text-slate-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-8 card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Appointment Summary</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                <p className="text-xs text-amber-600">Pending</p>
              </div>
              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
                <p className="text-xs text-green-600">Confirmed</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
                <p className="text-xs text-blue-600">Completed</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
                <p className="text-xs text-red-600">Cancelled</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-primary-50 p-4 text-center">
              <p className="text-2xl font-bold text-primary-700">₹{stats.revenue?.toLocaleString() || 0}</p>
              <p className="text-xs text-primary-600">Total Revenue</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
