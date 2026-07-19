import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaStar, FaUserMd, FaBriefcase, FaRupeeSign, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa'
import { BsCalendarCheck } from 'react-icons/bs'
import { getImageUrl } from '../services/apiService'

export default function DoctorCard({ doctor }) {
  const [imgError, setImgError] = useState(false)
  const initials = doctor.name
    .replace('Dr. ', '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isOnLeave = doctor.availability?.isCurrentlyOnLeave
  const isUnavailable = doctor.status === 'inactive' || isOnLeave

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="card overflow-hidden group"
    >
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
        {imgError || !doctor.image ? (
          <span className="text-5xl font-bold text-primary-600">{initials}</span>
        ) : (
          <img
            src={getImageUrl(doctor.image)}
            alt={doctor.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <span className="badge bg-white/90 text-primary-700 absolute top-3 left-3">
          <FaUserMd /> {doctor.specialization}
        </span>
        {isOnLeave && (
          <span className="badge bg-red-100 text-red-700 absolute top-3 right-3">
            <FaCalendarTimes /> On Leave
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{doctor.name}</h3>
          <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
            <FaStar /> {doctor.rating}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">{doctor.qualification}</p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="badge bg-slate-100">
            <FaBriefcase /> {doctor.experience} yrs exp
          </span>
          <span className="badge bg-slate-100">
            <BsCalendarCheck /> {doctor.availableDays?.join(', ') || 'N/A'}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm font-semibold text-accent-600">
            <FaRupeeSign /> {doctor.fee} <span className="text-slate-400 font-normal">/ consult</span>
          </span>
          <Link
            to={`/doctors/${doctor.id}`}
            className="btn-outline px-4 py-2 text-xs"
          >
            View Profile
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
