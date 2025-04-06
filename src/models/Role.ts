import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IRole {
    name: string
    permissions: string[]
}

export type RoleDocument = IRole & Document

const roleSchema = new Schema<IRole>({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String, enum: ['ADMIN', 'USER', 'GUEST'] }],
})

export const Role: Model<IRole> =
    (mongoose.models as Record<string, Model<IRole>>).Role ||
    mongoose.model<IRole>('Role', roleSchema)
