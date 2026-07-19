import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaUserMd,
  FaAmbulance,
  FaCalendarCheck,
  FaHeartbeat,
  FaArrowRight,
  FaPhoneAlt,
  FaThLarge,
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { doctorService } from '../services/apiService'

const services = [
  { icon: FaUserMd, title: 'Expert Doctors', desc: 'Verified specialists across 20+ departments.' },
  { icon: FaAmbulance, title: '24/7 Emergency', desc: 'Round-the-clock emergency & critical care.' },
  { icon: FaCalendarCheck, title: 'Online Appointment', desc: 'Book in seconds from anywhere, anytime.' },
  { icon: FaHeartbeat, title: 'Free Ambulance', desc: 'Complimentary ambulance service in city limits.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await doctorService.getDoctors({ limit: 6 })
        if (active && res?.success) setDoctors(res.data.doctors || [])
      } catch {
        // Departments section handles empty state
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const departments = useMemo(() => {
    const map = new Map()
    doctors.forEach((d) => {
      const name = d.department || d.specialization
      if (name && !map.has(name)) map.set(name, { name, count: 0 })
      if (name) map.get(name).count += 1
    })
    return Array.from(map.values())
  }, [doctors])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container-px mx-auto grid max-w-7xl items-center gap-10 py-20 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <span className="badge bg-white/15 text-white">
              <FaHeartbeat /> Trusted by 10,000+ patients
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Book Appointment With Trusted Doctors
            </h1>
            <p className="mt-4 max-w-md text-primary-100">
              Connect with experienced specialists, get online consultations and
              manage your health — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/doctors" className="btn bg-white text-primary-700 hover:bg-primary-50">
                Search Doctors <FaArrowRight />
              </Link>
              <a href="tel:108" className="btn border border-white/30 text-white hover:bg-white/10">
                <FaPhoneAlt /> Emergency: 108
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-primary-100">
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p>Expert Doctors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50k+</p>
                <p>Happy Patients</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p>Support</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80"
              alt="Doctor"
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-slate-800 shadow-card">
              <FaAmbulance className="text-accent-500" size={24} />
              <div>
                <p className="text-sm font-semibold">Free Ambulance</p>
                <p className="text-xs text-slate-500">Available 24/7</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick services */}
      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <s.icon size={26} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="text-center">
          <h2 className="section-title">Medical Departments</h2>
          <p className="section-subtitle">
            Comprehensive care across all major specialties.
          </p>
        </div>
        <div className="mt-10">
          {loading ? (
            <LoadingSpinner text="Loading departments..." />
          ) : departments.length === 0 ? (
            <EmptyState
              icon={FaThLarge}
              title="No departments available"
              message="Department information will appear here once doctors are added."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {departments.map((dep) => (
                <motion.div
                  key={dep.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="card p-6 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <FaThLarge size={26} />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{dep.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {dep.count} specialist{dep.count !== 1 ? 's' : ''}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="rounded-3xl bg-gradient-to-r from-accent-500 to-accent-700 p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Need Help Booking?</h2>
          <p className="mx-auto mt-3 max-w-xl text-accent-50">
            Our care team is available 24/7 to assist you with appointments and
            emergencies.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn bg-white text-accent-700 hover:bg-accent-50">
              Contact Us
            </Link>
            <a href="tel:108" className="btn border border-white/30 hover:bg-white/10">
              <FaPhoneAlt /> 108
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
