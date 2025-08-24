import Role from '@/models/Role'
import ClientPage from './client'
import dbConnect from '@/util/libmongo'

export default async function Page() {
  await dbConnect()
    const roles = (await Role.find({})).map((r) =>
        r.toObject({
            flattenObjectIds: true,
            versionKey: false,
        })
    )

    return <ClientPage roles={roles} />
}
