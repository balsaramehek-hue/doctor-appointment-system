import jwt from 'jsonwebtoken'
import Patient from '../models/Patient.js'
import Admin from '../models/Admin.js'
import { sendError } from '../utils/response.js'

/**
 * Generic auth guard. Reads the Bearer token, verifies it, and loads the
 * matching user (Patient or Admin) onto req.user. Rejects unauthenticated
 * requests with 401.
 */
export const protect = async (req, res, next) => {
  try {
    let token = null

    // Accept token from Authorization header or httpOnly cookie.
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return sendError(res, 'Not authorized, no token provided', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    let user = null

    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password')
    } else {
      user = await Patient.findById(decoded.id).select('-password')
    }

    if (!user) {
      return sendError(res, 'User no longer exists', 401)
    }

    if (user.isActive === false) {
      return sendError(res, 'Your account has been deactivated', 403)
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    return sendError(res, 'Not authorized, token failed', 401)
  }
}

/**
 * Restricts a route to a specific role. Must be used AFTER protect().
 * @param {...string} roles - allowed roles, e.g. ('admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. ${roles.join(' or ')} role required.`,
        403
      )
    }
    next()
  }
}

// Convenience guards
export const requirePatient = [protect, authorize('patient')]
export const requireAdmin = [protect, authorize('admin')]
