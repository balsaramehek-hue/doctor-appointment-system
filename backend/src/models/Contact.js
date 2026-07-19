import mongoose from 'mongoose'

/**
 * Contact message model — submitted via the public contact form and read by admin.
 */
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'solved'],
      default: 'unread',
    },
    // If submitted by a logged-in patient, link to their account
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    // Admin reply
    reply: {
      message: { type: String, default: '' },
      repliedAt: { type: Date, default: null },
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
      },
    },
  },
  { timestamps: true }
)

const Contact = mongoose.model('Contact', contactSchema)
export default Contact
