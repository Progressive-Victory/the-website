import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import dbConnect from '@/util/libmongo'
import { User } from '@/models/User'
import { JWT } from 'next-auth/jwt'
import { NextAuthOptions } from 'next-auth'

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
                    image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}?size=512`,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({
            token,
            account,
            profile,
        }: {
            token: JWT
            account: any
            profile?: any
        }) {
            if (account && profile) {
                // First time OAuth sign-in: Store OAuth data in the token
                token.access_token = account.access_token
                token.discordId = profile.id

                // Database connection
                await dbConnect()

                const existingUser = await User.findOne({
                    discordId: profile.id,
                })

                if (!existingUser) {
                    // Create new user
                    const newUser = new User({
                        name: profile.username,
                        email: profile.email,
                        image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}?size=512`,
                        discordId: profile.id,
                    })
                    await newUser.save()
                }
            }
            return token
        },
    },
}

const handler = NextAuth(authOptions)
export const GET = handler
export const POST = handler
