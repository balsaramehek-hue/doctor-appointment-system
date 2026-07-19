import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaAmbulance } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-dark text-slate-300">
      <div className="container-px mx-auto grid max-w-7xl gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 font-bold">
              M
            </span>
            <span className="text-xl font-bold">
              Medi<span className="text-primary-400">Care</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Trusted healthcare platform connecting patients with expert doctors.
            Book appointments online with ease.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary-400">Home</Link></li>
            <li><Link to="/doctors" className="hover:text-primary-400">Find Doctors</Link></li>
            <li><Link to="/contact" className="hover:text-primary-400">Contact</Link></li>
            <li><Link to="/login" className="hover:text-primary-400">Patient Login</Link></li>
            <li><Link to="/admin/login" className="hover:text-primary-400">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Departments</h4>
          <ul className="space-y-2 text-sm">
            <li>Cardiology</li>
            <li>Neurology</li>
            <li>Dermatology</li>
            <li>Orthopedics</li>
            <li>Pediatrics</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <FaMapMarkerAlt className="mt-1 text-primary-400" />
              Hospital address will appear here once configured.
            </li>
            <li className="flex items-center gap-2">
              <FaPhone className="text-primary-400" /> Contact number coming soon
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-primary-400" /> Email coming soon
            </li>
            <li className="flex items-center gap-2">
              <FaAmbulance className="text-accent-400" /> Ambulance: 108
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MediCare Hospital. All rights reserved.
      </div>
    </footer>
  )
}
