import { body } from 'express-validator'

const optionalDate = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (!value || value === 'null' || value === '') return true
      return !Number.isNaN(Date.parse(value))
    })
    .withMessage(`Invalid ${field}`)

export const doctorValidator = [
  body('name').trim().notEmpty().withMessage('Doctor name is required'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email'),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('department').optional({ values: 'falsy' }).trim(),
  body('qualification').optional({ values: 'falsy' }).trim(),
  body('experience').optional({ values: 'falsy' }).isNumeric().withMessage('Experience must be a number'),
  body('fee').optional({ values: 'falsy' }).isNumeric().withMessage('Fee must be a number'),
  body('consultationFee').optional({ values: 'falsy' }).isNumeric(),
  body('about').optional({ values: 'falsy' }).trim(),
  body('description').optional({ values: 'falsy' }).trim(),
  body('availableDays').optional().isArray().withMessage('availableDays must be an array'),
  body('slots').optional().isArray().withMessage('slots must be an array'),
  body('availableTimeSlots').optional().isArray(),
  body('status').optional().isIn(['active', 'inactive', 'on_leave']),
  body('availability.isOnLeave').optional().isBoolean().withMessage('isOnLeave must be a boolean'),
  optionalDate('availability.leaveStart'),
  optionalDate('availability.leaveEnd'),
  body('availability.leaveReason').optional({ values: 'falsy' }).trim(),
  body('availability.unavailableDates').optional().isArray().withMessage('unavailableDates must be an array'),
  body('availability.unavailableDays').optional().isArray().withMessage('unavailableDays must be an array'),
  optionalDate('availability.nextAvailableDate'),
]

export const doctorUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Doctor name cannot be empty'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email'),
  body('phone').optional({ values: 'falsy' }).trim(),
  body('specialization').optional().trim().notEmpty().withMessage('Specialization cannot be empty'),
  body('department').optional({ values: 'falsy' }).trim(),
  body('qualification').optional({ values: 'falsy' }).trim(),
  body('experience').optional({ values: 'falsy' }).isNumeric().withMessage('Experience must be a number'),
  body('fee').optional({ values: 'falsy' }).isNumeric().withMessage('Fee must be a number'),
  body('consultationFee').optional({ values: 'falsy' }).isNumeric(),
  body('about').optional({ values: 'falsy' }).trim(),
  body('description').optional({ values: 'falsy' }).trim(),
  body('availableDays').optional().isArray().withMessage('availableDays must be an array'),
  body('slots').optional().isArray().withMessage('slots must be an array'),
  body('availableTimeSlots').optional().isArray(),
  body('status').optional().isIn(['active', 'inactive', 'on_leave']),
  body('availability.isOnLeave').optional().isBoolean().withMessage('isOnLeave must be a boolean'),
  optionalDate('availability.leaveStart'),
  optionalDate('availability.leaveEnd'),
  body('availability.leaveReason').optional({ values: 'falsy' }).trim(),
  body('availability.unavailableDates').optional().isArray().withMessage('unavailableDates must be an array'),
  body('availability.unavailableDays').optional().isArray().withMessage('unavailableDays must be an array'),
  optionalDate('availability.nextAvailableDate'),
]
