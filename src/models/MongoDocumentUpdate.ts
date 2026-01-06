import mongoose, { Document, Model, ObjectId, Schema, Date } from 'mongoose'

export interface IMongoDocumentUpdate extends Document {
    // The collection that the updated document was from
    collection_name: string
    // The _id of the document which was updated
    document_id: ObjectId
    // The name of the filed which was updated
    field_name: string
    // The value that the field had before the update
    previous_value: unknown
    // The value that the field had after the update
    new_value: unknown
    // The time at which the document was updated
    updated_at: Date
    // The user that updated the document (if applicable)
    updated_by: ObjectId | null
}

const schema = new Schema<IMongoDocumentUpdate>(
    {
        collection_name: { type: String, required: true },
        document_id: { type: Schema.Types.ObjectId, required: true },
        field_name: { type: String, required: true },
        previous_value: { type: Schema.Types.Mixed, required: true },
        new_value: { type: Schema.Types.Mixed, required: true },
        updated_at: { type: Schema.Types.Date, required: true },
        updated_by: {
            type: Schema.Types.ObjectId,
            required: false,
        },
    },
    {
        collection: 'document_updates',
    }
)

export const MongoDocumentUpdate: Model<IMongoDocumentUpdate> =
    (mongoose.models as Record<string, Model<IMongoDocumentUpdate>>)
        .DocumentUpdate ||
    mongoose.model<IMongoDocumentUpdate>('MongoDocumentUpdate', schema)

export default MongoDocumentUpdate
