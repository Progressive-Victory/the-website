import mongoose, { Document, Model, Schema } from 'mongoose'
import { IPermission, Permission } from './Permission'

export interface IRole extends Document{
    name: string
    permissions: IPermission[]
}

const roleSchema = new Schema<IRole>({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: Permission, required: true }],
})

export const Role: Model<IRole> = mongoose.model<IRole>('Role', roleSchema)

export default Role