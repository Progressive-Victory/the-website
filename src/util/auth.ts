import { Account, getServerSession, Profile, Session } from 'next-auth'
import Discord from 'next-auth/providers/discord'
import dbConnect from '@/util/libmongo'
import { User } from '@/models/User'
import { JWT } from 'next-auth/jwt'
import { NextAuthOptions } from 'next-auth'
import { IUser } from '@/models/User'
import { IRole } from '@/models/Role'
import { getDisplayAvatarURL } from './discord-rest'

export const authOptions: NextAuthOptions = {
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization:
                'https://discord.com/oauth2/authorize?scope=identify+guilds+guilds.join+guilds.members.read+email',
            async profile(profile) {
                // FIXME(hhammon) @NoDiscordIdIndex As far as I can tell, there's no index on the `discordId` key.
                // At least there isn't one in the dev database, and one isn't created in the model. This probably
                // needs to be addressed.

                // Executed async. No reason to wait on this update before sending a response down.
                User.findOneAndUpdate(
                    {
                        discordId: profile.id,
                    },
                    {
                        $set: {
                            discordUserAvatar: profile.avatar,
                        },
                    }
                )
                    .exec()
                    .then()

                const image = await getDisplayAvatarURL(
                    profile.id,
                    profile.avatar
                )

                return {
                    id: profile.id,
                    name: profile.username,
                    email: profile.email,
                    // Using long form here to adjust size of image
                    image,
                }
            },
        }),
    ],
    callbacks: {
        // session call back assigns the discordId from the token to the session object
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token.discordId) session.discordId = token.discordId as string
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
                        discordUserAvatar: eprofile.avatar,
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
    InsufficientAccess,
}

// Role checking utility function
// takes an array of strings, each matching the name field of a given roles
const hasRequiredRoles = (user: IUser, requiredRoles: string[] = []) => {
    const userRoles = user.roles as IRole[]
    const roleStrs = userRoles.map((role: IRole) => role.name)
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    return requiredRoles.every((role) => roleStrs.includes(role))
}

// utility function for checking the current session against an array of roles
// provided in the form of strings that correspond to role names.
// If this function is called, it's implied that you need to be logged in to pass.
// If you want to check if a user is logged in but don't want to require any roles
// you can call this with no parameters and it will do that for you.
export async function checkAuth(roles?: string[]): Promise<ResponseCode> {
    //Get server session
    const session = await getServerSession(authOptions)

    // No session found
    if (!session || !session.user) return ResponseCode.NoSession

    //if there are no required roles, then all auth requirements have been met.
    if (!roles) return ResponseCode.Successful

    // Connect to database
    await dbConnect()

    // query database for the user object with a discordId corresponding to
    // the one stored in the session object
    const user: IUser | null = await User.findOne({
        discordId: session.discordId,
    })
        .populate({
            path: 'roles',
            populate: {
                path: 'permissions',
            },
        })
        .exec()

    //  if either the currently logged in user cant be found in the database
    // for some reason or the user has no roles at all return an exception code.
    if (!user || !(roles.length > 0)) return ResponseCode.Exception

    //if the user has any of the required roles, return a successful response code.
    if (hasRequiredRoles(user, roles)) return ResponseCode.Successful

    // otherwise return an insufficient access response.
    return ResponseCode.InsufficientAccess
}
