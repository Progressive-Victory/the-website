import mongoose, { Document, Model, Schema } from 'mongoose'
// import iPerm from "./Perm"
import * as perms from "./Perm"
// Here is a sample user document
// It defines the structure of the user document
export interface IRole extends Document {
    title: String,
    isLeadershipRole: Boolean, 

    permissions: [perms.IPerm], 
    superiors: [IRole], 
    subordinates: [IRole]
}

// We then create a schema for the user document, tells Mongoose how the document should be structured
const userSchema = new Schema<IRole>({
    title: String,
    isLeadershipRole : { type: Boolean, default: false }, 
    permissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Perm', require: false}], 
    superiors: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role', require: false}], 
    subordinates: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role', require: false}], 
})

// A name
const modelName = 'Role'

// Finally the model itself is exported, we use the cache if it exists
export const Role: Model<IRole> =
    (mongoose.models as Record<string, Model<IRole>>)[modelName] ||
    mongoose.model<IRole>(modelName, userSchema)

// Default export
export default Role
