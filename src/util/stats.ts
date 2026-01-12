import MongoPermission from '@/models/MongoPermission'
import MongoRole from '@/models/MongoRole'
import MongoUser from '@/models/MongoUser'
import dbConnect from '@/util/libmongo'

export async function get_collection_stats() {
    await dbConnect()

    const users_count = await MongoUser.countDocuments()
    const roles_count = await MongoRole.countDocuments()
    const permissions_count = await MongoPermission.countDocuments()

    return {
        users_count,
        roles_count,
        permissions_count,
    }
}
