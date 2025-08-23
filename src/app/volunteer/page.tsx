import VolunteerPage from '@/app/volunteer/page.client'
import User from '@/models/User'
import { auth } from '@/util/auth'
import { getMember } from '@/util/discord'
import dbConnect from '@/util/libmongo'
import { redirect } from 'next/navigation'

export default async function Page() {
    const session = await auth()

    if (!session) {
        redirect('/login?redirect=/volunteer')
    }

    await dbConnect()
    const user = await User.findOne({
        discordId: session.discordId,
    })

    if (!user) {
        throw new Error('well this is awkward')
    }

    const member = await getMember(user.discordId)

    return (
        <VolunteerPage
            user={JSON.parse(
                JSON.stringify(
                    user.toObject({
                        flattenObjectIds: true,
                    })
                )
            )}
            isInSever={!!member}
        />
    )
}
