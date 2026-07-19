import { validationResult } from 'express-validator'
import { sendValidationError } from '../utils/response.js'

/**
 * Middleware factory that runs a set of express-validator chains and,
 * if any fail, returns a 422 with the formatted errors array.
 *
 * Usage: router.post('/x', validate([...chains]), controller)
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)))

    const result = validationResult(req)
    if (!result.isEmpty()) {
      const errors = result.array().map((e) => ({
        field: e.path || e.param,
        message: e.msg,
      }))
      return sendValidationError(res, errors)
    }
    next()
  }
}

export default validate
