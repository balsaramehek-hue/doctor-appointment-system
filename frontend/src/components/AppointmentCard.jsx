import { motion } from 'framer-motion'
import { FaUserMd, FaCalendarDay, FaClock, FaRupeeSign, FaCreditCard } from 'react-icons/fa'

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

export default function AppointmentCard({ appointment, onCancel, onPay }) {
  const status = appointment.status || 'pending'
  const paymentStatus = appointment.paymentStatus || 'pending'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <FaUserMd size={18} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{appointment.doctorName}</h4>
            <p className="text-xs text-slate-500">{appointment.specialization}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className={`badge ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <span className={`badge ${paymentStatusStyles[paymentStatus] || paymentStatusStyles.pending}`}>
            {paymentStatus === 'paid'
              ? 'Paid'
              : paymentStatus === 'failed'
              ? 'Failed'
              : paymentStatus === 'refunded'
              ? 'Refunded'
              : 'Pending'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <FaCalendarDay className="text-primary-500" /> {appointment.date}
        </span>
        <span className="flex items-center gap-2">
          <FaClock className="text-primary-500" /> {appointment.time}
        </span>
        <span className="flex items-center gap-2">
          <FaRupeeSign className="text-primary-500" /> {appointment.fee}
        </span>
        <span className="flex items-center gap-2">
          <FaCreditCard className="text-primary-500" /> {appointment.paymentMethod}
        </span>
      </div>

      {appointment.transactionId && (
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-600">Txn ID:</span> {appointment.transactionId}
        </p>
      )}

      {appointment.reason && (
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-600">Reason:</span>{' '}
          {appointment.reason}
        </p>
      )}

      {status === 'cancelled' && appointment.refundStatus === 'processed' && (
        <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <p>
            Cancellation fee: <b>₹{appointment.cancellationFee}</b> · Refund:{' '}
            <b>₹{appointment.refundAmount}</b>
          </p>
          {appointment.refundId && (
            <p className="mt-0.5 text-blue-600">Refund ID: {appointment.refundId}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-1">
        {(status === 'pending' || status === 'confirmed') && onCancel && (
          <button
            onClick={() => onCancel(appointment)}
            className="text-xs font-medium text-red-500 hover:underline"
          >
            Cancel Appointment
          </button>
        )}
        {paymentStatus === 'pending' && status !== 'cancelled' && onPay && (
          <button
            onClick={() => onPay(appointment.id)}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            Pay Now
          </button>
        )}
      </div>
    </motion.div>
  )
}
