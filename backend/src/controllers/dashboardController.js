import moment from 'moment'
import Doctor from '../models/Doctor.js'
import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import { sendSuccess } from '../utils/response.js'

// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  const todayStr = moment().format('YYYY-MM-DD')

  const [totalDoctors, totalPatients, totalAppointments, todaysAppointments] =
    await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: todayStr }),
    ])

  const completed = await Appointment.countDocuments({ status: 'completed' })
  const cancelled = await Appointment.countDocuments({ status: 'cancelled' })
  const confirmed = await Appointment.countDocuments({ status: 'confirmed' })
  const pending = await Appointment.countDocuments({ status: 'pending' })

  // Revenue placeholder — sum of fees for completed/confirmed appointments.
  const revenueAgg = await Appointment.aggregate([
    { $match: { status: { $in: ['completed', 'confirmed'] } } },
    { $group: { _id: null, total: { $sum: '$fee' } } },
  ])
  const revenue = revenueAgg.length ? revenueAgg[0].total : 0

  return sendSuccess(res, 'Dashboard stats fetched', {
    stats: {
      totalDoctors,
      totalPatients,
      totalAppointments,
      todaysAppointments,
      completed,
      cancelled,
      confirmed,
      pending,
      revenue,
    },
  })
}
