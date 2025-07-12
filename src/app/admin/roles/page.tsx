import Page from './client'
import Permission from '@/models/Permission'

export default async function () {
    const permissions = (await Permission.find({})).map((r) =>
        r.toObject({
            flattenObjectIds: true,
            versionKey: false,
        })
    )

    return <Page permissions={permissions} />
}
