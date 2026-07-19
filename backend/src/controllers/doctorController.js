import Doctor from '../models/Doctor.js'
import { sendSuccess, sendError } from '../utils/response.js'

/**
 * Normalizes a doctor document into the shape the frontend expects.
 * The frontend uses `id`, `fee`, `about`, `slots` (not `consultationFee`,
 * `description`, `availableTimeSlots`). We map both for safety.
 */
export const formatDoctor = (doc) => {
  const d = typeof doc.toObject === 'function' ? doc.toObject() : doc
  const availability = d.availability || {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isOnLeave = availability.isOnLeave || d.status === 'on_leave' || false
  const leaveStart = availability.leaveStart ? new Date(availability.leaveStart) : null
  const leaveEnd = availability.leaveEnd ? new Date(availability.leaveEnd) : null

  let isCurrentlyOnLeave = false
  if (d.status === 'on_leave' || availability.isOnLeave) {
    if (leaveStart && leaveEnd) {
      isCurrentlyOnLeave = today >= leaveStart && today <= leaveEnd
    } else if (leaveEnd) {
      isCurrentlyOnLeave = today <= leaveEnd
    } else {
      // Marked on leave with no end date → treat as currently unavailable
      isCurrentlyOnLeave = true
    }
  }

  // Determine next available date
  let nextAvailable = null
  if (isCurrentlyOnLeave && leaveEnd) {
    const afterLeave = new Date(leaveEnd)
    afterLeave.setDate(afterLeave.getDate() + 1)
    nextAvailable = afterLeave
  } else if (availability.nextAvailableDate) {
    nextAvailable = new Date(availability.nextAvailableDate)
  }

  return {
    id: d._id.toString(),
    name: d.name,
    image: d.image || '',
    email: d.email || '',
    phone: d.phone || '',
    qualification: d.qualification || '',
    experience: d.experience || 0,
    specialization: d.specialization,
    department: d.department || d.specialization || '',
    description: d.description || d.about || '',
    about: d.about || d.description || '',
    education: d.education || [],
    hospital: d.hospital || 'MediCare Hospital',
    fee: d.fee ?? d.consultationFee ?? 0,
    consultationFee: d.consultationFee ?? d.fee ?? 0,
    rating: d.rating || 0,
    reviews: d.reviews || 0,
    availableDays: d.availableDays || [],
    slots: d.slots?.length ? d.slots : d.availableTimeSlots || [],
    availableTimeSlots: d.availableTimeSlots?.length
      ? d.availableTimeSlots
      : d.slots || [],
    status: d.status || 'active',
    availability: {
      isOnLeave,
      isCurrentlyOnLeave,
      leaveStart: availability.leaveStart || null,
      leaveEnd: availability.leaveEnd || null,
      leaveReason: availability.leaveReason || '',
      unavailableDates: (availability.unavailableDates || []).map((dt) =>
        new Date(dt).toISOString().split('T')[0]
      ),
      unavailableDays: availability.unavailableDays || [],
      nextAvailableDate: nextAvailable
        ? nextAvailable.toISOString().split('T')[0]
        : null,
    },
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

// @route   GET /api/doctors
export const getDoctors = async (req, res) => {
  const { search, specialization, availability, status } = req.query

  const filter = {}
  if (search) filter.name = { $regex: search, $options: 'i' }
  if (specialization) filter.specialization = specialization
  if (availability) filter.availableDays = availability
  if (status) filter.status = status

  const doctors = await Doctor.find(filter).sort({ createdAt: -1 })
  return sendSuccess(res, 'Doctors fetched', {
    doctors: doctors.map(formatDoctor),
    count: doctors.length,
  })
}

// @route   GET /api/doctors/:id
export const getDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
  if (!doctor) return sendError(res, 'Doctor not found', 404)
  return sendSuccess(res, 'Doctor fetched', { doctor: formatDoctor(doctor) })
}

// @route   POST /api/admin/doctors
export const addDoctor = async (req, res) => {
  const body = { ...req.body }
  if (req.file) {
    body.image = `/uploads/${req.file.filename}`
  }
  if (body.slots && !body.availableTimeSlots) {
    body.availableTimeSlots = body.slots
  }
  if (!body.department && body.specialization) {
    body.department = body.specialization
  }
  if (body.availability?.isOnLeave && body.status !== 'inactive') {
    body.status = 'on_leave'
  }

  const doctor = await Doctor.create(body)
  return sendSuccess(res, 'Doctor added successfully', {
    doctor: formatDoctor(doctor),
  }, 201)
}

// @route   PUT /api/admin/doctors/:id
export const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
  if (!doctor) return sendError(res, 'Doctor not found', 404)

  const body = { ...req.body }
  if (req.file) {
    body.image = `/uploads/${req.file.filename}`
  }
  if (body.slots && !body.availableTimeSlots) {
    body.availableTimeSlots = body.slots
  }
  if (!body.department && body.specialization) {
    body.department = body.specialization
  }
  if (body.availability?.isOnLeave && body.status !== 'inactive') {
    body.status = 'on_leave'
  } else if (body.availability && body.availability.isOnLeave === false && body.status === 'on_leave') {
    body.status = 'active'
  }

  const updated = await Doctor.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  })
  return sendSuccess(res, 'Doctor updated successfully', {
    doctor: formatDoctor(updated),
  })
}

// @route   DELETE /api/admin/doctors/:id
export const deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
  if (!doctor) return sendError(res, 'Doctor not found', 404)

  await doctor.deleteOne()
  return sendSuccess(res, 'Doctor deleted successfully')
}
