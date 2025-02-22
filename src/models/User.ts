import mongoose, { Document, Model, Schema } from 'mongoose'

// Here is a sample user document
// It defines the structure of the user document
export interface IUser extends Document {
    name: string
    email: string
    image: string
}

// We then create a schema for the user document, tells Mongoose how the document should be structured
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
})

// A name
const modelName = 'User'

// Finally the model itself is exported, we use the cache if it exists
export const User: Model<IUser> =
    (mongoose.models as Record<string, Model<IUser>>)[modelName] ||
    mongoose.model<IUser>(modelName, userSchema)

// Default export
export default User
