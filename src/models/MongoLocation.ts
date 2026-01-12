import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IMongoLocation extends Document {
    zip: string
    type: string
    decommissioned: number
    primary_city: string
    acceptable_cities: string
    unacceptable_cities: string
    state: string
    county: string
    timezone: string
    area_codes: string
    world_region: string
    country: string
    latitude: number
    longitude: number
    irs_estimated_population: number
}

const locationSchema = new Schema<IMongoLocation>({
    zip: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    decommissioned: { type: Number, required: true },
    primary_city: { type: String, required: true },
    acceptable_cities: { type: String, required: true },
    unacceptable_cities: { type: String, required: true },
    state: { type: String, required: true },
    county: { type: String, required: true },
    timezone: { type: String, required: true },
    area_codes: { type: String, required: true },
    world_region: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    irs_estimated_population: { type: Number, required: true },
})

const modelName = 'Location'

export const MongoLocation: Model<IMongoLocation> =
    (mongoose.models as Record<string, Model<IMongoLocation>>).Location ||
    mongoose.model<IMongoLocation>(modelName, locationSchema)

export default MongoLocation
