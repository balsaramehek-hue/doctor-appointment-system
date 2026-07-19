import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import { getDashboardStats } from '../controllers/dashboardController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Admin only
router.get('/', protect, authorize('admin'), asyncHandler(getDashboardStats))

export default router
