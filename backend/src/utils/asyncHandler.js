/**
 * Wraps an async route handler so thrown errors / rejected promises
 * are forwarded to the central error middleware (next(err)).
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
