import Department from '../models/Department.js'
import { sendSuccess, sendError } from '../utils/response.js'

// @route   GET /api/departments
export const getDepartments = async (req, res) => {
  const departments = await Department.find().sort({ name: 1 })
  return sendSuccess(res, 'Departments fetched', {
    departments: departments.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      icon: d.icon || '',
      description: d.description || '',
    })),
  })
}

// @route   POST /api/departments
export const addDepartment = async (req, res) => {
  const { name, description, icon } = req.body
  if (!name?.trim()) return sendError(res, 'Department name is required', 400)

  const existing = await Department.findOne({ name: name.trim() })
  if (existing) return sendError(res, 'Department already exists', 409)

  const department = await Department.create({
    name: name.trim(),
    description: description || '',
    icon: icon || '',
  })

  return sendSuccess(
    res,
    'Department added successfully',
    {
      department: {
        id: department._id.toString(),
        name: department.name,
        description: department.description,
        icon: department.icon,
      },
    },
    201
  )
}

// @route   DELETE /api/departments/:id
export const deleteDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id)
  if (!department) return sendError(res, 'Department not found', 404)
  await department.deleteOne()
  return sendSuccess(res, 'Department deleted successfully')
}
