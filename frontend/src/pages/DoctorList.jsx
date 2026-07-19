import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaUserMd } from 'react-icons/fa'
import DoctorCard from '../components/DoctorCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { doctorService } from '../services/apiService'

export default function DoctorList() {
  const [search, setSearch] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [availability, setAvailability] = useState('')
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDoctors = useCallback(async (params = {}) => {
    setLoading(true)
    setError('')
    try {
      const res = await doctorService.getDoctors(params)
      if (res?.success) {
        setDoctors(res.data.doctors || [])
        // Build the specialization dropdown from the returned doctors.
        const map = new Map()
        ;(res.data.doctors || []).forEach((d) => {
          const name = d.specialization
          if (name && !map.has(name)) map.set(name, { id: name, name })
        })
        setDepartments(Array.from(map.values()))
      }
    } catch (err) {
      setError(err.message || 'Failed to load doctors.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + refetch whenever a filter changes.
  useEffect(() => {
    const params = {}
    if (search.trim()) params.search = search.trim()
    if (specialization) params.specialization = specialization
    if (availability) params.availability = availability
    fetchDoctors(params)
  }, [search, specialization, availability, fetchDoctors])

  const filtered = useMemo(() => doctors, [doctors])

  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <div className="text-center">
        <h1 className="section-title">Find a Doctor</h1>
        <p className="section-subtitle">
          Browse our network of verified specialists and book instantly.
        </p>
      </div>

      {/* Filters */}
      <div className="card mt-8 flex flex-col gap-4 p-5 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="label">Search by name</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Dr. Amit"
              className="input pl-10"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="label">Specialization</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="input"
          >
            <option value="">All Specializations</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Availability</label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="input"
          >
            <option value="">Any Day</option>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="mt-6 text-sm text-slate-500">
        {loading ? 'Loading...' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {loading ? (
        <LoadingSpinner text="Loading doctors..." />
      ) : error ? (
        <EmptyState icon={FaUserMd} title="Couldn't load doctors" message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FaUserMd}
          title="No doctors available"
          message="We couldn't find any doctors matching your filters."
        />
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DoctorCard doctor={d} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
