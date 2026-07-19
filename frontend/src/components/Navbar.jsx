import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'
import Login from '../pages/Login'
import Register from '../pages/Register'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/doctors', label: 'Find Doctors' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [authModal, setAuthModal] = useState(null) // 'login' | 'register' | null
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location?.pathname])

  const handleBookClick = () => {
    if (!isAuthenticated) {
      setAuthModal('login')
    } else {
      navigate('/doctors')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <nav className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white font-bold">
              M
            </span>
            <span className="text-xl font-bold text-slate-900">
              Medi<span className="text-primary-600">Care</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-slate-600 hover:text-primary-600'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={handleBookClick} className="btn-primary">
              Book Appointment
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Link to="/admin" className="btn-outline px-4 py-2 text-sm">
                    Admin Panel
                  </Link>
                ) : (
                  <Link to="/dashboard" className="btn-outline px-4 py-2 text-sm">
                    My Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FaUserCircle size={22} className="text-primary-500" />
                  <span className="hidden lg:inline">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModal('login')}
                className="btn-ghost"
              >
                Login
              </button>
            )}
          </div>

          <button
            className="text-slate-700 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
            >
              <div className="container-px flex flex-col gap-3 py-4">
                {navLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    className="text-sm font-medium text-slate-600"
                  >
                    {l.label}
                  </NavLink>
                ))}
                <button onClick={handleBookClick} className="btn-primary">
                  Book Appointment
                </button>
                {isAuthenticated ? (
                  <>
                    {isAdmin ? (
                      <Link to="/admin" className="btn-outline">
                        Admin Panel
                      </Link>
                    ) : (
                      <Link to="/dashboard" className="btn-outline">
                        My Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="btn-ghost">
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAuthModal('login')}
                    className="btn-outline"
                  >
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Modal
        open={!!authModal}
        onClose={() => setAuthModal(null)}
        title={authModal === 'register' ? 'Create Account' : 'Login to MediCare'}
        size="md"
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
    </>
  )
}
