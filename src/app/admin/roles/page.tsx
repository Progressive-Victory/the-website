import ClientPage from './client'
import MongoPermission from '@/models/MongoPermission'
import dbConnect from '@/util/libmongo'

export default async function Page() {
    await dbConnect()
    const permissions = (await MongoPermission.find({})).map((r) =>
        r.toObject({
            flattenObjectIds: true,
            versionKey: false,
        })
    )

    return <ClientPage permissions={permissions} />
}
