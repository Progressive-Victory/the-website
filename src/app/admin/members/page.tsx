import Role from '@/models/Role'
import ClientPage from './client'

export default async function Page() {
    const roles = (await Role.find({})).map((r) =>
        r.toObject({
            flattenObjectIds: true,
            versionKey: false,
        })
    )

    return <ClientPage roles={roles} />
}
