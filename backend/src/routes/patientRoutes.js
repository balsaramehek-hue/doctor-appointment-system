import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import * as patient from '../controllers/patientController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Admin only: list / view patients
router.get('/', protect, authorize('admin'), asyncHandler(patient.getPatients))
router.get('/:id', protect, authorize('admin'), asyncHandler(patient.getPatient))

export default router
