import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization:
                'https://discord.com/oauth2/authorize?scope=identify+guilds+guilds.join+email',
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token = Object.assign({}, token, {
                    access_token: account.access_token,
                })
            }
            return token
        },
        async session({ session, token }) {
            if (session) {
                // session = Object.assign({}, session, {
                //     access_token: token.access_token,
                // })
                //console.log(session)
            }
            return session
        },
    },
}

const handler = NextAuth(authOptions)
export const GET = handler
export const POST = handler
