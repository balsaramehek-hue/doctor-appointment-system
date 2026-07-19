import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import * as auth from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
  adminLoginValidator,
} from '../validations/authValidation.js'

const router = express.Router()

// Public patient auth
router.post('/register', authLimiter, validate(registerValidator), asyncHandler(auth.register))
router.post('/login', authLimiter, validate(loginValidator), asyncHandler(auth.login))
router.post('/logout', asyncHandler(auth.logout))
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidator), asyncHandler(auth.forgotPassword))
router.post('/reset-password', validate(resetPasswordValidator), asyncHandler(auth.resetPassword))

// Protected patient routes
router.get('/me', protect, asyncHandler(auth.getMe))
router.post('/change-password', protect, validate(changePasswordValidator), asyncHandler(auth.changePassword))
router.put('/profile', protect, validate(updateProfileValidator), asyncHandler(auth.updateProfile))

// Admin-only login (separate route as required)
router.post('/admin/login', authLimiter, validate(adminLoginValidator), asyncHandler(auth.adminLogin))

export default router
