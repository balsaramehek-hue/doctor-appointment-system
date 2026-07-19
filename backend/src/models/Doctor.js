import mongoose from 'mongoose'

/**
 * Doctor model — managed by admin. Fields match the frontend doctor cards,
 * doctor detail page and the admin "Manage Doctors" form.
 */
const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    qualification: {
      type: String,
      default: '',
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Frontend uses `about` for the description text
    about: {
      type: String,
      default: '',
    },
    education: {
      type: [String],
      default: [],
    },
    hospital: {
      type: String,
      default: 'MediCare Hospital',
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Frontend uses `fee` for consultation fee
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableDays: {
      type: [String], // e.g. ['Mon', 'Tue']
      default: [],
    },
    availableTimeSlots: {
      type: [String], // e.g. ['9:00 AM', '10:00 AM']
      default: [],
    },
    // Frontend uses `slots` for time slots
    slots: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
    },
    // Availability / leave management
    availability: {
      isOnLeave: { type: Boolean, default: false },
      leaveStart: { type: Date, default: null },
      leaveEnd: { type: Date, default: null },
      leaveReason: { type: String, default: '' },
      unavailableDates: [{ type: Date }], // specific dates unavailable
      unavailableDays: [{ type: String }], // e.g. ['Mon', 'Tue']
      nextAvailableDate: { type: Date, default: null },
    },
  },
  { timestamps: true }
)

// Keep `fee` and `about` in sync with their canonical fields.
doctorSchema.pre('save', function (next) {
  if (this.fee == null) this.fee = this.consultationFee
  if (this.consultationFee == null) this.consultationFee = this.fee
  if (!this.about) this.about = this.description
  if (!this.description) this.description = this.about
  if (this.slots.length === 0 && this.availableTimeSlots.length > 0) {
    this.slots = this.availableTimeSlots
  }
  if (this.availableTimeSlots.length === 0 && this.slots.length > 0) {
    this.availableTimeSlots = this.slots
  }
  next()
})

const Doctor = mongoose.model('Doctor', doctorSchema)
export default Doctor
