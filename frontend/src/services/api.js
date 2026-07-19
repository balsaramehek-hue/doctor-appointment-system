import axios from 'axios'

const TOKEN_KEY = 'medicare_token'

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export const setStoredToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore storage errors
  }
}

export const clearStoredToken = () => setStoredToken('')

// Centralized API client. Base URL comes from VITE_API_URL (Netlify env / .env).
// Sends cookies when available, and Authorization Bearer as a cross-origin fallback
// (Netlify frontend + Render API are different sites).
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

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

API.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  // Let the browser set multipart boundary for FormData
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type']
    }
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data

    if (!error.response) {
      const netErr = new Error(
        'Network connection lost. Please check your internet connection and try again.'
      )
      netErr.status = 0
      netErr.isNetworkError = true
      netErr.errors = []
      return Promise.reject(netErr)
    }

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
