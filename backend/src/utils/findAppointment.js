import mongoose from 'mongoose'
import Appointment from '../models/Appointment.js'

/**
 * Find an appointment by MongoDB ObjectId or public appointmentId (APT-xxxx).
 * Frontend consistently uses the public appointmentId in URLs and API calls.
 */
export async function findAppointmentByIdOrCode(id, populate = []) {
  if (!id) return null

  const code = String(id).trim()
  let query

  if (/^APT-/i.test(code)) {
    query = Appointment.findOne({ appointmentId: code.toUpperCase() })
  } else if (
    mongoose.Types.ObjectId.isValid(code) &&
    String(new mongoose.Types.ObjectId(code)) === code
  ) {
    query = Appointment.findById(code)
  } else {
    query = Appointment.findOne({
      $or: [
        { appointmentId: code.toUpperCase() },
        ...(mongoose.Types.ObjectId.isValid(code) ? [{ _id: code }] : []),
      ],
    })
  }

  for (const p of populate) {
    if (typeof p === 'string') query = query.populate(p)
    else if (p?.path) query = query.populate(p)
  }

  return query
}
