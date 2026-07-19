import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUserMd,
} from 'react-icons/fa'
import AppointmentCard from '../components/AppointmentCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { appointmentService } from '../services/apiService'

export default function Dashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await appointmentService.getMyAppointments()
        if (active && res?.success) setAppointments(res.data.appointments || [])
      } catch (err) {
        if (active) setError(err.message || 'Failed to load appointments.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const upcoming = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  )
  const completed = appointments.filter((a) => a.status === 'completed')
  const cancelled = appointments.filter((a) => a.status === 'cancelled')

  const stats = [
    { label: 'Upcoming', value: upcoming.length, icon: FaClock, color: 'text-primary-600 bg-primary-50' },
    { label: 'Completed', value: completed.length, icon: FaCheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Cancelled', value: cancelled.length, icon: FaTimesCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Total', value: appointments.length, icon: FaCalendarCheck, color: 'text-accent-600 bg-accent-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome, {user?.name || 'Patient'} 👋
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Here's an overview of your appointments.
      </p>

      <Link
        to="/doctors"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-primary-700"
      >
        <FaUserMd /> Book an Appointment
      </Link>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card flex items-center gap-4 p-5"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
          <Link to="/dashboard/appointments" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {loading ? (
            <LoadingSpinner text="Loading appointments..." />
          ) : error ? (
            <EmptyState icon={FaCalendarCheck} title="Couldn't load appointments" message={error} />
          ) : upcoming.length ? (
            upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} />)
          ) : (
            <EmptyState
              icon={FaCalendarCheck}
              title="No upcoming appointments"
              message="Your upcoming appointments will appear here once you book one."
            />
          )}
        </div>
      </div>
    </div>
  )
}
