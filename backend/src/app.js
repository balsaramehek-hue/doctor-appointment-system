import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

import corsOptions from './config/cors.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import errorHandler from './middleware/errorHandler.js'
import { sendError } from './utils/response.js'

// Route imports
import authRoutes from './routes/authRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import patientRoutes from './routes/patientRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import departmentRoutes from './routes/departmentRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

/* ----------------------------- MIDDLEWARE ----------------------------- */

// Security headers
app.use(helmet())

// CORS
app.use(corsOptions)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Cookies
app.use(cookieParser())

// Logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Global rate limiter
app.use('/api', apiLimiter)

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

/* ------------------------------- ROUTES ------------------------------- */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MediCare API is running',
    version: '1.0.0',
  })
})

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK' })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/admin/dashboard', dashboardRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/departments', departmentRoutes)

/* --------------------------- ERROR HANDLING --------------------------- */

// 404 handler
app.use((req, res) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404)
})

// Central error middleware (must be last)
app.use(errorHandler)

export default app
