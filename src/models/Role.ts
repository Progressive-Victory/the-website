import mongoose, { Document, Model, Schema, PopulatedDoc, Types } from 'mongoose'
import { IPermission, Permission } from './Permission'

export interface IRole extends Document{
    name: string
    permissions?: [IPermission]
}

const roleSchema = new Schema<IRole>({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: Permission, required: false }],
})

export const Role: Model<IRole> =
    (mongoose.models as Record<string, Model<IRole>>).Role || 
    mongoose.model<IRole>('Role', roleSchema)

export default Role