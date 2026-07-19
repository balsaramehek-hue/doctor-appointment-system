import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-primary-600">404</h1>
      <p className="mt-4 text-lg text-slate-600">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        <FaHome /> Back to Home
      </Link>
    </div>
  )
}
