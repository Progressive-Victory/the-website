import { getGuildAvatar } from './discord'
import { IRole, IUser, zUser } from '@/contracts/data'
import { OAuth2Routes, OAuth2Scopes } from 'discord-api-types/v10'
import NextAuth, { Profile } from 'next-auth'
import Discord, { DiscordProfile } from 'next-auth/providers/discord'
import z from 'zod'

export enum PermissionName {
    ADMIN_PANEL_ACCESS = 'Admin Panel Access',
    VIEW_MEMBER_DATA = 'View Member Data',
}

function extractAvatarHash(url: string) {
    const split = url.split('/')
    const hashRaw = split[split.length - 1]
    const hashSplit = hashRaw.split('.')
    const hash = hashSplit[hashSplit.length - 1]
    return hash
}

async function serverAuth(token: string): Promise<string> {
    const res = await fetch(new URL('/auth', process.env.PV_WEBSITE_API_URL), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            discordToken: 'Bot ' + token,
        }),
    })

    if (!res.ok) throw Error("Can't fucking connect to API dawg")
    const { accessToken } = (await res.json()) as { accessToken: string }

    if (!accessToken) throw Error('Failed to generate server jwt')
    return accessToken
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    pages: {
        signIn: '/login',
        error: '/login',
        newUser: '/volunteer',
    },
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            checks: ['pkce'],

            authorization: {
                url: OAuth2Routes.authorizationURL,
                params: {
                    scope: [
                        OAuth2Scopes.Identify,
                        OAuth2Scopes.Email,
                        OAuth2Scopes.Guilds,
                        OAuth2Scopes.GuildsJoin,
                        OAuth2Scopes.GuildsMembersRead,
                    ].join(' '),
                },
            },

            redirectProxyUrl: process.env.BOOMERANG_URI,

            async profile(profile: DiscordProfile) {
                if (!process.env.PV_WEBSITE_API_KEY)
                    throw Error('set PV_WEBSITE_API_KEY in env vars')
                const serverToken = await serverAuth(
                    process.env.PV_WEBSITE_API_KEY
                )

                if (!serverToken)
                    throw Error('Failed to generate jwt for server.')

                if (profile.avatar) {
                    try {
                        await fetch(
                            `${process.env.PV_WEBSITE_API_URL}/discordUsers/${profile.id}/avatar`,
                            {
                                method: 'PATCH',
                                headers: {
                                    Authorization: serverToken,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    discordImage: profile.avatar
                                        ? extractAvatarHash(profile.avatar)
                                        : '',
                                }),
                            }
                        )
                    } catch (e) {
                        console.error(e)
                    }
                }

                const image = await getGuildAvatar(profile.id)

                return {
                    id: profile.id,
                    name: profile.username,
                    email: profile.email,
                    image,
                }
            },
        }),
    ],
    callbacks: {
        signIn({ profile }) {
            if (!profile?.email || !profile?.verified) {
                return '/login?error=DiscordEmailNotVerified'
            }

            return true
        },
        // session call back assigns the discordId from the token to the session object
        session({ session, token }) {
            session.discordId = token.discordId as string
            session.accessToken = token.accessToken as string
            session.apiUrl = process.env.PV_WEBSITE_API_URL ?? ''
            return session
        },
        async jwt({ token, account, profile }) {
            interface EProfile extends Profile {
                id: string
                username: string
                avatar: string
            }

            const eprofile = profile as EProfile

            if (account && profile) {
                token.accessToken = account.access_token
                token.discordId = eprofile.id

                if (!process.env.PV_WEBSITE_API_KEY)
                    throw Error('set PV_WEBSITE_API_KEY in env vars')
                const serverToken = await serverAuth(
                    process.env.PV_WEBSITE_API_KEY
                )

                if (!serverToken)
                    throw Error('Failed to generate jwt for server.')

                try {
                    const res = await fetch(
                        new URL(
                            `/discordUsers/${eprofile.id}/user`,
                            process.env.PV_WEBSITE_API_URL
                        ),
                        {
                            method: 'GET',
                            headers: {
                                Authorization: serverToken,
                            },
                        }
                    )

                    if (res.status === 404) {
                        const usr = await fetch(
                            new URL(`/users`, process.env.PV_WEBSITE_API_URL),
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${serverToken}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    email: profile.email,
                                }),
                            }
                        )
                        await fetch(
                            new URL(
                                `/discordUsers`,
                                process.env.PV_WEBSITE_API_URL
                            ),
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${serverToken}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    discordId: eprofile.id,
                                    discordUsername: eprofile.username,
                                    discordImage: extractAvatarHash(
                                        eprofile.avatar
                                    ),
                                    userId: ((await usr.json()) as IUser).id,
                                }),
                            }
                        )
                    }
                } catch (e) {
                    console.log(e)
                }
            }

            return token
        },
    },
})

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
    const roleStrs = userRoles?.map((role: IRole) => role.name)
    if (!user?.roles || !Array.isArray(user.roles)) return false
    return requiredRoles.every((role) => roleStrs?.includes(role))
}

// utility function for checking the current session against an array of roles
// provided in the form of strings that correspond to role names.
// If this function is called, it's implied that you need to be logged in to pass.
// If you want to check if a user is logged in but don't want to require any roles
// you can call this with no parameters and it will do that for you.
export async function checkAuth(roles?: string[]): Promise<ResponseCode> {
    //Get server session
    const session = await auth()

    // No session found
    if (!session?.user) return ResponseCode.NoSession

    //if there are no required roles, then all auth requirements have been met.
    if (!roles) return ResponseCode.Successful

    // query database for the user object with a discordId corresponding to
    // the one stored in the session object
    if (!process.env.PV_WEBSITE_API_KEY)
        throw Error('set PV_WEBSITE_API_KEY in env vars')
    const serverToken = await serverAuth(process.env.PV_WEBSITE_API_KEY)

    const res = await fetch(
        new URL(
            `/discordUsers/${session.discordId}/user`,
            process.env.PV_WEBSITE_API_URL
        ),
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${serverToken}`,
            },
        }
    )

    const data = (await res.json()) as unknown

    //  if either the currently logged in user cant be found in the database
    // for some reason or the user has no roles at all return an exception code.
    if (!res.ok || !(roles.length > 0)) return ResponseCode.Exception

    const user = z.parse(zUser, data)

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
    const session = await auth()
    if (!session?.user) {
        return ResponseCode.NoSession
    }

    if (!permissions || permissions.length == 0) {
        return ResponseCode.Successful
    }

    if (!process.env.PV_WEBSITE_API_KEY)
        throw Error('set PV_WEBSITE_API_KEY in env vars')
    const serverToken = await serverAuth(process.env.PV_WEBSITE_API_KEY)

    if (!serverToken) throw Error('Failed to generate jwt for server.')

    const res = await fetch(
        new URL(
            `/discordUsers/${session.discordId}/user`,
            process.env.PV_WEBSITE_API_URL
        ),
        {
            headers: {
                Authorization: serverToken,
            },
        }
    )

    const user = z.parse(zUser, await res.json())

    if (!user) {
        // This shouldn't happen except in the case of a database error.
        return ResponseCode.Exception
    }

    // Organize permissions from all user roles into a set for easy lookup
    const userPerms = new Set<string>()
    user.roles?.forEach((role) => {
        role.permissions?.forEach((perm) => {
            userPerms.add(perm.name)
        })
    })

    // Predicate to check if user has a perm is passed into some array iterating function based on mode
    const predicate = (perm: string) => userPerms.has(perm)
    let success = false
    if (mode === 'all') {
        success = permissions.every(predicate)
    } else {
        success = permissions.some(predicate)
    }

    return success ? ResponseCode.Successful : ResponseCode.InsufficientAccess
}
