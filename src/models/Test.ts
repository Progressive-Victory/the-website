import mongoose, {Document, Model, Schema} from "mongoose";

export interface ITest extends Document{
    a: string
    b: Int32Array
    c?: boolean
}

const testSchema = new Schema<ITest>({
    a: {type: String, required: true },
    b: {type: Schema.Types.Int32, required: true},
    c: {type: Boolean, required: false},
})

export const Test: Model<ITest> =
    (mongoose.models as Record<string, Model<ITest>>).Test ||
    mongoose.model<ITest>('Test', testSchema)
 
export default Test