import mongoose, { Document, Model, Schema } from 'mongoose'

// Here is a sample user document
// It defines the structure of the user document
export interface IPerm extends Document {
    title: String,
}

// We then create a schema for the user document, tells Mongoose how the document should be structured
export const userSchema = new Schema<IPerm>({
    title: String,
})

// A name
const modelName = 'Perm'

// Finally the model itself is exported, we use the cache if it exists
export const Perm: Model<IPerm> =
    (mongoose.models as Record<string, Model<IPerm>>)[modelName] ||
    mongoose.model<IPerm>(modelName, userSchema)

// Default export
export default Perm
