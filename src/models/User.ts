import mongoose, { Document, Model, Schema } from 'mongoose'
import { OnboardingStage } from '@/util/stage'
import { IRole } from './Role'

// Here is a user document
// It defines the structure of the user and provides a POJO for interacting with user data
export interface IUser extends Document {
    name: string
    email: string
    image: string
    discordId: string
    zipCode?: string
    preferredName?: string
    phoneNumber?: string
    acceptedAlerts?: boolean
    verified: boolean
    onboardingStage: OnboardingStage
    roles?: IRole["_id"]
}

// We then create a schema for the user document, tells Mongoose how the document should be structured
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    discordId: { type: String, required: true },
    zipCode: { type: String, required: false },
    preferredName: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    acceptedAlerts: { type: Boolean, required: false, default: false },
    verified: { type: Boolean, required: false, default: false },
    onboardingStage: {
        type: String,
        enum: OnboardingStage,
        default: OnboardingStage.NOT_STARTED,
    },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role', required: false }],
})

// A name
const modelName = 'User'

// Finally the model itself is exported, we use the cache if it exists
export const User: Model<IUser> =
    (mongoose.models as Record<string, Model<IUser>>)[modelName] ||
    mongoose.model<IUser>(modelName, userSchema)

// Default export
export default User
