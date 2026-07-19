import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

// role: 'patient' | 'admin' (optional). Redirects to login if not authenticated.
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner text="Checking session..." />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (role === 'patient' && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}
