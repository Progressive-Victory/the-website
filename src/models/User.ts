import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUser extends Document {
    name: string
    email: string
    image: string
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
})

const modelName = 'User'

export const User: Model<IUser> =
    (mongoose.models as any)[modelName] ||
    mongoose.model<IUser>(modelName, userSchema)

export default User
