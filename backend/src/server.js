import 'dotenv/config'
import app from './app.js'
import connectDB from './config/db.js'

const PORT = process.env.PORT || 5000

/**
 * Entry point: connect to MongoDB then start the HTTP server.
 * The server is never allowed to crash from an unhandled error — we log and
 * keep running where possible, and only exit on fatal DB connection failure.
 */
const startServer = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
  })

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`)
    server.close(() => {
      console.log('💤 Process terminated')
      process.exit(0)
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))

  // Prevent crashes from unhandled promise rejections / exceptions
  process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection:', reason)
  })
  process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception:', err)
  })
}

startServer()
