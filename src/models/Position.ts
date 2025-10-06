import mongoose, { Document, Model, Schema } from 'mongoose'
import { IPermission, Permission } from './Permission'

export interface IPosition extends Document {
    name: string
    permissions: IPermission[]
    parentPositions: IPosition[]
    childrenPositions: IPosition[]
    siblingPositions: IPosition[]
}

const schema = new Schema<IPosition>({
    name: { type: String, required: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: Permission }],
    parentPositions: [{ type: Schema.Types.ObjectId, ref: 'Position' }],
    childrenPositions: [{ type: Schema.Types.ObjectId, ref: 'Position' }],
    siblingPositions: [{ type: Schema.Types.ObjectId, ref: 'Position' }],
})

// Finally the model itself is exported, we use the cache if it exists
export const Position: Model<IPosition> =
    (mongoose.models as Record<string, Model<IPosition>>).Position ||
    mongoose.model<IPosition>('Position', schema)

// Default export
export default Position
