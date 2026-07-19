import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import Appointment from '../models/Appointment.js'
import Doctor from '../models/Doctor.js'
import Patient from '../models/Patient.js'
import Notification from '../models/Notification.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { sendEmail } from '../utils/email.js'
import { findAppointmentByIdOrCode } from '../utils/findAppointment.js'

/**
 * Normalizes an appointment into the shape the frontend expects:
 * { id, doctorId, doctorName, specialization, date, time, status, reason, fee, paymentStatus, paymentMethod, transactionId }
 */
export const formatAppointment = (doc) => {
  const a = typeof doc.toObject === 'function' ? doc.toObject() : doc
  const patientObj = a.patient && typeof a.patient === 'object' ? a.patient : null
  return {
    id: a.appointmentId,
    _id: a._id.toString(),
    doctorId: a.doctorId || (a.doctor ? a.doctor.toString() : null),
    doctorName: a.doctorName,
    specialization: a.specialization,
    patientName: a.patientName || patientObj?.name || '',
    patientEmail: a.patientEmail || patientObj?.email || '',
    patientPhone: a.patientPhone || patientObj?.phone || '',
    date: a.date,
    time: a.time,
    status: a.status,
    reason: a.reason || '',
    fee: a.fee || 0,
    paymentMethod: a.paymentMethod,
    paymentStatus: a.paymentStatus,
    transactionId: a.transactionId,
    paymentDetails: a.paymentDetails,
    cancellationFee: a.cancellationFee || 0,
    refundAmount: a.refundAmount || 0,
    refundStatus: a.refundStatus || 'none',
    refundId: a.refundId || '',
    cancelledAt: a.cancelledAt || null,
    hospitalName: 'MediCare Hospital',
    createdAt: a.createdAt,
  }
}

/* --------------------------- PATIENT BOOKING --------------------------- */

// @route   POST /api/appointments/book
export const bookAppointment = async (req, res) => {
  const { doctorId, date, time, reason, paymentMethod } = req.body
  const patientId = req.user._id

  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    return sendError(res, 'Doctor not found', 404)
  }

  const avail = doctor.availability || {}
  const today = moment().startOf('day')
  const leaveEnd = avail.leaveEnd ? moment(avail.leaveEnd).endOf('day') : null
  const leaveStart = avail.leaveStart ? moment(avail.leaveStart).startOf('day') : null
  const currentlyOnLeave =
    doctor.status === 'on_leave' ||
    (avail.isOnLeave && (!leaveEnd || leaveEnd.isSameOrAfter(today))) ||
    (leaveStart && leaveEnd && today.isBetween(leaveStart, leaveEnd, 'day', '[]'))

  if (doctor.status === 'inactive' || currentlyOnLeave) {
    return sendError(res, 'This doctor is currently not available for booking', 400)
  }

  const inputDate = moment(date, 'YYYY-MM-DD', true)
  if (!inputDate.isValid()) {
    return sendError(res, 'Invalid date format. Use YYYY-MM-DD', 400)
  }
  if (inputDate.isBefore(today)) {
    return sendError(res, 'Cannot book an appointment in the past', 400)
  }

  const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][inputDate.day()]
  if ((avail.unavailableDays || []).includes(dayShort)) {
    return sendError(res, 'Doctor is unavailable on this day of the week', 400)
  }
  const unavailableDates = (avail.unavailableDates || []).map((d) =>
    moment(d).format('YYYY-MM-DD')
  )
  if (unavailableDates.includes(date)) {
    return sendError(res, 'Doctor is unavailable on this date', 400)
  }
  if (
    leaveStart &&
    leaveEnd &&
    inputDate.isBetween(leaveStart, leaveEnd, 'day', '[]')
  ) {
    return sendError(res, 'Doctor is on leave on this date', 400)
  }

  const doctorSlots = doctor.slots?.length
    ? doctor.slots
    : doctor.availableTimeSlots || []
  if (!doctorSlots.includes(time)) {
    return sendError(res, 'Selected time slot is not available for this doctor', 400)
  }

  const existing = await Appointment.findOne({ doctor: doctorId, date, time })
  if (existing) {
    return sendError(
      res,
      'This appointment slot has already been booked.',
      409
    )
  }

  const patient = await Patient.findById(patientId)
  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    doctorId: doctorId.toString(),
    doctorName: doctor.name,
    specialization: doctor.specialization,
    fee: doctor.fee ?? doctor.consultationFee ?? 0,
    date,
    time,
    reason: reason || '',
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: 'pending',
    patientName: patient?.name || '',
    patientEmail: patient?.email || '',
    patientPhone: patient?.phone || '',
  })

  if (patient?.email) {
    await sendEmail({
      to: patient.email,
      subject: 'MediCare — Appointment Confirmed',
      html: `<p>Hello ${patient.name},</p>
        <p>Your appointment with <b>${doctor.name}</b> is booked.</p>
        <p>Appointment ID: <b>${appointment.appointmentId}</b></p>
        <p>Date: ${date} &nbsp; Time: ${time}</p>
        <p>Fee: ₹${appointment.fee}</p>
        <p>Payment Method: ${paymentMethod || 'cash'}</p>`,
    })
  }

  await Notification.create({
    recipient: patientId,
    recipientModel: 'Patient',
    title: 'Appointment Booked',
    message: `Your appointment with ${doctor.name} on ${date} at ${time} is confirmed.`,
    type: 'appointment',
    relatedAppointment: appointment._id,
  })

  return sendSuccess(
    res,
    'Appointment booked successfully',
    { appointment: formatAppointment(appointment) },
    201
  )
}

// @route   GET /api/appointments/booked-slots?doctorId=&date=
export const getBookedSlots = async (req, res) => {
  const { doctorId, date } = req.query
  if (!doctorId) return sendError(res, 'doctorId is required', 400)

  const filter = { doctor: doctorId, status: { $ne: 'cancelled' } }
  if (date) filter.date = date

  const appointments = await Appointment.find(filter).select('date time -_id')
  const booked = {}
  appointments.forEach((a) => {
    if (!booked[a.date]) booked[a.date] = []
    booked[a.date].push(a.time)
  })

  return sendSuccess(res, 'Booked slots fetched', { booked })
}

/* --------------------------- PAYMENT --------------------------- */

// @route   POST /api/appointments/:id/pay
export const processPayment = async (req, res) => {
  const { paymentMethod, cardDetails } = req.body
  const appointment = await findAppointmentByIdOrCode(req.params.id)
  if (!appointment) return sendError(res, 'Appointment not found', 404)

  if (appointment.patient.toString() !== req.user._id.toString()) {
    return sendError(res, 'Not authorized to pay for this appointment', 403)
  }

  if (appointment.paymentStatus === 'paid') {
    return sendError(res, 'Payment already completed for this appointment', 400)
  }

  // Simulate payment processing — integrate Stripe/Razorpay later
  let transactionId = ''
  let paymentStatus = 'paid'

  if (paymentMethod === 'cash') {
    transactionId = 'CASH-' + Date.now()
    paymentStatus = 'pending'
  } else {
    transactionId = 'TXN-' + uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()
    paymentStatus = 'paid'
  }

  appointment.paymentMethod = paymentMethod
  appointment.paymentStatus = paymentStatus
  appointment.transactionId = transactionId

  if (!appointment.paymentDetails) {
    appointment.paymentDetails = {}
  }

  if (cardDetails) {
    appointment.paymentDetails.cardLast4 = cardDetails.last4 || ''
    appointment.paymentDetails.cardBrand = cardDetails.brand || ''
  }

  if (paymentStatus === 'paid') {
    appointment.status = 'confirmed'
    appointment.paymentDetails.paidAt = new Date()
  }

  await appointment.save()

  const patient = await Patient.findById(appointment.patient)
  if (patient?.email) {
    await sendEmail({
      to: patient.email,
      subject: `MediCare — Payment ${paymentStatus === 'paid' ? 'Successful' : 'Failed'}`,
      html: `<p>Hello ${patient.name},</p>
        <p>Your payment for appointment <b>${appointment.appointmentId}</b> is <b>${paymentStatus}</b>.</p>
        <p>Transaction ID: ${transactionId}</p>
        <p>Amount: ₹${appointment.fee}</p>
        <p>Payment Method: ${paymentMethod}</p>
        ${paymentStatus === 'paid' ? '<p>Your appointment is now confirmed.</p>' : '<p>Please try again or contact support.</p>'}`,
    })
  }

  return sendSuccess(res, `Payment ${paymentStatus}`, {
    appointment: formatAppointment(appointment),
  })
}

/* --------------------------- PATIENT DASHBOARD -------------------------- */

// @route   GET /api/appointments/my
export const getMyAppointments = async (req, res) => {
  const { status, page = 1, limit = 20, sort = 'desc' } = req.query
  const filter = { patient: req.user._id }
  if (status) filter.status = status

  const skip = (Number(page) - 1) * Number(limit)
  const sortOrder = sort === 'asc' ? 1 : -1

  const appointments = await Appointment.find(filter)
    .populate('doctor', 'name specialization image')
    .sort({ date: sortOrder, createdAt: sortOrder })
    .skip(skip)
    .limit(Number(limit))

  const total = await Appointment.countDocuments(filter)

  return sendSuccess(res, 'Appointments fetched', {
    appointments: appointments.map(formatAppointment),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  })
}

// @route   GET /api/appointments/:id
export const getAppointment = async (req, res) => {
  const appointment = await findAppointmentByIdOrCode(req.params.id, [
    { path: 'doctor', select: 'name specialization image' },
    { path: 'patient', select: 'name email phone' },
  ])
  if (!appointment) return sendError(res, 'Appointment not found', 404)

  const patientId =
    appointment.patient?._id?.toString?.() || appointment.patient?.toString?.()
  if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
    return sendError(res, 'Not authorized to view this appointment', 403)
  }

  return sendSuccess(res, 'Appointment fetched', {
    appointment: formatAppointment(appointment),
  })
}

// @route   PATCH /api/appointments/:id/cancel  (patient cancels own)
export const cancelMyAppointment = async (req, res) => {
  const appointment = await findAppointmentByIdOrCode(req.params.id)
  if (!appointment) return sendError(res, 'Appointment not found', 404)

  if (appointment.patient.toString() !== req.user._id.toString()) {
    return sendError(res, 'Not authorized to cancel this appointment', 403)
  }
  if (appointment.status === 'completed') {
    return sendError(res, 'Completed appointments cannot be cancelled', 400)
  }
  if (appointment.status === 'cancelled') {
    return sendError(res, 'Appointment is already cancelled', 400)
  }

  const fee = Number(appointment.fee) || 0
  let cancellationFee = 0
  let refundAmount = 0
  let refundId = ''
  let refundStatus = 'not_applicable'
  let message = 'Appointment cancelled successfully.'

  // If already paid online, deduct a cancellation fee and refund the rest
  if (appointment.paymentStatus === 'paid' && fee > 0) {
    // 20% cancellation fee (minimum ₹50, max full fee)
    cancellationFee = Math.round(fee * 0.2)
    if (cancellationFee < 50 && fee >= 50) cancellationFee = 50
    if (cancellationFee > fee) cancellationFee = fee
    refundAmount = Math.max(0, fee - cancellationFee)
    refundId = 'REF-' + uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()
    refundStatus = 'processed'
    appointment.paymentStatus = 'refunded'
    message = `Appointment cancelled. Cancellation fee ₹${cancellationFee} deducted. Refund of ₹${refundAmount} will be returned to your original payment method.`
  } else if (appointment.paymentStatus === 'pending') {
    message =
      'Appointment cancelled. No payment was collected, so no refund is due.'
  }

  appointment.status = 'cancelled'
  appointment.cancellationFee = cancellationFee
  appointment.refundAmount = refundAmount
  appointment.refundStatus = refundStatus
  appointment.refundId = refundId
  appointment.cancelledAt = new Date()
  appointment.isSlotBooked = false
  await appointment.save()

  // Notify patient
  await Notification.create({
    recipient: appointment.patient,
    recipientModel: 'Patient',
    title: 'Appointment Cancelled',
    message,
    type: 'appointment',
    relatedAppointment: appointment._id,
  })

  // Email patient (non-blocking style)
  const patient = await Patient.findById(appointment.patient)
  if (patient?.email) {
    await sendEmail({
      to: patient.email,
      subject: 'MediCare — Appointment Cancelled',
      html: `<p>Hello ${patient.name},</p>
        <p>Your appointment <b>${appointment.appointmentId}</b> with <b>${appointment.doctorName}</b> on ${appointment.date} at ${appointment.time} has been cancelled.</p>
        ${
          refundStatus === 'processed'
            ? `<p><b>Paid amount:</b> ₹${fee}</p>
               <p><b>Cancellation fee:</b> ₹${cancellationFee}</p>
               <p><b>Refund amount:</b> ₹${refundAmount}</p>
               <p><b>Refund ID:</b> ${refundId}</p>
               <p>The refund will be credited to your original payment method.</p>`
            : `<p>No payment was collected for this booking.</p>`
        }`,
    })
  }

  return sendSuccess(res, message, {
    appointment: formatAppointment(appointment),
    refund: {
      paidAmount: fee,
      cancellationFee,
      refundAmount,
      refundId,
      refundStatus,
    },
  })
}

/* ----------------------------- ADMIN MGMT ------------------------------ */

// @route   GET /api/admin/appointments
export const adminGetAppointments = async (req, res) => {
  const {
    search,
    status,
    doctor,
    date,
    page = 1,
    limit = 20,
    sort = 'desc',
  } = req.query

  const filter = {}
  if (status) filter.status = status
  if (doctor) filter.doctor = doctor
  if (date) filter.date = date

  if (search) {
    const patients = await Patient.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }).select('_id')
    filter.$or = [
      { patient: { $in: patients.map((p) => p._id) } },
      { appointmentId: { $regex: search, $options: 'i' } },
      { patientName: { $regex: search, $options: 'i' } },
      { patientEmail: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const sortOrder = sort === 'asc' ? 1 : -1

  const appointments = await Appointment.find(filter)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name specialization image')
    .sort({ date: sortOrder, createdAt: sortOrder })
    .skip(skip)
    .limit(Number(limit))

  const total = await Appointment.countDocuments(filter)

  return sendSuccess(res, 'Appointments fetched', {
    appointments: appointments.map(formatAppointment),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  })
}

// @route   PATCH /api/admin/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body
  const appointment = await findAppointmentByIdOrCode(req.params.id)
  if (!appointment) return sendError(res, 'Appointment not found', 404)

  appointment.status = status
  await appointment.save()

  await Notification.create({
    recipient: appointment.patient,
    recipientModel: 'Patient',
    title: `Appointment ${status}`,
    message: `Your appointment (${appointment.appointmentId}) is now ${status}.`,
    type: 'appointment',
    relatedAppointment: appointment._id,
  })

  return sendSuccess(res, `Appointment ${status}`, {
    appointment: formatAppointment(appointment),
  })
}

// @route   DELETE /api/admin/appointments/:id
export const deleteAppointment = async (req, res) => {
  const appointment = await findAppointmentByIdOrCode(req.params.id)
  if (!appointment) return sendError(res, 'Appointment not found', 404)

  await appointment.deleteOne()
  return sendSuccess(res, 'Appointment deleted successfully')
}
