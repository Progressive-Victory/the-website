import ClientPage from './client'
import Permission from '@/models/Permission'

export default async function Page() {
    const permissions = (await Permission.find({})).map((r) =>
        r.toObject({
            flattenObjectIds: true,
            versionKey: false,
        })
    )

    return <ClientPage permissions={permissions} />
}
