import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * Patient model — self-registers via the public API.
 * Profile fields match the frontend patient dashboard/profile.
 */
const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    dob: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      default: 'patient',
      enum: ['patient'],
    },
    medicalHistory: [
      {
        date: { type: Date, default: Date.now },
        doctor: { type: String, default: '' },
        diagnosis: { type: String, default: '' },
        prescription: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // For forgot-password flow
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
)

// Hash password before save
patientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare candidate password
patientSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password)
}

const Patient = mongoose.model('Patient', patientSchema)
export default Patient
