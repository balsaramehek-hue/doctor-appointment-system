import API from './api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Build an absolute image URL from a backend image path (e.g. "/uploads/x.jpg").
// Doctor images are served by the backend's static /uploads route, so we prefix
// the backend origin. If the value is already a full URL, return as-is.
export const getImageUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5002/api').replace(
    /\/api\/?$/,
    ''
  )
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const authService = {
  register: (data) => API.post('/auth/register', data).then((r) => r.data),
  login: (data) => API.post('/auth/login', data).then((r) => r.data),
  adminLogin: (data) => API.post('/auth/admin/login', data).then((r) => r.data),
  logout: () => API.post('/auth/logout').then((r) => r.data),
  getMe: () => API.get('/auth/me').then((r) => r.data),
  updateProfile: (data) =>
    API.put('/auth/profile', data).then((r) => r.data),
  changePassword: (data) =>
    API.post('/auth/change-password', data).then((r) => r.data),
  forgotPassword: (data) =>
    API.post('/auth/forgot-password', data).then((r) => r.data),
  resetPassword: (data) =>
    API.post('/auth/reset-password', data).then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Doctors
// ---------------------------------------------------------------------------

export const doctorService = {
  getDoctors: (params = {}) =>
    API.get('/doctors', { params }).then((r) => r.data),
  getDoctor: (id) => API.get(`/doctors/${id}`).then((r) => r.data),
  // Admin: create / update (multipart for image upload) / delete
  addDoctor: (formData) =>
    API.post('/doctors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  updateDoctor: (id, formData) =>
    API.put(`/doctors/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  deleteDoctor: (id) => API.delete(`/doctors/${id}`).then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export const appointmentService = {
  getBookedSlots: (doctorId, date) =>
    API.get('/appointments/booked-slots', {
      params: { doctorId, date },
    }).then((r) => r.data),
  book: (data) => API.post('/appointments/book', data).then((r) => r.data),
  getMyAppointments: (params = {}) =>
    API.get('/appointments/my', { params }).then((r) => r.data),
  getAppointment: (id) =>
    API.get(`/appointments/${id}`).then((r) => r.data),
  cancelMyAppointment: (id) =>
    API.patch(`/appointments/${id}/cancel`).then((r) => r.data),
  processPayment: (id, data) =>
    API.post(`/appointments/${id}/pay`, data).then((r) => r.data),
  // Admin
  getAppointments: (params = {}) =>
    API.get('/appointments', { params }).then((r) => r.data),
  updateStatus: (id, status) =>
    API.patch(`/appointments/${id}/status`, { status }).then((r) => r.data),
  deleteAppointment: (id) =>
    API.delete(`/appointments/${id}`).then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Patients (admin)
// ---------------------------------------------------------------------------

export const patientService = {
  getPatients: (params = {}) =>
    API.get('/patients', { params }).then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Dashboard (admin)
// ---------------------------------------------------------------------------

export const dashboardService = {
  getStats: () => API.get('/admin/dashboard').then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const contactService = {
  submit: (data) => API.post('/contact', data).then((r) => r.data),
  getMyMessages: (params = {}) =>
    API.get('/contact/my', { params }).then((r) => r.data),
  getMessages: (params = {}) =>
    API.get('/contact', { params }).then((r) => r.data),
  markRead: (id) => API.patch(`/contact/${id}/read`).then((r) => r.data),
  markSolved: (id) => API.patch(`/contact/${id}/solve`).then((r) => r.data),
  replyToMessage: (id, message) =>
    API.patch(`/contact/${id}/reply`, { message }).then((r) => r.data),
  deleteMessage: (id) => API.delete(`/contact/${id}`).then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notificationService = {
  getNotifications: () =>
    API.get('/notifications').then((r) => r.data),
  markRead: (id) =>
    API.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    API.patch('/notifications/read-all').then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

export const departmentService = {
  getDepartments: () => API.get('/departments').then((r) => r.data),
  addDepartment: (data) => API.post('/departments', data).then((r) => r.data),
  deleteDepartment: (id) =>
    API.delete(`/departments/${id}`).then((r) => r.data),
}

export default API
