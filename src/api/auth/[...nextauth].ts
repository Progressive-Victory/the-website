import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'

export default NextAuth({
    providers: [
        Discord({
            clientId: process.env.OAUTH_DISCORD_APPID!,
            clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET!,
        }),
    ],
})
