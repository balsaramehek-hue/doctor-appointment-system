import crypto from 'crypto'
import moment from 'moment'
import Patient from '../models/Patient.js'
import Admin from '../models/Admin.js'
import { generateToken } from '../utils/jwt.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { sendEmail } from '../utils/email.js'

/**
 * Builds the user payload returned to the frontend. Matches the shape the
 * frontend AuthContext expects: { id, name, email, phone, role }.
 */
const buildUserPayload = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
})

// Attach JWT as cookie + return in response
const setAuthCookie = (res, token) => {
  const days = Number(process.env.JWT_COOKIE_EXPIRE) || 7
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  })
}

/* ----------------------------- PATIENT AUTH ----------------------------- */

// @route   POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, phone, password } = req.body

  const existing = await Patient.findOne({ email: email.toLowerCase() })
  if (existing) {
    return sendError(res, 'A patient with this email already exists', 409)
  }

  const patient = await Patient.create({ name, email, phone, password })

  const token = generateToken(patient._id.toString(), 'patient')
  setAuthCookie(res, token)

  return sendSuccess(
    res,
    'Registration successful',
    { token, user: buildUserPayload(patient) },
    201
  )
}

// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  // Password is select:false — must explicitly include it for comparison
  const patient = await Patient.findOne({ email: email.toLowerCase() }).select(
    '+password'
  )
  if (!patient) {
    return sendError(res, 'Invalid email', 401)
  }

  const isPasswordValid = await patient.comparePassword(password)
  if (!isPasswordValid) {
    return sendError(res, 'Incorrect password', 401)
  }

  if (patient.isActive === false) {
    return sendError(res, 'Your account has been deactivated', 403)
  }

  const token = generateToken(patient._id.toString(), 'patient')
  setAuthCookie(res, token)

  return sendSuccess(res, 'Login successful', {
    token,
    user: buildUserPayload(patient),
  })
}

// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  res.clearCookie('token')
  return sendSuccess(res, 'Logged out successfully')
}

// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  const user = req.user
  return sendSuccess(res, 'User profile', { user: buildUserPayload(user) })
}

// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body
  const patient = await Patient.findOne({ email: email.toLowerCase() })
  if (!patient) {
    // Do not reveal whether the email exists (security).
    return sendSuccess(res, 'If that email exists, a reset link has been sent.')
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  patient.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  patient.resetPasswordExpire = Date.now() + 15 * 60 * 1000 // 15 min
  await patient.save()

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
  await sendEmail({
    to: patient.email,
    subject: 'MediCare — Password Reset',
    html: `<p>Hello ${patient.name},</p>
      <p>You requested a password reset. Click the link below (valid for 15 minutes):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore the email.</p>`,
  })

  return sendSuccess(res, 'If that email exists, a reset link has been sent.')
}

// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body
  const hashed = crypto.createHash('sha256').update(token).digest('hex')

  const patient = await Patient.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!patient) {
    return sendError(res, 'Invalid or expired reset token', 400)
  }

  patient.password = password
  patient.resetPasswordToken = undefined
  patient.resetPasswordExpire = undefined
  await patient.save()

  return sendSuccess(res, 'Password has been reset. Please login.')
}

// @route   POST /api/auth/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, password } = req.body
  const patient = await Patient.findById(req.user._id).select('+password')

  if (!(await patient.comparePassword(currentPassword))) {
    return sendError(res, 'Current password is incorrect', 400)
  }

  patient.password = password
  await patient.save()

  return sendSuccess(res, 'Password changed successfully')
}

// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  const { name, phone, email, gender, address, dob } = req.body
  const patient = await Patient.findById(req.user._id)

  if (email && email.toLowerCase() !== patient.email) {
    const dup = await Patient.findOne({ email: email.toLowerCase() })
    if (dup) {
      return sendError(res, 'That email is already in use', 409)
    }
    patient.email = email.toLowerCase()
  }
  if (name) patient.name = name
  if (phone) patient.phone = phone
  if (gender !== undefined) patient.gender = gender
  if (address !== undefined) patient.address = address
  if (dob) patient.dob = dob

  await patient.save()
  return sendSuccess(res, 'Profile updated', { user: buildUserPayload(patient) })
}

/* ------------------------------ ADMIN AUTH ------------------------------ */

// @route   POST /api/admin/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select(
    '+password'
  )
  if (!admin) {
    return sendError(res, 'Invalid email', 401)
  }

  const isPasswordValid = await admin.comparePassword(password)
  if (!isPasswordValid) {
    return sendError(res, 'Incorrect password', 401)
  }

  if (admin.isActive === false) {
    return sendError(res, 'Admin account is deactivated', 403)
  }

  const token = generateToken(admin._id.toString(), 'admin')
  setAuthCookie(res, token)

  return sendSuccess(res, 'Admin login successful', {
    token,
    user: buildUserPayload(admin),
  })
}
