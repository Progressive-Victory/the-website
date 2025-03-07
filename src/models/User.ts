import mongoose, { Document, Model, Schema } from 'mongoose'

// Here is a sample user document
// It defines the structure of the user document
export interface IUser extends Document {
    name: string
    email: string
    image: string
    zipCode?: string
    preferredName?: string
    phoneNumber?: string
    verified: boolean
}

// We then create a schema for the user document, tells Mongoose how the document should be structured
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    zipCode: { type: String, required: false },
    preferredName: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    verified: { type: Boolean, required: false },
})

// A name
const modelName = 'User'

// Finally the model itself is exported, we use the cache if it exists
export const User: Model<IUser> =
    (mongoose.models as Record<string, Model<IUser>>)[modelName] ||
    mongoose.model<IUser>(modelName, userSchema)

// Default export
export default User
