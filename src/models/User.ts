import mongoose, { Document, Model, Schema } from 'mongoose'
import { IRole, Role } from './Role'
import { OnboardingStage } from '@/util/stage'
import { Location } from '@/models/Location'

// Here is a user document
// It defines the structure of the user and provides a POJO for interacting with user data
export interface IUser extends Document {
    name: string
    email: string
    image: string
    discordId: string
    discordUserAvatar?: string
    zipCode?: string
    state?: string
    county?: string
    city?: string
    preferredName?: string
    phoneNumber?: string
    acceptedAlerts?: boolean
    verified: boolean
    onboardingStage: OnboardingStage
    roles: IRole[]
    firstName?: string
    lastName?: string
}

// We then create a schema for the user document, tells Mongoose how the document should be structured
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    discordId: { type: String, required: true },
    discordUserAvatar: { type: String, required: false },
    zipCode: { type: String, required: false },
    state: { type: String, required: false },
    county: { type: String, required: false },
    city: { type: String, required: false },
    preferredName: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    acceptedAlerts: { type: Boolean, required: false, default: false },
    verified: { type: Boolean, required: false, default: false },
    onboardingStage: {
        type: String,
        enum: OnboardingStage,
        default: OnboardingStage.NOT_STARTED,
    },
    roles: [{ type: Schema.Types.ObjectId, ref: Role }],
    firstName: { type: String, required: false },
    lastName: { type: String, required: false }
})

userSchema.post('save', (doc: Document<IUser>, next) => {
    setTimeout(() => {
        const usr: IUser = doc as IUser
        if(usr.zipCode && !(usr.state && usr.county && usr.city)) {
            void Location.findOne({"zip": usr.zipCode}).then((usrLoc) => {
                if(!usrLoc) return
                usr.city = usrLoc.primary_city
                usr.county = usrLoc.county
                usr.state = usrLoc.state
                void usr.save()
            })
        }
        next()
    }, 10)
})

// A name
const modelName = 'User'

// Finally the model itself is exported, we use the cache if it exists
export const User: Model<IUser> =
    (mongoose.models as Record<string, Model<IUser>>).User ||
    mongoose.model<IUser>(modelName, userSchema)

// Default export
export default User
