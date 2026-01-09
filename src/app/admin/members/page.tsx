import ClientPage from './client'
import MongoRole from '@/models/MongoRole'
import dbConnect from '@/util/libmongo'

export default async function Page() {
    await dbConnect()

    const roles = (await MongoRole.find({})).map((r) =>
        r.toObject({
            flattenObjectIds: true,
            versionKey: false,
        })
    )

    return <ClientPage roles={roles} />
}
