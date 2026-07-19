// Centralized data placeholders for the frontend.
//
// All hardcoded demo data has been removed. Pages now start empty and show
// appropriate empty states / loading skeletons. When the backend is ready,
// replace the usages with API calls via services/api.js (e.g. api.get('/doctors')).
//
// The exports below are kept as empty defaults so existing imports don't break
// and can be wired to real API responses later.

export const departments = []
export const doctors = []
export const reviews = []
export const bookedSlots = {}
export const contactMessages = []
export const patientAppointments = []
export const medicalHistory = []
export const adminStats = {
  totalDoctors: 0,
  totalPatients: 0,
  totalAppointments: 0,
  todaysAppointments: 0,
}
export const hospitalInfo = {
  name: '',
  address: '',
  phone: '',
  email: '',
  emergency: '',
  ambulance: '',
}
