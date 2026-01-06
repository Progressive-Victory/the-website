import { IMongoPermission, MongoPermission } from './MongoPermission'
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IMongoRole extends Document {
    name: string
    permissions: IMongoPermission[]
}

const roleSchema = new Schema<IMongoRole>({
    name: { type: String, required: true, unique: true },
    permissions: [
        { type: Schema.Types.ObjectId, ref: MongoPermission, required: true },
    ],
})

export const MongoRole: Model<IMongoRole> =
    (mongoose.models as Record<string, Model<IMongoRole>>).Role ||
    mongoose.model<IMongoRole>('Role', roleSchema)

export default MongoRole
