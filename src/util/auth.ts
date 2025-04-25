import { Account, getServerSession, Profile, Session } from 'next-auth'
import Discord from 'next-auth/providers/discord'
import dbConnect from '@/util/libmongo'
import { User } from '@/models/User'
import { JWT } from 'next-auth/jwt'
import { NextAuthOptions } from 'next-auth'
import { IUser } from '@/models/User'
import { IRole } from '@/models/Role'

export const authOptions: NextAuthOptions = {
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization:
                'https://discord.com/oauth2/authorize?scope=identify+guilds+guilds.join+email',
            async profile(profile) {
                return {
                    id: profile.id,
                    name: profile.username,
                    email: profile.email,
                    // Using long form here to adjust size of image
                    image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}?size=512`,
                }
            },
        }),
    ],
    callbacks: {
        // session call back assigns the discordId from the token to the session object
        async session({
            session,
            token
        }: {
            session: Session
            token: JWT
        }) {
            if(token.discordId) session.discordId = token.discordId as string
            return session
        },
        async jwt({
            token,
            account,
            profile,
        }: {
            token: JWT
            account: Account | null
            profile?: Profile
        }) {
            interface EProfile extends Profile {
                id: string
                username: string
                avatar: string
            }

            const eprofile = profile as EProfile

            if (account && profile) {
                // First time OAuth sign-in: Store OAuth data in the token
                token.access_token = account.access_token
                token.discordId = eprofile.id

                // Database connection
                await dbConnect()

                const existingUser = await User.findOne({
                    discordId: eprofile.id,
                })
                if (!existingUser) {
                    // Create new user
                    const newUser = new User({
                        name: eprofile.username,
                        email: profile.email,
                        // Using long form here to adjust size of image
                        image: `https://cdn.discordapp.com/avatars/${eprofile.id}/${eprofile.avatar}?size=512`,
                        discordId: eprofile.id,
                    })
                    await newUser.save()
                }
            }

            return token
        },
    },
}

export const enum ResponseCode {
    Successful,
    Exception,
    NoSession,
    InsufficientAccess
}

// Role checking utility function
const hasRequiredRoles = (user: IUser, requiredRoles: string[] = []) => {
    const userRoles = user.roles as IRole[]
    const roleStrs = userRoles.map((role: IRole) => role.name)
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    return requiredRoles.every((role) => roleStrs.includes(role))   
}

export async function checkAuth(roles?: string[]): Promise<ResponseCode> {
    //Get server session
    const session = await getServerSession(authOptions)

    // No session found
    if (!session || !session.user) return ResponseCode.NoSession

    if(!roles) return ResponseCode.Successful

    // Connect to database
    await dbConnect()

    // query database for the user object with a discordId corresponding to
    // the one stored in the session object
    const user = await User.findOne({discordId: session.discordId})
        .populate({
            path: 'roles',
            populate: {
                path: 'permissions'
            }
        })
        .exec()

    if (!user || !(roles.length > 0)) return ResponseCode.Exception

    if (hasRequiredRoles(user, roles)) return ResponseCode.Successful

    return ResponseCode.InsufficientAccess
}
