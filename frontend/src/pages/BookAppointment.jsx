import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUserMd,
  FaCalendarDay,
  FaClock,
  FaCheck,
  FaChevronRight,
  FaRupeeSign,
  FaCalendarTimes,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingButton from '../components/LoadingButton'
import { doctorService, appointmentService, getImageUrl } from '../services/apiService'
import { useToast } from '../components/Toast'

// Generate next 14 days
function getNextDays(count = 14) {
  const days = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function BookAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [reason, setReason] = useState('')
  const [payment, setPayment] = useState('cash')
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked] = useState(null)
  const [serverError, setServerError] = useState('')

  const [bookedSlots, setBookedSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const days = useMemo(() => getNextDays(14), [])

  // Fetch the doctor from the backend.
  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await doctorService.getDoctor(id)
        if (active && res?.success) setDoctor(res.data.doctor)
      } catch (err) {
        if (active) setError(err.message || 'Failed to load doctor.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  // Fetch booked slots for the selected date.
  useEffect(() => {
    if (!doctor || !selectedDate) return
    let active = true
    const loadSlots = async () => {
      setSlotsLoading(true)
      try {
        const res = await appointmentService.getBookedSlots(doctor.id, selectedDate)
        if (active && res?.success) {
          setBookedSlots(res.data.booked?.[selectedDate] || [])
        }
      } catch {
        if (active) setBookedSlots([])
      } finally {
        if (active) setSlotsLoading(false)
      }
    }
    loadSlots()
    return () => {
      active = false
    }
  }, [doctor, selectedDate])

  if (loading) {
    return (
      <div className="container-px mx-auto max-w-3xl py-20">
        <LoadingSpinner text="Loading doctor..." />
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="container-px mx-auto max-w-3xl py-20">
        <EmptyState
          icon={FaUserMd}
          title="Doctor not found"
          message={error || 'This doctor could not be loaded.'}
        />
      </div>
    )
  }

  const isOnLeave = doctor.availability?.isCurrentlyOnLeave
  const isUnavailable = doctor.status === 'inactive' || isOnLeave
  const unavailableDates = doctor.availability?.unavailableDates || []
  const unavailableDays = doctor.availability?.unavailableDays || []

  const slots = doctor.slots || doctor.availableTimeSlots || []

  const handleSubmit = async () => {
    setSubmitting(true)
    setServerError('')
    try {
      const res = await appointmentService.book({
        doctorId: doctor.id,
        date: selectedDate,
        time: selectedTime,
        reason,
        paymentMethod: payment,
      })
      if (res?.success) {
        const appt = res.data.appointment
        toast.success('Appointment booked successfully!')
        setBooked({
          id: appt.id || appt.appointmentId,
          doctorName: doctor.name,
          date: selectedDate,
          time: selectedTime,
          fee: doctor.fee,
          paymentMethod: payment,
          paymentStatus: appt.paymentStatus,
        })
      } else {
        setServerError(res?.message || 'Booking failed. Please try again.')
        toast.error(res?.message || 'Booking failed')
      }
    } catch (err) {
      setServerError(err.message || 'Booking failed. Please try again.')
      toast.error(err.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProceedToPayment = () => {
    if (booked) {
      navigate(`/payment/${booked.id}`)
    }
  }

  if (booked) {
    return (
      <div className="container-px mx-auto max-w-xl py-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card p-8 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <FaCheck size={30} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Appointment Confirmed!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Your appointment has been booked successfully.
          </p>
          <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-5 text-left text-sm">
            <p><span className="text-slate-500">Appointment ID:</span> <b>{booked.id}</b></p>
            <p><span className="text-slate-500">Doctor:</span> {booked.doctorName}</p>
            <p><span className="text-slate-500">Date:</span> {booked.date}</p>
            <p><span className="text-slate-500">Time:</span> {booked.time}</p>
            <p><span className="text-slate-500">Fee:</span> ₹{booked.fee}</p>
            <p><span className="text-slate-500">Payment Method:</span> {booked.paymentMethod}</p>
            <p><span className="text-slate-500">Payment Status:</span> <b className={booked.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}>{booked.paymentStatus?.toUpperCase()}</b></p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            {booked.paymentStatus !== 'paid' && (
              <button onClick={handleProceedToPayment} className="btn-primary">
                <FaRupeeSign /> Proceed to Payment
              </button>
            )}
            <button onClick={() => navigate('/dashboard')} className="btn-outline">
              Go to Dashboard
            </button>
            <button onClick={() => navigate('/doctors')} className="btn-outline">
              Book Another
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isUnavailable) {
    return (
      <div className="container-px mx-auto max-w-3xl py-20">
        <div className="card p-8 text-center">
          <FaCalendarTimes className="mx-auto text-4xl text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {isOnLeave ? 'Doctor is on leave' : 'Doctor is currently unavailable'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isOnLeave
              ? `This doctor is on leave until ${doctor.availability?.leaveEnd ? new Date(doctor.availability.leaveEnd).toLocaleDateString() : 'further notice'}.`
              : 'This doctor is not available for booking at the moment.'}
          </p>
          {doctor.availability?.nextAvailableDate && (
            <p className="mt-2 text-sm text-primary-600">
              Next available: {new Date(doctor.availability.nextAvailableDate).toLocaleDateString()}
            </p>
          )}
          <button onClick={() => navigate('/doctors')} className="btn-outline mt-6">
            Back to Doctors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-px mx-auto max-w-4xl py-10">
      <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {s}
            </div>
            <span className="text-sm text-slate-500">
              {s === 1 ? 'Select Doctor' : s === 2 ? 'Select Date' : 'Time & Details'}
            </span>
            {s < 3 && <FaChevronRight className="text-slate-300" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* Doctor summary */}
        <div className="card p-5 md:col-span-1">
          <img
            src={getImageUrl(doctor.image)}
            alt={doctor.name}
            className="h-32 w-32 rounded-full object-cover mx-auto"
          />
          <h3 className="mt-3 text-center font-semibold text-slate-900">
            {doctor.name}
          </h3>
          <p className="text-center text-sm text-primary-600">{doctor.specialization}</p>
          <p className="mt-2 text-center text-sm text-slate-500">
            ₹{doctor.fee} / consult
          </p>
        </div>

        {/* Step content */}
        <div className="card p-6 md:col-span-2">
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-slate-900">Confirm Doctor</h3>
              <p className="mt-1 text-sm text-slate-500">
                You are booking with {doctor.name}.
              </p>
              <button
                onClick={() => setStep(2)}
                className="btn-primary mt-6"
              >
                Continue <FaChevronRight />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                <FaCalendarDay /> Select Date
              </h3>
              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {days.map((d) => {
                  const iso = d.toISOString().split('T')[0]
                  const dayName = dayNames[d.getDay()]
                  const notAvailableDay = !(doctor.availableDays || []).includes(dayName)
                  const blockedDay = unavailableDays.includes(dayName)
                  const blockedDate = unavailableDates.includes(iso)
                  const disabled = notAvailableDay || blockedDay || blockedDate || isUnavailable
                  const active = selectedDate === iso
                  return (
                    <button
                      key={iso}
                      disabled={disabled}
                      onClick={() => {
                        setSelectedDate(iso)
                        setSelectedTime('')
                      }}
                      className={`rounded-xl border p-2 text-center text-xs transition ${
                        active
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : disabled
                          ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                          : 'border-slate-200 hover:border-primary-300'
                      }`}
                      title={
                        blockedDate || blockedDay
                          ? 'Doctor unavailable'
                          : isOnLeave
                          ? 'Doctor on leave'
                          : ''
                      }
                    >
                      <p className="font-medium">{dayName}</p>
                      <p className="text-base font-bold">{d.getDate()}</p>
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost">
                  Back
                </button>
                <button
                  disabled={!selectedDate}
                  onClick={() => setStep(3)}
                  className="btn-primary"
                >
                  Continue <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                <FaClock /> Available Time Slots
              </h3>
              {slotsLoading ? (
                <LoadingSpinner size="sm" text="Loading slots..." />
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot)
                    const active = selectedTime === slot
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          isBooked
                            ? 'cursor-not-allowed border-red-100 bg-red-50 text-red-400 line-through'
                            : active
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 hover:border-primary-300'
                        }`}
                      >
                        {slot}
                        {isBooked && (
                          <span className="block text-[10px]">Booked</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {serverError && (
                <p className="mt-4 text-sm text-red-500">{serverError}</p>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="label">Reason for visit</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your symptoms"
                    className="input resize-none"
                  />
                </div>
                <div>
                  <label className="label">Payment Option</label>
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    className="input"
                  >
                    <option value="cash">Cash at Hospital</option>
                    <option value="card">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="gpay">Google Pay</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(2)} className="btn-ghost">
                  Back
                </button>
                <LoadingButton
                  disabled={!selectedTime}
                  loading={submitting}
                  onClick={handleSubmit}
                  className="btn-primary"
                >
                  Confirm Booking
                </LoadingButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
