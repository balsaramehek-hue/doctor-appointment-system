import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaPhone, FaCalendarCheck } from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { patientService } from '../services/apiService'

export default function ManagePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await patientService.getPatients()
        if (active && res?.success) setPatients(res.data.patients || [])
      } catch (err) {
        if (active) setError(err.message || 'Failed to load patients.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const formatDate = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return isNaN(d) ? '—' : d.toLocaleDateString()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Manage Patients</h1>
      <p className="mt-1 text-sm text-slate-500">{patients.length} registered patients</p>

      {loading ? (
        <LoadingSpinner text="Loading patients..." />
      ) : error ? (
        <EmptyState icon={FaUser} title="Couldn't load patients" message={error} />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={FaUser}
                title="No patients available"
                message="Registered patients will appear here once they sign up."
              />
            </div>
          ) : (
            patients.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-400">Joined {formatDate(p.joined)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-sm text-slate-500">
                  <p className="flex items-center gap-2"><FaEnvelope /> {p.email}</p>
                  <p className="flex items-center gap-2"><FaPhone /> {p.phone}</p>
                  <p className="flex items-center gap-2"><FaCalendarCheck /> {p.appointments} appointments</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
