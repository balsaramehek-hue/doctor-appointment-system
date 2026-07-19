import mongoose from 'mongoose'

/**
 * Establishes the MongoDB Atlas connection using Mongoose.
 * Exits the process gracefully on failure in production.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables.')
    }

    const conn = await mongoose.connect(uri, {
      // Mongoose 8 no longer needs these options, but kept for clarity.
      serverSelectionTimeoutMS: 10000,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    // Retry-free hard exit in production; in dev let nodemon restart.
    process.exit(1)
  }
}

export default connectDB
