import { ShippingStatus } from './models'
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IDonor extends Document {
    firstname: string
    lastname: string
    shippingAddr1: string
    shippingCity: string
    shippingState: string
    shippingZip: string
    contributionDate: Date
    email: string
    orderNumber: string
    phone: string
    recurringDuration: string
    recurringPeriod: string
    amount: string
    discordUsername: string
    shippingFirstName: string
    shippingLastName: string
    status: string
    shippingStatus: ShippingStatus
}

const schema = new Schema<IDonor>({
    firstname: { type: String, required: false, default: '' },
    lastname: { type: String, required: false, default: '' },
    shippingAddr1: { type: String, required: false, default: '' },
    shippingCity: { type: String, required: false, default: '' },
    shippingState: { type: String, required: false, default: '' },
    shippingZip: { type: String, required: false, default: '' },
    contributionDate: {
        type: Schema.Types.Date,
        required: false,
        default: null,
    },
    email: { type: String, required: false, default: '' },
    orderNumber: { type: String, required: false, default: '' },
    phone: { type: String, required: false, default: '' },
    recurringDuration: { type: String, required: false, default: '' },
    recurringPeriod: { type: String, required: false, default: '' },
    amount: { type: String, required: false, default: '' },
    discordUsername: { type: String, required: false, default: '' },
    shippingFirstName: { type: String, required: false, default: '' },
    shippingLastName: { type: String, required: false, default: '' },
    status: { type: String, required: false, default: '' },
    shippingStatus: {
        type: String,
        enum: ShippingStatus,
        default: ShippingStatus.NOT_SHIPPED,
    },
})

export const Donor: Model<IDonor> =
    (mongoose.models as Record<string, Model<IDonor>>).Donor ||
    mongoose.model<IDonor>('Donor', schema)
