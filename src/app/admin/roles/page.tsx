import ClientPage from './client'
import Permission from '@/models/Permission'
import dbConnect from '@/util/libmongo'

export default async function Page() {
    await dbConnect()
    const permissions = (await Permission.find({})).map((r) =>
        r.toObject({
            flattenObjectIds: true,
            versionKey: false,
        })
    )

    return <ClientPage permissions={permissions} />
}
