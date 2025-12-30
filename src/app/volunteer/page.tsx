import VolunteerPage from '@/app/volunteer/page.client'
import User from '@/models/User'
import { auth } from '@/util/auth'
import { isUserAGuildMember } from '@/util/discord'
import dbConnect from '@/util/libmongo'
import { OnboardingStage } from '@/util/stage'
import { redirect } from 'next/navigation'

// Development mode: bypass OAuth and use a mock user
const DEV_MODE = process.env.NODE_ENV === 'development'
const DEV_DISCORD_ID = 'dev-user-12345'

export default async function Page() {
    const session = await auth()

    await dbConnect()

    let user: InstanceType<typeof User> | null = null
    let isInServer = false

    if (DEV_MODE && !session) {
        // In dev mode without session, create or find a dev user
        user = await User.findOne({
            discordId: DEV_DISCORD_ID,
        })

        if (!user) {
            // Create a new dev user if it doesn't exist
            user = new User({
                name: 'Dev User',
                email: 'dev@example.com',
                image: '/images/Logo_White.svg',
                discordId: DEV_DISCORD_ID,
                discordUserAvatar: null,
                onboardingStage: OnboardingStage.NOT_STARTED,
                verified: false,
            })
            await user.save()
        }

        // In dev mode, assume user is not in server
        isInServer = false
    } else {
        // Production mode: require authentication
        if (!session) {
            redirect('/login?redirect=/volunteer')
        }

        user = await User.findOne({
            discordId: session.discordId,
        })

        if (!user) {
            throw new Error('well this is awkward')
        }

        isInServer = await isUserAGuildMember(user.discordId)
    }

    return (
        <VolunteerPage
            user={user.toObject({
                flattenObjectIds: true,
            })}
            isInSever={isInServer}
        />
    )
}
