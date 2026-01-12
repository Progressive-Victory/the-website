import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IMongoPermission extends Document {
    name: string
}

const permissionSchema = new Schema<IMongoPermission>({
    name: { type: String, required: true },
})

export const MongoPermission: Model<IMongoPermission> =
    (mongoose.models as Record<string, Model<IMongoPermission>>).Permission ||
    mongoose.model<IMongoPermission>('Permission', permissionSchema)

export default MongoPermission
