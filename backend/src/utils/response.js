/**
 * Standardized API response helpers.
 * Every response follows the contract:
 *   { success: boolean, message: string, data?: {}, errors?: [] }
 */

export const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const sendError = (
  res,
  message = 'Something went wrong',
  statusCode = 500,
  errors = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  })
}

export const sendValidationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors,
  })
}
