import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FaCalendarTimes, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import AppointmentCard from '../components/AppointmentCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingButton from '../components/LoadingButton'
import Modal from '../components/Modal'
import { appointmentService } from '../services/apiService'
import { useToast } from '../components/Toast'

const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

function getCancelEstimate(fee) {
  const amount = Number(fee) || 0
  let cancellationFee = amount > 0 ? Math.round(amount * 0.2) : 0
  if (cancellationFee < 50 && amount >= 50) cancellationFee = 50
  if (cancellationFee > amount) cancellationFee = amount
  return {
    fee: amount,
    cancellationFee,
    refundAmount: Math.max(0, amount - cancellationFee),
  }
}

export default function Appointments() {
  const navigate = useNavigate()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [resultModal, setResultModal] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await appointmentService.getMyAppointments()
      if (res?.success) setList(res.data.appointments || [])
    } catch (err) {
      setError(err.message || 'Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(
    () => (filter === 'all' ? list : list.filter((a) => a.status === filter)),
    [list, filter]
  )

  const estimate = cancelTarget
    ? getCancelEstimate(cancelTarget.fee)
    : null
  const isPaidCancel =
    cancelTarget?.paymentStatus === 'paid' && (Number(cancelTarget?.fee) || 0) > 0

  const confirmCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const res = await appointmentService.cancelMyAppointment(cancelTarget.id)
      if (res?.success) {
        const updated = res.data.appointment
        const refund = res.data.refund
        setList((prev) =>
          prev.map((a) => (a.id === cancelTarget.id ? { ...a, ...updated } : a))
        )
        setCancelTarget(null)
        setResultModal({
          title: 'Appointment Cancelled',
          message: res.message,
          refund,
        })
      } else {
        toast.error(res?.message || 'Failed to cancel appointment')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment')
    } finally {
      setCancelling(false)
    }
  }

  const handlePay = (id) => {
    navigate(`/payment/${id}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
      <p className="mt-1 text-sm text-slate-500">
        Track and manage all your bookings.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {loading ? (
          <div className="col-span-full">
            <LoadingSpinner text="Loading appointments..." />
          </div>
        ) : error ? (
          <div className="col-span-full">
            <EmptyState icon={FaCalendarTimes} title="Couldn't load appointments" message={error} />
          </div>
        ) : (
          <AnimatePresence>
            {filtered.length ? (
              filtered.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onCancel={cancelling ? undefined : setCancelTarget}
                  onPay={handlePay}
                />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={FaCalendarTimes}
                  title="No appointments found"
                  message="Your appointments will appear here once you book with a doctor."
                />
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => !cancelling && setCancelTarget(null)}
        title="Cancel Appointment"
        size="md"
      >
        {cancelTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to cancel your appointment with{' '}
              <b>{cancelTarget.doctorName}</b> on <b>{cancelTarget.date}</b> at{' '}
              <b>{cancelTarget.time}</b>?
            </p>

            {isPaidCancel && estimate && (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span>Paid amount</span>
                  <b>₹{estimate.fee}</b>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Cancellation fee (20%)</span>
                  <b>− ₹{estimate.cancellationFee}</b>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-green-700">
                  <span>Refund to be returned</span>
                  <b>₹{estimate.refundAmount}</b>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  The refund will be credited to your original payment method.
                </p>
              </div>
            )}

            {!isPaidCancel && (
              <p className="text-sm text-slate-500">
                No online payment was collected for this booking.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-ghost"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
              >
                Keep Appointment
              </button>
              <LoadingButton
                loading={cancelling}
                onClick={confirmCancel}
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                Confirm Cancel
              </LoadingButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Result / refund message modal */}
      <Modal
        open={!!resultModal}
        onClose={() => setResultModal(null)}
        title={resultModal?.title || 'Cancelled'}
        size="md"
      >
        {resultModal && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <FaCheckCircle size={28} />
            </div>
            <p className="text-sm text-slate-600">{resultModal.message}</p>

            {resultModal.refund?.refundStatus === 'processed' && (
              <div className="rounded-xl bg-blue-50 p-4 text-left text-sm text-blue-900 space-y-2">
                <div className="flex justify-between">
                  <span>Paid amount</span>
                  <b>₹{resultModal.refund.paidAmount}</b>
                </div>
                <div className="flex justify-between">
                  <span>Cancellation fee deducted</span>
                  <b>₹{resultModal.refund.cancellationFee}</b>
                </div>
                <div className="flex justify-between">
                  <span>Refund amount</span>
                  <b>₹{resultModal.refund.refundAmount}</b>
                </div>
                {resultModal.refund.refundId && (
                  <p className="text-xs text-blue-600 pt-1">
                    Refund ID: {resultModal.refund.refundId}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => setResultModal(null)}
            >
              OK
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
