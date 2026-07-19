import mongoose from 'mongoose'
import { sendError } from '../utils/response.js'

/**
 * Central error-handling middleware.
 * - Never crashes the server.
 * - Maps known error types (validation, duplicate key, cast) to clean JSON.
 * - Falls back to a generic 500.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  const errors = []

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `An account with that ${field} already exists.`
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422
    message = 'Validation failed'
    for (const key in err.errors) {
      errors.push({ field: key, message: err.errors[key].message })
    }
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired, please login again'
  }

  // Log unexpected errors server-side only
  if (statusCode === 500) {
    console.error('💥 Unhandled error:', err)
  }

  return sendError(res, message, statusCode, errors)
}

export default errorHandler
