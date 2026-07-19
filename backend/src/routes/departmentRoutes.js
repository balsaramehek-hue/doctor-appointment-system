import express from 'express'
import asyncHandler from '../utils/asyncHandler.js'
import * as department from '../controllers/departmentController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/', asyncHandler(department.getDepartments))
router.post('/', protect, authorize('admin'), asyncHandler(department.addDepartment))
router.delete('/:id', protect, authorize('admin'), asyncHandler(department.deleteDepartment))

export default router
