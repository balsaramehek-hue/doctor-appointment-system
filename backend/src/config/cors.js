import cors from 'cors'

/**
 * CORS configuration for local + production (Netlify ↔ Render).
 * Set CLIENT_URL on Render to your Netlify site URL.
 */
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
  'https://smart-healthcare-hospital.netlify.app',
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, server-to-server)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    // Allow any *.netlify.app preview deploy
    if (/^https:\/\/[a-z0-9-]+--smart-healthcare-hospital\.netlify\.app$/i.test(origin)) {
      return callback(null, true)
    }
    if (/^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin)) {
      return callback(null, true)
    }

    console.log('Blocked Origin:', origin)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

export default cors(corsOptions)
