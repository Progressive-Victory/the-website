import mongoose, { Document, Model, Schema } from 'mongoose'
import { IPermission } from './Permission'

export interface IRole {
    name: string
    permissions: IPermission["_id"]
}

export type RoleDocument = IRole & Document

const roleSchema = new Schema<IRole>({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
})

export const Role: Model<IRole> =
    (mongoose.models as Record<string, Model<IRole>>).Role ||
    mongoose.model<IRole>('Role', roleSchema)
