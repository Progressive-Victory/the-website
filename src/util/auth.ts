import { Account, Profile, Session } from 'next-auth'
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
