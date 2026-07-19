import { body, param } from 'express-validator'

export const bookAppointmentValidator = [
  body('doctorId').notEmpty().withMessage('Doctor is required'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('time').notEmpty().withMessage('Time slot is required'),
  body('reason').optional().trim(),
  body('paymentMethod')
    .optional()
    .isIn(['card', 'debit', 'gpay', 'upi', 'netbanking', 'cash'])
    .withMessage('Invalid payment method'),
]

export const appointmentIdValidator = [
  param('id').notEmpty().withMessage('Appointment id is required'),
]

export const updateStatusValidator = [
  param('id').notEmpty().withMessage('Appointment id is required'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
]

export const paymentValidator = [
  param('id').notEmpty().withMessage('Appointment id is required'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['card', 'debit', 'gpay', 'upi', 'netbanking', 'cash'])
    .withMessage('Invalid payment method'),
  body('cardDetails').optional().isObject().withMessage('Card details must be an object'),
]
