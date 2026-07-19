import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import * as appointment from '../controllers/appointmentController.js'
import { protect, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  bookAppointmentValidator,
  appointmentIdValidator,
  updateStatusValidator,
  paymentValidator,
} from '../validations/appointmentValidation.js'

const router = express.Router()

// Public-ish: booked slots lookup (used by booking page to disable slots)
router.get('/booked-slots', asyncHandler(appointment.getBookedSlots))

// Patient booking (must be logged in)
router.post(
  '/book',
  protect,
  authorize('patient'),
  validate(bookAppointmentValidator),
  asyncHandler(appointment.bookAppointment)
)

// Patient: process payment
router.post(
  '/:id/pay',
  protect,
  authorize('patient'),
  validate(paymentValidator),
  asyncHandler(appointment.processPayment)
)

// Patient: my appointments + cancel own
router.get('/my', protect, authorize('patient'), asyncHandler(appointment.getMyAppointments))
router.get('/:id', protect, asyncHandler(appointment.getAppointment))
router.patch(
  '/:id/cancel',
  protect,
  authorize('patient'),
  validate(appointmentIdValidator),
  asyncHandler(appointment.cancelMyAppointment)
)

// Admin: manage all appointments
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(appointment.adminGetAppointments)
)
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  validate(updateStatusValidator),
  asyncHandler(appointment.updateAppointmentStatus)
)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(appointment.deleteAppointment)
)

export default router
