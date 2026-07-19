import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import * as contact from '../controllers/contactController.js'
import { protect, authorize } from '../middleware/auth.js'
import { optionalAuth } from '../middleware/optionalAuth.js'
import { validate } from '../middleware/validate.js'
import { contactValidator } from '../validations/contactValidation.js'

const router = express.Router()

// Public: submit contact message (optional auth links patient account)
router.post(
  '/',
  optionalAuth,
  validate(contactValidator),
  asyncHandler(contact.submitContact)
)

// Patient: get own contact messages
router.get('/my', protect, authorize('patient'), asyncHandler(contact.getMyContacts))

// Admin only: read / manage messages
router.get('/', protect, authorize('admin'), asyncHandler(contact.getContacts))
router.patch('/:id/read', protect, authorize('admin'), asyncHandler(contact.markRead))
router.patch('/:id/solve', protect, authorize('admin'), asyncHandler(contact.markSolved))
router.patch('/:id/reply', protect, authorize('admin'), asyncHandler(contact.replyToContact))
router.delete('/:id', protect, authorize('admin'), asyncHandler(contact.deleteContact))

export default router
