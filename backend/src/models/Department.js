import mongoose from 'mongoose'

/**
 * Department model — medical departments (Cardiology, Neurology, ...).
 * Seeded from the frontend `departments` list. Used for filtering doctors.
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const Department = mongoose.model('Department', departmentSchema)
export default Department
