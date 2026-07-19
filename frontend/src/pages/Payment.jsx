import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaCreditCard,
  FaLock,
  FaCheck,
  FaExclamationCircle,
  FaRupeeSign,
  FaUserMd,
  FaCalendarDay,
  FaClock,
  FaDownload,
  FaPrint,
  FaUniversity,
  FaMobileAlt,
} from 'react-icons/fa'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingButton from '../components/LoadingButton'
import { appointmentService } from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const paymentMethods = [
  { value: 'card', label: 'Credit Card', icon: FaCreditCard },
  { value: 'debit', label: 'Debit Card', icon: FaCreditCard },
  { value: 'gpay', label: 'Google Pay', icon: FaMobileAlt },
  { value: 'upi', label: 'UPI', icon: FaMobileAlt },
  { value: 'netbanking', label: 'Net Banking', icon: FaUniversity },
  { value: 'cash', label: 'Cash at Hospital', icon: FaRupeeSign },
]

const METHOD_LABELS = {
  card: 'Credit Card',
  debit: 'Debit Card',
  gpay: 'Google Pay',
  upi: 'UPI',
  netbanking: 'Net Banking',
  cash: 'Cash at Hospital',
}

export default function Payment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const receiptRef = useRef(null)
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  })
  const [upiId, setUpiId] = useState('')
  const [bankName, setBankName] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        // Prefer direct fetch by appointment id / APT code
        const res = await appointmentService.getAppointment(id)
        if (res?.success && res.data.appointment) {
          setAppointment(res.data.appointment)
          if (res.data.appointment.paymentMethod) {
            setPaymentMethod(res.data.appointment.paymentMethod)
          }
        } else {
          setError('Appointment not found')
        }
      } catch (err) {
        // Fallback: scan my appointments
        try {
          const listRes = await appointmentService.getMyAppointments()
          if (listRes?.success) {
            const found = listRes.data.appointments.find(
              (a) => a.id === id || a._id === id
            )
            if (found) {
              setAppointment(found)
              if (found.paymentMethod) setPaymentMethod(found.paymentMethod)
            } else {
              setError('Appointment not found')
            }
          }
        } catch {
          setError(err.message || 'Failed to load appointment.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const needsCard = paymentMethod === 'card' || paymentMethod === 'debit'
  const needsUpi = paymentMethod === 'upi' || paymentMethod === 'gpay'
  const needsBank = paymentMethod === 'netbanking'

  const handlePayment = async () => {
    if (needsCard) {
      if (!cardDetails.number || cardDetails.number.length < 12) {
        setError('Please enter a valid card number')
        return
      }
      if (!cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        setError('Please fill in all card details')
        return
      }
    }
    if (needsUpi && !upiId.trim()) {
      setError('Please enter your UPI ID')
      return
    }
    if (needsBank && !bankName.trim()) {
      setError('Please select a bank')
      return
    }

    setProcessing(true)
    setError('')
    try {
      const payload = {
        paymentMethod,
        cardDetails: needsCard
          ? {
              last4: cardDetails.number.slice(-4),
              brand: cardDetails.number.startsWith('4')
                ? 'Visa'
                : cardDetails.number.startsWith('5')
                ? 'Mastercard'
                : 'Card',
            }
          : undefined,
      }
      const res = await appointmentService.processPayment(id, payload)
      if (res?.success) {
        setSuccess(res.data.appointment)
        if (res.data.appointment.paymentStatus === 'paid') {
          toast.success('Payment successful!')
        } else if (res.data.appointment.paymentStatus === 'pending') {
          toast.success('Cash payment noted. Pay at the hospital.')
        } else {
          toast.error('Payment failed. Please try again.')
        }
      } else {
        setError(res?.message || 'Payment failed. Please try again.')
        toast.error(res?.message || 'Payment failed')
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
      toast.error(err.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const downloadReceipt = () => {
    if (!success) return
    const method = METHOD_LABELS[success.paymentMethod] || success.paymentMethod
    const content = `
MediCare Hospital — Payment Receipt
====================================
Hospital Name: MediCare Hospital
Appointment Number: ${success.id}
Patient Name: ${success.patientName || user?.name || '—'}
Doctor Name: ${success.doctorName}
Date: ${success.date}
Time: ${success.time}
Payment Method: ${method}
Amount: ₹${success.fee}
Transaction ID: ${success.transactionId || '—'}
Payment Status: ${(success.paymentStatus || '').toUpperCase()}
====================================
Thank you for choosing MediCare.
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${success.id}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container-px mx-auto max-w-3xl py-20">
        <LoadingSpinner text="Loading payment details..." />
      </div>
    )
  }

  if (error && !appointment) {
    return (
      <div className="container-px mx-auto max-w-3xl py-20">
        <div className="card p-8 text-center text-red-600">{error}</div>
      </div>
    )
  }

  if (success) {
    const method = METHOD_LABELS[success.paymentMethod] || success.paymentMethod
    return (
      <div className="container-px mx-auto max-w-2xl py-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card p-8 text-center"
          ref={receiptRef}
          id="payment-receipt"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <FaCheck size={30} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Payment {success.paymentStatus === 'paid' ? 'Successful' : success.paymentStatus === 'pending' ? 'Recorded' : 'Failed'}!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {success.paymentStatus === 'paid'
              ? 'Your appointment has been confirmed.'
              : success.paymentStatus === 'pending'
              ? 'Please pay at the hospital reception.'
              : 'Payment could not be processed. Please try again or contact support.'}
          </p>
          <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-5 text-left text-sm">
            <p><span className="text-slate-500">Hospital Name:</span> <b>MediCare Hospital</b></p>
            <p><span className="text-slate-500">Appointment Number:</span> <b>{success.id}</b></p>
            <p><span className="text-slate-500">Patient Name:</span> {success.patientName || user?.name || '—'}</p>
            <p><span className="text-slate-500">Doctor Name:</span> {success.doctorName}</p>
            <p><span className="text-slate-500">Date:</span> {success.date}</p>
            <p><span className="text-slate-500">Time:</span> {success.time}</p>
            <p><span className="text-slate-500">Payment Method:</span> {method}</p>
            <p><span className="text-slate-500">Amount:</span> ₹{success.fee}</p>
            <p><span className="text-slate-500">Transaction ID:</span> {success.transactionId || '—'}</p>
            <p>
              <span className="text-slate-500">Payment Status:</span>{' '}
              <b className={
                success.paymentStatus === 'paid'
                  ? 'text-green-600'
                  : success.paymentStatus === 'failed'
                  ? 'text-red-600'
                  : 'text-amber-600'
              }>
                {(success.paymentStatus || '').toUpperCase()}
              </b>
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate('/dashboard/appointments')} className="btn-primary">
              View Appointments
            </button>
            <button onClick={downloadReceipt} className="btn-outline">
              <FaDownload /> Download Receipt
            </button>
            <button onClick={() => window.print()} className="btn-outline">
              <FaPrint /> Print Receipt
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container-px mx-auto max-w-4xl py-10">
      <h1 className="text-2xl font-bold text-slate-900">Complete Payment</h1>
      <p className="mt-1 text-sm text-slate-500">
        Secure placeholder payment flow (Stripe / Razorpay ready).
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-900">Appointment Summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <FaUserMd className="text-primary-500" />
              <div>
                <p className="font-medium text-slate-800">{appointment?.doctorName}</p>
                <p className="text-xs text-slate-500">{appointment?.specialization}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaCalendarDay className="text-primary-500" />
              <p className="text-slate-600">{appointment?.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <FaClock className="text-primary-500" />
              <p className="text-slate-600">{appointment?.time}</p>
            </div>
            <div className="flex items-center gap-3">
              <FaRupeeSign className="text-primary-500" />
              <p className="text-lg font-bold text-slate-900">₹{appointment?.fee}</p>
            </div>
            <p className="text-xs text-slate-400">#{appointment?.id}</p>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-900">Select Payment Method</h3>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {paymentMethods.map((pm) => (
              <button
                key={pm.value}
                type="button"
                onClick={() => setPaymentMethod(pm.value)}
                className={`rounded-xl border-2 p-3 text-center text-sm font-medium transition ${
                  paymentMethod === pm.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 hover:border-primary-300'
                }`}
              >
                <pm.icon className="mx-auto mb-1 text-lg" />
                {pm.label}
              </button>
            ))}
          </div>

          {needsCard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              <h4 className="font-medium text-slate-700">Card Details</h4>
              <div>
                <label className="label">Card Number</label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) =>
                    setCardDetails({
                      ...cardDetails,
                      number: e.target.value.replace(/\D/g, '').slice(0, 16),
                    })
                  }
                  placeholder="1234 5678 9012 3456"
                  className="input"
                  maxLength={16}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Expiry Date</label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '').slice(0, 4)
                      if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2)
                      setCardDetails({ ...cardDetails, expiry: val })
                    }}
                    placeholder="MM/YY"
                    className="input"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                      })
                    }
                    placeholder="***"
                    className="input"
                    maxLength={4}
                  />
                </div>
              </div>
              <div>
                <label className="label">Cardholder Name</label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  placeholder="John Doe"
                  className="input"
                />
              </div>
            </motion.div>
          )}

          {needsUpi && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              <h4 className="font-medium text-slate-700">
                {paymentMethod === 'gpay' ? 'Google Pay' : 'UPI'} Details
              </h4>
              <div>
                <label className="label">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@upi"
                  className="input"
                />
              </div>
            </motion.div>
          )}

          {needsBank && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              <h4 className="font-medium text-slate-700">Net Banking</h4>
              <div>
                <label className="label">Select Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input"
                >
                  <option value="">Choose a bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="Axis">Axis Bank</option>
                  <option value="Kotak">Kotak Mahindra Bank</option>
                </select>
              </div>
            </motion.div>
          )}

          {paymentMethod === 'cash' && (
            <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You will pay ₹{appointment?.fee} at the hospital reception. No online charge now.
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <FaExclamationCircle /> {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              <FaLock className="mr-1 inline" />
              Secure payment
            </div>
            <LoadingButton
              onClick={handlePayment}
              loading={processing}
              className="btn-primary"
            >
              {paymentMethod === 'cash' ? 'Confirm Cash Payment' : `Pay ₹${appointment?.fee}`}
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  )
}
