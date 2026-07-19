import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaCheck,
  FaTimes,
  FaFlagCheckered,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarTimes,
  FaSearch,
  FaFilter,
  FaDownload,
  FaTrash,
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import { appointmentService } from '../services/apiService'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

const paymentStatusStyles = {
  pending: 'bg-slate-100 text-slate-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
}

export default function ManageAppointments() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (statusFilter) params.status = statusFilter
      const res = await appointmentService.getAppointments(params)
      if (res?.success) setList(res.data.appointments || [])
    } catch (err) {
      setError(err.message || 'Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      const res = await appointmentService.updateStatus(id, status)
      if (res?.success) {
        setList((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
        const label = status.charAt(0).toUpperCase() + status.slice(1)
        toast.success(`Appointment ${label.toLowerCase()}`)
      } else {
        toast.error(res?.message || 'Failed to update status.')
      }
    } catch (err) {
      setError(err.message || 'Failed to update status.')
      toast.error(err.message || 'Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await appointmentService.deleteAppointment(deleteTarget.id)
      if (res?.success) {
        setList((prev) => prev.filter((a) => a.id !== deleteTarget.id))
        toast.success('Appointment deleted successfully')
        setDeleteTarget(null)
      } else {
        toast.error(res?.message || 'Failed to delete appointment.')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete appointment.')
      toast.error(err.message || 'Failed to delete appointment.')
    } finally {
      setDeleting(false)
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Patient', 'Email', 'Phone', 'Doctor', 'Specialization', 'Date', 'Time', 'Status', 'Payment', 'Amount', 'Transaction ID', 'Payment Method']
    const rows = list.map((a) => [
      a.id,
      a.patientName,
      a.patientEmail,
      a.patientPhone,
      a.doctorName,
      a.specialization,
      a.date,
      a.time,
      a.status,
      a.paymentStatus,
      a.fee,
      a.transactionId || '',
      a.paymentMethod || '',
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `appointments-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  // Auto-export when navigated from Quick Action "Generate Reports"
  useEffect(() => {
    if (searchParams.get('export') === '1' && list.length > 0 && !loading) {
      exportCSV()
      searchParams.delete('export')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, list, loading])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and update patient bookings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-outline text-xs">
            <FaFilter /> Filters
          </button>
          <button onClick={exportCSV} className="btn-outline text-xs" disabled={list.length === 0}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 card p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient name, email, phone, or appointment ID..."
                className="input pl-10"
              />
            </div>
          </div>
          {showFilters && (
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading appointments..." />
      ) : error ? (
        <EmptyState icon={FaCalendarTimes} title="Couldn't load appointments" message={error} />
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                <th className="py-3 pr-4">Patient</th>
                <th className="py-3 pr-4">Contact</th>
                <th className="py-3 pr-4">Doctor</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={FaCalendarTimes}
                      title="No appointments found"
                      message="Patient appointments will appear here once they are booked."
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {list.map((a) => (
                    <motion.tr
                      key={a.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-100 text-sm"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800">{a.patientName || '—'}</p>
                        <p className="text-xs text-slate-400">#{a.id}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-500">
                        <p className="flex items-center gap-1 text-xs"><FaPhone /> {a.patientPhone || '—'}</p>
                        <p className="flex items-center gap-1 text-xs"><FaEnvelope /> {a.patientEmail || '—'}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800">{a.doctorName}</p>
                        <p className="text-xs text-slate-400">{a.specialization}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{a.date}</td>
                      <td className="py-3 pr-4 text-slate-600">{a.time}</td>
                      <td className="py-3 pr-4">
                        <span className={`badge ${statusStyles[a.status]}`}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <span className={`badge ${paymentStatusStyles[a.paymentStatus] || paymentStatusStyles.pending}`}>
                            {a.paymentStatus === 'paid'
                              ? 'Paid'
                              : a.paymentStatus === 'failed'
                              ? 'Failed'
                              : a.paymentStatus === 'refunded'
                              ? 'Refunded'
                              : 'Pending'}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">{a.paymentMethod}</span>
                          {a.transactionId && (
                            <span className="text-[10px] text-slate-400">{a.transactionId}</span>
                          )}
                          {a.refundStatus === 'processed' && (
                            <span className="text-[10px] text-blue-600">
                              Fee ₹{a.cancellationFee} · Refund ₹{a.refundAmount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          {a.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(a.id, 'confirmed')}
                                disabled={updating === a.id}
                                className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 disabled:opacity-40"
                                title="Confirm"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => updateStatus(a.id, 'cancelled')}
                                disabled={updating === a.id}
                                className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 disabled:opacity-40"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {a.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(a.id, 'completed')}
                              disabled={updating === a.id}
                              className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 disabled:opacity-40"
                              title="Mark Completed"
                            >
                              <FaFlagCheckered />
                            </button>
                          )}
                          {(a.status === 'pending' || a.status === 'confirmed') && (
                            <button
                              onClick={() => updateStatus(a.id, 'cancelled')}
                              disabled={updating === a.id}
                              className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 disabled:opacity-40"
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(a)}
                            className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Appointment"
        message={
          deleteTarget
            ? `Are you sure you want to delete appointment #${deleteTarget.id} for ${deleteTarget.patientName || 'this patient'}? This action cannot be undone.`
            : 'Are you sure you want to delete this appointment?'
        }
        confirmLabel="Delete Appointment"
      />
    </div>
  )
}
