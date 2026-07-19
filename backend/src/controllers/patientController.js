import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import { sendSuccess, sendError } from '../utils/response.js'

// @route   GET /api/admin/patients
export const getPatients = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query
  const filter = {}
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const patients = await Patient.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const total = await Patient.countDocuments(filter)

  // Attach appointment count per patient
  const data = await Promise.all(
    patients.map(async (p) => {
      const appointments = await Appointment.countDocuments({ patient: p._id })
      return {
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        phone: p.phone,
        gender: p.gender,
        address: p.address,
        joined: p.createdAt,
        appointments,
      }
    })
  )

  return sendSuccess(res, 'Patients fetched', {
    patients: data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  })
}

// @route   GET /api/admin/patients/:id
export const getPatient = async (req, res) => {
  const patient = await Patient.findById(req.params.id).select('-password')
  if (!patient) return sendError(res, 'Patient not found', 404)

  const appointments = await Appointment.countDocuments({ patient: patient._id })
  return sendSuccess(res, 'Patient fetched', {
    patient: {
      id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      address: patient.address,
      dob: patient.dob,
      joined: patient.createdAt,
      appointments,
      medicalHistory: patient.medicalHistory,
    },
  })
}
