import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import * as notification from '../controllers/notificationController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Any authenticated user (patient or admin)
router.get('/', protect, asyncHandler(notification.getNotifications))
router.patch('/:id/read', protect, asyncHandler(notification.markNotificationRead))
router.patch('/read-all', protect, asyncHandler(notification.markAllRead))

export default router
