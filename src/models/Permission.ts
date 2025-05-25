import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IPermission extends Document {
    name: string
}

const permissionSchema = new Schema<IPermission>({
    name: {type: String, required: true}
})

export const Permission: Model<IPermission> = mongoose.model<IPermission>('Permission', permissionSchema)

export default Permission