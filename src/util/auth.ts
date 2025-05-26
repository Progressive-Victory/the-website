import { Account, getServerSession, Profile, Session } from 'next-auth'
import Discord, { DiscordProfile } from 'next-auth/providers/discord'
import dbConnect from '@/util/libmongo'
import { User } from '@/models/User'
import { JWT } from 'next-auth/jwt'
import { NextAuthOptions } from 'next-auth'
import { IUser } from '@/models/User'
import { IRole } from '@/models/Role'
import { getDisplayAvatarURL } from './discord/AvatarURL'
import { OAuth2Routes, OAuth2Scopes } from 'discord-api-types/v10'

interface EProfile extends Profile {
    id: string
    username: string
    avatar: string
}

export enum PermissionName {
    ADMIN_PANEL_ACCESS = 'Admin Panel Access',
    VIEW_MEMBER_DATA = 'View Member Data',
}
const clientId = process.env.DISCORD_CLIENT_ID
const clientSecret = process.env.DISCORD_CLIENT_SECRET

if (!clientId) throw Error('Please define the DISCORD_CLIENT_ID environment variable')
if (!clientSecret) throw Error('Please define the DISCORD_CLIENT_SECRET environment variable')



export const authOptions: NextAuthOptions = {
    providers: [
        /**
         * OAuth2 Discord documentation
         * @see https://discord.com/developers/docs/topics/oauth2
         */
        Discord({
            clientId,
            clientSecret,
            authorization: {
                url: OAuth2Routes.authorizationURL,
                params: {
                    scope: [
                        OAuth2Scopes.Identify,
                        OAuth2Scopes.Email,
                        OAuth2Scopes.Guilds,
                        OAuth2Scopes.GuildsJoin,
                        OAuth2Scopes.GuildsMembersRead,
                    ].join('+')
                }
            },
            async profile(profile: DiscordProfile) {
                // Executed async. No reason to wait on this update before sending a response down.
                void User.findOneAndUpdate(
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
                    profile.avatar,
                    process.env.GUILD_ID,
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
        session({ session, token }: { session: Session; token: JWT }) {
            if(!(typeof token.discordId === 'string')) throw Error('token.discordId is not a string')
            if (token.discordId) session.discordId = token.discordId
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

            if (account && profile && isEProfile(profile)) {
                
                const {id, username, avatar} = profile

                // First time OAuth sign-in: Store OAuth data in the token
                token.access_token = account.access_token
                token.discordId = id

                // Database connection
                await dbConnect()

                const existingUser = await User.findOne({ discordId: id })

                if (!existingUser) {
                    // Create new user
                    const newUser = new User({
                        name: username,
                        email: profile.email,
                        // Using long form here to adjust size of image
                        image: getDisplayAvatarURL(id, avatar),
                        discordId: id,
                        discordUserAvatar: avatar,
                    })
                    void newUser.save()
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
    const userRoles = user.roles
    const roleStrs = userRoles.map((role: IRole) => role.name)
    if (!Array.isArray(user.roles)) return false
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
    if (!session?.user) return ResponseCode.NoSession

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

/*
 * Checks the currently logged-in user against a list of permissions according to some mode.
 * The 'all' mode is default and requires the user to have all permission listed, otherwise,
 * it will pass if any match. Like `checkAuth` for roles, it will fail with no session if no
 * user is logged in.
 */
export async function checkAuthPermissions(
    permissions?: string[],
    mode: 'all' | 'any' = 'all'
): Promise<ResponseCode> {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return ResponseCode.NoSession
    }

    if (!permissions || permissions.length == 0) {
        return ResponseCode.Successful
    }

    const user = await User.findOne({
        discordId: session.discordId,
    }).select({
        roles: 1
    }).populate({
        path: 'roles',
        populate: {
            path: 'permissions',
        },
    }).exec()

    if (!user) {
        // This shouldn't happen except in the case of a database error.
        return ResponseCode.Exception
    }

    // Organize permissions from all user roles into a set for easy lookup
    const userPerms = new Set<string>()
    user.roles.forEach(((role) => {
        role.permissions.forEach(((perm) => {
            userPerms.add(perm.name)
        }))
    }))

    // Predicate to check if user has a perm is passed into some array iterating function based on mode
    const predicate = (perm: string) => userPerms.has(perm)
    let success = false;
    if (mode === 'all') {
        success = permissions.every(predicate)
    } else {
        success = permissions.some(predicate)
    }

    return success ? ResponseCode.Successful : ResponseCode.InsufficientAccess
}

function isEProfile(profile:Profile): profile is EProfile {
    return 'id' in profile &&
        'username' in profile &&
        'avatar' in profile
}