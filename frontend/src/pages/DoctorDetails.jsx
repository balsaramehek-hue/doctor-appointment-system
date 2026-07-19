import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaStar,
  FaUserMd,
  FaBriefcase,
  FaGraduationCap,
  FaHospital,
  FaRupeeSign,
  FaCalendarCheck,
  FaArrowLeft,
  FaCalendarTimes,
  FaClock,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import Login from './Login'
import Register from './Register'
import { doctorService, getImageUrl } from '../services/apiService'

export default function DoctorDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authModal, setAuthModal] = useState(null)

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
          message={error || "This doctor's profile could not be loaded."}
          action={
            <Link to="/doctors" className="btn-outline mt-2">
              Back to Doctors
            </Link>
          }
        />
      </div>
    )
  }

  const handleBook = () => {
    if (!isAuthenticated) {
      setAuthModal('login')
    } else {
      navigate(`/book/${doctor.id}`)
    }
  }

  const isOnLeave = doctor.availability?.isCurrentlyOnLeave
  const nextAvailable = doctor.availability?.nextAvailableDate

  return (
    <div className="container-px mx-auto max-w-6xl py-10">
      <Link
        to="/doctors"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600"
      >
        <FaArrowLeft /> Back to Doctors
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden lg:col-span-1"
        >
          <img
            src={getImageUrl(doctor.image)}
            alt={doctor.name}
            className="h-64 w-full object-cover"
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-900">{doctor.name}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-primary-600">
              <FaUserMd /> {doctor.specialization}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-amber-500">
                <FaStar /> {doctor.rating}
              </span>
              <span className="text-slate-400">({doctor.reviews} reviews)</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <FaBriefcase className="text-primary-500" /> {doctor.experience} years experience
              </p>
              <p className="flex items-center gap-2">
                <FaGraduationCap className="text-primary-500" /> {doctor.qualification}
              </p>
              <p className="flex items-center gap-2">
                <FaHospital className="text-primary-500" /> {doctor.department || doctor.specialization}
              </p>
              <p className="flex items-center gap-2">
                <FaRupeeSign className="text-primary-500" /> ₹{doctor.fee} per consultation
              </p>
              <p className="flex items-center gap-2">
                <FaCalendarCheck className="text-primary-500" /> {(doctor.availableDays || []).join(', ')}
              </p>
            </div>

            {/* Availability Status */}
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Availability</p>
              {isOnLeave ? (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-red-600">
                    <FaCalendarTimes />
                    <span className="text-sm font-medium">On Leave</span>
                  </div>
                  {doctor.availability?.leaveReason && (
                    <p className="text-xs text-slate-500">Reason: {doctor.availability.leaveReason}</p>
                  )}
                </div>
              ) : doctor.status === 'inactive' ? (
                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <FaCalendarTimes />
                  <span className="text-sm font-medium">Unavailable</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-green-600">
                  <FaCalendarCheck />
                  <span className="text-sm font-medium">Available</span>
                </div>
              )}
              {nextAvailable && (
                <p className="mt-1 text-xs text-slate-500">
                  Next available: {new Date(nextAvailable).toLocaleDateString()}
                </p>
              )}
              {(doctor.availability?.unavailableDays || []).length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Unavailable days: {doctor.availability.unavailableDays.join(', ')}
                </p>
              )}
            </div>

            <button
              onClick={handleBook}
              disabled={isOnLeave || doctor.status === 'inactive'}
              className="btn-primary mt-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOnLeave || doctor.status === 'inactive' ? 'Currently Unavailable' : 'Book Appointment'}
            </button>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 lg:col-span-2"
        >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">About Doctor</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {doctor.about}
            </p>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FaGraduationCap className="text-primary-500" /> Education
            </h3>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
              {(doctor.education || []).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FaHospital className="text-primary-500" /> Hospital Information
            </h3>
            <p className="mt-3 text-sm text-slate-600">{doctor.hospital}</p>
            <p className="mt-1 text-sm text-slate-500">
              Available days: {(doctor.availableDays || []).join(', ')}
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Available Appointment Slots
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(doctor.slots || doctor.availableTimeSlots || []).map((s) => (
                <span key={s} className="badge bg-primary-50 text-primary-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Modal
        open={!!authModal}
        onClose={() => setAuthModal(null)}
        title={authModal === 'register' ? 'Create Account' : 'Login to Book'}
      >
        {authModal === 'register' ? (
          <Register
            onSuccess={() => setAuthModal(null)}
            switchToLogin={() => setAuthModal('login')}
          />
        ) : (
          <Login
            onSuccess={() => setAuthModal(null)}
            switchToRegister={() => setAuthModal('register')}
          />
        )}
      </Modal>
    </div>
  )
}
