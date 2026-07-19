/**
 * Parses JSON-string fields sent via multipart/form-data (e.g. from FormData).
 * Multer leaves arrays/objects as strings; this restores them before validation.
 */
const JSON_FIELDS = [
  'availableDays',
  'slots',
  'availableTimeSlots',
  'availability',
  'education',
  'unavailableDates',
  'unavailableDays',
]

export const parseFormJson = (req, res, next) => {
  for (const field of JSON_FIELDS) {
    if (typeof req.body?.[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field])
      } catch {
        // Leave as string; validators will reject invalid shapes.
      }
    }
  }

  // Coerce numeric string fields from FormData
  for (const numField of ['fee', 'experience', 'consultationFee']) {
    if (typeof req.body?.[numField] === 'string' && req.body[numField] !== '') {
      const n = Number(req.body[numField])
      if (!Number.isNaN(n)) req.body[numField] = n
    }
  }

  // Coerce boolean nested in availability if needed
  if (req.body?.availability && typeof req.body.availability.isOnLeave === 'string') {
    req.body.availability.isOnLeave =
      req.body.availability.isOnLeave === 'true' || req.body.availability.isOnLeave === true
  }

  next()
}
