import Contact from '../models/Contact.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { sendEmail } from '../utils/email.js'

// @route   POST /api/contact
export const submitContact = async (req, res) => {
  const { name, email, phone, message } = req.body
  // Only link patient accounts (not admins browsing the public form)
  const patientId = req.user?.role === 'patient' ? req.user._id : null

  const contact = await Contact.create({
    name,
    email,
    phone,
    message,
    patient: patientId,
  })

  // Notify admin (non-blocking)
  await sendEmail({
    to: process.env.EMAIL_USER || 'admin@medicarehospital.com',
    subject: 'MediCare — New Contact Message',
    html: `<p><b>${name}</b> (${email}, ${phone || 'no phone'}) sent a message:</p>
      <p>${message}</p>`,
  })

  return sendSuccess(
    res,
    'Your message has been sent successfully',
    { contact: { id: contact._id.toString(), status: contact.status } },
    201
  )
}

// @route   GET /api/contact/my
// Patient: get own contact messages
export const getMyContacts = async (req, res) => {
  const patientId = req.user._id
  const { page = 1, limit = 20 } = req.query

  const skip = (Number(page) - 1) * Number(limit)
  const messages = await Contact.find({ patient: patientId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
  const total = await Contact.countDocuments({ patient: patientId })

  const data = messages.map((m) => ({
    id: m._id.toString(),
    name: m.name,
    email: m.email,
    phone: m.phone,
    message: m.message,
    status: m.status,
    date: m.createdAt,
    reply: m.reply?.message || '',
    repliedAt: m.reply?.repliedAt || null,
    isRead: m.status !== 'unread',
  }))

  return sendSuccess(res, 'Messages fetched', {
    messages: data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  })
}

// @route   GET /api/admin/contact
export const getContacts = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status

  const skip = (Number(page) - 1) * Number(limit)
  const messages = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
  const total = await Contact.countDocuments(filter)

  const data = messages.map((m) => ({
    id: m._id.toString(),
    name: m.name,
    email: m.email,
    phone: m.phone,
    message: m.message,
    status: m.status,
    date: m.createdAt,
    reply: m.reply?.message || '',
    repliedAt: m.reply?.repliedAt || null,
    patient: m.patient ? m.patient.toString() : null,
  }))

  return sendSuccess(res, 'Messages fetched', {
    messages: data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  })
}

// @route   PATCH /api/admin/contact/:id/read
export const markRead = async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: 'read' },
    { new: true }
  )
  if (!contact) return sendError(res, 'Message not found', 404)
  return sendSuccess(res, 'Message marked as read', {
    message: { id: contact._id.toString(), status: contact.status },
  })
}

// @route   PATCH /api/admin/contact/:id/solve
export const markSolved = async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: 'solved' },
    { new: true }
  )
  if (!contact) return sendError(res, 'Message not found', 404)
  return sendSuccess(res, 'Message marked as solved', {
    message: { id: contact._id.toString(), status: contact.status },
  })
}

// @route   PATCH /api/admin/contact/:id/reply
export const replyToContact = async (req, res) => {
  const { message: replyMessage } = req.body
  const adminId = req.user._id

  const contact = await Contact.findById(req.params.id)
  if (!contact) return sendError(res, 'Message not found', 404)

  contact.reply = {
    message: replyMessage,
    repliedAt: new Date(),
    repliedBy: adminId,
  }
  contact.status = 'read'
  await contact.save()

  // Send reply email to patient (non-blocking)
  if (contact.email) {
    await sendEmail({
      to: contact.email,
      subject: 'MediCare — Reply to Your Message',
      html: `<p>Hello ${contact.name},</p>
        <p>We have replied to your message:</p>
        <p><b>Your message:</b> ${contact.message}</p>
        <p><b>Our reply:</b> ${replyMessage}</p>
        <p>Thank you for contacting MediCare.</p>`,
    })
  }

  return sendSuccess(res, 'Reply sent successfully', {
    message: {
      id: contact._id.toString(),
      status: contact.status,
      reply: contact.reply?.message || '',
      repliedAt: contact.reply?.repliedAt || null,
    },
  })
}

// @route   DELETE /api/admin/contact/:id
export const deleteContact = async (req, res) => {
  const contact = await Contact.findById(req.params.id)
  if (!contact) return sendError(res, 'Message not found', 404)
  await contact.deleteOne()
  return sendSuccess(res, 'Message deleted successfully')
}
