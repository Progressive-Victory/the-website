import { getGuildAvatar } from './discord'
import { User } from '@/contracts/data'
import { OAuth2Routes, OAuth2Scopes } from 'discord-api-types/v10'
import NextAuth, { Profile } from 'next-auth'
import Discord, { DiscordProfile } from 'next-auth/providers/discord'

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
    return `Bot ${accessToken}`
}

async function verifyResponse(res: Response) {
    if (!res.ok)
        throw Error(
            `API threw error: ${res.status} ${res.statusText}${res.body ? '\n' + (await res.text()) : ''}`
        )
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
                if (!process.env.DISCORD_BOT_TOKEN)
                    throw Error('set DISCORD_BOT_TOKEN in env vars')
                const serverToken = await serverAuth(
                    process.env.DISCORD_BOT_TOKEN
                )

                if (!serverToken)
                    throw Error('Failed to generate jwt for server.')

                if (profile.avatar) {
                    try {
                        await fetch(
                            new URL(
                                '/discordUsers/${profile.id}/avatar',
                                process.env.PV_WEBSITE_API_URL
                            ),
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
            session.refreshToken = token.refreshToken as string
            session.apiUrl = process.env.PV_WEBSITE_API_URL ?? ''
            return session
        },
        async jwt({ token, profile, account }) {
            interface EProfile extends Profile {
                id: string
                username: string
                avatar: string
            }

            const eprofile = profile as EProfile

            if (account && profile) {
                token.accessToken = account.access_token
                token.discordId = eprofile.id
                token.refreshToken = account.refresh_token

                if (!process.env.DISCORD_BOT_TOKEN)
                    throw Error('set DISCORD_BOT_TOKEN in env vars')
                const serverToken = await serverAuth(
                    process.env.DISCORD_BOT_TOKEN
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

                    if (res.status !== 404) {
                        await verifyResponse(res)
                    }

                    if (res.status === 404) {
                        const usr = await fetch(
                            new URL(`/users`, process.env.PV_WEBSITE_API_URL),
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: serverToken,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    email: profile.email,
                                }),
                            }
                        )

                        await verifyResponse(usr)

                        const post = await fetch(
                            new URL(
                                `/discordUsers`,
                                process.env.PV_WEBSITE_API_URL
                            ),
                            {
                                method: 'POST',
                                headers: {
                                    Authorization: serverToken,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    discordId: eprofile.id,
                                    discordUsername: eprofile.username,
                                    discordImage: extractAvatarHash(
                                        eprofile.avatar
                                    ),
                                    userId: ((await usr.json()) as User).id,
                                }),
                            }
                        )

                        await verifyResponse(post)
                    }
                } catch (e) {
                    console.error(e)
                }
            }

            return token
        },
    },
})
