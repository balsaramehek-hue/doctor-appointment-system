import { body } from 'express-validator'

// Shared password rule — strong password validation
const passwordRule = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage(
    'Password must contain at least one uppercase letter, one lowercase letter and one number'
  )

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  passwordRule,
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
]

export const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

export const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
]

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  passwordRule,
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
]

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRule,
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
]

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('gender').optional().isIn(['male', 'female', 'other', '']).withMessage('Invalid gender'),
  body('address').optional().trim(),
  body('dob').optional().isISO8601().withMessage('Invalid date of birth'),
]

export const adminLoginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]
