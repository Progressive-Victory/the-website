import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

async function dbConnect() {
    // If the connection is already established (readyState 1 means connected),
    // return the mongoose instance right away.
    if (mongoose.connection.readyState >= 1) {
        return mongoose
    }

    if (!MONGODB_URI) throw Error('Please define the MONGODB_URI environment variable')

    try {
        // Connect to MongoDB; note that in a serverless environment it is
        // acceptable to connect on every invocation since cold starts are expected.
        await mongoose.connect(MONGODB_URI, {
            bufferCommands: false, // Disable mongoose buffering, recommended for serverless.
        })

        return mongoose
    } catch (error) {
        console.error('MongoDB connection error:', error)
        throw error
    }
}

export default dbConnect
