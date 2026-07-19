import jwt from 'jsonwebtoken'
import Patient from '../models/Patient.js'
import Admin from '../models/Admin.js'

/**
 * Optional auth — attaches req.user when a valid token is present,
 * but never rejects the request. Used for public contact form so
 * logged-in patients get their messages linked to their account.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }

    if (!token) return next()

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    let user = null
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password')
    } else {
      user = await Patient.findById(decoded.id).select('-password')
    }
    if (user && user.isActive !== false) {
      req.user = user
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next()
}
