import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

/**
 * Appointment model — the most important module.
 * Tracks which patient booked which doctor, on what date/time, and the status.
 * The `appointmentId` (APT-xxxx) is the public-facing identifier used by the
 * frontend. Double-booking is prevented by a unique compound index on
 * (doctor, date, time).
 */
const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      uppercase: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    // Denormalized doctor id (always available even without population)
    doctorId: {
      type: String,
      default: '',
    },
    // Denormalized snapshot fields so the patient/admin views render without
    // extra population and stay stable even if the doctor is later edited.
    doctorName: { type: String, default: '' },
    specialization: { type: String, default: '' },
    fee: { type: Number, default: 0 },
    patientName: { type: String, default: '' },
    patientEmail: { type: String, default: '' },
    patientPhone: { type: String, default: '' },
    date: {
      type: String, // ISO date 'YYYY-MM-DD'
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String, // e.g. '10:00 AM'
      required: [true, 'Appointment time slot is required'],
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'debit', 'gpay', 'upi', 'netbanking', 'cash'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: '',
    },
    paymentDetails: {
      cardLast4: { type: String, default: '' },
      cardBrand: { type: String, default: '' },
      paidAt: { type: Date, default: null },
    },
    // Cancellation / refund (when a paid appointment is cancelled)
    cancellationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'processed', 'not_applicable'],
      default: 'none',
    },
    refundId: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    isSlotBooked: {
      type: Boolean,
      default: true, // once created, the slot is taken
    },
  },
  { timestamps: true }
)

// Generate a human-friendly appointment id before saving.
appointmentSchema.pre('save', function (next) {
  if (!this.appointmentId) {
    // APT- + 4 random digits (collision extremely unlikely, index enforces uniqueness)
    this.appointmentId = 'APT-' + Math.floor(1000 + Math.random() * 9000)
  }
  next()
})

// Prevent double booking: same doctor + date + time can only exist once.
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true })

const Appointment = mongoose.model('Appointment', appointmentSchema)
export default Appointment
