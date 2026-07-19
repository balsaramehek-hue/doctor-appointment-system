import jwt from 'jsonwebtoken'

/**
 * Signs a JWT containing the user id and role.
 * @param {string} id - MongoDB _id of the user (patient or admin)
 * @param {string} role - 'patient' | 'admin'
 */
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

/**
 * Verifies and decodes a JWT. Throws on invalid/expired token.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}
