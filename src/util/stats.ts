import Permission from '@/models/Permission'
import Role from '@/models/Role'
import User from '@/models/User'
import dbConnect from '@/util/libmongo'

export async function get_collection_stats() {
    await dbConnect()

    const users_count = await User.countDocuments()
    const roles_count = await Role.countDocuments()
    const permissions_count = await Permission.countDocuments()

    return {
        users_count,
        roles_count,
        permissions_count,
    }
}
