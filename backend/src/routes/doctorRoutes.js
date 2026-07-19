import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import * as doctor from '../controllers/doctorController.js'
import { protect, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { handleUpload } from '../middleware/upload.js'
import { parseFormJson } from '../middleware/parseFormJson.js'
import {
  doctorValidator,
  doctorUpdateValidator,
} from '../validations/doctorValidation.js'

const router = express.Router()

// Public: list / view doctors
router.get('/', asyncHandler(doctor.getDoctors))
router.get('/:id', asyncHandler(doctor.getDoctor))

// Admin only: create / update / delete (with image upload)
router.post(
  '/',
  protect,
  authorize('admin'),
  handleUpload('image'),
  parseFormJson,
  validate(doctorValidator),
  asyncHandler(doctor.addDoctor)
)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  handleUpload('image'),
  parseFormJson,
  validate(doctorUpdateValidator),
  asyncHandler(doctor.updateDoctor)
)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(doctor.deleteDoctor)
)

export default router
