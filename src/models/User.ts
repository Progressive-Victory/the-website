import mongoose, { Document, Model, Schema } from 'mongoose'
import * as role from "./Role"
// Here is a sample user document
// It defines the structure of the user document
export interface IUser extends Document {
    id: string
    handle: string
    display_name: string
    image: string
    roles: [role.IRole]
}

// We then create a schema for the user document, tells Mongoose how the document should be structured
const userSchema = new Schema<IUser>({
    id: { type: String, required: true },
    handle: { type: String, required: true },
    display_name: { type: String, required: false },
    image: { type: String, required: true },
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role', require: false}], 
})

// A name
const modelName = 'User'

// Finally the model itself is exported, we use the cache if it exists
export const User: Model<IUser> =
    (mongoose.models as Record<string, Model<IUser>>)[modelName] ||
    mongoose.model<IUser>(modelName, userSchema)

// Default export
export default User
