import mongoose from 'mongoose'

/**
 * Notification model — system notifications for patients/admins
 * (booking confirmed, appointment cancelled, etc.).
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipientModel',
      required: true,
    },
    recipientModel: {
      type: String,
      enum: ['Patient', 'Admin'],
      default: 'Patient',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['appointment', 'system', 'message'],
      default: 'system',
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
  },
  { timestamps: true }
)

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
