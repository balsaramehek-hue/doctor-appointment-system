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

/**
 * Normalize API base URL so both of these work on Netlify:
 *   https://xxx.onrender.com
 *   https://xxx.onrender.com/api
 */
const resolveApiBase = () => {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5002/api').trim()
  const noTrailing = raw.replace(/\/+$/, '')
  if (/\/api$/i.test(noTrailing)) return noTrailing
  return `${noTrailing}/api`
}

const API_BASE = resolveApiBase()

const API = axios.create({
  baseURL: API_BASE,
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
