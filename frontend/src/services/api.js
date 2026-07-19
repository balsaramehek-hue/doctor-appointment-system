import axios from 'axios'

// Centralized API client. Every request goes through this instance.
// The base URL is provided via VITE_API_URL (see .env). Cookies are sent
// with every request so the backend's httpOnly JWT cookie is honored.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Friendly, user-facing messages mapped to HTTP status codes.
// Used when the backend does not provide a specific message.
const STATUS_MESSAGES = {
  400: 'Invalid request. Please check the information you provided.',
  401: 'Your session has expired or the credentials are invalid. Please log in again.',
  403: 'You are not authorized to perform this action.',
  404: 'The requested resource could not be found.',
  409: 'This action conflicts with existing data. It may already exist.',
  422: 'Some of the information you provided is invalid. Please review and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'A server error occurred. Please try again later.',
}

// Centralized error normalization. Throws a consistent error object so
// callers can rely on `err.message` and `err.status` regardless of source.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data

    // Network / timeout errors have no response.
    if (!error.response) {
      const netErr = new Error(
        'Network connection lost. Please check your internet connection and try again.'
      )
      netErr.status = 0
      netErr.isNetworkError = true
      netErr.errors = []
      return Promise.reject(netErr)
    }

    // Backend returns { success: false, message, errors }.
    const message =
      data?.message ||
      (typeof data === 'string' ? data : null) ||
      STATUS_MESSAGES[status] ||
      'Something went wrong. Please try again.'

    const normalized = new Error(message)
    normalized.status = status
    normalized.errors = data?.errors || []
    return Promise.reject(normalized)
  }
)

export default API
